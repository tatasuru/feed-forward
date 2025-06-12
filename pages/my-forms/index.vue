<script setup lang="ts">
definePageMeta({
  middleware: "auth",
  title: "マイフォーム",
  description:
    "Feed Forwardのマイフォームページです。あなたが作成したフィードバックフォームを確認できます。",
  ogTitle: "Feed Forward マイプロジェクト",
  ogDescription:
    "Feed Forwardのマイフォームページです。あなたが作成したフィードバックフォームを確認できます。",
  twitterCard: "summary_large_image",
});
</script>

<template>
  <div id="create-project" class="grid w-full gap-8">
    <div class="flex items-center justify-between">
      <PageTitle
        title="マイフォーム"
        description="あなたが作成したフォームを確認できます。"
        size="large"
      />
      <Button variant="main" class="w-fit cursor-pointer">
        <NuxtLink to="/create-form" class="flex items-center gap-1">
          <Icon name="mdi:plus" />
          フォームを作成
        </NuxtLink>
      </Button>
    </div>
  </div>
</template>
