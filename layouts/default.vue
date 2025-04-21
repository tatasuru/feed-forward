<script setup lang="ts">
import AppHeader from "@/components/layout/AppHeader.vue";
</script>

<template>
  <div class="w-full">
    <AppHeader />

    <main
      class="mx-auto w-full mt-[53px] md:mt-[68px] max-w-[1440px] px-4 py-8 md:p-8 md:min-h-[calc(100vh-68px)] min-h-[calc(100vh-53px)]"
    >
      <NuxtPage />
    </main>
  </div>
</template>
