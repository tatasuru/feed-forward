<script setup lang="ts">
definePageMeta({
  middleware: "auth",
});

const supabase = useSupabaseClient();

// get user data
onMounted(async () => {
  const { data: userData, error } = await supabase.rpc("get_current_user");
  if (error) {
    console.error("Error fetching user data:", error);
  }
});
</script>

<template>
  <div>
    <h1>Home</h1>
  </div>
</template>
