<script setup lang="ts">
const props = defineProps({
  title: {
    type: String,
    default: "HOME",
  },
  description: {
    type: String,
    default: "プロジェクトとフィードバックの概要",
  },
});
</script>

<template>
  <div class="inline-flex flex-col gap-1">
    <h1 class="text-2xl md:text-3xl font-bold">{{ props.title }}</h1>
    <p class="text-sm text-muted-foreground">
      {{ props.description }}
    </p>
  </div>
</template>
