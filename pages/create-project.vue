<script setup lang="ts">
definePageMeta({
  middleware: "auth",
});
</script>

<template>
  <div id="create-project" class="grid w-full gap-8">
    <PageTitle
      title="新規プロジェクト作成"
      description="フィードバックを受け取りたいプロジェクトの詳細を入力してください"
    />

    <!-- section -->
    <section id="create-project-form">
      <!-- info -->
      <Card>
        <CardHeader>
          <PageTitle
            title="基本情報"
            description="プロジェクトの基本情報を入力してください"
            size="small"
          />
        </CardHeader>
        <CardContent> Card Content </CardContent>
        <CardFooter> Card Footer </CardFooter>
      </Card>
    </section>
  </div>
</template>
