<script setup lang="ts">
import SettingLayout from "@/components/layout/SettingLayout.vue";

definePageMeta({
  middleware: "auth",
});
</script>

<template>
  <SettingLayout>
    <div class="flex flex-col gap-8 md:gap-8">
      <div class="flex flex-col gap-4">
        <PageTitle
          title="通知設定"
          description="通知の設定を行います"
          size="small"
        />
        <Separator />
      </div>
    </div>
  </SettingLayout>
</template>
