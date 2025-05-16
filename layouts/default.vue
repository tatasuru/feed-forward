<script setup lang="ts">
import AppHeader from "@/components/layout/AppHeader.vue";
const route = useRoute();
const isHome = route.path === "/";
</script>

<template>
  <div class="w-full">
    <AppHeader />

    <main
      class="mx-auto w-full min-h-svh md:min-h-screen mt-[53px] md:mt-[68px]"
      :class="{
        'px-4 md:px-8': isHome,
        'max-w-[1440px] px-4 pt-8 pb-12 md:p-8': !isHome,
      }"
    >
      <NuxtPage />
    </main>
  </div>
</template>
