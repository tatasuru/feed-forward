<script setup lang="ts">
import type { MyProjectWithFeedback } from "@/types/my-projects.types";
import { object } from "zod";
definePageMeta({
  middleware: "auth",
});

type DashboardContent = {
  title: string;
  description: string;
  icon: string;
  value: number;
};

const supabase = useSupabaseClient();
const user = useSupabaseUser();
const projects = computed<MyProjectWithFeedback[]>(
  () => projectsData.value || []
);
const activeProjects = computed<MyProjectWithFeedback[]>(() =>
  projects.value.filter((project) => project.status === "active")
);
const dashboardContents = ref<DashboardContent[]>([]);
const feedbackContents = ref<any[]>([]);
const activeTab = ref<"projects" | "feedbacks">("projects");

/**********************
 * LIFECYCLE HOOKS
 *********************/
const { data: projectsData } = await useAsyncData(
  "myProjects",
  async () => {
    try {
      const { data, error } = await supabase.rpc(
        "get_my_projects_with_feedback_ratings",
        {
          user_id: user.value?.id,
        }
      );

      if (error) throw new Error(error.message);
      return data;
    } catch (error) {
      console.error("Error fetching projects:", error);
      return [];
    }
  },
  {
    watch: [() => user.value?.id],
    server: true,
  }
);

/*********************
 * HELPER FUNCTIONS
 *********************/
function initDashboardContents(projects: MyProjectWithFeedback[]) {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

  const overdueProjects = projects.filter(
    (project) =>
      project.deadline &&
      new Date(project.deadline) < today &&
      project.status !== "completed"
  );

  const thisMonthProjects = projects.filter(
    (project) => new Date(project.created_at) >= firstDayOfMonth
  );

  const lastMonthProjects = projects.filter(
    (project) =>
      new Date(project.created_at) >= lastMonthStart &&
      new Date(project.created_at) <= lastMonthEnd
  );

  const thisMonthFeedbacks = projects.reduce((acc, project) => {
    const feedbacks = project.feedbacks || [];
    const count = feedbacks.filter(
      (fb) => new Date(fb.created_at) >= firstDayOfMonth
    ).length;
    return acc + count;
  }, 0);

  const lastMonthFeedbacks = projects.reduce((acc, project) => {
    const feedbacks = project.feedbacks || [];
    const count = feedbacks.filter(
      (fb) =>
        new Date(fb.created_at) >= lastMonthStart &&
        new Date(fb.created_at) <= lastMonthEnd
    ).length;
    return acc + count;
  }, 0);

  const calculateIncreasePercent = (
    current: number,
    previous: number
  ): string => {
    if (previous === 0) return current > 0 ? "+100%" : "0%";
    const percent = ((current - previous) / previous) * 100;
    return percent > 0 ? `+${percent.toFixed(0)}%` : `${percent.toFixed(0)}%`;
  };

  const totalAvgRating = projects.reduce((acc, project) => {
    acc += project.avg_rating || 0;
    return acc;
  }, 0);

  dashboardContents.value = [
    {
      title: "アクティブプロジェクト",
      description: `今月 ${calculateIncreasePercent(
        thisMonthProjects.length,
        lastMonthProjects.length
      )} 増加`,
      icon: "mdi:file-document",
      value: projects.length,
    },
    {
      title: "受け取ったフィードバック",
      description: `今月 ${calculateIncreasePercent(
        thisMonthFeedbacks,
        lastMonthFeedbacks
      )} 増加`,
      icon: "mdi:comment-check-outline",
      value: projects.reduce((acc, project) => acc + project.feedback_count, 0),
    },
    {
      title: "平均評価",
      description: `先月比 ±0%`,
      icon: "mdi:star-check",
      value: Number(
        (totalAvgRating / projects.filter((p) => p.avg_rating).length).toFixed(
          1
        )
      ),
    },
    {
      title: "期限切れプロジェクト",
      description: `今月 ${
        overdueProjects.filter((p) => new Date(p.deadline!) >= firstDayOfMonth)
          .length
      } 件追加`,
      icon: "mdi:alert-circle-outline",
      value: overdueProjects.length,
    },
  ];
}

