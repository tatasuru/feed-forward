<script setup lang="ts">
import type { Project } from "@/types/projects.types";
definePageMeta({
  middleware: "auth",
});

const supabase = useSupabaseClient();
const projects = ref<Project[]>([]);

try {
  projects.value = await getAllProjects();
  console.log(`${projects.value.length}件のプロジェクトを取得しました`);
} catch (err) {
  console.error("Error fetching projects:", err);
} finally {
}

async function getAllProjects() {
  // get all projects from the database without own projects excepted private
  const { data, error } = await supabase.rpc("get_others_projects");

  if (error) {
    console.error("Error fetching projects:", error);
    return [];
  }

  return data || [];
}
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

      <div>
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
