<script setup lang="ts">
const route = useRoute();
const config = useRuntimeConfig();

/************************
 * SEO
 *************************/
watchEffect(() => {
  const baseUrl = config.public.baseUrl;
  const ogImage = `${baseUrl}/logo.png`;
  const twitterImage = `${baseUrl}/summary-image.png`;

  useHead({
    title: route.meta.title
      ? `${route.meta.title} - Feed Forward`
      : "Feed Forward",
    meta: [
      {
        name: "description",
        content: String(route.meta.description ?? "Feed Forwardのページです"),
      },
      {
        property: "og:title",
        content: String(route.meta.ogTitle ?? "Feed Forward"),
      },
      {
        property: "og:description",
        content: String(route.meta.ogDescription ?? "Feed Forwardのページです"),
      },
      {
        property: "og:image",
        content: String(twitterImage),
      },
      {
        name: "twitter:card",
        content: String(route.meta.twitterCard ?? "summary_large_image"),
      },
      {
        name: "twitter:image",
        content: String(twitterImage),
      },
      {
        name: "twitter:title",
        content: String(route.meta.ogTitle ?? "Feed Forward"),
      },
      {
        name: "twitter:description",
        content: String(route.meta.ogDescription ?? "Feed Forwardのページです"),
      },
    ],
  });
});
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>

  <ClientOnly>
    <Toaster richColors />
  </ClientOnly>
</template>
