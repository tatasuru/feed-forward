<script setup lang="ts">
const props = defineProps<{
  title: string;
  description: string;
  size?: "large" | "medium" | "small";
}>();

const titleSize = computed(() => {
  switch (props.size) {
    case "large":
      return "text-4xl";
    case "medium":
      return "text-3xl";
    case "small":
      return "text-2xl";
    default:
      return "text-3xl";
  }
});

const descriptionSize = computed(() => {
  switch (props.size) {
    case "large":
      return "text-lg";
    case "medium":
      return "text-sm";
    case "small":
      return "text-sm";
    default:
      return "text-sm";
  }
});
</script>

<template>
  <div class="inline-flex flex-col gap-1">
    <h1 class="font-bold" :class="titleSize">
      {{ props.title }}
    </h1>
    <p class="text-muted-foreground" :class="descriptionSize">
      {{ props.description }}
    </p>
  </div>
</template>
