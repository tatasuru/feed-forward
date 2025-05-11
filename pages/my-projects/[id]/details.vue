<script setup lang="ts">
import type { ProjectWithFeedback } from "@/types/projects.types";
import { format } from "date-fns";
import { toast } from "vue-sonner";

definePageMeta({
  middleware: "auth",
  title: "マイプロジェクト詳細",
  description:
    "Feed Forwardのマイプロジェクト詳細ページです。作成したプロジェクトの詳細を確認できます。",
  ogTitle: "Feed Forward マイプロジェクト詳細",
  ogDescription:
    "Feed Forwardのマイプロジェクト詳細ページです。作成したプロジェクトの詳細を確認できます。",
  twitterCard: "summary_large_image",
});

const { id } = useRoute().params;
const supabase = useSupabaseClient();
const preview = ref();
const config = useRuntimeConfig();
const baseUrl = config.public.baseUrl;
const source = ref<string>(`${baseUrl}/projects/${id}`);
const { text, copy, copied, isSupported } = useClipboard({ source });

const projectWithFeedback = computed<ProjectWithFeedback>(() => {
  return projectsData.value as ProjectWithFeedback;
});
const badgeColors = {
  design: "bg-blue/20 text-blue",
  demo: "bg-pink/20 text-pink",
  plan: "bg-purple/20 text-purple",
};
const progressBarColors = ["bg-pink", "bg-blue", "bg-purple"];
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
    value: "---",
  },
  {
    title: "平均評価",
    description: "",
    icon: "mdi:star-check",
    value: "---",
  },
];
const isLoading = ref<boolean>(false);
const isDeleting = ref<boolean>(false);

/******************************
 * Lifecycle Hooks
 ******************************/
const { data: projectsData } = await useAsyncData(
  "myProjectDetails",
  async () => {
    try {
      isLoading.value = true;

      // 1. get project data
      const { data, error } = await supabase.rpc(
        "get_project_with_feedback_by_short_id",
        {
          p_short_id: id,
        }
      );

      if (error) throw new Error(error.message);
      return data as ProjectWithFeedback;
    } catch (error) {
      console.error("Error fetching projects:", error);
      return [];
    }
  },
  {
    server: true,
  }
);

const { data: relatedData } = await useAsyncData(
  "myProjectRelatedData",
  async () => {
    if (!projectsData.value)
      return {
        preview: null,
        userFeedback: null,
        criteriaRatings: [],
      };

    try {
      // 1.get preview data
      const preview = await getLinkPreview(
        projectWithFeedback.value.project.resource_url
      );

      // 2.get rating per criteria
      const ratingPerCriteria = await getRatingPerCriteria();

      // 3. set loading to false
      isLoading.value = false;

      return {
        preview,
        ratingPerCriteria,
      };
    } catch (error) {
      console.error("Error fetching related data:", error);
      return {
        preview: null,
        userFeedback: null,
        ratingPerCriteria: [],
      };
    }
  },
  {
    server: true,
  }
);

watch(
  relatedData,
  (newData) => {
    if (!newData) return;

    // 1. set preview data
    preview.value = newData.preview;

    // 2. set rating per criteria
    ratingPerCriteria.value = newData.ratingPerCriteria || [];

    // 3.initialize feedback analytics contents
    initDashboardContents();

    // 4.initialize feedback contents
    initFeedbackContents();
  },
  { immediate: true }
);

/******************************
 * HELPER FUNCTIONS
 ******************************/
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
  dashboardContents[1].value =
    ratingPerCriteria.value.length > 0
      ? (
          ratingPerCriteria.value.reduce((acc, curr) => acc + curr.rating, 0) /
          ratingPerCriteria.value.length
        ).toFixed(1)
      : "0.0";
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
          title: fb.criteria.name,
          rating: fb.rating,
          created_at: feedback.created_at.toString(),
          user_id: fb.user_id || "",
        })),
        overall_comment: feedback.overall_comment,
        project_type: projectWithFeedback.value.project?.project_type,
        user: {
          id: feedback.user?.id || "",
          display_name: feedback.user?.display_name || "Unknown User",
          avatar_url: feedback.user?.avatar_url || "",
        },
      };
    }
  );
}

