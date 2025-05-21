<script setup lang="ts">
import type { NuxtError } from "#app";

const props = defineProps({
  error: Object as () => NuxtError,
});

const errorTitle = computed(() => {
  const statusCode = props.error?.statusCode || "404";
  const statusMessage = props.error?.statusMessage || "ページが見つかりません";
  return `${statusCode} - ${statusMessage} | Feed Forward`;
});

useHead({
  title: errorTitle.value,
  meta: [
    { name: "title", content: errorTitle.value },
    {
      name: "description",
      content:
        "お探しのページが見つかりませんでした。Feed Forwardのメインページへ戻ってください。",
    },
    { property: "og:title", content: errorTitle.value },
    {
      property: "og:description",
      content:
        "お探しのページが見つかりませんでした。Feed Forwardのメインページへ戻ってください。",
    },
  ],
});

const user = useSupabaseUser();
const handleError = () =>
  clearError({ redirect: user.value ? "/dashboard" : "/" });
</script>

<template>
  <div class="flex items-center justify-center h-svh w-full">
    <div class="flex flex-col items-center gap-8">
      <div class="flex flex-col items-center gap-2">
        <h1 class="text-7xl gradient-text font-bold">
          {{ props.error?.statusCode }}
        </h1>
        <p class="text-xl gradient-text font-bold">
          {{ props.error?.statusMessage || "ページが見つかりません" }}
        </p>
      </div>
      <Button as-child variant="main" @click="handleError">
        <NuxtLink to="/" class="text-sm font-bold">
          {{ user ? "ダッシュボードへ" : "トップページへ" }}
        </NuxtLink>
      </Button>
    </div>
  </div>
</template>
