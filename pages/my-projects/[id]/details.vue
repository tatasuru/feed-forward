<script setup lang="ts">
import type {
  MyProjectWithFeedback,
  FeedbackContents,
} from "@/types/my-projects.types";
import type { ProjectWithFeedback } from "@/types/projects.types";
import { constructNow, format } from "date-fns";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import * as z from "zod";

const { id } = useRoute().params;
const supabase = useSupabaseClient();
const supabaseUser = useSupabaseUser();
const preview = ref();

const projectWithFeedback = ref<ProjectWithFeedback>({} as ProjectWithFeedback);
const badgeColors = {
  design: "bg-blue/20 text-blue",
  demo: "bg-pink/20 text-pink",
  plan: "bg-purple/20 text-purple",
};
const progressBarColors = ["bg-pink", "bg-blue", "bg-purple"];
const hoverStarIndexObj = ref<{
  [key: number]: number;
}>({
  0: -1,
  1: -1,
  2: -1,
});
const isAlreadyRated = ref<boolean>(false);
const currentFeedbackId = ref<string | null>(null);
const ratingPerCriteria = ref<
  {
    criteria_id: string;
    rating: number;
  }[]
>([]);
const feedbackContents = ref<FeedbackContents[]>([]);

const dashboardContents = [
  {
    title: "受け取ったフィードバック",
    description: "先月比 -8 (20%)",
    icon: "mdi:comment-check-outline",
    value: 10,
  },
  {
    title: "平均評価",
    description: "先月比 +0.3 (7.7%)",
    icon: "mdi:star-check",
    value: 4.5,
  },
];

/******************************
 * Lifecycle Hooks
 ******************************/
// Fetch project details and link preview
try {
  projectWithFeedback.value = await getProjectDetails(id as string);
  preview.value = await getLinkPreview(
    projectWithFeedback.value.project.resource_url
  );

  const { data, error } = await supabase.rpc(
    "get_my_projects_with_feedback_ratings",
    {
      user_id: supabaseUser.value?.id,
    }
  );

  if (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }

  initFeedbackContents(data);

  const initialRatings: Record<number, number> = {};

  const userFeedBack = await checkExistingFeedback();

  await getRatingPerCriteria();

  if (userFeedBack?.exists) {
    userFeedBack.feedback.ratings.forEach(
      (rating: { rating: number }, index: number) => {
        initialRatings[index] = rating.rating;
        hoverStarIndexObj.value[index] = rating.rating - 1;
      }
    );
    isAlreadyRated.value = true;
  } else {
    projectWithFeedback.value.evaluation_criteria.forEach((_, index) => {
      initialRatings[index] = -1;
      hoverStarIndexObj.value[index] = -1;
    });
    isAlreadyRated.value = false;
  }
} catch (error) {
  console.error("Error fetching project details or link preview:", error);
}

/******************************
 * HELPER FUNCTIONS
 ******************************/
async function getProjectDetails(id: string) {
  try {
    const { data, error } = await supabase.rpc("get_project_with_feedback", {
      p_project_id: id,
    });

    if (error) {
      throw new Error(`Error fetching project details: ${error.message}`);
    }

    return data as ProjectWithFeedback;
  } catch (error) {
    console.error("Error fetching project details:", error);
    throw error;
  }
}

async function getLinkPreview(url: string) {
  try {
    const encodedUrl = encodeURIComponent(url);
    const { data, error } = await useFetch(
      `/api/link-preview?url=${encodedUrl}`
    );

    if (error.value) {
      console.error("Error fetching link preview:", error.value);
      return {
        title: "No Title",
        description: "No Description",
        images: [],
      };
    }

    return data.value;
  } catch (error) {
    console.error("Error fetching link preview:", error);
    throw error;
  }
}

async function checkExistingFeedback() {
  try {
    const { data, error } = await supabase.rpc("check_user_feedback", {
      p_project_id: id,
      p_user_id: supabaseUser.value?.id,
    });

    if (error) {
      console.error("フィードバック確認エラー:", error);
      throw error;
    }

    if (data.exists) {
      currentFeedbackId.value = data.feedback_id;
      return await getUserFeedback();
    }

    return null;
  } catch (error) {
    console.error("フィードバック確認中にエラーが発生しました:", error);
    throw error;
  }
}

async function getUserFeedback() {
  try {
    const { data, error } = await supabase.rpc("get_user_feedback", {
      p_project_id: id,
      p_user_id: supabaseUser.value?.id,
    });

    if (error) {
      console.error("フィードバック取得エラー:", error);
      throw error;
    }

    if (data.status === "success") {
      const feedback = data.feedback;

      const initialValues: Record<string, any> = {
        overallComment: feedback.overall_comment || "",
        isAnonymous: feedback.is_anonymous || false,
        ratings: {},
      };

      if (feedback.ratings && feedback.ratings.length > 0) {
        feedback.ratings.forEach((rating: any) => {
          initialValues.ratings[rating.criteria_id] = rating.rating;
        });
      }

      return {
        exists: true,
        feedback: feedback,
        initialValues: initialValues,
      };
    }

    return {
      exists: false,
    };
  } catch (error) {
    console.error("フィードバック取得中にエラーが発生しました:", error);
    throw error;
  }
}

