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
    project_type: string;
    user: {
      id: string;
      display_name: string | null;
      avatar_url: string | null;
    };
  };
  isDashboard?: boolean;
}>();
</script>

<template>
  <div
    v-if="props.feedback.feedback_ratings"
    class="flex items-start gap-4 hover:scale-103 transition-transform duration-200 ease-in-out cursor-pointer"
  >
    <!-- avatar -->
    <div class="flex items-center gap-1">
      <Avatar class="!size-10">
        <AvatarImage
          :src="props.feedback?.user.avatar_url!"
          alt="User Avatar"
        />
        <AvatarFallback>U</AvatarFallback>
      </Avatar>
    </div>
    <div class="flex flex-col gap-4 w-full">
      <!-- description -->
      <div class="flex flex-col gap-2">
        <div class="flex items-center gap-2">
          <h3 class="text-base md:text-lg font-bold">
            {{ props.feedback.user.display_name }}
          </h3>
        </div>

        <p class="text-sm text-muted-foreground line-clamp-2">
          {{ props.feedback.overall_comment }}
        </p>
      </div>

      <!-- rating -->
      <div
        v-if="props.feedback.feedback_ratings.length"
        class="flex flex-col gap-2"
      >
        <div
          v-for="(rating, index) in props.feedback.feedback_ratings"
          :key="index"
          class="flex items-center gap-1"
        >
          <span class="text-sm text-muted-foreground">{{ rating.title }}:</span>
          <div class="flex items-center gap-1">
            <Icon
              v-for="i in rating.rating"
              name="mdi:star"
              :class="`!size-4 text-${i > 0 ? 'yellow' : 'gray'}-500`"
            />
          </div>
        </div>
      </div>

      <!-- date and user -->
      <div class="flex flex-row items-center gap-4">
        <div class="flex items-center gap-1">
          <Icon
            name="mdi:clock-outline"
            class="!size-4 text-muted-foreground"
          />
          <span class="text-sm text-muted-foreground">
            {{ format(new Date(props.feedback.created_at), "yyyy/MM/dd") }}
          </span>
        </div>
        <div class="flex items-center gap-1">
          <Icon
            name="mdi:file-document-outline"
            class="!size-4 text-muted-foreground"
          />
          <span class="text-sm text-muted-foreground">
            {{ props.feedback.title }}
          </span>
          <Badge
            v-if="isDashboard"
            variant="outline"
            class="gradient-bg text-white rounded-full"
          >
            {{ props.feedback.project_type }}
          </Badge>
        </div>
      </div>
    </div>
  </div>
</template>
