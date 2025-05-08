<script setup lang="ts">
import type { MyProject } from "@/types/my-projects.types";
import { format } from "date-fns";

const props = defineProps<{
  project: MyProject;
}>();

const typeBadgeColors = {
  design: "bg-blue/20 text-blue",
  demo: "bg-pink/20 text-pink",
  plan: "bg-purple/20 text-purple",
};

const statusBadgeColors = {
  draft: "border-yellow bg-yellow/20 text-yellow",
  active: "border-success bg-success/20 text-success",
  completed: "border-destructive bg-destructive/20 text-destructive",
  archived: "border-muted bg-muted/20 text-muted",
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
  <Card class="grid grid-rows-[1fr_auto_auto] row-span-3">
    <CardHeader>
      <div class="flex items-start justify-between">
        <div class="flex flex-col gap-2">
          <Badge
            v-if="props.project.project_type"
            variant="default"
            class="text-xs rounded-full border"
            :class="typeBadgeColors[props.project.project_type]"
          >
            {{ props.project.project_type }}
          </Badge>
          <Badge v-else class="text-xs rounded-full border">未設定</Badge>
          <CardTitle>
            {{ props.project.title || "未設定" }}
          </CardTitle>
        </div>

        <Icon
          v-if="props.project.visibility_type"
          :name="visibilityTypeIcon[`${props.project.visibility_type}`]"
          class="!size-4 text-muted-foreground"
        />
        <Icon
          v-else
          name="mdi:block-helper"
          class="!size-4 text-muted-foreground"
        />
      </div>
      <CardDescription class="line-clamp-2">
        {{ props.project.description.replace(/<[^>]+>/g, "") || "未設定" }}
      </CardDescription>
    </CardHeader>
    <CardContent class="flex items-center gap-12">
      <div class="flex flex-col gap-1">
        <div class="flex items-center gap-1">
          <Icon name="mdi:message-outline" class="!size-4" />
          <span class="text-sm">フィードバック数</span>
        </div>
        <span class="text-2xl text-blue font-bold">
          {{ props.project.feedback_count || "0" }}
        </span>
      </div>
      <div class="flex flex-col gap-1">
        <div class="flex items-center gap-1">
          <Icon name="mdi:star-outline" class="!size-4" />
          <span class="text-sm">平均評価</span>
        </div>
        <span class="text-2xl text-blue font-bold">
          <div class="flex items-center gap-2">
            <div class="flex items-center gap-px">
              {{ props.project.avg_rating.toFixed(1) || "0.0" }}
            </div>
          </div>
        </span>
      </div>
    </CardContent>
    <CardFooter
      class="flex flex-col md:flex-col items-start justify-between gap-4"
    >
      <div class="flex flex-col md:flex-row gap-2 md:gap-4 w-full">
        <div class="flex flex-row items-center gap-2">
          <div class="flex items-center gap-1">
            <Icon
              name="mdi:calendar-month"
              class="!size-4 text-muted-foreground"
            />
            <span class="text-sm text-muted-foreground">
              作成日:
              {{
                format(new Date(props.project.created_at), "yyyy/MM/dd") || ""
              }}
            </span>
          </div>
          <div class="flex items-center gap-1">
            <Icon
              name="mdi:clock-remove-outline"
              class="!size-4 text-muted-foreground"
            />
            <span class="text-sm text-muted-foreground">
              期限:
              {{
                props.project.deadline
                  ? format(new Date(props.project.deadline), "yyyy/MM/dd")
                  : "未設定"
              }}
            </span>
          </div>
        </div>
        <Badge
          variant="default"
          class="text-xs rounded-full"
          :class="statusBadgeColors[props.project.status]"
        >
          {{ statusType[props.project.status] || "" }}
        </Badge>
      </div>

      <Separator />

      <div
        class="flex flex-col md:flex-row md:items-center md:justify-end w-full"
      >
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
