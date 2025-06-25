<script setup lang="ts">
definePageMeta({
  middleware: "auth",
  title: "マイフォーム",
  description:
    "Feed Forwardのマイフォームページです。あなたが作成したフィードバックフォームを確認できます。",
  ogTitle: "Feed Forward マイプロジェクト",
  ogDescription:
    "Feed Forwardのマイフォームページです。あなたが作成したフィードバックフォームを確認できます。",
  twitterCard: "summary_large_image",
});

const supabase = useSupabaseClient();
const user = useSupabaseUser();

const { data: myFormsList } = await useAsyncData("myFormsList", async () => {
  try {
    const { data, error } = await supabase
      .from("my_forms")
      .select("*")
      .eq("user_id", user.value?.id)
      .limit(100);

    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error("Error fetching form templates:", error);
    return [];
  }
});
</script>

<template>
  <div id="create-project" class="grid w-full gap-8">
    <div class="flex items-center justify-between">
      <PageTitle
        title="マイフォーム"
        description="あなたが作成したフォームを確認できます。"
        size="large"
      />
      <Button variant="main" class="w-fit cursor-pointer">
        <NuxtLink to="/create-form" class="flex items-center gap-1">
          <Icon name="mdi:plus" />
          フォームを作成
        </NuxtLink>
      </Button>
    </div>

    <div class="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6">
      <MyFormCard v-for="form in myFormsList" :key="form.id" :myForm="form" />
    </div>
  </div>
</template>
