<script setup lang="ts">
import type { MyProject } from "@/types/my-projects.types";
import { format } from "date-fns";

const props = defineProps<{
  project: MyProject;
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
  <Card>
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
        <Icon
          :name="visibilityTypeIcon[`${props.project.visibility_type}`]"
          class="!size-4 text-muted-foreground"
        />
      </div>
      <CardDescription class="line-clamp-3">
        {{ props.project.description }}
      </CardDescription>
    </CardHeader>
    <CardContent class="flex items-center gap-12">
      <div class="flex flex-col gap-1">
        <div class="flex items-center gap-1">
          <Icon name="mdi:message-outline" class="!size-4" />
          <span class="text-sm">フィードバック数</span>
        </div>
        <span class="text-2xl text-blue font-bold">
          {{ props.project.feedback_count }}
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
        <div class="flex items-center gap-1">
          <Icon
            name="pajamas:status-health"
            class="!size-4 text-muted-foreground"
          />
          <span class="text-sm text-muted-foreground">
            ステータス: {{ statusType[props.project.status] }}
          </span>
        </div>
      </div>
      <Separator />
      <div class="flex items-center justify-end w-full gap-4">
        <Button
          as-child
          variant="outline"
          class="w-full md:w-fit h-fit md:py-1 md:px-6 rounded-sm hover:text-purple"
        >
          <NuxtLink
            :to="`/my-projects/${props.project.id}/edit`"
            class="text-sm text-purple dark:text-white"
          >
            編集する
          </NuxtLink>
        </Button>
        <Button
          as-child
          variant="main"
          class="w-full md:w-fit h-fit md:py-1 md:px-6 rounded-sm"
        >
          <NuxtLink
            :to="`/my-projects/${props.project.id}/details`"
            class="text-sm text-purple dark:text-white"
          >
            詳細を見る
          </NuxtLink>
        </Button>
      </div>
    </CardFooter>
  </Card>
</template>
