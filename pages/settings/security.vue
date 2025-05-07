<script setup lang="ts">
import SettingLayout from "@/components/layout/SettingLayout.vue";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import * as z from "zod";

definePageMeta({
  middleware: "auth",
  title: "セキュリティ設定",
  description:
    "Feed Forwardのセキュリティ設定ページです。パスワードリセットやアカウント削除ができます。",
  ogTitle: "Feed Forward セキュリティ設定",
  ogDescription:
    "Feed Forwardのセキュリティ設定ページです。パスワードリセットやアカウント削除ができます。",
  ogImage: "/logo.png",
  twitterCard: "summary_large_image",
});

const supabase = useSupabaseClient();
const config = useRuntimeConfig();
const loading = ref<boolean>(false);
const stage = ref<"request" | "confirmation">("request");
const message = ref<string>("");
const isRegistered = ref<boolean>(true);
const baseUrl = config.public.baseUrl;

// Form validation schema
const formSchema = toTypedSchema(
  z.object({
    email: z
      .string({
        message: "メールアドレスは必須です",
      })
      .email({ message: "有効なメールアドレスを入力してください" }),
  })
);

const form = useForm({
  validationSchema: formSchema,
});

// Submit handler
const onSubmit = form.handleSubmit(async (values) => {
  loading.value = true;
  message.value = "";

  // if check if email is already registered
  const { data: userData, error } = await supabase
    .from("profiles") // Replace "users" with the actual table name
    .select("email")
    .eq("email", values.email);

  if (error || !userData) {
    isRegistered.value = false;
    loading.value = false;
    return;
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${baseUrl}/update-password`,
    });

    if (error) {
      console.error("Error requesting password reset:", error);
      message.value = "パスワードリセットのリクエストに失敗しました。";
    } else {
      stage.value = "confirmation";
      message.value =
        "パスワードリセット用のメールを送信しました。メールを確認してください。";
    }
  } catch (error) {
    console.error("Exception during password reset request:", error);
    message.value = "パスワードリセット処理中にエラーが発生しました。";
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <SettingLayout>
    <div class="flex flex-col gap-8 md:gap-12">
      <div class="flex flex-col gap-8 md:gap-8">
        <div class="flex flex-col gap-4">
          <PageTitle
            title="パスワードリセット"
            description="パスワードを忘れた場合は、以下のフォームにメールアドレスを入力してください。"
            size="small"
          />
          <Separator />
        </div>

        <p class="text-success text-sm w-full text-center" v-if="message">
          {{ message }}
        </p>

        <form @submit="onSubmit" class="space-y-6">
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

          <div class="flex items-center justify-end">
            <Button
              type="submit"
              class="w-full md:w-fit cursor-pointer gradient-bg"
              :disabled="loading"
              variant="main"
            >
              {{ loading ? "処理中..." : "リセットリンクを送信" }}
            </Button>
          </div>
        </form>
      </div>

      <div class="flex flex-col gap-8 md:gap-8">
        <div class="flex flex-col gap-4">
          <PageTitle
            title="アカウント削除"
            description="アカウントを削除する場合は、以下のボタンをクリックしてください。"
            size="small"
          />
          <Separator />
        </div>

        <AlertDialog>
          <AlertDialogTrigger as-child>
            <Button
              variant="destructive"
              class="w-full md:w-fit cursor-pointer"
            >
              アカウントを削除
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>最終確認</AlertDialogTitle>
              <AlertDialogDescription>
                <p
                  class="text-danger text-sm w-full text-center text-destructive-foreground"
                >
                  アカウントを削除すると、すべてのデータが失われます。
                  <br />
                  本当に削除しますか？
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel class="cursor-pointer">
                キャンセル
              </AlertDialogCancel>
              <AlertDialogAction
                class="w-full md:w-fit cursor-pointer bg-destructive text-white hover:bg-destructive/80 hover:text-white"
              >
                削除する
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  </SettingLayout>
</template>
