<script setup lang="ts">
/********************************
 * for forms preview
 ********************************/
const templates = [
  {
    image: "/feedback-thumbnail.png",
    icon: "mdi:star-check",
    value: "starFeedback",
    label: "製品フィードバック",
    description:
      "5つの星で評価し、コメントを追加するフィードバックテンプレートです。",
  },
];

const ratingPerCriteria = [
  {
    title: "使いやすさ",
    description: "アプリケーションの使いやすさを評価してください",
    value: 0,
  },
  {
    title: "機能性",
    description: "アプリケーションの機能性を評価してください",
    value: 0,
  },
  {
    title: "デザイン",
    description: "アプリケーションのデザインを評価してください",
    value: 0,
  },
];

const hoverStarIndexObj = ref<{
  [key: number]: number;
}>({
  0: -1,
  1: -1,
  2: -1,
});
</script>

<template>
  <div id="create-project" class="flex flex-col w-full gap-8">
    <PageTitle
      title="テンプレート選択"
      description="テンプレートからフィードバックフォームを作成できます。"
      size="large"
    />

    <div class="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
      <Card v-for="template in templates" :key="template.value">
        <div>
          <NuxtImg
            :src="template.image"
            alt="フィードバックテンプレート"
            class="w-full h-32 object-contain rounded-t-md"
          />
        </div>
        <CardHeader class="flex h-fit">
          <div class="flex flex-col gap-1">
            <CardTitle class="text-sm font-semibold">
              {{ template.label }}
            </CardTitle>
            <CardDescription class="text-xs text-muted-foreground">
              {{ template.description }}
            </CardDescription>
          </div>
        </CardHeader>

        <CardFooter class="flex flex-col gap-4 w-full">
          <Dialog>
            <DialogTrigger as-child>
              <Button
                variant="link"
                type="button"
                class="p-0 size-fit text-xs text-purple hover:underline cursor-pointer"
                @click="(e: Event) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                      }"
              >
                プレビューを見る
              </Button>
            </DialogTrigger>
            <DialogContent class="sm:max-w-[700px]">
              <DialogHeader>
                <DialogTitle>製品フィードバックテンプレート</DialogTitle>
                <DialogDescription>
                  このテンプレートは、5つの星で評価し、コメントを追加するフィードバックテンプレートです。5段階評価、コメント、匿名でのフィードバックが可能です。
                </DialogDescription>
              </DialogHeader>

              <!-- template -->
              <div
                class="flex flex-col gap-6 border p-6 rounded-md w-full max-w-[600px] mx-auto"
              >
                <!-- rating -->
                <div v-for="(criteria, criteriaIndex) in ratingPerCriteria">
                  <p class="text-sm font-medium">
                    {{ criteria.title }}
                  </p>
                  <span class="text-xs text-muted-foreground">
                    {{ criteria.description }}
                  </span>
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <Button
                        v-for="(_, index) in [1, 2, 3, 4, 5]"
                        :key="index"
                        variant="ghost"
                        type="button"
                        size="icon"
                        class="cursor-pointer rounded-full hover:bg-yellow-500/20 dark:hover:bg-yellow-500/20"
                        @click="hoverStarIndexObj[criteriaIndex] = index"
                      >
                        <Icon
                          v-if="hoverStarIndexObj[criteriaIndex] >= index"
                          name="mdi:star"
                          class="!size-6 text-yellow-500"
                        />
                        <Icon
                          v-else
                          name="mdi:star-outline"
                          class="!size-6 text-muted-foreground hover:text-yellow-500"
                        />
                      </Button>
                    </div>
                    <span class="text-sm text-muted-foreground">
                      {{
                        hoverStarIndexObj[criteriaIndex] < 0
                          ? 0
                          : hoverStarIndexObj[criteriaIndex] + 1
                      }}/5
                    </span>
                  </div>
                </div>

                <!-- comment -->
                <div>
                  <p class="text-sm font-medium">コメント</p>
                  <Textarea
                    type="text"
                    placeholder="フィードバックを入力"
                    class="w-full h-36 border border-muted-foreground/20 rounded-md p-4"
                  />
                  <span class="text-xs text-muted-foreground">
                    フィードバックで伝えたい想いがあればご記入ください。
                  </span>
                </div>

                <!-- anonymous -->
                <div name="isAnonymous">
                  <div class="flex items-center justify-between">
                    <p class="text-sm text-muted-foreground">
                      匿名でフィードバックをする
                    </p>
                    <Switch
                      class="cursor-pointer data-[state=checked]:bg-purple"
                    />
                  </div>
                </div>
                <Button variant="main" class="w-full cursor-pointer">
                  フィードバックを送信する
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="main" class="w-full cursor-pointer" as-child>
            <NuxtLink
              :to="`/create-form/${template.value}`"
              class="flex items-center gap-1"
            >
              <Icon name="mdi:plus" />
              このテンプレートを使う
            </NuxtLink>
          </Button>
        </CardFooter>
      </Card>
    </div>
  </div>
</template>
