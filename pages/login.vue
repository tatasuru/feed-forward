<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import * as z from "zod";

const supabase = useSupabaseClient();
const loading = ref<boolean>(false);
const activeTab = ref<"signup" | "signin">("signup");
const config = useRuntimeConfig();

const baseUrl = config.public.baseUrl;

/********************************
 * Form setup
 ********************************/
const emailSchema = (fieldName: string) =>
  z
    .string({
      message: "メールアドレスは必須です",
    })
    .email({ message: "有効なメールアドレスを入力してください" });

const passwordSchema = (fieldName: string, requireRegex = true) => {
  let schema = z
    .string({ message: "パスワードは必須です" })
    .min(8, { message: "パスワードは8文字以上である必要があります。" });

  if (requireRegex) {
    schema = schema
      .regex(/[a-zA-Z]/, { message: "英字を含める必要があります。" })
      .regex(/[0-9]/, { message: "数字を含める必要があります。" });
  }

  return schema;
};

const formSchema = computed(() => {
  if (activeTab.value === "signup") {
    return toTypedSchema(
      z.object({
        email: emailSchema("email"),
        password: passwordSchema("password", true),
      })
    );
  } else {
    return toTypedSchema(
      z.object({
        email: emailSchema("email"),
        password: passwordSchema("password", false),
      })
    );
  }
});

const form = useForm({
  validationSchema: formSchema,
});

/********************************
 * Form validation
 ********************************/
const onSubmit = form.handleSubmit(async (values) => {
  loading.value = true;

  try {
    if (activeTab.value === "signup") {
      await signUp(values.email, values.password);
    } else {
      await signIn(values.email, values.password);
    }
  } catch (error) {
    console.error(`Error during ${activeTab.value}:`, error);
  } finally {
    form.resetForm();
    loading.value = false;
  }
});

// Sign up a new user
async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${baseUrl}/confirm`,
    },
  });

  if (error) {
    console.error("Error signing up:", error);
    throw error;
  }

  console.log("User signed up:", data?.user);
  return data;
}

// Sign in an existing user
async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Error signing in:", error);
    throw error;
  }

  // redirect to the home page
  const redirectInfo = useSupabaseCookieRedirect();
  window.location.href = redirectInfo.pluck() || "/";

  return data;
}

// for reset form when tab changes
watch(
  activeTab,
  (newTab) => {
    form.resetForm();
  },
  { immediate: true }
);
</script>

<template>
  <div class="flex items-center justify-center w-full h-screen">
    <div class="w-1/2 gradient-bg h-full"></div>
    <div class="w-1/2 flex flex-col items-center justify-center gap-4">
      <Tabs
        v-model="activeTab"
        default-value="signup"
        class="w-2/3 mx-auto gap-8"
      >
        <TabsList class="w-full">
          <TabsTrigger value="signup" class="cursor-pointer">
            サインアップ
          </TabsTrigger>
          <TabsTrigger value="signin" class="cursor-pointer">
            ログイン
          </TabsTrigger>
        </TabsList>

        <!-- 共通のフォームコンポーネントを作成 -->
        <TabsContent
          v-for="tab in ['signup', 'signin']"
          :key="tab"
          :value="tab"
          class="w-full flex flex-col gap-6"
        >
          <form class="space-y-6" @submit="onSubmit">
            <FormField v-slot="{ componentField }" name="email">
              <FormItem>
                <FormLabel>メールアドレス</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="xxxxxx@example.com"
                    v-bind="componentField"
                    autocomplete="email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="password">
              <FormItem>
                <FormLabel>パスワード</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="パスワード"
                    v-bind="componentField"
                    autocomplete="new-password"
                  />
                </FormControl>
                <FormDescription>
                  パスワードは8文字以上で、{{
                    tab === "signup" ? "英字と数字を含む" : ""
                  }}必要があります。
                </FormDescription>
                <FormMessage />
              </FormItem>
            </FormField>

            <Button type="submit" class="w-full gradient-bg cursor-pointer">
              {{
                loading
                  ? tab === "signup"
                    ? "処理中..."
                    : "ログイン中..."
                  : tab === "signup"
                  ? "アカウント作成"
                  : "ログイン"
              }}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  </div>
</template>
