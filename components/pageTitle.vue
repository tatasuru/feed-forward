<script setup lang="ts">
const props = defineProps<{
  title: string;
  description: string;
  size?: "large" | "medium" | "small";
}>();

const titleSize = computed(() => {
  switch (props.size) {
    case "large":
      return "md:text-3xl text-2xl";
    case "medium":
      return "md:text-2xl text-xl";
    case "small":
      return "md:text-xl text-lg";
    default:
      return "md:text-2xl text-xl";
  }
});

const descriptionSize = computed(() => {
  switch (props.size) {
    case "large":
      return "text-lg md:text-xl";
    case "medium":
      return "text-base md:text-lg";
    case "small":
      return "text-sm md:text-base";
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