async function deleteProject() {
  try {
    isDeleting.value = true;

    const { data, error } = await supabase.rpc("delete_project", {
      p_project_id: projectWithFeedback.value.project.id,
    });

    if (error) {
      throw error;
    }

    setTimeout(() => {
      navigateTo("/my-projects");
      toast.success("プロジェクトを削除しました", {
        description: "プロジェクトは正常に削除されました",
      });
    }, 2000);
  } catch (error) {
    console.error("Error creating project:", error);
    toast.error("プロジェクトの削除に失敗しました", {
      description: "もう一度お試しください",
    });
  }
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

        <div class="flex items-center gap-4 flex-wrap">
          <Badge
            variant="default"
            class="text-xs rounded-full border"
            :class="badgeColors[projectWithFeedback.project.project_type]"
          >
            {{ projectWithFeedback.project.project_type || "未設定" }}
          </Badge>

          <div class="flex items-center gap-px">
            <Icon
              name="mdi:calendar-month"
              class="!size-4 text-muted-foreground"
            />
            <span class="text-xs md:text-sm text-muted-foreground">
              作成日:
              {{
                format(
                  new Date(projectWithFeedback.project.created_at),
                  "yyyy/MM/dd"
                )
              }}
            </span>
          </div>

          <div class="flex items-center gap-1">
            <Icon
              name="mdi:clock-remove-outline"
              class="!size-4 text-muted-foreground"
            />
            <span class="text-xs md:text-sm text-muted-foreground">
              期限:
              {{
                projectWithFeedback.project.deadline
                  ? format(
                      new Date(projectWithFeedback.project.deadline),
                      "yyyy/MM/dd"
                    )
                  : "未設定"
              }}
            </span>
          </div>

          <Button
            v-if="isSupported"
            variant="link"
            class="p-0 hover:text-muted-foreground cursor-pointer gap-1 h-fit hover:no-underline md:text-sm text-xs"
            :class="isDeleting ? 'pointer-events-none opacity-50' : ''"
            @click="copy(source)"
          >
            <Icon v-if="copied" name="mdi:attachment-check" class="!size-4" />
            <Icon v-else name="mdi:attachment" class="!size-4" />
            {{ copied ? "コピーしました" : "シェアリンクをコピー" }}
          </Button>
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
          :class="isDeleting ? 'pointer-events-none opacity-50' : ''"
        >
          <NuxtLink
            :to="`/my-projects/${projectWithFeedback.project.short_id}/edit`"
          >
            <Icon
              name="mdi:text-box-edit-outline"
              class="!size-4 text-muted-foreground"
            />
            プロジェクトを編集
          </NuxtLink>
        </Button>
        <Button
          variant="destructive"
          class="w-full md:w-fit cursor-pointer"
          :disabled="isDeleting"
          @click="deleteProject"
        >
          <Icon name="mdi:delete-outline" class="!size-4 text-white" />
          {{ isDeleting ? "プロジェクトを削除中..." : "プロジェクトを削除" }}
        </Button>
      </div>
    </div>

    <div class="grid md:grid-cols-[1fr_500px] gap-4">
      <!-- left -->
      <div
        v-if="projectWithFeedback.project"
        class="flex flex-col gap-8 border border-muted-foreground/20 rounded-lg p-4 md:p-8 w-full"
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
            <div
              v-if="projectWithFeedback.project.description"
              v-html="projectWithFeedback.project.description"
              class="prose prose-sm project-description text-sm"
            />
            <p v-else class="text-sm text-muted-foreground leading-5">
              説明文がありません
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
                v-if="preview?.images?.[0]"
                :src="preview?.images?.[0] || 'no-image.png'"
                :alt="preview?.title || ''"
                class="object-cover object-center h-52 md:h-96 rounded-t-sm"
              />
              <NuxtImg
                v-else="!preview?.images?.[0]"
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

            <div
              v-if="projectWithFeedback?.evaluation_criteria.length > 0"
              class="flex flex-col gap-4"
            >
              <div
                v-for="(
                  criteria, index
                ) in projectWithFeedback?.evaluation_criteria"
                class="flex flex-col gap-2"
              >
                <div class="flex justify-between items-end">
                  <div class="flex flex-col gap-px max-w-4/6">
                    <p class="text-sm">{{ criteria.name }}</p>
                    <p class="text-xs text-muted-foreground">
                      {{ criteria.description }}
                    </p>
                  </div>
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

            <EmptyProjectCard
              v-if="projectWithFeedback?.evaluation_criteria.length === 0"
              class="h-[200px] md:h-[200px] flex items-center justify-center"
              text="評価項目はありません"
            />
          </div>
        </div>
      </div>

      <!-- right -->
      <div class="flex flex-col gap-4 w-full">
        <!-- analytics -->
        <div
          class="flex flex-col gap-8 border border-muted-foreground/20 rounded-lg p-4 md:p-8"
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
                <span class="text-foreground text-3xl gradient-text">
                  {{ item.value }}
                </span>
                <span class="text-muted-foreground text-sm">
                  {{ item.description }}
                </span>
              </CardContent>
            </Card>
          </div>
        </div>

        <!-- feedback -->
        <div
          class="flex flex-col gap-8 border border-muted-foreground/20 rounded-lg p-4 md:p-8"
        >
          <PageTitle title="フィードバック" size="medium" />

          <div
            v-if="projectWithFeedback.feedbacks.length > 0"
            class="flex flex-col gap-4 w-full"
          >
            <FeedbackCard
              v-for="(feedback, index) in feedbackContents.slice(0, 3)"
              :key="index"
              :feedback="feedback"
              :isClamp="true"
              :isProjectNameDisplay="false"
            />
          </div>

          <div v-if="isLoading" class="flex flex-col gap-8">
            <FeedbackCardSkeleton />
          </div>

          <EmptyProjectCard
            v-if="projectWithFeedback.feedbacks.length === 0"
            class="h-[200px] md:h-[200px] flex items-center justify-center"
            text="最近のフィードバックはありません"
          />

          <Button
            as-child
            variant="main"
            class="w-full cursor-pointer"
            :class="isDeleting ? 'pointer-events-none opacity-50' : ''"
          >
            <NuxtLink
              :to="{
                path: `/my-projects/feedbacks`,
                query: {
                  project_id: projectWithFeedback?.project?.short_id,
                },
              }"
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
