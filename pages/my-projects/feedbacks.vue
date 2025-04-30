<script setup lang="ts">
import type { AllProjectWithFeedback } from "@/types/projects.types";

const supabase = useSupabaseClient();
const user = useSupabaseUser();
const { project_id } = useRoute().query;

const isLoading = ref<boolean>(false);
const projectWithFeedback = computed<AllProjectWithFeedback>(() => {
  return projectsData.value as AllProjectWithFeedback;
});
const feedbackContents = ref<any[]>([]);
const ratingPerCriteria = ref<
  {
    title: string;
    criteria_id: string;
    rating: number;
  }[]
>([]);

/******************************
 * Lifecycle Hooks
 ******************************/
const { data: projectsData } = await useAsyncData(
  "myProjectDetails",
  async () => {
    try {
      isLoading.value = true;

      // 1. get project data
      const { data, error } = await supabase.rpc("get_user_feedback", {
        p_user_id: user.value?.id,
        p_project_id: project_id ? project_id : "",
      });

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

/*****************************
 * HELPER FUNCTIONS
 *****************************/
async function getRatingPerCriteria() {
  const projects = projectWithFeedback.value.projects;
  const feedbacks = projectWithFeedback.value.feedbacks;
  const ratingAvgByCriteriaId: Record<string, number> = {};
  const ratingCountByCriteriaId: Record<string, number> = {};

  // 1. insert feedbacks into each criteria variable
  feedbacks.map((feedback) => {
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
  return projects.map((project) => {
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
  const projects = projectWithFeedback.value.projects;
  const feedbacks = projectWithFeedback.value.feedbacks;

  feedbackContents.value = feedbacks.map((feedback, feedbackIndex) => {
    return {
      id: feedback.id,
      title: projects[feedbackIndex].project.title,
      description: feedback.overall_comment,
      created_at: feedback.created_at.toString(),
      feedback_ratings: feedback.ratings.map((fb: any, index: number) => ({
        title: projects[feedbackIndex].evaluation_criteria[index].name,
        rating: fb.rating,
        created_at: feedback.created_at.toString(),
        user_id: feedback.user?.id || null,
      })),
      overall_comment: feedback.overall_comment,
      project_type: projects[feedbackIndex].project.project_type,
      user: {
        id: feedback.user?.id || "",
        display_name: feedback.user?.display_name || "Unknown User",
        avatar_url: feedback.user?.avatar_url || "",
      },
    };
  });
}
</script>

<template>
  <div id="create-project" class="grid w-full gap-8">
    <PageTitle
      title="フィードバック一覧"
      description="みんなからのフィードバックを確認"
      size="large"
    />

    <Tabs default-value="all" class="w-full gap-8">
      <div class="flex items-center justify-between">
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
        <Select>
          <SelectTrigger class="cursor-pointer">
            <SelectValue placeholder="プロジェクトを選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem
                v-for="(project, index) in projectWithFeedback?.projects"
                :key="index"
                :value="project.project.id"
                class="cursor-pointer"
              >
                {{ project.project.title }}
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
          <div
            v-for="(feedback, index) in feedbackContents"
            :key="index"
            class="border rounded-lg p-4"
          >
            <FeedbackCard :feedback="feedback" :isDashboard="true" />
          </div>
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
          <div
            v-for="(feedback, index) in feedbackContents"
            :key="index"
            class="border rounded-lg p-4"
          >
            <FeedbackCard :feedback="feedback" :isDashboard="true" />
          </div>
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
          <div
            v-for="(feedback, index) in feedbackContents"
            :key="index"
            class="border rounded-lg p-4"
          >
            <FeedbackCard :feedback="feedback" :isDashboard="true" />
          </div>
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
          <div
            v-for="(feedback, index) in feedbackContents"
            :key="index"
            class="border rounded-lg p-4"
          >
            <FeedbackCard :feedback="feedback" :isDashboard="true" />
          </div>
        </div>

        <EmptyProjectCard
          v-if="feedbackContents?.length === 0"
          text="最近のフィードバックはありません"
        />
      </TabsContent>
    </Tabs>
  </div>
</template>
