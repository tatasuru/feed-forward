<script setup lang="ts">
interface FeedbackItem {
  id: string;
  name: string;
  question: string;
  type?: "star" | "scale_10" | "radio";
  required?: boolean;
  options?: string[]; // for radio type
  maxRating?: number; // for scale_10 type and star type
}

const props = defineProps<{
  formTitle: string | undefined;
  formDescription: string | undefined;
  type: "star" | "scale_10" | "radio";
  feedbackItems: FeedbackItem[];
  preview?: boolean;
  size?: "small" | "large";
}>();
</script>

<template>
  <div
    class="flex flex-col w-full h-fit mx-auto"
    :class="[
      props.size === 'small' ? 'gap-6 max-w-[520px]' : 'gap-12 max-w-[700px]',
    ]"
  >
    <!-- title and description -->
    <div class="flex flex-col gap-2">
      <h2
        class="font-semibold"
        :class="[props.size === 'small' ? 'text-lg' : 'text-2xl']"
      >
        {{
          props.formTitle ? props.formTitle : "フィードバックフォームタイトル"
        }}
      </h2>
      <p
        class="text-muted-foreground"
        :class="[props.size === 'small' ? 'text-sm' : 'text-lg']"
      >
        {{
          props.formDescription
            ? props.formDescription
            : "このフォームはフィードバックを収集するためのものです。"
        }}
      </p>
    </div>

    <!-- rating items -->
    <template v-if="type === 'star'">
      <div
        v-for="(item, index) in props.feedbackItems"
        :key="item.id"
        :class="[
          !props.preview && 'border-2 border-dashed p-4 rounded-md',
          index === 0
            ? 'border-pink'
            : index === 1
            ? 'border-purple'
            : 'border-blue',
        ]"
      >
        <p
          class="font-medium"
          :class="[props.size === 'small' ? 'text-sm' : 'text-lg']"
        >
          {{ item.name || `フィードバック項目${index + 1}` }}
        </p>
        <span
          class="text-muted-foreground"
          :class="[props.size === 'small' ? 'text-xs' : 'text-base']"
        >
          {{
            item.question || "フィードバックを収集するための項目を設定します。"
          }}
        </span>
        <div class="flex items-center justify-between mt-3">
          <div
            class="flex items-center"
            :class="[props.size === 'small' ? 'gap-2' : 'gap-6']"
          >
            <Button
              v-for="(_, starIndex) in [1, 2, 3, 4, 5]"
              :key="starIndex"
              variant="ghost"
              type="button"
              size="icon"
              class="cursor-pointer rounded-full hover:bg-yellow-500/20 dark:hover:bg-yellow-500/20"
            >
              <Icon
                name="mdi:star-outline"
                class="text-muted-foreground hover:text-yellow-500"
                :class="[props.size === 'small' ? '!size-6' : '!size-12']"
              />
            </Button>
          </div>
          <span
            class="text-muted-foreground"
            :class="[props.size === 'small' ? 'text-sm' : 'text-lg']"
          >
            0/5
          </span>
        </div>
      </div>
    </template>

    <!-- comment -->
    <div>
      <p
        class="font-medium"
        :class="[props.size === 'small' ? 'text-sm' : 'text-lg']"
      >
        コメント
      </p>
      <Textarea
        type="text"
        placeholder="フィードバックを入力"
        class="w-full border border-muted-foreground/20 rounded-md p-4"
        :class="[props.size === 'small' ? 'h-42' : 'h-56']"
      />
      <span
        class="text-muted-foreground"
        :class="[props.size === 'small' ? 'text-xs' : 'text-base']"
      >
        フィードバックで伝えたい想いがあればご記入ください。
      </span>
    </div>

    <!-- form submit -->
    <Button
      class="w-full cursor-pointer h-fit"
      :class="[props.size === 'small' ? 'text-sm' : 'text-lg py-4']"
    >
      フィードバックを送信する
    </Button>

    <!-- footer -->
    <div
      class="flex items-center justify-center gap-2"
      :class="[props.size === 'small' ? 'mt-6' : 'mt-12']"
    >
      <p class="text-xs text-center text-muted-foreground leading-8">
        Powered by
        <span
          class="flex font-bold gradient-text whitespace-nowrap overflow-hidden"
          :class="[props.size === 'small' ? 'text-xl' : 'text-2xl']"
        >
          FeedForward
        </span>
      </p>
    </div>
  </div>
</template>
