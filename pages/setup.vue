<script setup lang="ts">
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import Textarea from "@/components/shadcn-ui/Textarea.vue";

type formValues = {
  displayName: string;
  avatarUrl: string;
  bio: string;
  website: string;
};

const supabase = useSupabaseClient();
const isFirstLogin = ref<boolean>(false);
const profile = ref<any>(null);
const isSubmitting = ref<boolean>(false);
const store = useStore();

onMounted(async () => {
  await checkFirstLogin();

  if (isFirstLogin.value) {
    return;
  }

  await checkDisplayName();

  if (!isFirstLogin.value) {
    window.location.href = "/";
    return;
  }
});

const stepIndex = ref(1);
const steps = [
  {
    step: 1,
    title: "1. 表示名",
    description: "Feed Forwardで表示される名前を入力してください",
  },
  {
    step: 2,
    title: "2. プロフィール画像",
    description: "プロフィール画像のURLを入力してください",
  },
  {
    step: 3,
    title: "3. ひとことあいさつ・自己紹介とポートフォリオサイト",
    description: "自己紹介やポートフォリオサイトのURLを入力してください",
  },
];

/********************************
 * Form setup
 ********************************/
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

const form = useForm();

function onSubmit(values: formValues) {
  try {
    isSubmitting.value = true;

    setTimeout(() => {
      registrationProfile(values);
      store.profile.display_name = values.displayName;
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

  if (error) {
    console.error("ユーザー情報取得エラー:", error);
    return;
  }

  if (!userData.display_name) {
    isFirstLogin.value = true;
    return;
  }

  isFirstLogin.value = false;
  return;
}

/***************************************************
 * Check if user already resigned display name
 ***************************************************/
async function checkDisplayName() {
  const { data, error } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", profile.value.id)
    .single();

  if (error) {
    console.error("Error fetching display name:", error);
    return;
  }

  if (data.display_name) {
    isFirstLogin.value = false;
  } else {
    isFirstLogin.value = true;
  }
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
      avatar_url: avatarUrl,
      email: profile.value.email,
      bio: bio,
      website: website,
    })
    .eq("id", profile.value.id);

  if (error) {
    console.error("プロフィール登録エラー:", error);
  } else {
    window.location.href = "/";
  }
}
</script>

<template>
  <div class="flex items-center justify-center w-full h-screen">
    <div class="w-1/2 h-full backdrop-blur-md gradient-bg">
      <div class="flex items-center justify-center h-full">
        <Stepper
          v-model="stepIndex"
          orientation="vertical"
          class="mx-auto flex w-full max-w-md flex-col justify-start gap-20"
        >
          <StepperItem
            v-for="step in steps"
            :key="step.step"
            v-slot="{ state }"
            class="relative flex w-full items-start gap-6"
            :step="step.step"
          >
            <StepperSeparator
              v-if="step.step !== steps[steps.length - 1].step"
              class="absolute left-[23px] top-[100%] block h-[167%] w-0.5 shrink-0 rounded-full bg-background/20 group-data-[state=completed]:bg-background"
            />

            <StepperTrigger as-child>
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
                class="text-sm font-semibold transition lg:text-base text-white"
              >
                {{ step.title }}
              </StepperTitle>
              <StepperDescription
                :class="[state === 'active' && 'text-primary']"
                class="sr-only text-xs text-white transition md:not-sr-only lg:text-sm"
              >
                {{ step.description }}
              </StepperDescription>
            </div>
          </StepperItem>
        </Stepper>
      </div>
    </div>
    <div
      class="w-1/2 flex flex-col items-center justify-center gap-4 p-12 h-full relative"
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
          class="w-full flex flex-col gap-5"
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
                    <Input
                      type="text"
                      placeholder="https://example.com/image.jpg"
                      v-bind="componentField"
                      :default-value="profile.avatar_url"
                    />
                  </FormControl>
                  <FormDescription>
                    プロフィール画像のURLを入力してください。
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
