<script setup lang="ts">
import SettingLayout from "@/components/layout/SettingLayout.vue";

definePageMeta({
  middleware: "auth",
  title: "プラン設定",
  description:
    "Feed Forwardのプラン設定ページです。プラン変更や利用状況の確認ができます。",
  ogTitle: "Feed Forward プラン設定",
  ogDescription:
    "Feed Forwardのプラン設定ページです。プラン変更や利用状況の確認ができます。",
  ogImage: "/logo.png",
  twitterCard: "summary_large_image",
});
</script>

<template>
  <SettingLayout>
    <div class="flex flex-col gap-8 md:gap-8">
      <div class="flex flex-col gap-4">
        <PageTitle
          title="プラン設定"
          description="プランの設定を行います"
          size="small"
        />
        <Separator />
      </div>
    </div>
  </SettingLayout>
</template>
