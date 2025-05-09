<script setup lang="ts">
import type { AllProjectWithFeedback } from "@/types/projects.types";

definePageMeta({
  middleware: "auth",
  title: "フィードバック一覧",
  description:
    "Feed Forwardのフィードバック一覧ページです。あなたが受けたフィードバックを確認できます。",
  ogTitle: "Feed Forward フィードバック一覧",
  ogDescription:
    "Feed Forwardのフィードバック一覧ページです。あなたが受けたフィードバックを確認できます。",
  twitterCard: "summary_large_image",
});

const supabase = useSupabaseClient();
const user = useSupabaseUser();
const { project_id } = useRoute().query;

const isLoading = ref<boolean>(false);
const selectItems = ref<{ value: string; label: string }[]>([
  {
    value: "all",
    label: "すべて",
  },
]);
const projectWithFeedback = ref<AllProjectWithFeedback>();
const feedbackContents = ref<any>();
const ratingPerCriteria = ref<
  {
    title: string;
    criteria_id: string;
    rating: number;
  }[]
>([]);
const router = useRouter();

/******************************
 * Lifecycle Hooks
 ******************************/
const { data: selectItem } = await useAsyncData(
  "myProjectSelectItems",
  async () => {
    try {
      isLoading.value = true;

      // 1. get project data
      const { data, error } = await supabase
        .from("projects")
        .select("short_id, title")
        .eq("user_id", user.value?.id)
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);

      return data;
    } catch (error) {
      console.error("Error fetching projects:", error);
      return [];
    }
  },
  {
    server: true,
  }
);

