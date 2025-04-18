<script setup lang="ts">
import AppSidebar from "@/components/layout/AppSidebar.vue";
import AppHeader from "@/components/layout/AppHeader.vue";
</script>

<template>
  <SidebarProvider>
    <AppSidebar />
    <div class="p-2 flex flex-col w-full">
      <div class="flex items-center justify-between">
        <SidebarTrigger class="cursor-pointer" />
        <AppHeader />
      </div>
      <main class="flex-1">
        <NuxtPage />
      </main>
    </div>
  </SidebarProvider>
</template>
