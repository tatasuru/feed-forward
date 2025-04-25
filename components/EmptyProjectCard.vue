<script setup lang="ts">
const props = defineProps({
  text: {
    type: String,
    default: "プロジェクトはありません",
  },
  label: {
    type: String,
    default: "",
  },
  icon: {
    type: String,
    default: "",
  },
  link: {
    type: String,
    default: "",
  },
});
</script>

<template>
  <div
    class="flex flex-col items-center justify-center w-full h-full gap-4 p-4 border border-dashed rounded-md dark:border-muted"
  >
    <p class="text-sm text-muted-foreground">{{ props.text }}</p>
    <Button v-if="props.label && props.link" variant="main">
      <NuxtLink :to="props.link" class="flex items-center gap-2">
        <Icon :name="props.icon" />
        {{ props.label }}
      </NuxtLink>
    </Button>
  </div>
</template>
