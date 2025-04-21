<script setup lang="ts">
definePageMeta({
  middleware: "auth",
});

const supabase = useSupabaseClient();
const dashboardContents = [
  {
    title: "アクティブプロジェクト",
    description: "先月比 +1 (50%)",
    icon: "mdi:file-document",
    value: 3,
  },
  {
    title: "受け取ったフィードバック",
    description: "先月比 -8 (20%)",
    icon: "mdi:comment-check-outline",
    value: 10,
  },
  {
    title: "平均評価",
    description: "先月比 +0.3 (7.7%)",
    icon: "mdi:star-check",
    value: 4.5,
  },
  {
    title: "フィードバック完了率",
    description: "先月比 +5% (6.8%)",
    icon: "mdi:file-document-check-outline",
    value: 75,
  },
];

// get user data
onMounted(async () => {
  const { data: userData, error } = await supabase.rpc("get_current_user");
  if (error) {
    console.error("Error fetching user data:", error);
  }
});
</script>

<template>
  <div id="dashboard" class="grid w-full gap-8">
    <PageTitle
      title="ダッシュボード"
      description="プロジェクトとフィードバックの概要"
    />
    <div class="flex items-center gap-2 md:gap-4 overflow-scroll">
      <Card
        v-for="(item, index) in dashboardContents"
        :key="index"
        class="py-5 md:min-w-[330px] min-w-[270px]"
      >
        <CardHeader
          class="flex flex-row items-center justify-between gap-2 px-5"
        >
          <CardTitle>{{ item.title }}</CardTitle>
          <Icon :name="item.icon" class="!size-5" />
        </CardHeader>
        <CardContent class="font-bold flex flex-col gap-1 px-5">
          <span class="text-foreground text-3xl gradient-text">{{
            item.value
          }}</span>
          <span class="text-muted-foreground text-sm">
            {{ item.description }}
          </span>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
