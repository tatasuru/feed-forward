<script setup lang="ts">
import type { ProjectWithFeedback } from "@/types/projects.types";
import { format } from "date-fns";

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
const isAlreadyRated = ref<boolean>(false);
const currentFeedbackId = ref<string | null>(null);
const ratingPerCriteria = ref<
  {
    title: string;
    criteria_id: string;
    rating: number;
  }[]
>([]);
const feedbackContents = ref<any[]>([]);

const dashboardContents = [
  {
    title: "受け取ったフィードバック",
    description: "",
    icon: "mdi:comment-check-outline",
    value: "",
  },
  {
    title: "平均評価",
    description: "",
    icon: "mdi:star-check",
    value: "",
  },
];

/******************************
 * Lifecycle Hooks
 ******************************/
try {
  // Fetch project details and link preview
  projectWithFeedback.value = await getProjectDetails(id as string);
  preview.value = await getLinkPreview(
    projectWithFeedback.value.project.resource_url
  );

  // initialize ratings
  const initialRatings: Record<number, number> = {};
  projectWithFeedback.value.evaluation_criteria.forEach((_, index) => {
    initialRatings[index] = -1;
  });

  // Check if the user has already given feedback
  const userFeedBack = await checkExistingFeedback();

  // Get feedback ratings
  ratingPerCriteria.value = await getRatingPerCriteria();

  if (userFeedBack?.exists && userFeedBack.feedback.ratings) {
    const ratingsByCriteriaId: Record<string, any> = {};
    userFeedBack.feedback.ratings.forEach((rating: any) => {
      ratingsByCriteriaId[rating.criteria_id] = rating;
    });

    projectWithFeedback.value.evaluation_criteria.forEach((criteria, index) => {
      const rating = ratingsByCriteriaId[criteria.id];
      if (rating) {
        initialRatings[index] = rating.rating;
      }
    });

    isAlreadyRated.value = true;
  } else {
    isAlreadyRated.value = false;
  }

  // initialize feedback analytics contents
  initDashboardContents();

  // initialize feedback contents
  initFeedbackContents();
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
  const feedbacks = projectWithFeedback.value.feedbacks || [];
  const ratingAvgByCriteriaId: Record<string, number> = {};
  const ratingCountByCriteriaId: Record<string, number> = {};

  // 1. insert feedbacks into each criteria variable
  feedbacks.forEach((feedback) => {
    feedback.ratings.forEach((rating) => {
      if (!ratingAvgByCriteriaId[rating.criteria_id]) {
        ratingAvgByCriteriaId[rating.criteria_id] = 0;
        ratingCountByCriteriaId[rating.criteria_id] = 0;
      }
      ratingAvgByCriteriaId[rating.criteria_id] += rating.rating;
      ratingCountByCriteriaId[rating.criteria_id]++;
    });
  });

  // 2. calculate average rating for each criteria
  Object.keys(ratingAvgByCriteriaId).forEach((criteriaId) => {
    if (ratingCountByCriteriaId[criteriaId] > 0) {
      ratingAvgByCriteriaId[criteriaId] =
        ratingAvgByCriteriaId[criteriaId] / ratingCountByCriteriaId[criteriaId];
    }
  });

  // 3. set the average rating to the ratingPerCriteria
  return projectWithFeedback.value.evaluation_criteria.map((criteria) => {
    return {
      title: criteria.name,
      criteria_id: criteria.id,
      rating: ratingAvgByCriteriaId[criteria.id] || 0,
    };
  });
}

function initDashboardContents() {
  dashboardContents[0].value = String(
    projectWithFeedback.value.feedbacks.length
  );
  dashboardContents[1].value = (
    ratingPerCriteria.value.reduce((acc, curr) => acc + curr.rating, 0) /
    ratingPerCriteria.value.length
  ).toFixed(1);
}

function initFeedbackContents() {
  feedbackContents.value = projectWithFeedback.value.feedbacks.map(
    (feedback) => {
      return {
        id: feedback.id,
        title: feedback.overall_comment,
        description: feedback.overall_comment,
        created_at: feedback.created_at.toString(),
        feedback_ratings: feedback.ratings.map((fb: any, index: number) => ({
          title: ratingPerCriteria.value[index].title,
          rating: ratingPerCriteria.value[index].rating || 0,
          created_at: feedback.created_at.toString(),
          user_id: fb.user_id || "",
        })),
        overall_comment: feedback.overall_comment,
        project_type: projectWithFeedback.value.project.project_type,
        user: {
          id: feedback.user?.id || "",
          display_name: feedback.user?.display_name || "Unknown User",
          avatar_url: feedback.user?.avatar_url || "",
        },
      };
    }
  );
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
                  <p class="text-sm">
                    {{ criteria.name }}
                  </p>
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
            <FeedbackCard :feedback="feedback" :isDashboard="false" />
            <Separator />
          </div>

          <EmptyProjectCard
            v-if="!projectWithFeedback.feedbacks.length"
            class="h-[200px] md:h-[200px] flex items-center justify-center"
            text="最近のフィードバックはありません"
          />

          <Button
            v-if="projectWithFeedback.feedbacks.length > 3"
            as-child
            variant="main"
            class="w-full cursor-pointer"
          >
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
