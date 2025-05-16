<script setup lang="ts">
definePageMeta({
  middleware: "auth",
  title: "ご紹介",
  description: "Feed Forwardのご紹介",
  ogTitle: "Feed Forward ご紹介",
  ogDescription: "Feed Forwardのご紹介",
  twitterCard: "summary_large_image",
});
</script>

<template>
  <div id="dashboard" class="grid w-full gap-12">
    <PageTitle title="HOME" description="LPみたいにしたい" size="large" />
  </div>
</template>
