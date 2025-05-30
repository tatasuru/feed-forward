<script setup lang="ts">
import type { Project } from "@/types/projects.types";
import { format } from "date-fns";

const props = defineProps<{
  project: Project;
}>();

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
</script>

<template>
  <Card class="grid grid-template-subgrid row-span-2">
    <CardHeader>
      <div class="flex items-start justify-between">
        <div class="flex flex-col gap-2">
          <Badge
            variant="default"
            class="text-xs rounded-full border"
            :class="badgeColors[props.project.project_type]"
          >
            {{ props.project.project_type }}
          </Badge>
          <CardTitle>{{ props.project.title }}</CardTitle>
        </div>
      </div>
      <CardDescription class="line-clamp-2">
        {{ props.project.description.replace(/<[^>]+>/g, "") }}
      </CardDescription>
    </CardHeader>

    <CardFooter
      class="flex flex-col md:flex-col items-start justify-between gap-6"
    >
      <div class="flex flex-col md:flex-row gap-2 md:gap-4 w-full">
        <div class="flex items-center gap-1">
          <Icon
            name="mdi:calendar-month"
            class="!size-4 text-muted-foreground"
          />
          <span class="text-sm text-muted-foreground">
            作成日:
            {{ format(new Date(props.project.created_at), "yyyy/MM/dd") }}
          </span>
        </div>
        <div class="flex items-center gap-1">
          <Icon
            name="mdi:clock-remove-outline"
            class="!size-4 text-muted-foreground"
          />
          <span class="text-sm text-muted-foreground">
            期限:
            {{ format(new Date(props.project.deadline), "yyyy/MM/dd") }}
          </span>
        </div>
      </div>
      <Separator />
      <div
        class="flex flex-col md:flex-row gap-4 md:gap-0 md:items-center justify-between w-full"
      >
        <div class="flex items-center gap-2">
          <Avatar :size="'xs'" class="cursor-pointer">
            <AvatarImage :src="props.project.user_avatar_url" alt="avatar" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <span class="text-sm text-muted-foreground">
            {{ props.project.user_display_name }}
          </span>
        </div>
        <Button
          as-child
          variant="main"
          class="w-full md:w-fit h-fit md:py-1 md:px-6 rounded-sm"
        >
          <NuxtLink
            :to="`/projects/${props.project.short_id}`"
            class="text-sm text-purple dark:text-white"
          >
            詳細を見る
          </NuxtLink>
        </Button>
      </div>
    </CardFooter>
  </Card>
</template>
