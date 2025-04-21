<script setup lang="ts">
definePageMeta({
  middleware: "auth",
});
</script>

<template>
  <div id="create-project" class="grid w-full gap-8">
    <PageTitle
      title="マイプロジェクト"
      description="あなたが作成したフィードバックプロジェクト"
    />
  </div>
</template>
