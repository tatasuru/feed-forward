<script setup lang="ts">
import { format } from "date-fns";
const props = defineProps<{
  feedback: {
    id: string;
    title: string;
    description: string;
    created_at: string;
    feedback_ratings: Array<{
      title: string;
      rating: number;
      created_at: string;
      user_id: string | null;
    }>;
    overall_comment: string | null;
    project_type: "design" | "demo" | "plan";
    user: {
      id: string;
      display_name: string | null;
      avatar_url: string | null;
    };
  };
  isClamp?: boolean;
  isProjectNameDisplay?: boolean;
}>();

const badgeColors = {
  design: "bg-blue/20 text-blue",
  demo: "bg-pink/20 text-pink",
  plan: "bg-purple/20 text-purple",
};
</script>

<template>
  <div
    v-if="props.feedback.feedback_ratings"
    class="grid grid-cols-[40px_1fr] gap-4 cursor-pointer grid-rows-[1fr_auto_auto] h-full border rounded-lg p-4"
  >
    <!-- avatar - spans all 3 rows -->
    <Avatar class="!size-10 self-start row-span-3">
      <AvatarImage :src="props.feedback?.user.avatar_url!" alt="User Avatar" />
      <AvatarFallback>U</AvatarFallback>
    </Avatar>

    <!-- Main content - uses subgrid -->
    <div class="grid grid-rows-subgrid row-span-3 gap-4">
      <!-- description - first row -->
      <div class="flex flex-col gap-2">
        <div class="flex items-center gap-2">
          <h3 class="text-base md:text-lg font-bold">
            {{ props.feedback.user.display_name }}
          </h3>
        </div>

        <p
          class="text-sm text-muted-foreground"
          :class="{ 'line-clamp-2': isClamp }"
        >
          {{ props.feedback.overall_comment }}
        </p>
      </div>

      <!-- rating - second row -->
      <div
        v-if="props.feedback.feedback_ratings.length"
        class="flex flex-col gap-2"
      >
        <div
          v-for="(rating, index) in props.feedback.feedback_ratings"
          :key="index"
          class="flex items-center gap-1"
        >
          <span class="text-sm text-muted-foreground min-w-24">
            {{ rating.title }}:
          </span>
          <div class="flex items-center gap-1">
            <Icon
              v-for="i in 5"
              :key="i"
              name="mdi:star"
              :class="`!size-4 text-${
                i <= rating.rating ? 'yellow-500' : 'muted-foreground'
              }`"
            />
          </div>
        </div>
      </div>

      <!-- date and user - third row -->
      <div class="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
        <div class="flex items-center gap-1">
          <Icon
            name="mdi:clock-outline"
            class="!size-4 text-muted-foreground"
          />
          <span class="text-sm text-muted-foreground">
            {{ format(new Date(props.feedback.created_at), "yyyy/MM/dd") }}
          </span>
        </div>
        <div v-if="isProjectNameDisplay" class="flex items-center gap-1">
          <Icon
            name="mdi:file-document-outline"
            class="!size-4 text-muted-foreground"
          />
          <span class="text-sm text-muted-foreground">
            {{ props.feedback.title }}
          </span>
          <Badge
            variant="default"
            class="text-xs rounded-full border"
            :class="badgeColors[props.feedback.project_type]"
          >
            {{ props.feedback.project_type }}
          </Badge>
        </div>
      </div>
    </div>
  </div>
</template>
