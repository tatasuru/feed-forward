<script setup lang="ts">
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import type {
  ProjectData,
  CriteriaTemplate,
} from "@/types/create-project.types";
import {
  today,
  type DateValue,
  getLocalTimeZone,
} from "@internationalized/date";
import { CalendarIcon } from "lucide-vue-next";
import { toast } from "vue-sonner";

definePageMeta({
  middleware: "auth",
  title: "新規プロジェクト作成",
  description:
    "フィードバックを受け取りたいプロジェクトの詳細を入力してください",
  ogTitle: "Feed Forward 新規プロジェクト作成",
  ogDescription:
    "フィードバックを受け取りたいプロジェクトの詳細を入力してください",
  twitterCard: "summary_large_image",
});

const supabase = useSupabaseClient();
const user = useSupabaseUser();

const visibilityTypes = [
  {
    icon: "mdi:earth",
    value: "public",
    label: "パブリック（誰でも閲覧・フィードバック可能）",
  },
  {
    icon: "mdi:lock-open",
    value: "unlisted",
    label:
      "限定公開（リンクを知っている人のみ閲覧・フィードバック可能） (有料版のみ)",
  },
  {
    icon: "mdi:lock",
    value: "private",
    label:
      "プライベート（招待した人のみ閲覧・フィードバック可能） (有料版のみ)",
  },
];
const evaluationTypes = computed<CriteriaTemplate[]>(() => {
  return criteriaTemplates.value;
});
const criteriaTemplate = ref<CriteriaTemplate["criteria"]>([]);
const dateValue = ref<string>("");
const selectedDateValue = ref<DateValue>();
const bgColorPalette = ["bg-purple/10", "bg-blue/10", "bg-pink/10"];
const borderColorPalette = [
  "border-purple/50",
  "border-blue/50",
  "border-pink/50",
];
const publishStatus = ref<boolean>(false);
const formRef = ref<HTMLElement | null>(null);
const isSubmitting = ref<boolean>(false);

/********************************
 * Lifecycle hooks
 ********************************/
const { data: criteriaTemplates } = await useAsyncData(
  "criteriaTemplatesForCreate",
  async () => {
    const { data, error } = await supabase.rpc("get_criteria_templates", {
      p_evaluation_type: "",
    });

    if (error) {
      throw error;
    }

    return data;
  }
);

/********************************
 * Form setup
 ********************************/
const formSchema = [
  z.object({
    purpose: z.enum(["community", "external"], {
      errorMap: () => ({ message: "プロジェクトの種類は必須です" }),
    }),
  }),
  z.object({
    template: z.enum(["starFeedback"], {
      errorMap: () => ({ message: "テンプレートの選択は必須です" }),
    }),
  }),
];

const purposes = [
  {
    icon: "mdi:comment-text-multiple",
    value: "community",
    label: "コミュニティフィードバック用",
    description:
      "コミュニティ内でのフィードバックを受け取るためのプロジェクトです。",
  },
  {
    icon: "mdi:satellite-uplink",
    value: "external",
    label: "共有URL・埋め込みフィードバック用",
    description:
      "共有URLや埋め込みコードを使って、外部からフィードバックを受け取るためのプロジェクトです。",
  },
];

const templates = [
  {
    icon: "mdi:star-check",
    value: "starFeedback",
    label: "製品フィードバック",
    description:
      "5つの星で評価し、コメントを追加するフィードバックテンプレートです。",
  },
];

const hoverStarIndexObj = ref<{
  [key: number]: number;
}>({
  0: -1,
  1: -1,
  2: -1,
});

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

/********************************
 * stepper and form logic
 ********************************/
const stepIndex = ref<number>(1);
const steps = [
  {
    step: 1,
    title: "プロジェクトの目的を選択",
    description: "目的を選択してください",
  },
  {
    step: 2,
    title: "テンプレートを選択",
    description: "テンプレートを選択してください。",
  },
  {
    step: 3,
    title: "詳細入力",
    description: "詳細情報を入力してください。",
  },
];
</script>

