<script setup lang="ts">
import type { MyProjectWithFeedback } from "@/types/my-projects.types";

definePageMeta({
  middleware: "auth",
  title: "ダッシュボード",
  description: "プロジェクトとフィードバックの概要",
  ogTitle: "Feed Forward ダッシュボード",
  ogDescription: "チームの活動状況を一目で確認",
  twitterCard: "summary_large_image",
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
const store = useStore();

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
      project.status === "completed"
  );

  const thisMonthProjects = projects.filter(
    (project) =>
      new Date(project.created_at) >= firstDayOfMonth &&
      project.status === "active"
  );

  const lastMonthProjects = projects.filter(
    (project) =>
      new Date(project.created_at) >= lastMonthStart &&
      new Date(project.created_at) <= lastMonthEnd &&
      project.status === "active"
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
      value: projects.filter((project) => project.status === "active").length,
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
      value:
        Number(
          (
            totalAvgRating / projects.filter((p) => p.avg_rating).length
          ).toFixed(1)
        ) || 0,
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
  projects.map((project) => {
    const feedbacks = project.feedbacks || [];

    if (feedbacks.length === 0) {
      return {};
    }

    feedbacks.map((feedback: any) => {
      feedbackContents.value.unshift({
        ...feedbackContents.value,
        id: project.id,
        title: project.title,
        description: project.description,
        created_at: project.created_at.toString(),
        feedback_ratings: feedback?.ratings.map((fb: any, index: number) => ({
          title: feedback.ratings[index]?.name,
          rating: Number(fb.rating),
          created_at: feedback.created_at.toString(),
          user_id: fb.user_id || "",
        })),
        overall_comment: feedback ? feedback.overall_comment : "",
        project_type: project.project_type,
        user: {
          id: feedback?.user?.id || "",
          display_name: feedback?.user?.display_name || "Unknown User",
          avatar_url: feedback?.user?.avatar_url || "",
        },
      });
    });
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
  <div id="dashboard" class="grid w-full gap-12">
    <PageTitle
      title="ダッシュボード"
      description="プロジェクトとフィードバックの概要"
      size="large"
    />

    <div class="grid gap-12 md:gap-16 w-full">
      <div class="grid gap-4 w-full">
        <div
          class="flex flex-col md:flex-row gap-4 md:gap-12 justify-between items-start"
        >
          <div class="flex items-start gap-4">
            <Avatar class="cursor-pointer size-20">
              <AvatarImage
                :src="store.profile.avatar_url || 'default-avatar.png'"
                alt="avatar"
              />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div class="flex flex-col gap-1">
              <p class="text-xl font-semibold">
                {{ store.profile.display_name }}
              </p>
              <p v-if="store.profile.bio" class="text-sm text-muted-foreground">
                {{ store.profile.bio }}
              </p>
              <NuxtLink
                v-if="store.profile.website"
                :to="store.profile.website"
                target="_blank"
                class="text-sm text-link flex items-center gap-1"
              >
                <Icon name="mdi:link" class="!size-4 text-link" />
                サイトへ
              </NuxtLink>
            </div>
          </div>

          <Button as-child variant="outline" class="w-full md:w-fit">
            <NuxtLink to="/settings/account" class="flex items-center gap-2">
              <Icon name="mdi:account" class="!size-4" />
              プロフィールを編集
            </NuxtLink>
          </Button>
        </div>

        <div
          class="flex items-center gap-2 md:gap-4 overflow-x-scroll hidden-scrollbar max-w-full"
        >
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
      </div>

      <div id="summary" class="grid gap-12">
        <!-- projects -->
        <div class="flex flex-col gap-4">
          <div class="flex items-center justify-between">
            <PageTitle
              title="進行中のプロジェクト"
              description="現在アクティブなプロジェクトの一覧"
              size="small"
            />

            <Button as-child variant="outline" class="hidden md:flex w-fit">
              <NuxtLink to="/my-projects" class="flex items-center gap-2">
                すべてのプロジェクトを見る
                <Icon name="mdi:arrow-top-right" class="!size-4" />
              </NuxtLink>
            </Button>
          </div>

          <div
            v-if="activeProjects.length > 0"
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
            class="min-h-[320px] flex items-center justify-center"
            text="進行中のプロジェクトはありません"
            label="プロジェクトを作成する"
            icon="mdi:plus-circle-outline"
            link="/create-project"
          />

          <Button variant="outline" as-child class="w-full md:hidden flex">
            <NuxtLink to="/my-projects" class="flex items-center gap-2">
              すべてのプロジェクトを見る
              <Icon name="mdi:arrow-top-right" class="!size-4" />
            </NuxtLink>
          </Button>
        </div>

        <!-- feedbacks -->
        <div class="flex flex-col gap-4">
          <div class="flex items-center justify-between">
            <PageTitle
              title="最近のフィードバック"
              description="最近受け取ったフィードバックの一覧"
              size="small"
            />

            <Button as-child variant="outline" class="hidden md:flex w-fit">
              <NuxtLink
                :to="{
                  path: '/my-projects/feedbacks',
                  query: {
                    project_id: 'all',
                  },
                }"
                class="flex items-center gap-2"
              >
                すべてのフィードバックを見る
                <Icon name="mdi:arrow-top-right" class="!size-4" />
              </NuxtLink>
            </Button>
          </div>

          <div
            v-if="
              feedbackContents.length > 0 &&
              feedbackContents[0].feedback_ratings
            "
            class="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-3"
          >
            <FeedbackCard
              v-for="(feedback, index) in feedbackContents.slice(0, 6)"
              :key="index"
              :feedback="feedback"
              :isClamp="true"
              :isProjectNameDisplay="true"
            />
          </div>

          <EmptyProjectCard
            v-if="
              feedbackContents.length === 0 ||
              !feedbackContents[0].feedback_ratings
            "
            class="min-h-[240px] flex items-center justify-center"
            text="最近のフィードバックはありません"
            label="プロジェクトを作成する"
            icon="mdi:plus-circle-outline"
            link="/create-project"
          />

          <Button variant="outline" as-child class="w-full md:hidden flex">
            <NuxtLink
              :to="{
                path: '/my-projects/feedbacks',
                query: {
                  project_id: 'all',
                },
              }"
              class="flex items-center gap-2"
            >
              すべてのフィードバックを見る
              <Icon name="mdi:arrow-top-right" class="!size-4" />
            </NuxtLink>
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
