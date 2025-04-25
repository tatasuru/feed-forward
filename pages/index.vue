<script setup lang="ts">
import type { MyProjectWithFeedback } from "@/types/my-projects.types";
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
const projects = ref<MyProjectWithFeedback[]>([]);
const dashboardContents = ref<DashboardContent[]>([]);

try {
  const { data, error } = await supabase.rpc(
    "get_my_projects_with_feedback_ratings",
    {
      user_id: user.value?.id,
    }
  );

  if (error) {
    throw new Error(error.message);
  }

  projects.value = data;
  initDashboardContents(projects.value);
} catch (error) {
  console.error("Error fetching projects:", error);
}

/*********************
 * HELPER FUNCTIONS
 *********************/
function initDashboardContents(projects: MyProjectWithFeedback[]) {
  // 今月のデータを計算
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

  // 期限切れプロジェクト
  const overdueProjects = projects.filter(
    (project) =>
      project.deadline &&
      new Date(project.deadline) < today &&
      project.status !== "completed"
  );

  // 今月作成されたプロジェクト
  const thisMonthProjects = projects.filter(
    (project) => new Date(project.created_at) >= firstDayOfMonth
  );

  // 先月作成されたプロジェクト
  const lastMonthProjects = projects.filter(
    (project) =>
      new Date(project.created_at) >= lastMonthStart &&
      new Date(project.created_at) <= lastMonthEnd
  );

  // 今月受け取ったフィードバック
  const thisMonthFeedbacks = projects.reduce((acc, project) => {
    const feedbacks = project.feedback || [];
    const count = feedbacks.filter(
      (fb) => new Date(fb.created_at) >= firstDayOfMonth
    ).length;
    return acc + count;
  }, 0);

  // 先月受け取ったフィードバック
  const lastMonthFeedbacks = projects.reduce((acc, project) => {
    const feedbacks = project.feedback || [];
    const count = feedbacks.filter(
      (fb) =>
        new Date(fb.created_at) >= lastMonthStart &&
        new Date(fb.created_at) <= lastMonthEnd
    ).length;
    return acc + count;
  }, 0);

  // 増加率計算のヘルパー関数
  const calculateIncreasePercent = (
    current: number,
    previous: number
  ): string => {
    if (previous === 0) return current > 0 ? "+100%" : "0%";
    const percent = ((current - previous) / previous) * 100;
    return percent > 0 ? `+${percent.toFixed(0)}%` : `${percent.toFixed(0)}%`;
  };

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
      description: `先月比 ±0%`, // 平均評価の変化計算は複雑なので簡略化
      icon: "mdi:star-check",
      value:
        projects.reduce(
          (acc, project) =>
            acc +
            (project.average_ratings
              ? project.average_ratings.reduce(
                  (sum, item) => sum + item.average_rating,
                  0
                ) / (project.average_ratings.length || 1)
              : 0),
          0
        ) / (projects.length || 1),
    },
    {
      title: "期限切れプロジェクト",
      description: `今月 ${
        overdueProjects.filter((p) => new Date(p.deadline!) >= firstDayOfMonth)
          .length
      } 件追加`,
      icon: "mdi:alert-clock",
      value: overdueProjects.length,
    },
  ];
}
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

    <Tabs default-value="overview" class="w-full">
      <TabsList>
        <TabsTrigger value="overview" class="cursor-pointer">概要</TabsTrigger>
        <TabsTrigger value="project" class="cursor-pointer">
          プロジェクト
        </TabsTrigger>
        <TabsTrigger value="feedback" class="cursor-pointer">
          フィードバック
        </TabsTrigger>
      </TabsList>
      <TabsContent value="overview" class="flex flex-col md:flex-row gap-4">
        <div
          class="border rounded-md md:p-6 p-4 flex flex-col gap-6 w-full md:w-3/5"
        >
          <PageTitle
            title="最近のフィードバック"
            description="過去7日間に受け取ったフィードバック"
            size="small"
          />
          <div class="p-0 md:p-5 flex flex-col gap-8">
            <div
              class="flex items-start gap-4 hover:scale-103 transition-transform duration-200 ease-in-out cursor-pointer"
            >
              <div class="flex items-center gap-1">
                <Avatar src="/" alt="" class="!size-10">
                  <AvatarImage
                    src="https://images.unsplash.com/photo-1502685104226-e9df14d4d9f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDF8fG1hdGhlc3xlbnwwfHx8fDE2OTI5NzY5NTg&ixlib=rb-4.0.3&q=80&w=400"
                    alt="User Avatar"
                  />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </div>
              <div class="flex flex-col gap-4 w-full">
                <div class="flex flex-col gap-2">
                  <div
                    class="flex flex-col gap-1 md:gap-0 md:flex-row md:items-center justify-between"
                  >
                    <div class="flex items-center gap-2">
                      <h3 class="text-base md:text-lg font-bold">
                        UIデザイン改善案
                      </h3>
                      <Badge
                        variant="outline"
                        class="gradient-bg text-white rounded-full"
                      >
                        デザイン
                      </Badge>
                    </div>
                    <div class="flex items-center gap-px">
                      <Icon
                        v-for="(item, index) in [1, 2, 3, 4, 5]"
                        name="mdi:star-outline"
                        class="!size-5 text-yellow-500"
                      />
                    </div>
                  </div>
                  <p class="text-sm text-muted-foreground">
                    ナビゲーションの動線が分かりやすくなりました。モバイル表示の最適化がさらに必要かもしれません。
                  </p>
                </div>
                <div class="flex flex-row items-center gap-4">
                  <div class="flex items-center gap-1">
                    <Icon
                      name="mdi:clock-outline"
                      class="!size-4 text-muted-foreground"
                    />
                    <span class="text-sm text-muted-foreground">2日前</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <Icon
                      name="mdi:account-outline"
                      class="!size-4 text-muted-foreground"
                    />
                    <span class="text-sm text-muted-foreground">佐藤さん</span>
                  </div>
                </div>
              </div>
            </div>
            <Separator />
            <div
              class="flex items-start gap-4 hover:scale-103 transition-transform duration-200 ease-in-out cursor-pointer"
            >
              <div class="flex items-center gap-1">
                <Avatar src="/" alt="" class="!size-10">
                  <AvatarImage
                    src="https://images.unsplash.com/photo-1502685104226-e9df14d4d9f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDF8fG1hdGhlc3xlbnwwfHx8fDE2OTI5NzY5NTg&ixlib=rb-4.0.3&q=80&w=400"
                    alt="User Avatar"
                  />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </div>
              <div class="flex flex-col gap-4 w-full">
                <div class="flex flex-col gap-2">
                  <div
                    class="flex flex-col gap-1 md:gap-0 md:flex-row md:items-center justify-between"
                  >
                    <div class="flex items-center gap-2">
                      <h3 class="text-base md:text-lg font-bold">
                        UIデザイン改善案
                      </h3>
                      <Badge
                        variant="outline"
                        class="gradient-bg text-white rounded-full"
                      >
                        デザイン
                      </Badge>
                    </div>
                    <div class="flex items-center gap-px">
                      <Icon
                        v-for="(item, index) in [1, 2, 3, 4, 5]"
                        name="mdi:star-outline"
                        class="!size-5 text-yellow-500"
                      />
                    </div>
                  </div>
                  <p class="text-sm text-muted-foreground">
                    ナビゲーションの動線が分かりやすくなりました。モバイル表示の最適化がさらに必要かもしれません。
                  </p>
                </div>
                <div class="flex flex-row items-center gap-4">
                  <div class="flex items-center gap-1">
                    <Icon
                      name="mdi:clock-outline"
                      class="!size-4 text-muted-foreground"
                    />
                    <span class="text-sm text-muted-foreground">2日前</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <Icon
                      name="mdi:account-outline"
                      class="!size-4 text-muted-foreground"
                    />
                    <span class="text-sm text-muted-foreground">佐藤さん</span>
                  </div>
                </div>
              </div>
            </div>
            <Separator />

            <Button variant="outline" class="w-full cursor-pointer">
              すべてのフィードバックを表示
            </Button>
          </div>
        </div>
        <div
          class="border rounded-md md:p-6 p-4 flex flex-col gap-6 w-full md:w-2/5"
        >
          <PageTitle
            title="進行中のプロジェクト"
            description="現在フィードバック募集中のプロジェクト"
            size="small"
          />
        </div>
      </TabsContent>
      <TabsContent value="project"> プロジェクト一覧 </TabsContent>
      <TabsContent value="feedback"> フィードバック一覧 </TabsContent>
    </Tabs>
  </div>
</template>
