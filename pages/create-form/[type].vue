<script setup lang="ts">
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { ref, computed } from "vue";
import { toast } from "vue-sonner";

const supabase = useSupabaseClient();
const user = useSupabaseUser();
const route = useRoute();
const isSubmitting = ref<boolean>(false);
const type = route.params.type as "star" | "scale_10" | "radio";

interface FeedbackItem {
  id: string;
  name: string;
  question: string;
  type?: "star" | "scale_10" | "radio";
  required?: boolean;
  options?: string[]; // for radio type
  maxRating?: number; // for scale_10 type and star type
}

/******************************
 * form validation schema
 *******************************/
const feedbackItemSchema = z.object({
  name: z
    .string({
      required_error: "項目名は必須です",
    })
    .min(1, "項目名は必須です"),
  question: z
    .string({
      required_error: "項目の説明は必須です",
    })
    .min(1, "項目の説明は必須です"),
});

const formSchema = toTypedSchema(
  z.object({
    formName: z.string().min(1, "フォーム名は必須です"),
    formDescription: z.string().min(1, "フォームの説明は必須です"),
    feedbackItems: z
      .array(feedbackItemSchema)
      .min(1, "少なくとも1つの項目が必要です")
      .max(3, "項目は最大3つまでです"),
  })
);

/******************************
 * feedback items management
 *******************************/
const feedbackItems = ref<FeedbackItem[]>([
  {
    id: "1",
    name: "",
    question: "",
  },
]);
const maxItems = 3;
const remainingItems = computed(() => maxItems - feedbackItems.value.length);
const canAddMore = computed(() => feedbackItems.value.length < maxItems);

const addFeedbackItem = () => {
  if (canAddMore.value) {
    const newId = (feedbackItems.value.length + 1).toString();
    feedbackItems.value.push({
      id: newId,
      name: "",
      question: "",
    });
  }
};
const removeFeedbackItem = (index: number) => {
  if (feedbackItems.value.length > 1) {
    feedbackItems.value.splice(index, 1);
  }
};

/*******************************
 * fetch form catalog
 *******************************/
const thumbnail = computed(() => {
  const template = formTemplates.value?.find((t) => t.form_type === type);
  return template ? template.thumbnail : "";
});

const { data: formTemplates } = await useAsyncData(
  "formTemplates",
  async () => {
    try {
      const { data, error } = await supabase
        .from("form_template_catalog")
        .select("*")
        .order("is_featured", { ascending: false })
        .eq("form_type", type);

      if (error) throw new Error(error.message);
      return data;
    } catch (error) {
      console.error("Error fetching form templates:", error);
      return [];
    }
  }
);

/******************************
 * form handling
 *******************************/
const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    formName: "",
    formDescription: "",
    feedbackItems: feedbackItems.value,
  },
});

async function createForm(values: any) {
  const { data, error } = await supabase
    .from("my_forms")
    .insert([
      {
        user_id: user.value?.id || null,
        form_type: type,
        title: values.formName,
        description: values.formDescription,
        feedback_items: values.feedbackItems.map((item: FeedbackItem) => ({
          name: item.name,
          question: item.question,
          type: type,
          required: true,
          options: [],
          max_rating:
            type === "star" ? 5 : type === "scale_10" ? 10 : undefined,
        })),
        is_published: true,
        embed_code: "",
        thumbnail: thumbnail.value,
      },
    ])
    .select();

  if (error) {
    console.error("Error creating form:", error);
    throw new Error(error.message);
  }

  return data[0];
}

const onSubmit = form.handleSubmit(async (values) => {
  console.log("Form values:", values);
  isSubmitting.value = true;

  const result = createForm(values)
    .then((data) => {
      console.log("Form created successfully:", data);
      return data;
    })
    .catch((error) => {
      console.error("Error creating form:", error);
      toast.error("フィードバックフォームの作成に失敗しました。", {
        description: error.message || "不明なエラーが発生しました。",
      });
    });

  // clear the form state
  form.resetForm();

  // show success message
  toast.success("フィードバックフォームが作成されました！", {
    description: "マイフォーム一覧から確認できます。",
  });

  setTimeout(() => {
    //TODO: Redirect to the newly created form's page
    navigateTo("/my-forms");
  }, 2000);

  isSubmitting.value = false;
  return result;
});
</script>

