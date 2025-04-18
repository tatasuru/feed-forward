<script setup lang="ts">
import AppHeader from "@/components/layout/AppHeader.vue";
</script>

<template>
  <div class="flex flex-col w-full">
    <AppHeader />

    <main class="flex-1 p-4">
      <NuxtPage />
    </main>
  </div>
</template>
