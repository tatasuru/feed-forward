<script setup lang="ts">
import { cn } from "@/lib/utils";
import { useForm } from "vee-validate";
import { formSchema } from "@/utils/form-schema/create-project";
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
  title: "プロジェクト編集",
  description:
    "Feed Forwardのプロジェクト編集ページです。プロジェクトの詳細を編集できます。",
  ogTitle: "Feed Forward プロジェクト編集",
  ogDescription:
    "Feed Forwardのプロジェクト編集ページです。プロジェクトの詳細を編集できます。",
  ogImage: "/logo.png",
  twitterCard: "summary_large_image",
});

const supabase = useSupabaseClient();
const user = useSupabaseUser();
const route = useRoute();
const project = ref<ProjectData>();
const publishStatus = ref<boolean>(false);
const isSubmitting = ref<boolean>(false);

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
  return criteriaTemplates.value as CriteriaTemplate[];
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
const status = ref<ProjectData["status"]>("active");
const formRef = ref<HTMLElement | null>(null);

/********************************
 * Lifecycle hooks
 ********************************/
const { data: criteriaTemplates } = useAsyncData(
  "criteriaTemplates",
  async () => {
    try {
      const { data, error } = await supabase.rpc("get_criteria_templates", {
        p_evaluation_type: "",
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error fetching criteria templates:", error);
      return [];
    }
  }
);

// for form initialization by using existing project data
onMounted(async () => {
  await nextTick();
  await getProjectData();

  // Set the initial date value
  publishStatus.value = project.value?.status === "active" ? true : false;
});

/********************************
 * Form setup
 ********************************/
const form = useForm({
  validationSchema: formSchema,
});

const onSubmit = async (event: Event) => {
  event.preventDefault();

  isSubmitting.value = true;

  // Check if the form is valid
  const userId = user.value?.id;

  if (!userId) {
    return;
  }

  if (!publishStatus.value) {
    handleSubmit(userId);
  } else {
    const { valid, errors } = await form.validate();

    if (!valid) {
      isSubmitting.value = false;
      toast.error("入力項目に誤りがあります", {
        description: "入力項目を確認してください",
      });
      // Check if the form has errors
      if (Object.keys(errors).length > 0) {
        await nextTick();

        formRef.value?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
      return;
    }

    handleSubmit(userId);
  }
};

async function handleSubmit(userId: string) {
  const formValues = form.values;
  const formattedDeadline = formValues.deadline
    ? (() => {
        const [year, month, day] = formValues.deadline.split("/").map(Number);
        const date = new Date(Date.UTC(year, month - 1, day, 3, 0, 0));

        return date.toISOString();
      })()
    : null;

  const projectData: ProjectData = {
    user_id: userId,
    title: formValues.title ? formValues.title : "",
    description: formValues.description ? formValues.description : "",
    project_type: formValues.projectType ? formValues.projectType : null,
    deadline: formattedDeadline,
    resource_url: formValues.resourceUrl ? formValues.resourceUrl : null,
    evaluation_type: formValues.evaluationType
      ? formValues.evaluationType
      : null,
    visibility_type: formValues.visibilityType
      ? formValues.visibilityType
      : null,
    email_notifications: formValues.emailNotifications
      ? formValues.emailNotifications
      : false,
    app_notifications: formValues.appNotifications
      ? formValues.appNotifications
      : false,
    status: publishStatus.value ? "active" : "draft",
  };

  try {
    await updateProject(route.params.id as string, projectData);

    toast.success("プロジェクトが更新されました", {
      description: "プロジェクト詳細ページに移動します",
    });

    setTimeout(() => {
      navigateTo(`/my-projects/${route.params.id}/details`);

      form.resetForm();
      isSubmitting.value = false;
    }, 2000);
  } catch (error) {
    toast.error("プロジェクトの更新に失敗しました", {
      description: "もう一度お試しください",
    });
    isSubmitting.value = false;
  }
}

/********************************
 * HELPER FUNCTIONS
 ********************************/
function selectCriteriaTemplate() {
  const selectedTemplate = evaluationTypes.value.find(
    (template) => template.evaluation_type === form.values.evaluationType
  );

  if (selectedTemplate) {
    criteriaTemplate.value = selectedTemplate.criteria;
  } else {
    criteriaTemplate.value = [];
  }
}

function formatDate(newDate: DateValue) {
  const localTimeZone = getLocalTimeZone();
  const date = newDate.toDate(localTimeZone);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // 月は0始まり
  const day = String(date.getDate()).padStart(2, "0");

  // Set the formatted date to the input field
  dateValue.value = `${year}/${month}/${day}`;
  form.setFieldValue("deadline", dateValue.value);
}

async function getProjectData() {
  const { data, error } = await supabase.rpc("get_project_with_feedback", {
    p_project_id: route.params.id,
  });

  if (error) {
    console.error("Error fetching project data:", error);
    return;
  }

  project.value = data.project;
  criteriaTemplate.value = data.criteria_templates[0]
    ? data.criteria_templates[0].criteria
    : null;

  // init form values
  if (project.value) {
    const formattedDate = project.value?.deadline
      ? new Date(project.value.deadline)
          .toISOString()
          .split("T")[0]
          .replace(/-/g, "/")
      : "";

    dateValue.value = formattedDate;

    form.setValues({
      title: project.value.title,
      description: project.value.description,
      projectType: project.value.project_type
        ? project.value.project_type
        : undefined,
      deadline: formattedDate,
      resourceUrl: project.value.resource_url
        ? project.value.resource_url
        : undefined,
      evaluationType: project.value.evaluation_type
        ? project.value.evaluation_type
        : undefined,
      visibilityType: project.value.visibility_type
        ? project.value.visibility_type
        : undefined,
      emailNotifications: project.value.email_notifications,
      appNotifications: project.value.app_notifications,
    });
  } else {
    console.error("Project not found");
  }
}

async function updateProject(projectId: string, projectData: ProjectData) {
  try {
    const { data, error } = await supabase.rpc("update_project_from_form", {
      p_project_id: projectId,
      form_data: projectData,
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error updating project:", error);
    throw error;
  }
}
</script>

<template>
  <div id="create-project" class="grid w-full gap-8" ref="formRef">
    <PageTitle
      title="プロジェクト編集"
      description="フィードバックプロジェクトを編集"
      size="large"
    />

    <!-- section -->
    <section id="create-project-form">
      <form @submit="onSubmit" class="grid gap-8">
        <!-- info for evaluation -->
        <Card>
          <CardHeader>
            <PageTitle
              title="基本情報"
              description="プロジェクトの基本情報を入力してください"
              size="small"
            />
          </CardHeader>
          <CardContent class="flex flex-col gap-8">
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
                  <Textarea
                    placeholder="デザインやデモ、企画の詳細をわかりやすく記載"
                    v-bind="componentField"
                    :rows="4"
                    class="resize-none h-[200px]"
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
          </CardContent>
        </Card>

        <!-- file or link for evaluation -->
        <Card>
          <CardHeader>
            <PageTitle
              title="フィードバック対象のファイルやリンク"
              description="フィードバックを受け取りたいファイルやリンクをアップロードしてください"
              size="small"
            />
          </CardHeader>
          <CardContent class="flex flex-col gap-8">
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
          </CardContent>
        </Card>

        <!-- evaluation items -->
        <Card>
          <CardHeader>
            <PageTitle
              title="評価項目設定"
              description="フィードバックで評価してほしい項目を設定してください"
              size="small"
            />
          </CardHeader>
          <CardContent class="flex flex-col gap-8">
            <FormField v-slot="{ componentField }" name="evaluationType">
              <FormItem>
                <FormLabel>
                  テンプレート選択
                  <Badge
                    variant="gradient"
                    class="text-xs text-white rounded-sm"
                  >
                    必須
                  </Badge>
                </FormLabel>
                <Select v-bind="componentField">
                  <FormControl>
                    <SelectTrigger class="w-full cursor-pointer">
                      <SelectValue placeholder="評価項目テンプレートを選択" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem
                        v-for="evaluationType in evaluationTypes"
                        :key="evaluationType.name"
                        :value="evaluationType.evaluation_type"
                        :disabled="
                          evaluationType.evaluation_type === 'customEvaluation'
                        "
                        @vue:updated="selectCriteriaTemplate"
                      >
                        {{ evaluationType.name }}
                        {{
                          evaluationType.evaluation_type === "customEvaluation"
                            ? "(有料版のみ)"
                            : ""
                        }}
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormDescription class="flex items-center">
                  項目はそれぞれ5段階で評価されます。(星1つ〜星5つ)
                </FormDescription>
                <FormMessage />
              </FormItem>
            </FormField>

            <!-- TODO: display when selector selected -->
            <div
              v-if="
                form.values.evaluationType &&
                form.values.evaluationType !== 'customEvaluation'
              "
              class="flex flex-col gap-4"
            >
              <div class="flex flex-col gap-2">
                <Label>評価項目</Label>
                <div class="flex flex-col gap-3">
                  <Card
                    v-for="(criteria, index) in criteriaTemplate"
                    class="rounded-sm"
                    :class="{
                      [bgColorPalette[index]]: criteriaTemplate.length > 0,
                      [borderColorPalette[index]]: criteriaTemplate.length > 0,
                    }"
                  >
                    <CardContent class="flex flex-col gap-8">
                      <div class="flex flex-col gap-2">
                        <Label> 項目{{ index + 1 }} </Label>
                        <Input
                          type="url"
                          :placeholder="criteria.name"
                          v-model="criteria.name"
                          :class="{
                            [borderColorPalette[index]]:
                              criteriaTemplate.length > 0,
                          }"
                          :default-value="criteria.name"
                          disabled
                        />
                      </div>

                      <div class="flex flex-col gap-2">
                        <Label> 項目{{ index + 1 }}の説明 </Label>
                        <Input
                          :placeholder="criteria.description"
                          v-model="criteria.description"
                          :class="{
                            [borderColorPalette[index]]:
                              criteriaTemplate.length > 0,
                          }"
                          :default-value="criteria.description"
                          disabled
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
              <!-- TODO: For paid version -->

              <Button
                variant="outline"
                class="w-full text-sm text-primary cursor-pointer"
                disabled
              >
                <Icon name="mdi:plus" class="!size-4" />
                評価項目を追加 (有料版のみ)
              </Button>
            </div>
          </CardContent>
        </Card>

        <!-- publish settings -->
        <Card>
          <CardHeader>
            <PageTitle
              title="公開設定"
              description="プロジェクトの公開範囲と通知設定"
              size="small"
            />
          </CardHeader>
          <CardContent class="flex flex-col gap-8">
            <FormField v-slot="{ componentField }" name="visibilityType">
              <FormItem>
                <FormLabel>
                  公開範囲
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
                    class="grid gap-2 [&_svg]:fill-purple"
                  >
                    <Card
                      v-for="visibilityType in visibilityTypes"
                      :key="visibilityType.value"
                      class="flex items-center space-x-2 border rounded-sm cursor-pointer hover:bg-purple/20 transition-colors shadow-none"
                      @click="componentField.onChange(visibilityType.value)"
                      :class="{
                        'border-purple border-1 bg-purple/20':
                          componentField.modelValue === visibilityType.value,
                        'pointer-events-none bg-accent-foreground/10':
                          visibilityType.value !== 'public',
                      }"
                    >
                      <CardContent
                        class="w-full flex flex-row items-center space-x-2"
                      >
                        <RadioGroupItem
                          :id="visibilityType.value"
                          :value="visibilityType.value"
                          class="border-purple"
                        />
                        <Icon
                          :name="visibilityType.icon"
                          class="!size-5 text-primary"
                          :class="{
                            '!text-muted-foreground':
                              visibilityType.value !== 'public',
                          }"
                        />
                        <Label
                          :for="visibilityType.value"
                          class="w-full cursor-pointer"
                          :class="{
                            'text-muted-foreground':
                              visibilityType.value !== 'public',
                          }"
                        >
                          {{ visibilityType.label }}
                        </Label>
                      </CardContent>
                    </Card>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <div class="flex flex-col gap-2">
              <Label> 通知設定 </Label>
              <Card class="shadow-none rounded-sm">
                <CardContent class="flex flex-col gap-8">
                  <FormField
                    v-slot="{ value, handleChange }"
                    name="emailNotifications"
                  >
                    <FormItem class="flex items-center justify-between">
                      <FormLabel class="text-sm text-muted-foreground"
                        >メールで通知を受け取る (有料版のみ)</FormLabel
                      >
                      <FormControl>
                        <Switch
                          disabled
                          :model-value="value"
                          @update:model-value="handleChange"
                          class="cursor-pointer data-[state=checked]:bg-purple"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  </FormField>
                  <FormField
                    v-slot="{ value, handleChange }"
                    name="appNotifications"
                  >
                    <FormItem class="flex items-center justify-between">
                      <FormLabel>アプリ内で通知を受け取る</FormLabel>
                      <FormControl>
                        <Switch
                          :model-value="value"
                          @update:model-value="handleChange"
                          class="cursor-pointer data-[state=checked]:bg-purple"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  </FormField>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <!-- buttons -->
        <div
          class="flex flex-col-reverse md:flex-row items-center justify-between gap-2"
        >
          <!-- cancel -->
          <Button
            variant="outline"
            type="button"
            class="text-sm text-destructive cursor-pointer w-full md:w-auto border-destructive hover:bg-destructive/10 hover:text-destructive dark:border-destructive dark:hover:bg-destructive/10 dark:hover:text-destructive"
            @click="$router.back()"
          >
            <Icon name="mdi:close" class="!size-4" />
            キャンセル
          </Button>

          <div
            class="flex flex-col md:flex-row gap-2 md:gap-4 w-full md:w-auto"
          >
            <div
              class="flex items-center space-x-2 justify-end md:justify-start"
            >
              <Switch
                id="publish-status"
                :model-value="publishStatus"
                @update:model-value="publishStatus = $event"
                class="cursor-pointer data-[state=checked]:bg-purple"
              />
              <Label for="publish-status" class="cursor-pointer">
                公開する
              </Label>
            </div>
            <!-- save as draft -->
            <Button
              v-if="!publishStatus"
              variant="outline"
              type="submit"
              class="text-sm text-primary cursor-pointer w-full md:w-auto"
              :disabled="isSubmitting"
            >
              <Icon name="mdi:content-save" class="!size-4" />
              下書きとして保存
            </Button>

            <!-- create project -->
            <Button
              v-else
              type="submit"
              variant="main"
              class="text-sm text-white cursor-pointer w-full md:w-auto"
              :disabled="isSubmitting"
            >
              <Icon name="mdi:plus" class="!size-4" />
              {{
                isSubmitting ? "プロジェクトを更新中..." : "プロジェクトを更新"
              }}
            </Button>
          </div>
        </div>
      </form>
    </section>
  </div>
</template>
