<script setup lang="ts">
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";

const formSchema = [
  z.object({
    formName: z.string(),
    formDescription: z.string(),
  }),
  z.object({
    password: z.string().min(2).max(50),
    confirmPassword: z.string(),
  }),
];

const stepIndex = ref(1);
const steps = [
  {
    step: 1,
    title: "1. フォームの名前と説明",
    description: "このフォームの名前と説明を入力してください。",
  },
  {
    step: 2,
    title: "2. フォーム編集",
    description: "フィードバック項目などを設定します。",
  },
];

function onSubmit(values: any) {
  console.log("Form submitted with values:", values);
  // Handle form submission logic here
}
</script>

<template>
  <div id="create-project" class="grid w-full h-full gap-8">
    <div class="flex flex-col gap-8">
      <Form
        v-slot="{ meta, values, validate }"
        as=""
        keep-values
        :validation-schema="toTypedSchema(formSchema[stepIndex - 1])"
      >
        <Stepper
          v-model="stepIndex"
          v-slot="{ isNextDisabled, isPrevDisabled, nextStep, prevStep }"
          orientation="horizontal"
          class="w-full h-full flex flex-col gap-8"
        >
          <div class="flex flex-col gap-4">
            <div class="flex items-center gap-4">
              <div
                v-for="step in steps"
                :key="step.step"
                class="flex items-center gap-4"
              >
                <StepperItem
                  v-slot="{ state }"
                  class="relative flex w-fit items-start gap-2"
                  :step="step.step"
                >
                  <StepperTrigger
                    :state="state"
                    class="flex flex-col items-start gap-1 cursor-pointer"
                  >
                    <StepperTitle
                      :class="[state === 'active' && '!text-purple']"
                      class="text-sm font-semibold transition whitespace-normal text-muted-foreground md:not-sr-only"
                    >
                      {{ step.title }}
                    </StepperTitle>
                    <StepperDescription
                      :class="[state === 'active' && '!text-purple']"
                      class="text-xs transition whitespace-normal text-muted-foreground md:not-sr-only"
                    >
                      {{ step.description }}
                    </StepperDescription>
                  </StepperTrigger>
                </StepperItem>

                <Icon
                  v-if="step.step !== steps[steps.length - 1].step"
                  name="mdi:arrow-right"
                  class="text-muted-foreground"
                />
              </div>
            </div>
            <Separator class="w-full h-px bg-border" orientation="horizontal" />
          </div>

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
            class="w-full h-full grid grid-rows-[1fr_auto] gap-8"
          >
            <div v-if="stepIndex === 1" class="flex flex-col gap-8">
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
                  <FormDescription>
                    フォームの名前を入力してください。
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
                  <FormDescription>
                    フォームの説明を入力してください。
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              </FormField>
            </div>

            <div v-if="stepIndex === 2" class="flex items-start gap-8">
              <div class="flex flex-col gap-6 min-w-[600px]">
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
                    <FormDescription>
                      フォームの名前を入力してください。
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                </FormField>
              </div>

              <Separator class="w-px h-full bg-border" orientation="vertical" />

              <div class="flex flex-col gap-6 border p-6 rounded-md w-full">
                <!-- rating -->
                <div>
                  <p class="text-sm font-medium">フィードバック項目</p>
                  <span class="text-xs text-muted-foreground">
                    フィードバックを収集するための項目を設定します。
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
                      >
                        <!-- <Icon name="mdi:star" class="!size-6 text-yellow-500" /> -->
                        <Icon
                          name="mdi:star-outline"
                          class="!size-6 text-muted-foreground hover:text-yellow-500"
                        />
                      </Button>
                    </div>
                    <span class="text-sm text-muted-foreground"> 0/5 </span>
                  </div>
                </div>

                <div>
                  <p class="text-sm font-medium">フィードバック項目</p>
                  <span class="text-xs text-muted-foreground">
                    フィードバックを収集するための項目を設定します。
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
                      >
                        <!-- <Icon name="mdi:star" class="!size-6 text-yellow-500" /> -->
                        <Icon
                          name="mdi:star-outline"
                          class="!size-6 text-muted-foreground hover:text-yellow-500"
                        />
                      </Button>
                    </div>
                    <span class="text-sm text-muted-foreground"> 0/5 </span>
                  </div>
                </div>

                <div>
                  <p class="text-sm font-medium">フィードバック項目</p>
                  <span class="text-xs text-muted-foreground">
                    フィードバックを収集するための項目を設定します。
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
                      >
                        <!-- <Icon name="mdi:star" class="!size-6 text-yellow-500" /> -->
                        <Icon
                          name="mdi:star-outline"
                          class="!size-6 text-muted-foreground hover:text-yellow-500"
                        />
                      </Button>
                    </div>
                    <span class="text-sm text-muted-foreground"> 0/5 </span>
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
                  次へ進む
                </Button>
                <Button
                  v-if="stepIndex === 3"
                  size="sm"
                  type="submit"
                  class="cursor-pointer"
                >
                  保存する
                </Button>
              </div>
            </div>
          </form>
        </Stepper>
      </Form>
    </div>
  </div>
</template>
