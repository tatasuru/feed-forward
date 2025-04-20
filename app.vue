<script setup lang="ts">
import AppHeader from "@/components/layout/AppHeader.vue";

const supabase = useSupabaseClient();
const router = useRouter();
const currentPath = ref(router.currentRoute.value.path);
const store = useStore();

const isLoginPage = computed(() => {
  return (
    currentPath.value.includes("/login") ||
    currentPath.value.includes("/confirm") ||
    currentPath.value.includes("/setup") ||
    currentPath.value.includes("/reset-password") ||
    currentPath.value.includes("/update-password")
  );
});

onMounted(async () => {
  const { data: userData, error } = await supabase.rpc("get_current_user");
  store.profile = userData;
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
