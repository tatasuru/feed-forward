<script setup lang="ts">
const user = useSupabaseUser();
const supabase = useSupabaseClient();
const redirectInfo = useSupabaseCookieRedirect();

definePageMeta({
  layout: "custom",
});

watch(
  user,
  async () => {
    const { data: userData, error } = await supabase.rpc("get_current_user");

    setTimeout(() => {
      if (userData.display_name === null) {
        window.location.href = "/setup";
        return;
      }

      if (user.value) {
        const path = redirectInfo.pluck();
        window.location.href = path || "/";
      }

      if (!user.value) {
        window.location.href = "/login";
      }
    }, 1000);
  },
  { immediate: true }
);
</script>

<template>
  <div class="flex items-center justify-center h-svh w-full">
    <p class="text-2xl gradient-text font-bold">Waiting for loading...</p>
  </div>
</template>
