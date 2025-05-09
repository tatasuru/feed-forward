<script setup lang="ts">
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";

definePageMeta({
  middleware: "auth",
  layout: "custom",
  title: "セットアップ",
  description: "Feed Forwardのセットアップ",
  ogTitle: "Feed Forward セットアップ",
  ogDescription: "Feed Forwardのセットアップ",
  twitterCard: "summary_large_image",
});

type formValues = {
  displayName: string;
  avatarUrl: string;
  bio: string;
  website: string;
};

const supabase = useSupabaseClient();
const user = useSupabaseUser();
const isFirstLogin = ref<boolean>(false);
const profile = ref<any>(null);
const isSubmitting = ref<boolean>(false);
const store = useStore();
const { isMobile } = useDevice();

onMounted(async () => {
  await checkFirstLogin();

  if (isFirstLogin.value) {
    return;
  }
});

const stepIndex = ref<number>(1);
const steps = [
  {
    step: 1,
    title: "1. 表示名",
    description: "Feed Forwardで表示される名前を入力してください",
  },
  {
    step: 2,
    title: "2. プロフィール画像",
    description: "プロフィール画像をアップロードしてください",
  },
  {
    step: 3,
    title: "3. その他設定",
    description: "自己紹介やポートフォリオサイトのURLを入力してください",
  },
];

/********************************
 * Form setup
 ********************************/
// const form = useForm();

const formSchema = [
  z.object({
    displayName: z
      .string({
        required_error: "表示名は必須です",
        invalid_type_error: "表示名は文字列である必要があります",
      })
      .min(2, "表示名は2文字以上で入力してください")
      .max(50, "表示名は50文字以内で入力してください"),
  }),
  z.object({
    avatarUrl: z
      .string({
        invalid_type_error: "プロフィール画像は文字列である必要があります",
      })
      .url("URL形式で入力してください")
      .or(z.literal(""))
      .optional(),
  }),
  z.object({
    bio: z
      .string({
        invalid_type_error: "自己紹介は文字列である必要があります",
      })
      .max(200, "自己紹介は200文字以内で入力してください")
      .or(z.literal(""))
      .optional(),
    website: z
      .string({
        invalid_type_error: "ポートフォリオサイトは文字列である必要があります",
      })
      .url("URL形式で入力してください")
      .or(z.literal(""))
      .optional(),
  }),
];

function onSubmit(values: formValues) {
  try {
    isSubmitting.value = true;

    setTimeout(() => {
      registrationProfile(values);
    }, 1000);
  } catch (error) {
    console.error("Validation error:", error);
    isSubmitting.value = false;
    return;
  }
}

/********************************
 * Check first login
 ********************************/
async function checkFirstLogin() {
  const { data: userData, error } = await supabase.rpc("get_current_user");
  profile.value = userData;
  uploadedImageUrl.value = userData?.avatar_url;

  if (error) {
    console.error("ユーザー情報取得エラー:", error);
    return;
  }

  if (!userData?.display_name) {
    isFirstLogin.value = true;
    return;
  }

  isFirstLogin.value = false;
  return;
}

/********************************
 * FormField setup
 ********************************/
async function registrationProfile(values: formValues) {
  const { displayName, avatarUrl, bio, website } = values;
  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: displayName,
      avatar_url: uploadedImageUrl.value || avatarUrl,
      email: profile.value.email,
      bio: bio,
      website: website,
    })
    .eq("id", profile.value.id);

  store.profile = {
    ...store.profile,
    display_name: displayName,
    avatar_url: uploadedImageUrl.value || avatarUrl,
    bio: bio,
    website: website,
  };

  if (error) {
    console.error("プロフィール登録エラー:", error);
  } else {
    window.location.href = "/";
  }
}

/********************************
 * Image upload
 ********************************/
const {
  dropZoneRef,
  isOverDropZone,
  uploadedImageUrl,
  isUploading,
  handleMainImageUpload,
} = useImageUpload({
  bucket: "profile-images",
  folderPath: user.value?.id,
  allowedTypes: ["image/jpeg", "image/png"],
  maxSize: 2 * 1024 * 1024,
  onSuccess: (url: string) => {
    console.log("画像のアップロードに成功しました:", url);
  },
  onError: (err: Error) => {
    console.error("アップロードに失敗しました:", err);
  },
});
</script>

