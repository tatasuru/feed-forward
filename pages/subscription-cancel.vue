<script setup lang="ts">
definePageMeta({
  middleware: "auth",
  title: "サブスクリプションキャンセル",
  description:
    "サブスクリプションがキャンセルされました。ご不明な点がございましたら、サポートまでお問い合わせください。",
  ogTitle: "Feed Forward サブスクリプションキャンセル",
  ogDescription:
    "Your subscription サブスクリプションがキャンセルされました。ご不明な点がございましたら、サポートまでお問い合わせください。",
  twitterCard: "summary_large_image",
});
</script>

<template>
  <div
    class="flex flex-col items-center gap-8 justify-center h-[calc(100vh-117px)] md:h-[calc(100vh-132px)]"
  >
    <div class="flex flex-col items-center justify-center gap-4">
      <h1 class="text-2xl font-bold">
        サブスクリプションがキャンセルされました
      </h1>
      <p class="text-center">
        サブスクリプションはキャンセルされました。<br />
        ご不明な点がございましたら、サポートまでお問い合わせください。
      </p>
    </div>
    <Button variant="main" as-child>
      <NuxtLink to="/dashboard" class=""> ダッシュボードに戻る </NuxtLink>
    </Button>
  </div>
</template>
