<script setup lang="ts">
const user = useSupabaseUser();
const supabase = useSupabaseClient();
const redirectInfo = useSupabaseCookieRedirect();

definePageMeta({
  layout: "custom",
  title: "ログイン確認",
  description:
    "Feed Forwardのログイン確認を行います。ログイン後、プロジェクトの詳細を入力してください。",
  ogTitle: "Feed Forward ログイン確認",
  ogDescription:
    "Feed Forwardのログイン確認を行います。ログイン後、プロジェクトの詳細を入力してください。",
  twitterCard: "summary_large_image",
});

watch(
  user,
  async () => {
    const { data: userData, error } = await supabase.rpc("get_current_user");

    setTimeout(() => {
      if (userData?.display_name === null) {
        window.location.href = "/setup";
        return;
      }

      if (user.value) {
        const path = redirectInfo.pluck();
        window.location.href = path || "/dashboard";
      }

      if (!user.value) {
        window.location.href = "/";
      }
    }, 1000);
  },
  { immediate: true }
);

const loadingText = "LOADING...";
const letters = loadingText.split("");
</script>

<template>
  <div class="flex items-center justify-center h-svh w-full">
    <div class="flex items-center gap-2">
      <p
        v-for="(letter, index) in letters"
        :key="index"
        class="text-2xl animation-text gradient-text font-bold"
        :style="{ '--delay': `${index * 0.1}s` }"
      >
        {{ letter }}
      </p>
    </div>
  </div>
</template>

<style>
.animation-text {
  animation: gradient-shift 2s linear infinite, float 1s ease-in-out infinite;
  animation-delay: var(--delay, 0s), var(--delay, 0s);
  transform: translateY(0);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes gradient-shift {
  0% {
    background-position: 0% center;
  }
  100% {
    background-position: 200% center;
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}
</style>
