<script setup lang="ts">
const props = defineProps<{
  title: string;
  description: string;
  size?: "large" | "medium" | "small";
}>();

const titleSize = computed(() => {
  switch (props.size) {
    case "large":
      return "md:text-2xl text-xl";
    case "medium":
      return "md:text-xl text-lg";
    case "small":
      return "md:text-lg text-base";
    default:
      return "md:text-xl text-lg";
  }
});

const descriptionSize = computed(() => {
  switch (props.size) {
    case "large":
      return "md:text-base text-sm";
    case "medium":
      return "md:text-sm text-xs";
    case "small":
      return "md:text-xs text-xs";
    default:
      return "md:text-sm text-xs";
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
