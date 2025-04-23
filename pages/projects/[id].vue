<script setup lang="ts">
import type { ProjectWithFeedback } from "@/types/projects.types";
import { format } from "date-fns";

const { id } = useRoute().params;
const supabase = useSupabaseClient();
const preview = ref();

const projectWithFeedback = ref<ProjectWithFeedback>({} as ProjectWithFeedback);
const badgeColors = {
  design: "bg-blue/20 text-blue",
  demo: "bg-pink/20 text-pink",
  plan: "bg-purple/20 text-purple",
};

/******************************
 * Lifecycle Hooks
 ******************************/
// Fetch project details and link preview
projectWithFeedback.value = await getProjectDetails(id as string);
preview.value = await getLinkPreview(
  "https://nuxt.com/docs/getting-started/data-fetching"
);

/******************************
 * HELPER FUNCTIONS
 ******************************/
async function getProjectDetails(id: string) {
  try {
    const { data, error } = await supabase.rpc("get_project_with_feedback", {
      p_project_id: id,
    });

    if (error) {
      throw new Error(`Error fetching project details: ${error.message}`);
    }

    return data as ProjectWithFeedback;
  } catch (error) {
    console.error("Error fetching project details:", error);
    throw error;
  }
}

async function getLinkPreview(url: string) {
  try {
    const encodedUrl = encodeURIComponent(url);
    const { data, error } = await useFetch(
      `/api/link-preview?url=${encodedUrl}`
    );

    if (error.value) {
      throw new Error(`Error fetching link preview: ${error.value}`);
    }

    return data.value;
  } catch (error) {
    console.error("Error fetching link preview:", error);
    throw error;
  }
}
</script>

<template>
  <div id="projects" class="grid w-full gap-8">
    <div
      v-if="projectWithFeedback.project"
      class="flex flex-col gap-4 items-start justify-between"
    >
      <PageTitle :title="projectWithFeedback.project.title" size="large" />

      <Badge
        variant="default"
        class="text-xs rounded-full border"
        :class="badgeColors[projectWithFeedback.project.project_type]"
      >
        {{ projectWithFeedback.project.project_type }}
      </Badge>
    </div>

    <div>
      <div
        v-if="projectWithFeedback.project"
        class="flex flex-col gap-8 border border-muted-foreground/20 rounded-lg p-8"
      >
        <div>
          <PageTitle
            title="プロジェクトの詳細"
            description="フィードバックを求めているプロジェクトの詳細"
            size="medium"
          />
        </div>

        <div class="flex flex-col gap-6">
          <div class="flex flex-col gap-2 w-full">
            <PageTitle title="概要" size="medium" />
            <p class="text-sm text-muted-foreground leading-6">
              {{ projectWithFeedback.project.description }}
            </p>
          </div>

          <div class="flex flex-col gap-2 w-full">
            <PageTitle title="フィードバック対象" size="medium" />
            <NuxtLink
              :to="projectWithFeedback.project.resource_url"
              target="_blank"
              class="text-sm text-link"
            >
              {{ projectWithFeedback.project.resource_url }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
