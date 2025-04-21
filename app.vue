<script setup lang="ts">
const route = useRoute();
const store = useStore();
const supabase = useSupabaseClient();

/************************
 * SEO
 *************************/
useHead({
  // or as a function
  titleTemplate: (productCategory) => {
    return productCategory
      ? `${productCategory} - Feed Forward`
      : "Feed Forward";
  },
  meta: [
    { property: "og:title", content: `Feed Forward - ${route.meta.title}` },
  ],
});

/************************
 * set user data to store
 *************************/
onMounted(async () => {
  const { data: userData, error } = await supabase.rpc("get_current_user");

  if (error) {
    console.error("Error fetching user data:", error);
    return;
  }

  if (userData && userData.display_name !== null) {
    store.profile = {
      display_name: userData.display_name,
      email: userData.email,
      avatar_url: userData.avatar_url,
      bio: userData.bio,
      website: userData.website,
    };
  }
});
</script>

<template>
  <NuxtLayout>
    <!-- loading bar -->
    <NuxtLoadingIndicator
      :color="'#1C7C54'"
      :height="4"
      :duration="5000"
      :throttle="0"
    />
    <NuxtPage />
    <Toaster />
  </NuxtLayout>
</template>
