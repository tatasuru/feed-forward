<script setup lang="ts">
definePageMeta({
  middleware: "auth",
  layout: "home",
  title:
    "デザイン・コードのフィードバックプラットフォーム FeedForward – AI分析で制作物の品質向上",
  description:
    "クリエイター・エンジニア向けフィードバックプラットフォーム。Figma、GitHub連携で構造化されたフィードバックを収集。AI分析機能で制作物の改善提案を自動生成。デザイン・コード・企画の評価を効率化し、チームの創造性を加速させます。",
  ogTitle:
    "デザイン・コードのフィードバックプラットフォーム FeedForward – AI分析で制作物の品質向上",
  ogDescription:
    "クリエイター・エンジニア向けフィードバックプラットフォーム。Figma、GitHub連携で構造化されたフィードバックを収集。AI分析機能で制作物の改善提案を自動生成。デザイン・コード・企画の評価を効率化し、チームの創造性を加速させます。",
  twitterCard: "summary_large_image",
});

const pricePlans = [
  {
    name: "フリープラン",
    price: "無料",
    description: "無料でフィードバックを受け取ることができます",
    features: [
      "3プロジェクト作成可能",
      "フィードバック項目テンプレート",
      "フィードバック収集",
    ],
    buttonText: "今すぐ始める",
  },
  {
    name: "スタータープラン",
    price: "￥1,000",
    description: "追加機能でフィードバックをさらに活用",
    features: [
      "10プロジェクト作成可能",
      "フィードバック項目テンプレート",
      "カスタムテンプレート",
      "フィードバック収集",
      "AI分析機能",
    ],
    buttonText: "今すぐ始める",
  },
  {
    name: "プロプラン",
    price: "￥3,000",
    description: "フィードバックをチーム全体で活用",
    features: [
      "無制限のプロジェクト作成",
      "フィードバック項目テンプレート",
      "カスタムテンプレート",
      "フィードバック収集",
      "AI分析機能",
    ],
    buttonText: "お問い合わせ",
  },
];
</script>

<template>
  <div id="home" class="w-full grid gap-16 md:gap-32">
    <!-- kv -->
    <div
      id="kv"
      class="flex flex-col items-center justify-center gap-8 md:gap-12 gradient-bg-pale relative w-screen ml-[calc(-50vw+50%)] pt-12 px-4 md:pt-40 md:px-8"
    >
      <div class="flex flex-col items-center justify-center gap-4">
        <h1
          class="text-4xl font-bold text-center sm:text-5xl lg:text-6xl leading-12 md:leading-16 tracking-wide md:tracking-widest gradient-text"
        >
          フィードバックで<br class="md:hidden" />創造を加速する
        </h1>
        <p class="text-sm md:text-lg text-center leading-6 md:leading-8">
          FeedForwardは、デザイナー・エンジニア・プランナーのためのプロフェッショナルフィードバックプラットフォームです。
          <br />
          Figma、GitHub、Slack連携で構造化されたフィードバックを収集し、AI分析で具体的な改善提案を生成。あなたの制作物を次のレベルに引き上げます。
        </p>
      </div>

      <!-- buttons -->
      <div class="flex items-center gap-2">
        <Button :variant="'main'" class="md:text-base" as-child>
          <div class="flex items-center gap-2">
            <NuxtLink
              :to="{
                name: 'login',
                query: {
                  tab: 'signup',
                },
              }"
            >
              無料で始める
            </NuxtLink>
            <Icon name="mdi:arrow-right-thick" />
          </div>
        </Button>
        <Button :variant="'mainOutline'" class="md:text-base" as-child>
          <div>
            <Icon name="mdi:email" />
            <NuxtLink to="/"> 問い合わせる </NuxtLink>
          </div>
        </Button>
      </div>

      <div class="flex flex-col items-center justify-center">
        <p class="text-sm text-muted-foreground">
          すでにアカウントをお持ちですか？
        </p>
        <Button :variant="'link'" class="text-base" as-child>
          <NuxtLink
            :to="{
              name: 'login',
              query: {
                tab: 'signin',
              },
            }"
            class="text-sm text-purple"
          >
            ログイン
          </NuxtLink>
        </Button>
      </div>
    </div>

    <!-- price -->
    <section id="price" class="flex flex-col items-center justify-center gap-8">
      <div class="">
        <PageTitle
          title="料金プラン"
          description="あなたのチームに最適なプランを見つけましょう。"
          size="large"
          class="text-center"
        />
      </div>

      <div
        class="md:w-[80%] mx-auto grid md:grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-6 md:items-center"
      >
        <Card
          v-for="(plan, index) in pricePlans"
          :key="index"
          class="row-span-4 grid grid-rows-subgrid"
          :class="{
            'border-purple border-2': index === 1,
          }"
        >
          <CardHeader class="text-center">
            <CardTitle class="mb-7 text-xl md:text-2xl font-bold">
              {{ plan.name }}
            </CardTitle>
            <span
              class="font-bold text-4xl md:text-5xl"
              :class="{
                'gradient-text': index === 1,
              }"
            >
              {{ plan.price }}
              <span
                v-if="index !== 0"
                class="text-lg font-bold text-muted-foreground"
                >/ 月
              </span>
            </span>
          </CardHeader>
          <CardDescription class="text-center px-6">
            {{ plan.description }}
          </CardDescription>
          <CardContent class="flex-1">
            <ul class="mt-7 space-y-2.5 text-sm">
              <li
                v-for="(feature, index) in plan.features"
                :key="index"
                class="flex space-x-2"
              >
                <Icon name="mdi:check" class="flex-shrink-0 mt-0.5 h-4 w-4" />
                <span class="text-muted-foreground">
                  {{ feature }}
                </span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              class="w-full cursor-pointer"
              :variant="index !== 2 ? 'main' : 'outline'"
            >
              {{ plan.buttonText }}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </section>

    <!-- footer -->
    <footer class="relative w-screen ml-[calc(-50vw+50%)] p-4 border">
      <div class="flex flex-col items-center justify-center gap-4">
        <div
          class="flex flex-col md:flex-row md:items-center gap-4 w-full md:w-auto"
        >
          <NuxtLink
            to="/privacy"
            class="text-sm text-gray-600 dark:text-gray-400"
          >
            プライバシーポリシー
          </NuxtLink>

          <NuxtLink
            to="/terms"
            class="text-sm text-gray-600 dark:text-gray-400"
          >
            利用規約
          </NuxtLink>

          <NuxtLink
            to="/contact"
            class="text-sm text-gray-600 dark:text-gray-400"
          >
            お問い合わせ
          </NuxtLink>

          <NuxtLink to="/help" class="text-sm text-gray-600 dark:text-gray-400">
            ヘルプ
          </NuxtLink>

          <NuxtLink to="/blog" class="text-sm text-gray-600 dark:text-gray-400">
            ブログ
          </NuxtLink>
        </div>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          © 2023 FeedForward. All rights reserved.
        </p>
      </div>
    </footer>
  </div>
</template>
