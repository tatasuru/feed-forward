<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import * as z from "zod";

definePageMeta({
  middleware: "auth",
  layout: "custom",
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
  <div class="flex items-center justify-center w-full h-svh">
    <!-- left -->
    <div
      class="w-1/2 items-center justify-center h-full gradient-bg md:flex hidden"
    />

    <!-- right -->
    <div
      class="w-full relative md:h-auto md:w-1/2 flex flex-col items-center justify-center gap-8"
    >
      <h1 class="gradient-text font-bold text-4xl z-10">Feed Forward</h1>

      <div class="w-full p-4 md:p-0 md:w-2/3 mx-auto gap-4 z-10">
        <Card>
          <CardHeader>
            <CardTitle>パスワードリセット</CardTitle>
            <CardDescription v-if="stage === 'request'">
              登録したメールアドレスを入力してください。パスワードリセット用のリンクを送信します。
            </CardDescription>
          </CardHeader>

          <p
            v-if="!isRegistered"
            class="text-danger text-sm text-center text-error"
          >
            このメールアドレスは登録されていません。
          </p>

          <CardContent>
            <div v-if="stage === 'request'">
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

                <Button
                  type="submit"
                  class="w-full cursor-pointer gradient-bg"
                  :disabled="loading"
                  variant="main"
                >
                  {{ loading ? "処理中..." : "リセットリンクを送信" }}
                </Button>
              </form>
            </div>

            <div v-else class="text-center space-y-6">
              <p class="text-success text-sm" v-if="message">
                {{ message }}
              </p>
              <Button class="cursor-pointer" variant="outline" as-child>
                <NuxtLink to="/login">ログインページに戻る</NuxtLink>
              </Button>
            </div>
          </CardContent>

          <CardFooter v-if="stage === 'request'" class="flex justify-between">
            <p class="text-sm">
              {{ message }}
            </p>
            <Button class="cursor-pointer" variant="link" as-child>
              <NuxtLink to="/login">ログインページに戻る</NuxtLink>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  </div>
</template>
