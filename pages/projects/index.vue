<script setup lang="ts">
import type { Project } from "@/types/projects.types";
definePageMeta({
  middleware: "auth",
  title: "みんなのプロジェクト",
  description:
    "Feed Forwardのみんなのプロジェクトページです。みんなのプロジェクトを見てみましょう！",
  ogTitle: "Feed Forward みんなのプロジェクト",
  ogDescription:
    "Feed Forwardのみんなのプロジェクトページです。みんなのプロジェクトを見てみましょう！",
  twitterCard: "summary_large_image",
});

const supabase = useSupabaseClient();
const projects = computed<Project[]>(() => {
  return projectsData.value?.filter(
    (project: { status: string }) =>
      project.status !== "completed" &&
      project.status !== "archived" &&
      project.status !== "draft"
  );
});

const { data: projectsData } = await useAsyncData(
  "projectsList",
  async () => {
    try {
      const { data, error } = await supabase.rpc("get_others_projects");

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
</script>

<template>
  <div id="projects" class="grid w-full gap-8">
    <PageTitle
      title="みんなのプロジェクト"
      description="みんなのプロジェクトを見てみましょう！"
      size="large"
    />

    <div class="w-full flex flex-col gap-8">
      <div class="relative w-full items-center">
        <Input
          id="search"
          type="text"
          :placeholder="'プロジェクトを検索'"
          class="w-full pl-8 dark:border-[#4c4c4c]"
        />
        <span
          class="absolute inset-y-0 start-0 flex items-center justify-center px-2"
        >
          <Icon
            name="solar:magnifer-linear"
            class="!size-4 text-muted-foreground"
          />
        </span>
      </div>

      <div class="min-h-[calc(100vh-300px)] flex flex-col gap-4">
        <div
          v-if="projects.length > 0"
          class="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-3"
        >
          <ProjectCard
            v-for="project in projects"
            :key="project.id"
            :project="project"
          />
        </div>

        <EmptyProjectCard v-else />
      </div>
    </div>
  </div>
</template>
