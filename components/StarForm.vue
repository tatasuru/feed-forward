<script setup lang="ts">
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { toast } from "vue-sonner";

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
const route = useRoute();
const supabase = useSupabaseClient();
const parentUrl = ref<string | undefined>(undefined);
const starRatings = ref<number[]>([]);
const currentPath = useRoute().path;
const borderColor = ["border-pink", "border-purple", "border-blue"];

/******************************
 * form setup
 ******************************/
const formSchema = toTypedSchema(
  z.object({
    comment: z
      .string({
        required_error: "コメントは必須です",
      })
      .max(500, "コメントは500文字以内で入力してください"),
    ratings: z
      .array(
        z
          .number({
            required_error: "評価は必須です",
          })
          .min(0, "評価は0以上で入力してください")
          .max(5, "評価は5以下で入力してください")
      )
      .length(
        props.feedbackItems.length,
        "すべてのフィードバック項目に回答してください"
      ),
  })
);

const form = useForm({
  validationSchema: formSchema,
});

const onSubmit = form.handleSubmit(async (values) => {
  if (props.preview) {
    console.log("Preview mode: Form submission skipped.");
    toast.info("プレビュー中のため送信されません。");
    return;
  }

  try {
    const responseData = {
      items: props.feedbackItems.map((item, index) => ({
        id: item.id,
        name: item.name || `フィードバック項目${index + 1}`,
        question:
          item.question || "フィードバックを収集するための項目を設定します。",
        rating: values.ratings[index],
      })),
      comment: values.comment,
    };

    console.log(route.params.id, "Form ID:", route.params.id);

    const { data, error } = await supabase
      .from("form_responses")
      .insert({
        form_id: route.params.id,
        response_data: responseData,
        referrer_url: parentUrl.value || "unknown",
      })
      .select();

    if (error) {
      console.error("Error submitting form:", error);
      throw new Error("フィードバックの送信中にエラーが発生しました。");
    }

    console.log("Form submitted successfully:", data);
    toast.success("フィードバックが送信されました。");
    return data;
  } catch (error) {
    console.error("Unexpected error:", error);
    toast.error("フィードバックの送信中に予期しないエラーが発生しました。");
    return;
  }
});

/******************************
 * Star rating click handler
 ******************************/
function clickStar(index: number, itemIndex: number) {
  starRatings.value[itemIndex] = index + 1;
  form.setFieldValue(`ratings.${itemIndex}`, starRatings.value[itemIndex]);
}

/******************************
 * Lifecycle hook
 ******************************/
onMounted(() => {
  // referrerからフィードバック元のURLを取得
  parentUrl.value = document.referrer;
  console.log("Parent URL:", parentUrl.value);

  if (!parentUrl.value) {
    console.log("Referrer情報が取得できませんでした");
  }
});
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

    <!-- form -->
    <form
      @submit="onSubmit"
      class="flex flex-col"
      :class="[props.size === 'small' ? 'gap-6' : 'gap-8']"
    >
      <FormField
        v-for="(item, index) in props.feedbackItems"
        v-slot="{ componentField }"
        :key="item.id"
        :name="`ratings[${index}]`"
      >
        <FormItem
          class="flex flex-col border-dashed rounded-lg"
          :class="[
            props.size === 'small' ? 'gap-2 p-4' : 'gap-4',
            !currentPath.includes('preview') && preview && borderColor[index],
            !currentPath.includes('preview') && preview && 'border-2',
          ]"
        >
          <div class="flex flex-col gap-1">
            <FormLabel
              class="font-medium pointer-events-none"
              :class="[props.size === 'small' ? 'text-sm' : 'text-lg']"
            >
              {{ item.name || `フィードバック項目${index + 1}` }}
            </FormLabel>
            <span
              class="text-muted-foreground"
              :class="[props.size === 'small' ? 'text-xs' : 'text-base']"
            >
              {{
                item.question ||
                "フィードバックを収集するための項目を設定します。"
              }}
            </span>
          </div>

          <!-- star rating item -->
          <div class="flex items-center justify-between">
            <div
              class="flex items-center"
              :class="[props.size === 'small' ? 'gap-2' : 'gap-6']"
            >
              <FormControl>
                <Button
                  v-for="(_, starIndex) in [1, 2, 3, 4, 5]"
                  v-bind="componentField"
                  :key="starIndex"
                  variant="ghost"
                  type="button"
                  size="icon"
                  class="cursor-pointer rounded-full hover:bg-yellow-500/20 dark:hover:bg-yellow-500/20 focus:bg-transparent focus:ring-0 focus:ring-transparent focus:ring-offset-0"
                  @click="clickStar(starIndex, index)"
                >
                  <Icon
                    v-if="starRatings[index] > starIndex"
                    name="mdi:star"
                    class="text-yellow-500 shrink-0"
                    :class="[props.size === 'small' ? '!size-6' : '!size-10']"
                  />
                  <Icon
                    v-else
                    name="mdi:star-outline"
                    class="text-muted-foreground hover:text-yellow-500 shrink-0"
                    :class="[props.size === 'small' ? '!size-6' : '!size-10']"
                  />
                </Button>
              </FormControl>
            </div>
            <span
              class="text-muted-foreground"
              :class="[props.size === 'small' ? 'text-sm' : 'text-lg']"
            >
              {{ starRatings[index] || 0 }} / 5
            </span>
          </div>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="comment">
        <FormItem>
          <FormLabel
            class="font-medium"
            :class="[props.size === 'small' ? 'text-sm' : 'text-lg']"
          >
            コメント
          </FormLabel>
          <FormControl>
            <Textarea
              type="text"
              v-bind="componentField"
              placeholder="フィードバックを入力"
              class="w-full border border-muted-foreground/20 rounded-md p-4"
              :class="[props.size === 'small' ? 'h-42' : 'h-56']"
            />
          </FormControl>
          <FormDescription
            class="text-muted-foreground"
            :class="[props.size === 'small' ? 'text-xs' : 'text-base']"
          >
            フィードバックで伝えたい想いがあればご記入ください。
          </FormDescription>
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- form submit -->
      <Button
        type="submit"
        class="w-full cursor-pointer h-fit"
        :class="[props.size === 'small' ? 'text-sm' : 'text-lg py-4']"
      >
        フィードバックを送信する
      </Button>
    </form>

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
