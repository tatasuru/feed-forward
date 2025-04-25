<script setup lang="ts"></script>

<template>
  <div
    class="flex items-start gap-4 hover:scale-103 transition-transform duration-200 ease-in-out cursor-pointer"
  >
    <div class="flex items-center gap-1">
      <Avatar src="/" alt="" class="!size-10">
        <AvatarImage
          src="https://images.unsplash.com/photo-1502685104226-e9df14d4d9f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDF8fG1hdGhlc3xlbnwwfHx8fDE2OTI5NzY5NTg&ixlib=rb-4.0.3&q=80&w=400"
          alt="User Avatar"
        />
        <AvatarFallback>U</AvatarFallback>
      </Avatar>
    </div>
    <div class="flex flex-col gap-4 w-full">
      <div class="flex flex-col gap-2">
        <div
          class="flex flex-col gap-1 md:gap-0 md:flex-row md:items-center justify-between"
        >
          <div class="flex items-center gap-2">
            <h3 class="text-base md:text-lg font-bold">UIデザイン改善案</h3>
            <Badge
              variant="outline"
              class="gradient-bg text-white rounded-full"
            >
              デザイン
            </Badge>
          </div>
          <div class="flex items-center gap-px">
            <Icon
              v-for="(item, index) in [1, 2, 3, 4, 5]"
              name="mdi:star-outline"
              class="!size-5 text-yellow-500"
            />
          </div>
        </div>
        <p class="text-sm text-muted-foreground">
          ナビゲーションの動線が分かりやすくなりました。モバイル表示の最適化がさらに必要かもしれません。
        </p>
      </div>
      <div class="flex flex-row items-center gap-4">
        <div class="flex items-center gap-1">
          <Icon
            name="mdi:clock-outline"
            class="!size-4 text-muted-foreground"
          />
          <span class="text-sm text-muted-foreground">2日前</span>
        </div>
        <div class="flex items-center gap-1">
          <Icon
            name="mdi:account-outline"
            class="!size-4 text-muted-foreground"
          />
          <span class="text-sm text-muted-foreground">佐藤さん</span>
        </div>
      </div>
    </div>
  </div>
</template>
