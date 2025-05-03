<script setup lang="ts">
import type { MyProject } from "@/types/my-projects.types";

definePageMeta({
  middleware: "auth",
});

const supabase = useSupabaseClient();
const user = useSupabaseUser();
const myProjects = computed<MyProject[]>(() => projectsData.value || []);
const myActiveProjects = computed<MyProject[]>(() =>
  myProjects.value.filter((project: MyProject) => project.status === "active")
);
const myDraftProjects = computed<MyProject[]>(() =>
  myProjects.value.filter((project: MyProject) => project.status === "draft")
);
const myCompletedProjects = computed<MyProject[]>(() =>
  myProjects.value.filter(
    (project: MyProject) => project.status === "completed"
  )
);

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
      <TabsContent value="all" class="w-full min-h-[calc(100vh-300px)]">
        <div
          v-if="myProjects.length > 0"
          class="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-3"
        >
          <MyProjectCard v-for="project in myProjects" :project="project" />
        </div>
        <EmptyProjectCard v-else text="プロジェクトはありません" />
      </TabsContent>
      <TabsContent value="active" class="w-full min-h-[calc(100vh-300px)]">
        <div
          v-if="myActiveProjects.length > 0"
          class="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-3"
        >
          <MyProjectCard
            v-for="project in myActiveProjects"
            :key="project.id"
            :project="project"
          />
        </div>
        <EmptyProjectCard v-else text="プロジェクトはありません" />
      </TabsContent>
      <TabsContent value="draft" class="w-full min-h-[calc(100vh-300px)]">
        <div
          v-if="myDraftProjects.length > 0"
          class="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-3"
        >
          <MyProjectCard
            v-for="project in myDraftProjects"
            :key="project.id"
            :project="project"
          />
        </div>
        <EmptyProjectCard v-else text="プロジェクトはありません" />
      </TabsContent>
      <TabsContent value="completed" class="w-full min-h-[calc(100vh-300px)]">
        <div
          v-if="myCompletedProjects.length > 0"
          class="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-3"
        >
          <MyProjectCard
            v-for="project in myCompletedProjects"
            :key="project.id"
            :project="project"
          />
        </div>
        <EmptyProjectCard v-else text="プロジェクトはありません" />
      </TabsContent>
    </Tabs>
  </div>
</template>