<template>
  <div
    class="flex items-center justify-center md:flex-row flex-col w-full h-svh"
  >
    <div
      class="md:w-1/2 w-full h-fit md:h-full backdrop-blur-md gradient-bg p-4 py-12 md:p-12"
    >
      <div class="flex items-center justify-center h-full">
        <Stepper
          v-model="stepIndex"
          orientation="vertical"
          class="mx-auto flex w-full max-w-md md:flex-col justify-start gap-20"
        >
          <template v-for="step in steps" :key="step.step">
            <StepperItem
              v-if="isMobile ? stepIndex === step.step : true"
              v-slot="{ state }"
              class="relative flex w-full items-start gap-6"
              :step="step.step"
            >
              <StepperSeparator
                v-if="step.step !== steps[steps.length - 1].step"
                class="absolute left-[23px] top-[100%] hidden md:block h-[167%] w-0.5 shrink-0 rounded-full bg-background/20 group-data-[state=completed]:bg-background"
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
                  class="z-10 rounded-full shrink-0 size-12"
                  :class="[
                    state === 'active' &&
                      'ring-2 ring-background ring-offset-2 ring-offset-purple bg-background hover:bg-background focus:bg-background',
                    state === 'completed' &&
                      'bg-background text-primary shadow-md shadow-primary/20 hover:bg-background focus-bg-background',
                  ]"
                  :disabled="state !== 'active'"
                >
                  <Icon
                    name="mdi:account"
                    v-if="step.step === 1"
                    class="!size-5 text-purple"
                  />
                  <Icon
                    name="mdi:file-image-box"
                    v-if="step.step === 2"
                    class="!size-5 text-purple"
                  />
                  <Icon
                    name="mdi:web-plus"
                    v-if="step.step === 3"
                    class="!size-5 text-purple"
                  />
                </Button>
              </StepperTrigger>

              <div class="flex flex-col gap-1">
                <StepperTitle
                  :class="[state === 'active' && 'text-primary']"
                  class="text-sm font-semibold transition lg:text-base text-white whitespace-normal"
                >
                  {{ step.title }}
                </StepperTitle>
                <StepperDescription
                  :class="[state === 'active' && 'text-primary']"
                  class="text-xs text-white transition md:not-sr-only lg:text-sm"
                >
                  {{ step.description }}
                </StepperDescription>
              </div>
            </StepperItem>
          </template>
        </Stepper>
      </div>
    </div>
    <div
      class="w-full md:w-1/2 flex flex-col items-center justify-center gap-4 p-4 pt-12 md:p-12 h-full relative"
    >
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
                onSubmit(values);
              }
            }
          "
          class="w-full h-full md:h-auto flex flex-col gap-5"
        >
          <div class="flex flex-col">
            <template v-if="stepIndex === 1">
              <FormField v-slot="{ componentField }" name="displayName">
                <FormItem>
                  <FormLabel>
                    表示名
                    <Badge class="gradient-bg-reverse">必須</Badge>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="たろうくん"
                      v-bind="componentField"
                    />
                  </FormControl>
                  <FormDescription>
                    フィードバックした際に表示される名前です。
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              </FormField>
            </template>

            <template v-if="stepIndex === 2">
              <FormField v-slot="{ componentField }" name="avatarUrl">
                <FormItem>
                  <FormLabel>プロフィール画像</FormLabel>
                  <FormControl>
                    <Label
                      ref="dropZoneRef"
                      for="dropzone-file"
                      class="border border-dashed border-muted-foreground rounded-md p-8 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-muted-foreground/10 transition-colors"
                      :class="isOverDropZone && 'bg-muted-foreground/10'"
                    >
                      <Input
                        type="file"
                        id="dropzone-file"
                        accept="image/jpeg,image/png"
                        class="hidden"
                        @change="
                          (e: Event) => {
                            handleMainImageUpload(e);
                          }
                        "
                      />

                      <!-- preview -->
                      <div class="flex items-center justify-center">
                        <Avatar class="!size-10 self-start row-span-3">
                          <AvatarImage
                            :src="uploadedImageUrl"
                            alt="User Avatar"
                          />
                          <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                      </div>

                      <!-- description -->
                      <div
                        v-if="!isUploading"
                        class="flex flex-col items-center gap-2"
                      >
                        <span class="text-sm text-muted-foreground text-center">
                          クリックかドラック&ドロップで画像をアップロードできます。
                          <br />
                          2MBまでのJPEG/PNG形式の画像がアップロード可能です。
                        </span>
                        <span class="text-sm text-muted-foreground">
                          画像をアップロードしない場合は、そのまま次へ進んでください。
                        </span>
                      </div>
                      <div
                        v-if="isUploading"
                        class="flex flex-col items-center gap-2"
                      >
                        <span class="text-sm text-muted-foreground">
                          画像をアップロード中...
                        </span>
                        <span class="text-sm text-muted-foreground">
                          しばらくお待ちください。
                        </span>
                      </div>
                    </Label>

                    <Input
                      type="text"
                      placeholder="https://example.com/image.jpg"
                      v-bind="componentField"
                      disabled
                      v-model="uploadedImageUrl"
                      class="hidden"
                    />
                  </FormControl>
                  <FormDescription>
                    初期値は仮のプロフィール画像です。
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              </FormField>
            </template>

            <div v-if="stepIndex === 3" class="flex flex-col gap-8">
              <FormField v-slot="{ componentField }" name="bio">
                <FormItem>
                  <FormLabel>ひとことあいさつ・自己紹介</FormLabel>
                  <FormControl>
                    <Textarea
                      type="text"
                      placeholder="こんにちは！よろしくお願いします！"
                      v-bind="componentField"
                    />
                  </FormControl>
                  <FormDescription>
                    自己紹介やひとことあいさつを入力してください。
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              </FormField>
              <FormField v-slot="{ componentField }" name="website">
                <FormItem>
                  <FormLabel>ポートフォリオサイト</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="https://example.com"
                      v-bind="componentField"
                    />
                  </FormControl>
                  <FormDescription>
                    自分のポートフォリオサイトやSNSのURLを入力してください。
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              </FormField>
            </div>
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
    </div>
  </div>
</template>
