<script setup lang="ts">
import { useForm } from "vee-validate";
import { formSchema } from "@/utils/form-schema/create-project";
import type { ProjectData } from "@/types/create-project.types";

definePageMeta({
  middleware: "auth",
});

const supabase = useSupabaseClient();
const user = useSupabaseUser();

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
    label: "限定公開（リンクを知っている人のみ閲覧・フィードバック可能）",
  },
  {
    icon: "mdi:lock",
    value: "private",
    label: "プライベート（招待した人のみ閲覧・フィードバック可能）",
  },
];
const evaluationTypes = [
  {
    value: "uiDesignEvaluation",
    label: "UIデザイン評価",
  },
  {
    value: "uxDesignEvaluation",
    label: "UXデザイン評価",
  },
  {
    value: "demoEvaluation",
    label: "デモ評価",
  },
  {
    value: "planEvaluation",
    label: "企画評価",
  },
  {
    value: "customEvaluation",
    label: "カスタム評価",
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
const form = useForm({
  validationSchema: formSchema,
});

const onSubmit = form.handleSubmit((values) => {
  const userId = user.value?.id;

  if (!userId) {
    console.error("User not found");
    return;
  }

  const formattedDeadline = values.deadline
    ? new Date(values.deadline).toISOString()
    : null;

  const projectData: ProjectData = {
    user_id: userId,
    title: values.title,
    description: values.description,
    project_type: values.projectType,
    deadline: formattedDeadline,
    resource_url: values.resourceUrl,
    evaluation_type: values.evaluationType,
    visibility_type: values.visibilityType,
    email_notifications: values.emailNotifications
      ? values.emailNotifications
      : false,
    app_notifications: values.appNotifications
      ? values.appNotifications
      : false,
    status: "active",
  };

  try {
    createProject(projectData);
    form.resetForm();
  } catch (error) {
    console.error("Error creating project:", error);
  }
  console.log("Project data:", projectData);
});

async function createProject(projectData: ProjectData) {
  try {
    const { data, error } = await supabase.rpc("create_project_from_form", {
      form_data: projectData,
    });

    if (error) {
      throw error;
    }

    console.log("Project created successfully:", data);
  } catch (error) {
    console.error("Error creating project:", error);
  }
}
</script>

<template>
  <div id="create-project" class="grid w-full gap-8">
    <PageTitle
      title="新規プロジェクト作成"
      description="フィードバックを受け取りたいプロジェクトの詳細を入力してください"
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
                        :key="evaluationType.value"
                        :value="evaluationType.value"
                        :disabled="evaluationType.value === 'customEvaluation'"
                      >
                        {{ evaluationType.label }}
                        {{
                          evaluationType.value === "customEvaluation"
                            ? "(有料版のみ)"
                            : ""
                        }}
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            </FormField>

            <!-- TODO: display when selector selected -->
            <!-- <div class="flex flex-col gap-4">
              <div class="flex flex-col gap-2">
                <Label>評価項目</Label>
                <div class="flex flex-col gap-3">
                  <Card class="bg-blue/10 border-blue rounded-sm">
                    <CardContent class="flex flex-col gap-8">
                      <FormField
                        v-slot="{ componentField }"
                        name="materialLink"
                      >
                        <FormItem>
                          <FormLabel> 項目名1 </FormLabel>
                          <FormControl>
                            <Input
                              type="url"
                              placeholder="操作のしやすさ"
                              v-bind="componentField"
                              class="border-blue/50"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      </FormField>
                      <FormField
                        v-slot="{ componentField }"
                        name="materialLink"
                      >
                        <FormItem>
                          <FormLabel> 説明（任意） </FormLabel>
                          <FormControl>
                            <Input
                              type="url"
                              placeholder="https://example.com"
                              v-bind="componentField"
                              class="border-blue/50"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      </FormField>
                    </CardContent>
                  </Card>
                  <Card class="bg-pink/10 border-pink rounded-sm">
                    <CardContent class="flex flex-col gap-8">
                      <FormField
                        v-slot="{ componentField }"
                        name="materialLink"
                      >
                        <FormItem>
                          <FormLabel> 項目名2 </FormLabel>
                          <FormControl>
                            <Input
                              type="url"
                              placeholder="操作のしやすさ"
                              v-bind="componentField"
                              class="border-pink/50"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      </FormField>
                      <FormField
                        v-slot="{ componentField }"
                        name="materialLink"
                      >
                        <FormItem>
                          <FormLabel> 説明（任意） </FormLabel>
                          <FormControl>
                            <Input
                              type="url"
                              placeholder="https://example.com"
                              v-bind="componentField"
                              class="border-pink/50"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      </FormField>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Button
                variant="outline"
                class="w-full text-sm text-primary cursor-pointer"
              >
                <Icon name="mdi:plus" class="!size-4" />
                評価項目を追加
              </Button>
            </div> -->
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
                        />
                        <Label
                          :for="visibilityType.value"
                          class="w-full cursor-pointer"
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
                      <FormLabel>メールで通知を受け取る</FormLabel>
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
          class="flex flex-col md:flex-row items-center justify-between gap-2"
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
            <!-- save as draft -->
            <Button
              variant="outline"
              type="button"
              class="text-sm text-primary cursor-pointer w-full md:w-auto"
            >
              <Icon name="mdi:content-save" class="!size-4" />
              下書きとして保存
            </Button>

            <!-- create project -->
            <Button
              type="submit"
              variant="main"
              class="text-sm text-white cursor-pointer w-full md:w-auto"
            >
              <Icon name="mdi:plus" class="!size-4" />
              プロジェクトを作成
            </Button>
          </div>
        </div>
      </form>
    </section>
  </div>
</template>
