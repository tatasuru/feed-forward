<script setup lang="ts">
import type { MyProject } from "@/types/my-projects.types";
import { format } from "date-fns";

definePageMeta({
  middleware: "auth",
});

const supabase = useSupabaseClient();
const myProjects = ref<MyProject[]>([]);
const myContributedProjects = ref<MyProject[]>([]);
const badgeColors = {
  design: "bg-blue/20 text-blue",
  demo: "bg-pink/20 text-pink",
  plan: "bg-purple/20 text-purple",
};
const visibilityTypeIcon = {
  public: "mdi:earth",
  limited: "mdi:lock-open",
  private: "mdi:lock",
};
const statusType = {
  draft: "下書き",
  active: "進行中",
  completed: "完了",
  archived: "アーカイブ",
};

onMounted(async () => {
  try {
    const { data, error } = await supabase.rpc("get_my_projects");

    if (error) {
      throw new Error(error.message);
    }

    // set the data to the ref variables
    myProjects.value = data.created_projects;
    myContributedProjects.value = data.contributed_projects;
  } catch (error) {
    console.error("Error fetching projects:", error);
  }
});
</script>

<template>
  <div id="create-project" class="grid w-full gap-8">
    <PageTitle
      title="マイプロジェクト"
      description="あなたが作成したフィードバックプロジェクト"
      size="large"
    />

    <Tabs default-value="all" class="w-full gap-8">
      <div
        class="flex flex-col-reverse gap-4 md:flex-row md:items-center items-end md:justify-between w-full"
      >
        <TabsList class="w-full md:w-[400px]">
          <TabsTrigger value="all" class="cursor-pointer"> すべて </TabsTrigger>
          <TabsTrigger value="active" class="cursor-pointer">
            進行中
          </TabsTrigger>
          <TabsTrigger value="draft" class="cursor-pointer">
            下書き
          </TabsTrigger>
          <TabsTrigger value="completed" class="cursor-pointer">
            完了
          </TabsTrigger>
        </TabsList>
        <Button as-child>
          <NuxtLink to="/create-project" class="gradient-bg w-fit text-white">
            <Icon name="mdi:plus-circle-outline" class="!size-4" />
            新規プロジェクト作成
          </NuxtLink>
        </Button>
      </div>
      <TabsContent value="all" class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card v-for="project in myProjects" :key="project.id">
          <CardHeader>
            <div class="flex items-start justify-between">
              <div class="flex flex-col gap-2">
                <Badge
                  variant="default"
                  class="text-xs rounded-full border"
                  :class="badgeColors[project.project_type]"
                >
                  {{ project.project_type }}
                </Badge>
                <CardTitle>{{ project.title }}</CardTitle>
              </div>
              <Icon
                :name="visibilityTypeIcon[`${project.visibility_type}`]"
                class="!size-4 text-muted-foreground"
              />
            </div>
            <CardDescription>
              {{ project.description }}
            </CardDescription>
          </CardHeader>
          <CardContent class="flex items-center gap-12">
            <div class="flex flex-col gap-1">
              <div class="flex items-center gap-1">
                <Icon name="mdi:message-outline" class="!size-4" />
                <span class="text-sm">フィードバック数</span>
              </div>
              <span class="text-2xl text-blue font-bold">
                {{ project.feedback_count }}
              </span>
            </div>
            <div class="flex flex-col gap-1">
              <div class="flex items-center gap-1">
                <Icon name="mdi:star-outline" class="!size-4" />
                <span class="text-sm">平均評価</span>
              </div>
              <span class="text-2xl text-blue font-bold">
                <div class="flex items-center gap-2">
                  <div class="flex items-center gap-px">4.2</div>
                </div>
              </span>
            </div>
          </CardContent>
          <CardFooter
            class="flex flex-col lg:flex-row items-center justify-between gap-6"
          >
            <div class="flex flex-col lg:flex-row gap-2 lg:gap-4 w-full">
              <div class="flex items-center gap-1">
                <Icon
                  name="mdi:calendar-month"
                  class="!size-4 text-muted-foreground"
                />
                <span class="text-sm text-muted-foreground">
                  作成日:
                  {{ format(new Date(project.created_at), "yyyy/MM/dd") }}
                </span>
              </div>
              <div class="flex items-center gap-1">
                <Icon
                  name="mdi:clock-remove-outline"
                  class="!size-4 text-muted-foreground"
                />
                <span class="text-sm text-muted-foreground">
                  期限:
                  {{ format(new Date(project.deadline), "yyyy/MM/dd") }}
                </span>
              </div>
              <div class="flex items-center gap-1">
                <Icon
                  name="pajamas:status-health"
                  class="!size-4 text-muted-foreground"
                />
                <span class="text-sm text-muted-foreground">
                  ステータス: {{ statusType[project.status] }}
                </span>
              </div>
            </div>
            <Button
              as-child
              variant="main"
              class="w-full lg:w-fit h-fit lg:py-1 lg:px-6 rounded-sm"
            >
              <NuxtLink
                :to="`/my-projects/${project.id}`"
                class="text-sm text-purple dark:text-white"
              >
                詳細を見る
              </NuxtLink>
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="active">
        Make changes to your account here.
      </TabsContent>
      <TabsContent value="draft"> Change your password here. </TabsContent>
      <TabsContent value="completed"> Change your password here. </TabsContent>
    </Tabs>
  </div>
</template>
