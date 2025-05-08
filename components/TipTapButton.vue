<script setup lang="ts">
const props = defineProps({
  editor: {
    type: Object,
    required: true,
  },
  action: {
    type: Function,
    required: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  label: {
    type: String,
    default: "Button",
  },
  icon: {
    type: String,
    default: "",
  },
});
</script>

<template>
  <Button
    @click="
          (e: Event) => {
            e.preventDefault();
            props.action();
          }
        "
    :disabled="props.disabled"
    variant="outline"
    class="h-fit px-1 py-1 rounded-sm text-xs cursor-pointer gap-px hover:bg-purple hover:text-white hover:border-purple focus:outline-none focus:ring-2 focus:ring-purple focus:ring-offset-2"
  >
    <Icon v-if="props.icon" :name="props.icon" class="!size-4" />
    {{ props.label }}
  </Button>
</template>
