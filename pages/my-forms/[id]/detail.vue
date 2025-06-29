<script setup lang="ts"></script>

<template>
  <div id="create-project" class="grid w-full gap-8">
    <div class="flex items-center">
      <PageTitle
        title="フォーム詳細"
        description="フォームの詳細を確認できます。"
        size="large"
      />
    </div>

    <Tabs default-value="analytics" class="w-full">
      <TabsList
        class="w-full bg-background border-b border-border justify-start rounded-none p-0 relative"
      >
        <TabsTrigger
          value="analytics"
          class="w-fit border-t-0 border-l-0 border-r-0 border-b-0 rounded-none flex-0 cursor-pointer shadow-none hover:shadow-none data-[state=active]:shadow-none data-[state=active]:border-b-purple data-[state=active]:border-b-2 -mb-1 data-[state=active]:relative data-[state=active]:z-10"
        >
          アナリティクス
        </TabsTrigger>
        <TabsTrigger
          value="feedbacks"
          class="w-fit border-t-0 border-l-0 border-r-0 border-b-0 rounded-none flex-0 cursor-pointer shadow-none hover:shadow-none data-[state=active]:shadow-none data-[state=active]:border-b-purple data-[state=active]:border-b-2 -mb-1 data-[state=active]:relative data-[state=active]:z-10"
        >
          フィードバック
        </TabsTrigger>
      </TabsList>
      <TabsContent value="analytics"> analytics </TabsContent>
      <TabsContent value="feedbacks"> feedback </TabsContent>
    </Tabs>
  </div>
</template>
