<script setup lang="ts">
import type { MyProjectWithFeedback } from "@/types/my-projects.types";
import { format } from "date-fns";
const props = defineProps<{
  project: MyProjectWithFeedback;
}>();

const isHover = ref<boolean>(false);
const badgeColors = {
  design: "bg-blue/20 text-blue",
  demo: "bg-pink/20 text-pink",
  plan: "bg-purple/20 text-purple",
};
</script>

<template>
  <div
    class="flex flex-col gap-4 hover:scale-103 transition-transform duration-200 ease-in-out cursor-pointer"
  >
    <div class="flex items-center justify-between">
      <NuxtLink
        @mouseover="isHover = true"
        @mouseleave="isHover = false"
        :to="`/my-projects/${props.project.id}/details`"
        class="flex items-center gap-2 hover:text-link"
      >
        <Icon v-if="!isHover" name="mdi:folder-outline" class="!size-5" />
        <Icon v-else name="mdi:folder-open-outline" class="!size-5" />
        <span class="text-base md:text-lg font-bold">
          {{ props.project.title }}
        </span>
      </NuxtLink>
      <Badge
        variant="default"
        class="text-xs rounded-full border"
        :class="badgeColors[props.project.project_type]"
      >
        {{ props.project.project_type }}
      </Badge>
    </div>
    <div class="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
      <div class="flex items-center gap-1">
        <Icon
          name="mdi:message-outline"
          class="!size-4 text-muted-foreground"
        />
        <span class="text-sm text-muted-foreground">
          フィードバック数: {{ props.project.feedbacks.length }}
        </span>
      </div>
      <div v-if="props.project.deadline" class="flex items-center gap-1">
        <Icon
          name="mdi:clock-remove-outline"
          class="!size-4 text-muted-foreground"
        />
        <span class="text-sm text-muted-foreground">
          期限:
          {{ format(new Date(props.project.deadline || ""), "yyyy/MM/dd") }}
        </span>
      </div>
      <div class="flex items-center gap-1">
        <Icon name="mdi:calendar-month" class="!size-4 text-muted-foreground" />
        <span class="text-sm text-muted-foreground">
          作成日: {{ format(new Date(props.project.created_at), "yyyy/MM/dd") }}
        </span>
      </div>
    </div>
  </div>
</template>
