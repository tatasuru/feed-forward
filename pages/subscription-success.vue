<script setup lang="ts">
definePageMeta({
  middleware: "auth",
  title: "サブスクリプション完了",
  description: "サブスクリプションが成功しました。ご利用ありがとうございます。",
  ogTitle: "Feed Forward サブスクリプション完了",
  ogDescription:
    "サブスクリプションが成功しました。ご利用ありがとうございます。",
  twitterCard: "summary_large_image",
});

const route = useRoute();
const subscription = ref<any>(null);
const formatDate = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleDateString("ja-JP");
};

try {
  const sessionId = route.query.session_id as string;
  const { data } = await useFetch(
    `/api/retrieve-subscription?sessionId=${sessionId}`
  );
  subscription.value = data.value;
} catch (error) {
  console.error("サブスクリプション情報の取得に失敗しました:", error);
}
</script>

<template>
  <div
    class="flex flex-col items-center gap-8 justify-center h-[calc(100vh-117px)] md:h-[calc(100vh-132px)]"
  >
    <div class="flex flex-col items-center justify-center gap-4">
      <h1 class="text-2xl font-bold">
        🎉 サブスクリプションの設定が完了しました 🎉
      </h1>
      <p class="text-center">
        ご利用ありがとうございます。<br />
        サブスクリプションの設定が完了しました。
      </p>
    </div>
    <Button variant="main" as-child>
      <NuxtLink to="/dashboard" class=""> ダッシュボードに戻る </NuxtLink>
    </Button>
  </div>
</template>