function initFeedbackContents(projects: any[]) {
  feedbackContents.value = projects.map((project) => {
    const feedbacks = project.feedbacks || [];

    if (feedbacks.length === 0) {
      return {};
    }

    return {
      id: project.id,
      title: project.title,
      description: project.description,
      created_at: project.created_at.toString(),
      feedback_ratings: feedbacks[0]?.ratings.map((fb: any, index: number) => ({
        title: feedbacks[0]?.ratings[index]?.name,
        rating: Number(fb.rating),
        created_at: feedbacks[0]?.created_at.toString(),
        user_id: fb.user_id || "",
      })),
      overall_comment: feedbacks.length ? feedbacks[0].overall_comment : "",
      project_type: project.project_type,
      user: {
        id: feedbacks[0]?.user?.id || "",
        display_name: feedbacks[0]?.user?.display_name || "Unknown User",
        avatar_url: feedbacks[0]?.user?.avatar_url || "",
      },
    };
  });
}

watch(
  projects,
  (newProjects) => {
    initDashboardContents(newProjects);
    initFeedbackContents(newProjects);
  },
  { immediate: true }
);
</script>

<template>
  <div id="dashboard" class="grid w-full gap-8">
    <PageTitle
      title="ダッシュボード"
      description="プロジェクトとフィードバックの概要"
      size="large"
    />

    <div class="flex items-center gap-2 md:gap-4 overflow-scroll">
      <Card
        v-for="(item, index) in dashboardContents"
        :key="index"
        class="py-5 md:min-w-[330px] min-w-[270px]"
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

    <Tabs default-value="projects" class="w-full" v-model="activeTab">
      <div class="flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="projects" class="cursor-pointer">
            進行中のプロジェクト
          </TabsTrigger>
          <TabsTrigger value="feedbacks" class="cursor-pointer">
            最新フィードバック
          </TabsTrigger>
        </TabsList>
        <Button
          variant="outline"
          as-child
          v-if="activeTab === 'projects'"
          class="hidden md:flex"
        >
          <NuxtLink to="/my-projects"> すべてのプロジェクトを見る </NuxtLink>
        </Button>
        <Button
          v-if="activeTab === 'feedbacks'"
          variant="outline"
          as-child
          class="hidden md:flex"
        >
          <NuxtLink to="/my-projects/feedbacks">
            すべてのフィードバックを見る
          </NuxtLink>
        </Button>
      </div>

      <!-- projects -->
      <TabsContent value="projects" class="flex flex-col gap-6">
        <div
          class="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-3"
        >
          <MyProjectCard
            v-for="(project, index) in activeProjects.slice(0, 6)"
            :key="index"
            :project="project"
          />
        </div>

        <EmptyProjectCard
          v-if="activeProjects.length === 0"
          class="h-full flex items-center justify-center"
          text="進行中のプロジェクトはありません"
          label="プロジェクトを作成してフィードバックを受け取る"
          icon="mdi:plus-circle-outline"
          link="/create-project"
        />

        <Button
          v-if="activeTab === 'projects'"
          variant="outline"
          as-child
          class="w-full md:hidden flex"
        >
          <NuxtLink to="/my-projects"> すべてのプロジェクトを見る </NuxtLink>
        </Button>
      </TabsContent>

      <!-- feedbacks -->
      <TabsContent value="feedbacks" class="flex flex-col gap-6">
        <div
          class="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-3"
        >
          <FeedbackCard
            v-for="(feedback, index) in feedbackContents.slice(0, 6)"
            :key="index"
            :feedback="feedback"
            :isDashboard="true"
          />
        </div>

        <EmptyProjectCard
          v-if="feedbackContents.length === 0"
          class="h-full flex items-center justify-center"
          text="最近のフィードバックはありません"
          label="プロジェクトを作成してフィードバックを受け取る"
          icon="mdi:plus-circle-outline"
          link="/create-project"
        />

        <Button
          v-if="activeTab === 'feedbacks'"
          variant="outline"
          as-child
          class="w-full md:hidden flex"
        >
          <NuxtLink to="/my-projects/feedbacks">
            すべてのフィードバックを見る
          </NuxtLink>
        </Button>
      </TabsContent>
    </Tabs>
  </div>
</template>
