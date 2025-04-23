<script setup lang="ts">
const props = defineProps({
  text: {
    type: String,
    default: "プロジェクトはありません",
  },
});
</script>

<template>
  <div
    class="flex flex-col items-center justify-center w-full h-full gap-4 p-4 border border-dashed rounded-md dark:border-muted"
  >
    <p class="text-sm text-muted-foreground">{{ props.text }}</p>
  </div>
</template>
