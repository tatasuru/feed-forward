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
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