async function getRatingPerCriteria() {
  const feedbacks = projectWithFeedback.value.feedback;

  feedbacks.map((feedback: any) => {
    feedback.ratings.map((rating: any) => {
      const existingRating = ratingPerCriteria.value.find(
        (r) => r.criteria_id === rating.criteria_id
      );

      if (existingRating) {
        existingRating.rating += rating.rating;
      } else {
        ratingPerCriteria.value.push({
          criteria_id: rating.criteria_id,
          rating: rating.rating / feedbacks.length,
        });
      }
    });
  });

  console.log("ratingPerCriteria", ratingPerCriteria.value);
}

function initFeedbackContents(projects: MyProjectWithFeedback[]) {
  feedbackContents.value = projects.map((project) => {
    const feedbacks = project.feedback || [];
    return {
      id: project.id,
      title: project.title,
      description: project.description,
      created_at: project.created_at.toString(),
      feedback_ratings: feedbacks.map((fb) => ({
        rating: Number(fb.ratings),
        created_at: fb.created_at.toString(),
        user_id: fb.user_id || "",
      })),
      project_type: project.project_type,
      user: {
        id: project.user.id,
        display_name: project.user.display_name || "Unknown User",
        avatar_url: project.user.avatar_url || "",
      },
    };
  });
}
</script>

