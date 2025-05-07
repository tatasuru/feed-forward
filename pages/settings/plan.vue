<script setup lang="ts">
import SettingLayout from "@/components/layout/SettingLayout.vue";

definePageMeta({
  middleware: "auth",
});
</script>

<template>
  <SettingLayout> Plan </SettingLayout>
</template>
