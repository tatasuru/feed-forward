<script setup lang="ts">
import { cn } from "@/lib/utils";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { parseDate } from "@internationalized/date";

import * as z from "zod";

definePageMeta({
  middleware: "auth",
});

const projectTypes = [
  {
    icon: "mdi:picture-in-picture-top-right",
    value: "design",
    label: "デザイン",
  },
  {
    icon: "mdi:code-tags",
    value: "code",
    label: "コーディング",
  },
  {
    icon: "mdi:clipboard-text",
    value: "plan",
    label: "プランニング",
  },
];

const dateValue = ref<string>("");

const dateFormatToYYYYMMDD = (e: Event) => {
  const input = e.target as HTMLInputElement;
  let value = input.value.replace(/[^0-9/]/g, "");

  if (value.length === 4 && !value.includes("/")) {
    dateValue.value = value + "/";
  } else if (
    value.length === 7 &&
    value.charAt(4) === "/" &&
    !value.includes("/", 5)
  ) {
    dateValue.value = value + "/";
  }

  // 最大10文字（YYYY/MM/DD）まで
  if (value.length > 10) {
    input.value = value.slice(0, 10);
  }
};

/********************************
 * Form setup
 ********************************/
const formSchema = toTypedSchema(
  z.object({
    projectName: z
      .string({
        message: "プロジェクト名は必須です",
      })
      .min(2)
      .max(50),
    projectDescription: z
      .string({
        message: "プロジェクトの説明は必須です",
      })
      .min(10)
      .max(500),
    projectType: z.enum(["design", "code", "plan"], {
      errorMap: () => ({ message: "プロジェクトの種類は必須です" }),
    }),
    projectDueDate: z
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
          return inputDate > today;
        },
        {
          message: "期限は未来の日付である必要があります",
        }
      ),
  })
);

const form = useForm({
  validationSchema: formSchema,
});

const onSubmit = form.handleSubmit((values) => {
  console.log("Form submitted!", values);
});
</script>

<template>
  <div id="create-project" class="grid w-full gap-8">
    <PageTitle
      title="新規プロジェクト作成"
      description="フィードバックを受け取りたいプロジェクトの詳細を入力してください"
    />

    <!-- section -->
    <section id="create-project-form">
      <!-- info -->
      <Card>
        <CardHeader>
          <PageTitle
            title="基本情報"
            description="プロジェクトの基本情報を入力してください"
            size="small"
          />
        </CardHeader>
        <CardContent>
          <form @submit="onSubmit" class="flex flex-col gap-8">
            <FormField v-slot="{ componentField }" name="projectName">
              <FormItem>
                <FormLabel>プロジェクト名</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="shadcn"
                    v-bind="componentField"
                  />
                </FormControl>
                <FormDescription>プロジェクト名は必須です。</FormDescription>
                <FormMessage />
              </FormItem>
            </FormField>
            <FormField v-slot="{ componentField }" name="projectDescription">
              <FormItem>
                <FormLabel>プロジェクトの説明</FormLabel>
                <FormControl>
                  <Textarea placeholder="shadcn" v-bind="componentField" />
                </FormControl>
                <FormDescription
                  >プロジェクトの説明は必須です。</FormDescription
                >
                <FormMessage />
              </FormItem>
            </FormField>
            <FormField v-slot="{ componentField }" name="projectType">
              <FormItem>
                <FormLabel>プロジェクトの種類</FormLabel>
                <FormControl>
                  <RadioGroup
                    v-bind="componentField"
                    :orientation="'vertical'"
                    class="grid grid-cols-3 gap-4 [&_svg]:fill-purple"
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
                          :class="{
                            'border-purple':
                              componentField.modelValue === projectType.value,
                          }"
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
            <FormField v-slot="{ componentField }" name="projectDueDate">
              <FormItem>
                <FormLabel>プロジェクトの期限</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="YYYY/MM/DD"
                    v-bind="componentField"
                    v-model="dateValue"
                    @input="(e: Event) => dateFormatToYYYYMMDD(e)"
                    maxlength="10"
                  />
                </FormControl>
                <FormDescription>
                  日付はYYYY/MM/DD形式で入力してください（例: 2025/04/30）
                </FormDescription>
                <FormMessage />
              </FormItem>
            </FormField>
          </form>
        </CardContent>
      </Card>
    </section>
  </div>
</template>