<template>
  <div id="create-project" class="grid w-full gap-8" ref="formRef">
    <PageTitle
      title="新規プロジェクト作成"
      description="フィードバックを受け取りたいプロジェクトの詳細を入力してください"
      size="large"
    />

    <section class="flex gap-8 min-h-[calc(100vh-220px)] p-4">
      <Stepper
        v-model="stepIndex"
        orientation="vertical"
        class="mx-auto flex w-full max-w-[300px] md:flex-col justify-start gap-20"
      >
        <template v-for="step in steps" :key="step.step">
          <StepperItem
            v-slot="{ state }"
            class="relative flex w-full items-start gap-6"
            :step="step.step"
          >
            <StepperSeparator
              v-if="step.step !== steps[steps.length - 1].step"
              class="absolute left-[19px] top-[50px] block h-[60px] w-0.5 shrink-0 rounded-full bg-muted group-data-[state=completed]:bg-purple"
            />

            <StepperTrigger
              :state="state"
              class="flex flex-col items-center gap-2"
              :class="[state === 'active' && 'text-primary']"
              as-child
            >
              <Button
                :variant="
                  state === 'completed' || state === 'active'
                    ? 'default'
                    : 'outline'
                "
                size="icon"
                class="z-10 rounded-full shrink-0 size-10 cursor-pointer"
                :class="[
                  state === 'active' &&
                    'ring-2 ring-background ring-offset-2 ring-offset-purple bg-background hover:bg-background focus:bg-background',
                  state === 'completed' &&
                    'bg-purple hover:bg-purple/90 focus:bg-purple/90',
                ]"
                :disabled="step.step !== stepIndex"
              >
                <Icon
                  name="mdi:cube-outline"
                  v-if="step.step === 1 && state !== 'completed'"
                  class="!size-5 text-purple"
                />
                <Icon
                  name="mdi:file-document"
                  v-if="step.step === 2 && state !== 'completed'"
                  class="!size-5 text-purple"
                />
                <Icon
                  name="mdi:web-plus"
                  v-if="step.step === 3 && state !== 'completed'"
                  class="!size-5 text-purple"
                />
                <Icon
                  v-if="state === 'completed'"
                  name="mdi:check-bold"
                  class="!size-5 text-white"
                />
              </Button>
            </StepperTrigger>

            <div class="flex flex-col gap-1">
              <StepperTitle
                :class="[state === 'active' && 'text-primary']"
                class="text-sm font-semibold transition lg:text-base whitespace-normal"
              >
                {{ step.title }}
              </StepperTitle>
              <StepperDescription
                :class="[state === 'active' && 'text-primary']"
                class="text-xs transition md:not-sr-only lg:text-xs"
              >
                {{ step.description }}
              </StepperDescription>
            </div>
          </StepperItem>
        </template>
      </Stepper>

      <Separator orientation="vertical" class="hidden md:block" />

      <Form
        v-slot="{ meta, values, validate }"
        as=""
        keep-values
        :validation-schema="toTypedSchema(formSchema[stepIndex - 1])"
      >
        <form
          @submit="
            (e) => {
              e.preventDefault();
              validate();

              if (stepIndex === steps.length && meta.valid) {
              }
            }
          "
          class="w-full h-full md:h-auto flex flex-col justify-between"
        >
          <div v-if="stepIndex === 1" class="flex flex-col gap-8">
            <PageTitle
              title="プロジェクトの目的を選択"
              description="プロジェクトをどのような目的で作成するかを選択してください"
              size="small"
            />

            <FormField v-slot="{ componentField }" name="purpose">
              <FormItem>
                <FormLabel>
                  プロジェクトの種類
                  <Badge
                    variant="gradient"
                    class="text-xs text-white rounded-sm"
                  >
                    必須
                  </Badge>
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    v-bind="componentField"
                    :orientation="'vertical'"
                    class="grid md:grid-cols-2 gap-2 md:gap-4 [&_svg]:fill-purple"
                  >
                    <Card
                      v-for="purpose in purposes"
                      :key="purpose.value"
                      class="flex items-center space-x-2 border rounded-sm cursor-pointer hover:bg-purple/20 transition-colors shadow-none"
                      @click="componentField.onChange(purpose.value)"
                      :class="{
                        'border-purple border-1 bg-purple/20':
                          componentField.modelValue === purpose.value,
                      }"
                    >
                      <CardContent class="w-full flex flex-row space-x-2">
                        <RadioGroupItem
                          :id="purpose.value"
                          :value="purpose.value"
                          class="border-purple"
                        />
                        <Icon
                          :name="purpose.icon"
                          class="!size-5 text-primary shrink-0"
                        />
                        <div class="flex flex-col gap-1">
                          <Label
                            :for="purpose.value"
                            class="w-full cursor-pointer"
                          >
                            {{ purpose.label }}
                          </Label>
                          <span class="text-xs text-muted-foreground">
                            {{ purpose.description }}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
          </div>

          <div v-if="stepIndex === 2" class="flex flex-col gap-8">
            <PageTitle
              title="プロジェクトの目的を選択"
              description="プロジェクトをどのような目的で作成するかを選択してください"
              size="small"
            />

            <FormField v-slot="{ componentField }" name="template">
              <FormItem>
                <FormLabel>
                  プロジェクトの種類
                  <Badge
                    variant="gradient"
                    class="text-xs text-white rounded-sm"
                  >
                    必須
                  </Badge>
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    v-bind="componentField"
                    :orientation="'vertical'"
                    class="grid md:grid-cols-2 gap-2 md:gap-4 [&_svg]:fill-purple"
                  >
                    <Card
                      v-for="template in templates"
                      :key="template.value"
                      class="flex items-center space-x-2 border rounded-sm cursor-pointer hover:bg-purple/20 transition-colors shadow-none"
                      @click="componentField.onChange(template.value)"
                      :class="{
                        'border-purple border-1 bg-purple/20':
                          componentField.modelValue === template.value,
                      }"
                    >
                      <CardContent class="w-full flex flex-row space-x-2">
                        <RadioGroupItem
                          :id="template.value"
                          :value="template.value"
                          class="border-purple"
                        />
                        <Icon
                          :name="template.icon"
                          class="!size-5 text-primary shrink-0"
                        />
                        <div class="flex flex-col gap-1">
                          <Label
                            :for="template.value"
                            class="w-full cursor-pointer"
                          >
                            {{ template.label }}
                          </Label>
                          <span class="text-xs text-muted-foreground">
                            {{ template.description }}
                          </span>
                        </div>
                      </CardContent>
                      <CardFooter class="flex w-full justify-end">
                        <Dialog>
                          <DialogTrigger as-child>
                            <Button
                              variant="link"
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
                              <DialogTitle
                                >製品フィードバックテンプレート</DialogTitle
                              >
                              <DialogDescription>
                                このテンプレートは、5つの星で評価し、コメントを追加するフィードバックテンプレートです。5段階評価、コメント、匿名でのフィードバックが可能です。
                              </DialogDescription>
                            </DialogHeader>

                            <!-- template -->
                            <div
                              class="flex flex-col gap-6 border p-6 rounded-md w-full max-w-[600px] mx-auto"
                            >
                              <!-- rating -->
                              <div
                                v-for="(
                                  criteria, criteriaIndex
                                ) in ratingPerCriteria"
                              >
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
                                      v-bind="componentField"
                                      variant="ghost"
                                      type="button"
                                      size="icon"
                                      class="cursor-pointer rounded-full hover:bg-yellow-500/20 dark:hover:bg-yellow-500/20"
                                      @click="
                                        hoverStarIndexObj[criteriaIndex] = index
                                      "
                                    >
                                      <Icon
                                        v-if="
                                          hoverStarIndexObj[criteriaIndex] >=
                                          index
                                        "
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
                              <Button
                                variant="main"
                                class="w-full cursor-pointer"
                              >
                                フィードバックを送信する
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </CardFooter>
                    </Card>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
          </div>

          <div class="flex items-center justify-between mt-4">
            <Button
              :disabled="stepIndex === 1"
              variant="outline"
              size="sm"
              @click="stepIndex--"
              class="cursor-pointer"
            >
              もどる
            </Button>
            <div class="flex items-center gap-3">
              <Button
                v-if="stepIndex !== 3"
                :type="meta.valid ? 'button' : 'submit'"
                size="sm"
                :variant="'mainOutline'"
                @click="meta.valid && stepIndex++"
                class="cursor-pointer"
              >
                次へ
              </Button>
              <Button
                v-if="stepIndex === 3"
                size="sm"
                type="submit"
                class="cursor-pointer gradient-bg"
                :disabled="!meta.valid || isSubmitting"
              >
                {{ isSubmitting ? "登録中..." : "登録する" }}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </section>
  </div>
</template>
