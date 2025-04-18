<script setup lang="ts">
import AppHeader from "@/components/layout/AppHeader.vue";

const router = useRouter();
const currentPath = ref(router.currentRoute.value.path);

const isLoginPage = computed(() => {
  return (
    currentPath.value.includes("/login") ||
    currentPath.value.includes("/confirm")
  );
});
</script>

<template>
  <div class="flex flex-col w-full">
    <AppHeader v-if="!isLoginPage" />

    <main
      class="flex-1 mx-auto w-full"
      :class="{
        'mt-[68px] max-w-[1280px] p-4': !isLoginPage,
      }"
    >
      <NuxtPage />
    </main>
  </div>
</template>
