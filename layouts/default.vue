<script setup lang="ts">
import { useSidebarStore } from "@/stores/sidebar";
import AppSidebar from "@/components/layout/AppSidebar.vue";
import AppHeader from "@/components/layout/AppHeader.vue";

const route = useRoute();
const sidebarStore = useSidebarStore();

onMounted(() => {
  const sidebarOpen = localStorage.getItem("sidebarOpen");

  if (sidebarOpen) {
    sidebarStore.setSidebarOpen(sidebarOpen === "true");
  } else {
    sidebarStore.setSidebarOpen(true);
    localStorage.setItem("sidebarOpen", "true");
  }
});
</script>

<template>
  <SidebarProvider :open="sidebarStore.isSidebarOpen">
    <AppSidebar v-if="route.path !== '/'" />
    <main class="flex-1 flex flex-col">
      <AppHeader />
      <div class="py-2 px-6 min-h-[calc(100svh-52px)]">
        <slot />
      </div>
    </main>
  </SidebarProvider>
</template>
