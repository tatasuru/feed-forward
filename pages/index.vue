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
    link: {
      name: "login",
      query: {
        tab: "signup",
      },
    },
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
    link: {
      name: "login",
      query: {
        tab: "signup",
      },
    },
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
    link: {
      name: "contact",
    },
  },
];

const featureList = [
  {
    icon: "mdi:comment-check-outline",
    title: "フィードバックの収集",
    description:
      "Figma、GitHub、Slackなどのツールと連携し、フィードバックを簡単に収集できます。",
  },
  {
    icon: "mdi:star-check",
    title: "評価システム",
    description:
      "5段階評価とコメントで、プロジェクトの強みと改善点を明確に把握できます。",
  },
  {
    icon: "mdi:share",
    title: "コラボレーション",
    description:
      "チームメンバーや外部の専門家と簡単に共有し、多様な視点を取り入れられます。",
  },
  {
    icon: "solar:bell-line-duotone",
    title: "リアルタイム通知",
    description:
      "新しいフィードバックがあったときに即座に通知を受け取り、迅速に対応できます。",
  },
  {
    icon: "mdi:security",
    title: "プライバシー管理",
    description:
      "公開範囲を細かく設定でき、必要に応じて匿名フィードバックも可能です。",
  },
  {
    icon: "mdi:star-shooting",
    title: "分析ダッシュボード",
    description:
      "フィードバックデータを視覚化し、プロジェクトの改善点を簡単に特定できます。",
  },
];

const accordionItems = [
  {
    value: "item-1",
    title: "無料で使えますか？",
    content: "はい。フリープランがあり、無料でフィードバックを受け取れます。",
  },
  {
    value: "item-2",
    title: "ログインしてないメンバーにもフィードバックを依頼できますか？",
    content:
      "はい。フィードバック依頼のURLを共有することで、ログインしていないメンバーにもフィードバックを依頼できます。",
  },
  {
    value: "item-3",
    title: "フィードバックの依頼はどのように行いますか？",
    content:
      "フィードバック依頼のURLを共有することで、簡単にフィードバックを依頼できます。",
  },
  {
    value: "item-4",
    title: "フィードバックの収集はどのように行いますか？",
    content:
      "Figma、GitHub、Slackなどのツールと連携し、フィードバックを簡単に収集できます。",
  },
  {
    value: "item-5",
    title: "フィードバックの分析はどのように行いますか？",
    content:
      "AI分析機能を使用して、フィードバックデータを視覚化し、プロジェクトの改善点を簡単に特定できます。",
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
          <NuxtLink
            :to="{
              name: 'login',
              query: {
                tab: 'signup',
              },
            }"
            class="flex items-center gap-2"
          >
            無料で始める
            <Icon name="mdi:arrow-right-thick" />
          </NuxtLink>
        </Button>
        <Button :variant="'mainOutline'" class="md:text-base" as-child>
          <NuxtLink to="/contact" class="flex items-center gap-2">
            <Icon name="mdi:email" />
            問い合わせる
          </NuxtLink>
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

    <!-- feature -->
    <section id="feature" class="flex flex-col items-center gap-8 md:px-24">
      <div class="flex flex-col gap-8 md:gap-12">
        <PageTitle
          title="フィードバック収集・分析を一つのプラットフォームで"
          description="シンプルな操作でプロジェクトの成功に必要な機能を提供し、フィードバックプロセスを効率化します"
          size="large"
        />

        <div class="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Card
            v-for="(feature, index) in featureList"
            :key="index"
            class="flex flex-row gap-4 items-start p-4 border-purple/50"
          >
            <div
              class="flex items-center justify-center gradient-bg rounded-full p-2 w-8 h-8 shrink-0"
            >
              <Icon :name="feature.icon" class="text-white" />
            </div>
            <div class="flex flex-col gap-2">
              <h3 class="font-semibold text-lg">
                {{ feature.title }}
              </h3>
              <p class="text-muted-foreground leading-relaxed">
                {{ feature.description }}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </section>

    <!-- price -->
    <section id="price" class="flex flex-col items-center justify-center gap-8">
      <PageTitle
        title="料金プラン"
        description="あなたのチームに最適なプランを見つけましょう。"
        size="large"
        class="text-center"
      />

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
              as-child
            >
              <NuxtLink
                :to="{
                  name: plan.link.name,
                  query: plan.link.query,
                }"
              >
                {{ plan.buttonText }}
              </NuxtLink>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </section>

    <!-- Q&A -->
    <section id="qa" class="flex flex-col items-center gap-8 md:px-24">
      <PageTitle
        title="よくある質問"
        description="FeedForwardに関するよくある質問をまとめました。"
        size="large"
        class="text-center"
      />

      <Accordion
        type="single"
        class="w-full md:w-[80%] mx-auto"
        collapsible
        default-value="item-1"
      >
        <AccordionItem
          v-for="item in accordionItems"
          :key="item.value"
          :value="item.value"
        >
          <AccordionTrigger class="cursor-pointer md:text-base">
            {{ item.title }}
          </AccordionTrigger>
          <AccordionContent>
            {{ item.content }}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>

    <!-- footer -->
    <section id="footer" class="relative w-screen ml-[calc(-50vw+50%)]">
      <!-- PR -->
      <div
        class="relative flex flex-col gap-8 items-center justify-center w-full p-4 md:p-16"
      >
        <div
          class="glow absolute -z-10 aspect-square w-full md:max-w-sm rounded-full bg-purple/90 blur-[220px] filter"
        />
        <h2
          class="text-3xl md:text-4xl gradient-text font-bold text-center md:text-left"
        >
          今すぐフィードバックの力を体験しよう
        </h2>
        <NuxtImg src="logo.png" alt="rocket" width="200" height="200" />
        <Button :variant="'main'" class="text-lg px-12 py-6" as-child>
          <NuxtLink
            :to="{
              name: 'login',
              query: {
                tab: 'signup',
              },
            }"
            class="w-fit flex items-center gap-2"
          >
            無料で始める
            <Icon name="mdi:arrow-right-thick" />
          </NuxtLink>
        </Button>
      </div>

      <!-- footer menu -->
      <footer class="w-full pt-8 p-4">
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

            <NuxtLink
              to="/help"
              class="text-sm text-gray-600 dark:text-gray-400"
            >
              ヘルプ
            </NuxtLink>

            <NuxtLink
              to="/blog"
              class="text-sm text-gray-600 dark:text-gray-400"
            >
              ブログ
            </NuxtLink>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            © 2025 FeedForward. All rights reserved.
          </p>
        </div>
      </footer>
    </section>
  </div>
</template>
