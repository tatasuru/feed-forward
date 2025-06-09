<script setup lang="ts">
definePageMeta({
  middleware: "auth",
  title: "マイプロジェクト",
  description:
    "Feed Forwardのマイプロジェクトページです。あなたが作成したフィードバックプロジェクトを確認できます。",
  ogTitle: "Feed Forward マイプロジェクト",
  ogDescription:
    "Feed Forwardのマイプロジェクトページです。あなたが作成したフィードバックプロジェクトを確認できます。",
  twitterCard: "summary_large_image",
});
</script>

<template>
  <div id="create-project" class="grid w-full gap-8">
    <PageTitle
      title="マイフォーム"
      description="あなたが作成したフォームを確認できます。"
      size="large"
    />
  </div>
</template>
