<script setup lang="ts">
import AppSidebar from "@/components/layout/AppSidebar.vue";
import AppHeader from "@/components/layout/AppHeader.vue";

const route = useRoute();
</script>

<template>
  <SidebarProvider>
    <AppSidebar v-if="route.path !== '/'" />
    <main class="flex-1 flex flex-col">
      <AppHeader />
      <NuxtPage class="p-4" />
    </main>
  </SidebarProvider>
</template>
