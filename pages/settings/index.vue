<script setup lang="ts">
definePageMeta({
  middleware: "auth",
});
</script>

<template>
  <div id="settings" class="grid w-full gap-8">
    <PageTitle
      title="各種設定"
      description="アカウントの設定や通知の管理を行います"
      size="large"
    />

    <Tabs
      default-value="profile"
      class="grid grid-rows-[200px_auto] gap-4 md:grid-cols-[200px_auto] md:grid-rows-[auto]"
      orientation="vertical"
    >
      <TabsList class="flex-col h-fit w-full gap-2">
        <TabsTrigger
          value="profile"
          class="w-full cursor-pointer justify-start"
        >
          <Icon name="mdi:account" class="!size-5" />
          プロフィール
        </TabsTrigger>
        <TabsTrigger
          value="password"
          class="w-full cursor-pointer justify-start"
        >
          <Icon name="mdi:lock" class="!size-5" />
          パスワード
        </TabsTrigger>
      </TabsList>
      <TabsContent value="profile">
        Make changes to your account here.
      </TabsContent>
      <TabsContent value="password"> Change your password here. </TabsContent>
    </Tabs>
  </div>
</template>