const { data: projectsData } = await useAsyncData(
  "myProjectDetails",
  async () => {
    try {
      isLoading.value = true;

      // 1. get project data
      const { data, error } = await supabase.rpc(
        "get_user_feedback_by_short_id",
        {
          p_user_id: user.value?.id,
          p_short_id: project_id !== "all" ? project_id : null,
        }
      );

      if (error) throw new Error(error.message);

      return data as AllProjectWithFeedback;
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
    try {
      projectWithFeedback.value =
        projectsData.value && Array.isArray(projectsData.value) === false
          ? projectsData.value
          : undefined;

      const ratingPerCriteria = await getRatingPerCriteria();

      return ratingPerCriteria;
    } catch (error) {
      console.error("Error fetching projects:", error);
      return [];
    }
  },
  {
    server: false,
    watch: [() => projectsData.value],
  }
);

watch(
  relatedData,
  (newData) => {
    if (!newData) return;

    ratingPerCriteria.value = newData?.flat() || [];

    initFeedbackContents();
  },
  {
    immediate: true,
  }
);

watch(
  selectItem,
  (newData) => {
    if (!newData) return;

    selectItems.value.push(
      ...newData.map((item: { short_id: string; title: string }) => ({
        value: item.short_id,
        label: item.title,
      }))
    );
  },
  {
    immediate: true,
  }
);

/*****************************
 * HELPER FUNCTIONS
 *****************************/
async function getRatingPerCriteria() {
  const projects = projectWithFeedback.value?.projects;
  const feedbacks = projectWithFeedback.value?.feedbacks;
  const ratingAvgByCriteriaId: Record<string, number> = {};
  const ratingCountByCriteriaId: Record<string, number> = {};

  // 1. insert feedbacks into each criteria variable
  feedbacks?.map((feedback) => {
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
  return projects?.map((project) => {
    return project.evaluation_criteria.map((criteria) => {
      return {
        title: criteria.name,
        criteria_id: criteria.id,
        rating: ratingAvgByCriteriaId[criteria.id] || 0,
      };
    });
  });
}

function initFeedbackContents() {
  const projects = projectWithFeedback.value?.projects;
  const feedbacks = projectWithFeedback.value?.feedbacks;

  feedbackContents.value = feedbacks?.map((feedback, feedbackIndex) => {
    return {
      id: feedback.id,
      title: projects?.[0]?.project?.title,
      description: feedback.overall_comment,
      created_at: feedback.created_at.toString(),
      feedback_ratings: feedback.ratings.map((fb: any, index: number) => ({
        title: projects?.[0].evaluation_criteria[index].name,
        rating: fb.rating,
        created_at: feedback.created_at.toString(),
        user_id: feedback.user?.id || null,
      })),
      overall_comment: feedback.overall_comment,
      project_type: projects?.[0].project.project_type,
      user: {
        id: feedback.user?.id || "",
        display_name: feedback.user?.display_name || "Unknown User",
        avatar_url: feedback.user?.avatar_url || "",
      },
    };
  });
}

async function selectProject(projectId: string) {
  // 1. get project data
  const { data, error } = await supabase.rpc("get_user_feedback_by_short_id", {
    p_user_id: user.value?.id,
    p_short_id: projectId !== "all" ? projectId : null,
  });

  if (error) throw new Error(error.message);

  projectWithFeedback.value = data;

  // 2. get the rating per criteria
  const criteriaRatings = await getRatingPerCriteria();
  ratingPerCriteria.value = criteriaRatings?.flat() || [];

  // 3. set the project data to the feedbackContents
  initFeedbackContents();

  // 4. set query params
  const query = useRoute().query;
  const newQuery = { ...query, project_id: projectId };
  router.push({ query: newQuery });
}
</script>

<template>
  <div id="create-project" class="grid w-full gap-8">
    <PageTitle
      title="フィードバック一覧"
      description="みんなからのフィードバックを確認"
      size="large"
    />

    <Tabs default-value="all" class="w-full gap-4 md:gap-8">
      <div
        class="flex flex-col-reverse md:flex-row md:items-center gap-4 justify-between"
      >
        <TabsList class="w-full md:w-[400px]">
          <TabsTrigger value="all" class="cursor-pointer"> すべて </TabsTrigger>
          <TabsTrigger value="high-evaluation" class="cursor-pointer">
            高評価
          </TabsTrigger>
          <TabsTrigger value="improvement" class="cursor-pointer">
            改善点
          </TabsTrigger>
          <TabsTrigger value="recently-evaluation" class="cursor-pointer">
            最近のフィードバック
          </TabsTrigger>
        </TabsList>
        <Select
          :default-value="project_id ? project_id : 'all'"
          @update:model-value="selectProject"
        >
          <SelectTrigger class="cursor-pointer w-full md:w-[200px]">
            <SelectValue placeholder="プロジェクトを選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem
                v-for="(item, index) in selectItems"
                :key="index"
                :value="item.value"
                class="cursor-pointer"
              >
                {{ item.label }}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <!-- all -->
      <TabsContent value="all" class="w-full min-h-[calc(100vh-300px)]">
        <div
          v-if="feedbackContents?.length"
          class="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-3"
        >
          <FeedbackCard
            v-for="(feedback, index) in feedbackContents"
            :key="index"
            :feedback="feedback"
            :isDashboard="true"
          />
        </div>

        <EmptyProjectCard
          v-if="feedbackContents?.length === 0"
          text="最近のフィードバックはありません"
        />
      </TabsContent>

      <!-- high evaluation -->
      <TabsContent
        value="high-evaluation"
        class="w-full min-h-[calc(100vh-300px)]"
      >
        <div
          v-if="feedbackContents?.length"
          class="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-3"
        >
          <FeedbackCard
            v-for="(feedback, index) in feedbackContents"
            :key="index"
            :feedback="feedback"
            :isDashboard="true"
            class="border rounded-lg p-4"
          />
        </div>

        <EmptyProjectCard
          v-if="feedbackContents?.length === 0"
          text="最近のフィードバックはありません"
        />
      </TabsContent>

      <!-- improvement -->
      <TabsContent value="improvement" class="w-full min-h-[calc(100vh-300px)]">
        <div
          v-if="feedbackContents?.length"
          class="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-3"
        >
          <FeedbackCard
            v-for="(feedback, index) in feedbackContents"
            :key="index"
            :feedback="feedback"
            :isDashboard="true"
            class="border rounded-lg p-4"
          />
        </div>

        <EmptyProjectCard
          v-if="feedbackContents?.length === 0"
          text="最近のフィードバックはありません"
        />
      </TabsContent>

      <!-- recently evaluation -->
      <TabsContent
        value="recently-evaluation"
        class="w-full min-h-[calc(100vh-300px)]"
      >
        <div
          v-if="feedbackContents?.length"
          class="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-3"
        >
          <FeedbackCard
            v-for="(feedback, index) in feedbackContents"
            :key="index"
            :feedback="feedback"
            :isDashboard="true"
            class="border rounded-lg p-4"
          />
        </div>

        <EmptyProjectCard
          v-if="feedbackContents?.length === 0"
          text="最近のフィードバックはありません"
        />
      </TabsContent>
    </Tabs>
  </div>
</template>
