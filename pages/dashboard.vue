<script setup lang="ts">
import type { MyProjectWithFeedback } from "@/types/my-projects.types";

definePageMeta({
  middleware: "auth",
  title: "ダッシュボード",
  description: "プロジェクトとフィードバックの概要",
  ogTitle: "Feed Forward ダッシュボード",
  ogDescription: "チームの活動状況を一目で確認",
  twitterCard: "summary_large_image",
});


</script>

<template>
  <div id="dashboard" class="grid w-full gap-12">
    <PageTitle
      title="ダッシュボード"
      description="プロジェクトとフィードバックの概要"
      size="large"
    />
  </div>
</template>
