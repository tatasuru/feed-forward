<script setup lang="ts">
const user = useSupabaseUser();
const redirectInfo = useSupabaseCookieRedirect();

watch(
  user,
  () => {
    if (user.value) {
      const path = redirectInfo.pluck();
      window.location.href = path || "/";
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="flex items-center justify-center h-screen w-full">
    Waiting for login...
  </div>
</template>
