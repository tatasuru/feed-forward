<script setup lang="ts">
import AppHeader from "@/components/layout/AppHeader.vue";
</script>

<template>
  <div class="flex flex-col w-full">
    <AppHeader />

    <main
      class="flex-1 mx-auto w-full mt-[53px] md:mt-[68px] max-w-[1280px] p-4 md:min-h-[calc(100vh-68px)] min-h-[calc(100vh-53px)]"
    >
      <NuxtPage />
    </main>
  </div>
</template>