<template>
  <div id="projects" class="grid w-full gap-8">
    <Button
      as-child
      variant="ghost"
      class="!p-0 hover:bg-transparent hover:text-muted-foreground"
    >
      <NuxtLink to="/my-projects" class="w-fit text-muted-foreground">
        <Icon name="mdi:arrow-left" class="!size-4 text-muted-foreground" />
        前のページへ戻る
      </NuxtLink>
    </Button>
    <div
      v-if="projectWithFeedback.project"
      class="flex flex-col md:flex-row gap-4 items-start justify-between"
    >
      <div class="flex flex-col items-start gap-4">
        <PageTitle :title="projectWithFeedback.project.title" size="large" />

        <div class="flex items-center gap-4">
          <Badge
            variant="default"
            class="text-xs rounded-full border"
            :class="badgeColors[projectWithFeedback.project.project_type]"
          >
            {{ projectWithFeedback.project.project_type }}
          </Badge>

          <div class="flex items-center gap-px">
            <Icon
              name="mdi:calendar-month"
              class="!size-4 text-muted-foreground"
            />
            <span class="text-sm text-muted-foreground">
              作成日:
              {{
                format(
                  new Date(projectWithFeedback.project.created_at),
                  "yyyy/MM/dd"
                )
              }}
            </span>
          </div>

          <div
            v-if="projectWithFeedback.project.deadline"
            class="flex items-center gap-1"
          >
            <Icon
              name="mdi:clock-remove-outline"
              class="!size-4 text-muted-foreground"
            />
            <span class="text-sm text-muted-foreground">
              期限:
              {{
                format(
                  new Date(projectWithFeedback.project.deadline),
                  "yyyy/MM/dd"
                )
              }}
            </span>
          </div>
        </div>
      </div>
      <!-- settings -->
      <div
        class="flex flex-col md:flex-row items-center gap-2 md:gap-4 w-full md:w-fit"
      >
        <Button
          as-child
          variant="outline"
          class="w-full md:w-fit cursor-pointer"
        >
          <NuxtLink :to="`/my-projects/${projectWithFeedback.project.id}/edit`">
            <Icon
              name="mdi:text-box-edit-outline"
              class="!size-4 text-muted-foreground"
            />
            プロジェクトを編集
          </NuxtLink>
        </Button>
        <Button variant="destructive" class="w-full md:w-fit cursor-pointer">
          <Icon name="mdi:delete-outline" class="!size-4 text-white" />
          プロジェクトを削除
        </Button>
      </div>
    </div>

    <div class="grid md:grid-cols-[1fr_500px] gap-4">
      <!-- left -->
      <div
        v-if="projectWithFeedback.project"
        class="flex flex-col gap-8 border border-muted-foreground/20 rounded-lg p-8 w-full"
      >
        <PageTitle
          title="プロジェクトの詳細"
          description="フィードバックを求めているプロジェクトの詳細"
          size="medium"
        />

        <div class="flex flex-col gap-12">
          <!-- profile -->
          <div class="flex flex-col gap-4 w-full">
            <PageTitle title="ユーザー情報" size="small" />

            <div class="flex items-start gap-4">
              <Avatar class="cursor-pointer size-20">
                <AvatarImage
                  :src="
                    projectWithFeedback.owner.avatar_url || 'default-avatar.png'
                  "
                  alt="avatar"
                />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div class="flex flex-col gap-1">
                <p class="text-lg font-semibold">
                  {{ projectWithFeedback.owner.display_name }}
                </p>
                <p
                  v-if="projectWithFeedback.owner.bio"
                  class="text-sm text-muted-foreground"
                >
                  {{ projectWithFeedback.owner.bio }}
                </p>
                <NuxtLink
                  v-if="projectWithFeedback.owner.website"
                  :to="projectWithFeedback.owner.website"
                  class="text-sm text-link flex items-center gap-1"
                >
                  <Icon name="mdi:link" class="!size-4 text-link" />
                  サイトへ
                </NuxtLink>
              </div>
            </div>
          </div>

          <!-- overview -->
          <div class="flex flex-col gap-4 w-full">
            <PageTitle title="概要" size="small" />
            <p class="text-sm text-muted-foreground leading-5">
              {{ projectWithFeedback.project.description }}
            </p>
          </div>

          <!-- feedback subject  -->
          <div class="flex flex-col gap-4 w-full">
            <PageTitle title="フィードバック対象" size="small" />
            <NuxtLink
              :to="projectWithFeedback.project.resource_url"
              class="flex flex-col gap-3 border border-muted-foreground/20 rounded-sm"
              target="_blank"
            >
              <NuxtImg
                v-if="preview.images?.[0]"
                :src="preview?.images?.[0] || 'no-image.png'"
                :alt="preview?.title || ''"
                class="object-cover object-center h-52 md:h-96 rounded-t-sm"
              />
              <NuxtImg
                v-else="!preview.images?.[0]"
                src="no-image.png"
                :alt="preview?.title || ''"
                class="object-contain object-center h-52 md:h-96 rounded-t-sm bg-muted-foreground/22"
              />

              <div class="flex flex-col gap-2 p-4">
                <p class="text-base">
                  {{ preview?.title ? preview?.title : "No Title" }}
                </p>
                <p class="text-sm text-muted-foreground leading-6">
                  {{
                    preview?.description
                      ? preview?.description
                      : "No Description"
                  }}
                </p>
              </div>
            </NuxtLink>
          </div>

          <!-- feedback items -->
          <div class="flex flex-col gap-4 w-full">
            <PageTitle title="評価項目" size="small" />

            <div class="flex flex-col gap-4">
              <div
                v-for="(
                  criteria, index
                ) in projectWithFeedback.evaluation_criteria"
                class="flex flex-col gap-2"
              >
                <div class="flex justify-between items-center">
                  <p class="text-sm">{{ criteria.name }}</p>
                  <p class="text-sm">
                    平均:
                    {{
                      ratingPerCriteria[index]
                        ? ratingPerCriteria[index].rating.toFixed(1)
                        : 0
                    }}
                    / 5.0
                  </p>
                </div>
                <Progress
                  :model-value="
                    ratingPerCriteria[index]
                      ? (ratingPerCriteria[index].rating / 5) * 100
                      : 0
                  "
                  :indicator-color="progressBarColors[index]"
                  class="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- right -->
      <div class="flex flex-col gap-4 w-full">
        <!-- analytics -->
        <div
          class="flex flex-col gap-8 border border-muted-foreground/20 rounded-lg p-8"
        >
          <PageTitle title="アナリティクス" size="medium" />

          <div class="w-full grid grid-cols-1 gap-4">
            <Card
              v-for="(item, index) in dashboardContents"
              :key="index"
              class="py-5"
            >
              <CardHeader
                class="flex flex-row items-center justify-between gap-2 px-5"
              >
                <CardTitle>{{ item.title }}</CardTitle>
                <Icon :name="item.icon" class="!size-5" />
              </CardHeader>
              <CardContent class="font-bold flex flex-col gap-1 px-5">
                <span class="text-foreground text-3xl gradient-text">{{
                  item.value
                }}</span>
                <span class="text-muted-foreground text-sm">
                  {{ item.description }}
                </span>
              </CardContent>
            </Card>
          </div>
        </div>

        <!-- feedback -->
        <div
          class="flex flex-col gap-8 border border-muted-foreground/20 rounded-lg p-8"
        >
          <PageTitle title="フィードバック" size="medium" />
          <div
            v-for="(feedback, index) in feedbackContents"
            :key="index"
            class="flex flex-col gap-8"
          >
            <FeedbackCard :feedback="feedback" />
            <Separator />
          </div>

          <Button as-child variant="main" class="w-full cursor-pointer">
            <NuxtLink
              :to="`/my-projects/${projectWithFeedback.project.id}/feedback`"
              class="w-full"
            >
              フィードバックをもっと見る
            </NuxtLink>
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
