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
  z.object({
    title: z
      .string({
        message: "プロジェクト名は必須です",
      })
      .min(2, {
        message: "プロジェクト名は2文字以上で入力してください",
      })
      .max(50, {
        message: "プロジェクト名は50文字以内で入力してください",
      }),
    description: z.string({
      message: "プロジェクトの説明は必須です",
      required_error: "プロジェクトの説明は必須です",
    }),
    projectType: z.enum(["design", "demo", "plan"], {
      errorMap: () => ({ message: "プロジェクトの種類は必須です" }),
    }),
    deadline: z
      .string({
        message: "プロジェクトの期限は必須です",
      })
      .regex(/^[0-9/]+$/, {
        message: "日付は数字とスラッシュのみで入力してください",
      })
      .regex(/^\d{4}\/\d{2}\/\d{2}$/, {
        message: "日付はYYYY/MM/DD形式で入力してください",
      })
      .refine(
        (v) => {
          const parts = v.split("/");
          if (parts.length !== 3) return false;

          const year = parseInt(parts[0]);
          const month = parseInt(parts[1]);
          const day = parseInt(parts[2]);

          // Check if the month is valid (1-12)
          const date = new Date(year, month - 1, day);
          return (
            date.getFullYear() === year &&
            date.getMonth() === month - 1 &&
            date.getDate() === day
          );
        },
        {
          message: "有効な日付を入力してください",
        }
      )
      .refine(
        (v) => {
          // Check if the date is in the future
          const parts = v.split("/");
          const inputDate = new Date(
            parseInt(parts[0]),
            parseInt(parts[1]) - 1,
            parseInt(parts[2])
          );
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Set time to midnight for comparison
          return inputDate >= today;
        },
        {
          message: "期限は未来の日付である必要があります",
        }
      ),
    resourceUrl: z
      .string({
        message: "フィードバック対象のファイルやリンクは必須です",
      })
      .url("URL形式で入力してください"),
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

const projectTypes = [
  {
    icon: "mdi:picture-in-picture-top-right",
    value: "design",
    label: "デザイン",
  },
  {
    icon: "mdi:code-tags",
    value: "demo",
    label: "デモ",
  },
  {
    icon: "mdi:clipboard-text",
    value: "plan",
    label: "企画・仕様",
  },
];

function formatDate(newDate: DateValue) {
  const localTimeZone = getLocalTimeZone();
  const date = newDate.toDate(localTimeZone);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // 月は0始まり
  const day = String(date.getDate()).padStart(2, "0");

  // Set the formatted date to the input field
  dateValue.value = `${year}/${month}/${day}`;

  // set form value
  // TODO: refactor
  if (formRef.value) {
    const form = useForm<ProjectData>({
      initialValues: {
        deadline: dateValue.value,
      },
    });
    form.setFieldValue("deadline", dateValue.value);
  }
}

/********************************
 * stepper and form logic
 ********************************/
const stepIndex = ref<number>(1);
const steps = [
  {
    step: 1,
    title: "1.プロジェクトの目的を選択",
    description: "目的を選択してください",
  },
  {
    step: 2,
    title: "2.テンプレートを選択",
    description: "テンプレートを選択してください。",
  },
  {
    step: 3,
    title: "3.プロジェクト概要入力",
    description: "詳細情報を入力してください。",
  },
  {
    step: 4,
    title: "4.フィードバックフォーム編集",
    description: "項目を編集してください。",
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

    <section class="flex gap-8 min-h-[calc(100vh-210px)] p-4">
      <Stepper
        v-model="stepIndex"
        orientation="vertical"
        class="mx-auto flex w-full max-w-[220px] md:flex-col justify-start gap-12 sticky top-24 h-fit"
      >
        <template v-for="step in steps" :key="step.step">
          <StepperItem
            v-slot="{ state }"
            class="relative flex w-full items-start gap-2"
            :step="step.step"
          >
            <StepperSeparator
              v-if="step.step !== steps[steps.length - 1].step"
              class="absolute left-[11px] top-[30px] block h-[55px] w-0.5 shrink-0 rounded-full bg-muted group-data-[state=completed]:bg-purple"
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
                class="z-10 rounded-full shrink-0 size-6 cursor-pointer"
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
                  name="mdi:text-box-edit-outline"
                  v-if="step.step === 4 && state !== 'completed'"
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
                :class="[
                  state === 'active' ? 'text-primary' : 'text-muted-foreground',
                ]"
                class="text-sm font-semibold transition lg:text-sm whitespace-normal"
              >
                {{ step.title }}
              </StepperTitle>
              <StepperDescription
                :class="[
                  state === 'active' ? 'text-primary' : 'text-muted-foreground',
                ]"
                class="text-xs transition md:not-sr-only lg:text-xs"
              >
                {{ step.description }}
              </StepperDescription>
            </div>
          </StepperItem>
        </template>
      </Stepper>

      <Separator orientation="vertical" class="hidden md:block h-full" />

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
          class="w-full h-full md:h-auto flex flex-col gap-8 justify-between"
        >
          <div v-if="stepIndex === 1" class="flex flex-col gap-4 h-full">
            <FormField v-slot="{ componentField }" name="purpose">
              <FormItem>
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

          <div v-if="stepIndex === 2" class="flex flex-col gap-8 h-full">
            <FormField v-slot="{ componentField }" name="template">
              <FormItem>
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

          <div v-if="stepIndex === 3" class="flex flex-col gap-8 h-full">
            <FormField v-slot="{ componentField }" name="title">
              <FormItem>
                <FormLabel>
                  プロジェクト名
                  <Badge
                    variant="gradient"
                    class="text-xs text-white rounded-sm"
                  >
                    必須
                  </Badge>
                </FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="新規プロダクト草案"
                    v-bind="componentField"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="description">
              <FormItem>
                <FormLabel>
                  プロジェクトの説明
                  <Badge
                    variant="gradient"
                    class="text-xs text-white rounded-sm"
                  >
                    必須
                  </Badge>
                </FormLabel>
                <FormControl>
                  <TiptapEditor
                    :model-value="componentField.modelValue"
                    @update:model-value="(e: Event) => componentField.onChange(e)"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="projectType">
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
                    class="grid md:grid-cols-3 gap-2 md:gap-4 [&_svg]:fill-purple"
                  >
                    <Card
                      v-for="projectType in projectTypes"
                      :key="projectType.value"
                      class="flex items-center space-x-2 border rounded-sm cursor-pointer hover:bg-purple/20 transition-colors shadow-none"
                      @click="componentField.onChange(projectType.value)"
                      :class="{
                        'border-purple border-1 bg-purple/20':
                          componentField.modelValue === projectType.value,
                      }"
                    >
                      <CardContent
                        class="w-full flex flex-row items-center space-x-2"
                      >
                        <RadioGroupItem
                          :id="projectType.value"
                          :value="projectType.value"
                          class="border-purple"
                        />
                        <Icon
                          :name="projectType.icon"
                          class="!size-5 text-primary"
                        />
                        <Label
                          :for="projectType.value"
                          class="w-full cursor-pointer"
                        >
                          {{ projectType.label }}
                        </Label>
                      </CardContent>
                    </Card>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="deadline">
              <FormItem>
                <FormLabel>
                  プロジェクトの期限
                  <Badge
                    variant="gradient"
                    class="text-xs text-white rounded-sm"
                  >
                    必須
                  </Badge>
                </FormLabel>
                <FormControl>
                  <div class="relative">
                    <Input
                      type="text"
                      placeholder="YYYY/MM/DD"
                      v-bind="componentField"
                      v-model="dateValue"
                      maxlength="10"
                    />
                    <Popover>
                      <PopoverTrigger as-child>
                        <Button
                          variant="ghost"
                          size="icon"
                          class="absolute right-2 top-1/2 -translate-y-1/2 size-6 cursor-pointer"
                        >
                          <CalendarIcon class="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent class="w-auto p-0" align="end">
                        <Calendar
                          v-model="selectedDateValue"
                          @update:model-value="formatDate(selectedDateValue!)"
                          initial-focus
                          :locale="'ja-JP'"
                          :min-value="today(getLocalTimeZone())"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </FormControl>
                <FormDescription>
                  日付はYYYY/MM/DD形式で入力してください（例: 2025/04/30）
                </FormDescription>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="resourceUrl">
              <FormItem>
                <FormLabel>
                  フィードバック対象のファイルやリンク
                  <Badge
                    variant="gradient"
                    class="text-xs text-white rounded-sm"
                  >
                    必須
                  </Badge>
                </FormLabel>
                <FormControl>
                  <Input
                    type="url"
                    placeholder="https://example.com"
                    v-bind="componentField"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
          </div>

          <div v-if="stepIndex === 4" class="flex flex-col gap-8 h-full"></div>

          <!-- bottom -->
          <div class="flex flex-col gap-4">
            <Separator />

            <div class="flex items-center justify-end gap-4">
              <Button
                :disabled="stepIndex === 1"
                variant="outline"
                size="sm"
                @click="stepIndex--"
                class="cursor-pointer"
              >
                <Icon
                  name="mdi:chevron-left"
                  class="!size-4 text-muted-foreground"
                />
                もどる
              </Button>
              <div class="flex items-center gap-3">
                <Button
                  v-if="stepIndex !== 4"
                  :type="meta.valid ? 'button' : 'submit'"
                  size="sm"
                  :variant="'mainOutline'"
                  @click="meta.valid && stepIndex++"
                  class="cursor-pointer"
                >
                  次へ
                  <Icon name="mdi:chevron-right" class="!size-4 text-purple" />
                </Button>
                <Button
                  v-if="stepIndex === 4"
                  size="sm"
                  type="submit"
                  class="cursor-pointer min-w-[120px]"
                  variant="main"
                  :disabled="!meta.valid || isSubmitting"
                >
                  {{ isSubmitting ? "作成中..." : "作成する" }}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </section>
  </div>
</template>
