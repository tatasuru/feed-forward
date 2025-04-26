<script setup lang="ts">
import type { FeedbackContents } from "@/types/my-projects.types";
const props = defineProps<{
  feedback: {
    id: string;
    title: string;
    description: string;
    created_at: string;
    feedback_ratings: Array<{
      rating: number;
      created_at: string;
      user_id: string | null;
    }>;
    project_type: string;
    user: {
      id: string;
      display_name: string | null;
      avatar_url: string | null;
    };
  };
}>();
</script>

<template>
  <div
    class="flex items-start gap-4 hover:scale-103 transition-transform duration-200 ease-in-out cursor-pointer"
  >
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
      <div class="flex flex-col gap-2">
        <div
          class="flex flex-col gap-1 md:gap-0 md:flex-row md:items-center justify-between"
        >
          <div class="flex items-center gap-2">
            <h3 class="text-base md:text-lg font-bold">
              {{ props.feedback.title }}
            </h3>
            <Badge
              variant="outline"
              class="gradient-bg text-white rounded-full"
            >
              {{ props.feedback.project_type }}
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
        <!-- TODO -->
        <!-- <p class="text-sm text-muted-foreground">
          ナビゲーションの動線が分かりやすくなりました。モバイル表示の最適化がさらに必要かもしれません。
        </p> -->
      </div>
      <div class="flex flex-row items-center gap-4">
        <!-- TODO -->
        <!-- <div class="flex items-center gap-1">
          <Icon
            name="mdi:clock-outline"
            class="!size-4 text-muted-foreground"
          />
          <span class="text-sm text-muted-foreground">2日前</span>
        </div> -->
        <div class="flex items-center gap-1">
          <Icon
            name="mdi:account-outline"
            class="!size-4 text-muted-foreground"
          />
          <span class="text-sm text-muted-foreground">
            {{ props.feedback.user.display_name }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
