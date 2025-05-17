<script setup lang="ts">
definePageMeta({
  middleware: "auth",
  title: "お問い合わせ",
  description: "Feed Forwardに関するお問い合わせはこちらから",
  ogTitle: "Feed Forward お問い合わせ",
  ogDescription: "Feed Forwardに関するお問い合わせはこちらから",
  twitterCard: "summary_large_image",
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <PageTitle
      title="お問い合わせ"
      description="Feed Forwardに関するお問い合わせはこちらから"
      size="large"
    />
    <div class="flex flex-col gap-4">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Feed Forwardに関するお問い合わせは、以下のフォームからご連絡ください。
      </p>
      <ContactForm />
    </div>
  </div>
</template>
