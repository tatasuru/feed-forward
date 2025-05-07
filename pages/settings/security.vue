<script setup lang="ts">
import SettingLayout from "@/components/layout/SettingLayout.vue";

definePageMeta({
  middleware: "auth",
});
</script>

<template>
  <SettingLayout> security </SettingLayout>
</template>
