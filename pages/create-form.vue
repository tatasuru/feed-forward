<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import { Check, Circle, Dot } from "lucide-vue-next";
import { h, ref } from "vue";
import * as z from "zod";
import { toast } from "vue-sonner";

/********************************
 * for form
 ********************************/
const formSchema = [
  z.object({
    template: z.enum(["starFeedback"], {
      errorMap: () => ({ message: "テンプレートの選択は必須です" }),
    }),
  }),
  z
    .object({
      password: z.string().min(2).max(50),
      confirmPassword: z.string(),
    })
    .refine(
      (values) => {
        return values.password === values.confirmPassword;
      },
      {
        message: "Passwords must match!",
        path: ["confirmPassword"],
      }
    ),
  z.object({
    favoriteDrink: z.union([
      z.literal("coffee"),
      z.literal("tea"),
      z.literal("soda"),
    ]),
  }),
];

function onSubmit(values: any) {
  toast({
    title: "You submitted the following values:",
    description: h(
      "pre",
      { class: "mt-2 w-[340px] rounded-md bg-slate-950 p-4" },
      h("code", { class: "text-white" }, JSON.stringify(values, null, 2))
    ),
  });
}

/********************************
 * for stepper
 ********************************/
const stepIndex = ref(1);
const steps = [
  {
    step: 1,
    title: "テンプレートを選択",
    description: "テンプレートを選択してください。",
  },
  {
    step: 2,
    title: "フォーム概要入力",
    description: "詳細情報を入力してください。",
  },
  {
    step: 3,
    title: "フォーム編集",
    description: "項目を編集してください。",
  },
];
/********************************
 * for forms preview
 ********************************/
const templates = [
  {
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
  <div id="create-project" class="grid w-full gap-8" ref="formRef">
    <!-- <PageTitle
      title="新規フォーム作成"
      description="フィードバックを受け取るためのフォームを作成します。"
      size="large"
    /> -->

    <Form
      v-slot="{ meta, values, validate }"
      as=""
      keep-values
      :validation-schema="toTypedSchema(formSchema[stepIndex - 1])"
    >
      <Stepper
        orientation="vertical"
        v-slot="{ isNextDisabled, isPrevDisabled, nextStep, prevStep }"
        v-model="stepIndex"
      >
        <form
          @submit="
            (e) => {
              e.preventDefault();
              validate();

              if (stepIndex === steps.length && meta.valid) {
                onSubmit(values);
              }
            }
          "
          class="flex w-full flex-col justify-start gap-6 min-h-[calc(100vh-210px)]"
        >
          <!-- stepper -->
          <div class="flex w-full items-center gap-4 sticky top-[100px] z-10">
            <StepperItem
              v-for="step in steps"
              :key="step.step"
              v-slot="{ state }"
              class="relative flex w-fit items-center justify-start gap-4"
              :step="step.step"
            >
              <StepperTrigger as-child>
                <Button
                  :variant="
                    state === 'completed' || state === 'active'
                      ? 'main'
                      : 'outline'
                  "
                  class="shrink-0 px-4 py-2 h-auto min-w-[280px] cursor-pointer flex flex-row gap-2 items-start"
                >
                  <div
                    class="border border-primary rounded-full w-5 h-5 flex items-center justify-center shrink-0 text-[10px]"
                    :class="{
                      'border-white':
                        state === 'active' || state === 'completed',
                    }"
                  >
                    {{ step.step }}
                  </div>
                  <div class="flex flex-col gap-1 items-start w-full">
                    <StepperTitle
                      :class="[state === 'active' && 'text-white']"
                      class="text-sm font-bold transition"
                    >
                      {{ step.title }}
                    </StepperTitle>
                    <StepperDescription
                      :class="[
                        (state === 'active' || 'completed') && 'text-white',
                        state === 'inactive' && 'text-muted-foreground',
                      ]"
                      class="sr-only text-xs transition md:not-sr-only font-normal"
                    >
                      {{ step.description }}
                    </StepperDescription>
                  </div>
                </Button>
              </StepperTrigger>

              <Icon v-if="step.step !== 3" name="mdi:chevron-right" />
            </StepperItem>
          </div>

          <Separator orientation="horizontal" class="w-full" />

          <!-- form fields -->
          <div
            class="flex flex-col w-full justify-between min-h-[calc(100vh-250px)]"
          >
            <div class="flex flex-col gap-4">
              <template v-if="stepIndex === 1">
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
                                    <div
                                      class="flex items-center justify-between"
                                    >
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
                                            hoverStarIndexObj[criteriaIndex] =
                                              index
                                          "
                                        >
                                          <Icon
                                            v-if="
                                              hoverStarIndexObj[
                                                criteriaIndex
                                              ] >= index
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
                                      <span
                                        class="text-sm text-muted-foreground"
                                      >
                                        {{
                                          hoverStarIndexObj[criteriaIndex] < 0
                                            ? 0
                                            : hoverStarIndexObj[criteriaIndex] +
                                              1
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
                                    <div
                                      class="flex items-center justify-between"
                                    >
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
              </template>

              <template v-if="stepIndex === 2">
                <FormField v-slot="{ componentField }" name="password">
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" v-bind="componentField" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>

                <FormField v-slot="{ componentField }" name="confirmPassword">
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" v-bind="componentField" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>
              </template>

              <template v-if="stepIndex === 3">
                <FormField v-slot="{ componentField }" name="favoriteDrink">
                  <FormItem>
                    <FormLabel>Drink</FormLabel>

                    <Select v-bind="componentField">
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a drink" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="coffee"> Coffe </SelectItem>
                          <SelectItem value="tea"> Tea </SelectItem>
                          <SelectItem value="soda"> Soda </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                </FormField>
              </template>
            </div>

            <div class="flex items-center justify-between mt-4">
              <Button
                :disabled="isPrevDisabled"
                variant="outline"
                size="sm"
                @click="prevStep()"
                class="cursor-pointer"
              >
                もどる
              </Button>
              <div class="flex items-center gap-3">
                <Button
                  v-if="stepIndex !== 3"
                  :type="meta.valid ? 'button' : 'submit'"
                  :disabled="isNextDisabled"
                  size="sm"
                  variant="main"
                  @click="meta.valid && nextStep()"
                  class="cursor-pointer"
                >
                  つぎへすすむ
                </Button>
                <Button
                  v-if="stepIndex === 3"
                  size="sm"
                  type="submit"
                  variant="main"
                  class="cursor-pointer"
                >
                  フォームを作成
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Stepper>
    </Form>
  </div>
</template>