<template>
  <div id="create-project" class="grid w-full h-full gap-8">
    <div class="flex flex-col gap-4">
      <!-- header -->
      <div
        class="flex items-center justify-between w-full sticky top-0 z-50 bg-background border-b border-border py-4"
      >
        <PageTitle title="フィードバックフォームの作成" size="medium" />
        <Button
          @click="onSubmit"
          variant="main"
          class="cursor-pointer"
          :class="isSubmitting ? 'opacity-50 cursor-not-allowed' : ''"
        >
          <template v-if="isSubmitting">
            <Icon name="mdi:loading" class="!size-4 animate-spin" />
            保存中...
          </template>
          <span v-else>保存する</span>
        </Button>
      </div>

      <!-- main -->
      <div
        class="w-full h-full grid grid-cols-[50%_auto_1fr] items-start gap-8"
      >
        <!-- edit form -->
        <div class="w-full h-full p-4">
          <form class="flex flex-col gap-8 w-full h-full">
            <!-- step-1 -->
            <div class="flex flex-col gap-6 p-8 border rounded-md shadow-sm">
              <PageTitle
                title="1.フォームの基本情報"
                description="フォームの基本情報を入力してください。"
                size="small"
              />
              <div class="flex flex-col gap-6">
                <FormField v-slot="{ componentField }" name="formName">
                  <FormItem>
                    <FormLabel>フォームの名前</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="プロジェクト"
                        v-bind="componentField"
                      />
                    </FormControl>
                    <FormDescription class="text-xs">
                      マイフォーム一覧で表示されるフォームの名前を入力してください。
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                </FormField>
                <FormField v-slot="{ componentField }" name="formDescription">
                  <FormItem>
                    <FormLabel>フォームの説明</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="このフォームはフィードバックを収集するためのものです。"
                        v-bind="componentField"
                      />
                    </FormControl>
                    <FormDescription class="text-xs">
                      フォームの目的や内容を簡潔に説明してください。
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                </FormField>
              </div>
            </div>

            <!-- step-2 -->

            <div class="flex flex-col gap-6 p-8 border rounded-md shadow-sm">
              <PageTitle
                title="2.フィードバック項目の設定"
                description="フィードバックを収集するための項目を設定してください。"
                size="small"
              />

              <template v-if="type === 'star'">
                <div
                  v-for="(item, index) in feedbackItems"
                  :key="item.id"
                  :class="[
                    'flex flex-col gap-6 border-2 p-6 rounded-md border-dashed relative',
                    index === 0
                      ? 'border-pink'
                      : index === 1
                      ? 'border-purple'
                      : 'border-blue',
                  ]"
                >
                  <div class="flex items-center justify-between">
                    <h3 class="text-sm font-medium">項目{{ index + 1 }}</h3>
                    <Button
                      v-if="feedbackItems.length > 1"
                      variant="ghost"
                      size="icon"
                      type="button"
                      @click="removeFeedbackItem(index)"
                      class="text-purple hover:bg-muted dark:hover:bg-purple/20 cursor-pointer"
                    >
                      <Icon name="mdi:close" class="!size-4" />
                    </Button>
                  </div>

                  <FormField
                    v-slot="{ componentField }"
                    :name="`feedbackItems.${index}.name`"
                  >
                    <FormItem>
                      <FormLabel>項目{{ index + 1 }}の名前</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="例: デザインの質"
                          v-bind="componentField"
                          v-model="feedbackItems[index].name"
                        />
                      </FormControl>
                      <FormDescription class="text-xs">
                        実際に表示するフィードバック項目の名前を入力してください。
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  </FormField>

                  <FormField
                    v-slot="{ componentField }"
                    :name="`feedbackItems.${index}.question`"
                  >
                    <FormItem>
                      <FormLabel>項目{{ index + 1 }}の説明</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="例: デザインの美しさや一貫性について評価してください"
                          v-bind="componentField"
                          v-model="feedbackItems[index].question"
                        />
                      </FormControl>
                      <FormDescription class="text-xs">
                        フィードバックを収集するための項目を設定します。
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  </FormField>
                </div>
              </template>

              <div class="flex flex-col gap-2">
                <Button
                  variant="mainOutline"
                  type="button"
                  class="w-full cursor-pointer self-center border-dashed"
                  @click="addFeedbackItem"
                  :disabled="!canAddMore"
                >
                  <Icon name="mdi:plus" class="!size-4" />
                  フィードバック項目を追加
                </Button>
                <span class="flex self-center text-xs text-muted-foreground">
                  残り{{ remainingItems }}つまで
                </span>
              </div>
            </div>
          </form>
        </div>

        <!-- separator -->
        <Separator class="w-px h-full bg-border" orientation="vertical" />

        <!-- preview -->
        <div
          class="w-full h-fit flex flex-col justify-center items-center gap-4 p-4 sticky top-20 z-10"
        >
          <div
            class="flex flex-col gap-6 border p-6 rounded-md w-full max-w-[520px] h-fit mx-auto shadow-sm"
          >
            <!-- title and description -->
            <div>
              <h2 class="text-lg font-semibold">
                {{
                  form.values.formName
                    ? form.values.formName
                    : "フィードバックフォームタイトル"
                }}
              </h2>
              <p class="text-sm text-muted-foreground">
                {{
                  form.values.formDescription
                    ? form.values.formDescription
                    : "このフォームはフィードバックを収集するためのものです。"
                }}
              </p>
            </div>

            <!-- rating items -->
            <template v-if="type === 'star'">
              <div
                v-for="(item, index) in feedbackItems"
                :key="item.id"
                :class="[
                  'border-2 border-dashed p-4 rounded-md',
                  index === 0
                    ? 'border-pink'
                    : index === 1
                    ? 'border-purple'
                    : 'border-blue',
                ]"
              >
                <p class="text-sm font-medium">
                  {{ item.name || `フィードバック項目${index + 1}` }}
                </p>
                <span class="text-xs text-muted-foreground">
                  {{
                    item.question ||
                    "フィードバックを収集するための項目を設定します。"
                  }}
                </span>
                <div class="flex items-center justify-between mt-3">
                  <div class="flex items-center gap-2">
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
                        class="!size-6 text-muted-foreground hover:text-yellow-500"
                      />
                    </Button>
                  </div>
                  <span class="text-sm text-muted-foreground"> 0/5 </span>
                </div>
              </div>
            </template>

            <!-- comment -->
            <div>
              <p class="text-sm font-medium">コメント</p>
              <Textarea
                type="text"
                placeholder="フィードバックを入力"
                class="w-full h-24 border border-muted-foreground/20 rounded-md p-4"
              />
              <span class="text-xs text-muted-foreground">
                フィードバックで伝えたい想いがあればご記入ください。
              </span>
            </div>

            <!-- form submit -->
            <Button class="w-full cursor-pointer">
              フィードバックを送信する
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
