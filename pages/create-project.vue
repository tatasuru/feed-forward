<script setup lang="ts">
import { cn } from "@/lib/utils";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import {
  CalendarDate,
  DateFormatter,
  getLocalTimeZone,
  parseDate,
  today,
} from "@internationalized/date";
import { CalendarIcon } from "lucide-vue-next";
import * as z from "zod";
import { toDate } from "reka-ui/date";

definePageMeta({
  middleware: "auth",
});

// 日本時間に合わせる
const df = new DateFormatter("ja-JP", {
  timeZone: "Asia/Tokyo",
  dateStyle: "long",
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

const value = computed({
  get: () =>
    form.values.projectDueDate
      ? parseDate(form.values.projectDueDate)
      : undefined,
  set: (val) => val,
});

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
      .string()
      .refine((v) => v, { message: "A date of birth is required." }),
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
                <FormLabel>プロジェクトの締切日</FormLabel>
                <Popover>
                  <PopoverTrigger as-child>
                    <FormControl>
                      <Button
                        variant="outline"
                        :class="
                          cn(
                            'w-[240px] ps-3 text-start font-normal cursor-pointer',
                            !value && 'text-muted-foreground'
                          )
                        "
                      >
                        <span>
                          {{ value ? df.format(toDate(value)) : "Pick a date" }}
                        </span>
                        <CalendarIcon class="ms-auto h-4 w-4 opacity-50" />
                      </Button>
                      <input hidden />
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent class="w-auto p-0">
                    <Calendar
                      v-model="value"
                      calendar-label="Date of birth"
                      initial-focus
                      :min-value="new CalendarDate(1900, 1, 1)"
                      :max-value="today(getLocalTimeZone())"
                      @update:model-value="
                        (v:any) => {
                          if (v) {
                            form.setFieldValue('projectDueDate', v.toString());
                          } else {
                            form.setFieldValue('projectDueDate', undefined);
                          }
                        }
                      "
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            </FormField>
          </form>
        </CardContent>
      </Card>
    </section>
  </div>
</template>
