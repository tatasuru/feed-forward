<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import * as z from "zod";

definePageMeta({
  middleware: "auth",
  layout: "custom",
  title: "パスワード更新",
  description: "Feed Forwardのパスワード更新",
  ogTitle: "Feed Forward パスワード更新",
  ogDescription: "Feed Forwardのパスワード更新",
  twitterCard: "summary_large_image",
});

const supabase = useSupabaseClient();
const loading = ref<boolean>(false);
const stage = ref<"request" | "confirmation">("request");
const message = ref<string>("");

// Form validation schema
const formSchema = toTypedSchema(
  z
    .object({
      password: z
        .string({ message: "パスワードは必須です" })
        .min(8, { message: "パスワードは8文字以上である必要があります。" })
        .regex(/[a-zA-Z]/, { message: "英字を含める必要があります。" })
        .regex(/[0-9]/, { message: "数字を含める必要があります。" }),
      confirmPassword: z.string({
        message: "確認のためのパスワードは必須です",
      }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "パスワードが一致しません",
      path: ["confirmPassword"],
    })
);

const form = useForm({
  validationSchema: formSchema,
});

// Submit handler
const onSubmit = form.handleSubmit(async (values) => {
  loading.value = true;
  message.value = "";

  try {
    await supabase.auth.updateUser({ password: "new_password" });
    const { error } = await supabase.auth.updateUser({
      password: values.password,
    });
    if (error) {
      console.error("Error updating password:", error);
      message.value = "パスワードの更新に失敗しました。";
    } else {
      stage.value = "confirmation";
      message.value =
        "パスワードが正常に更新されました。ログインページよりログインしてください。";
    }
  } catch (error) {
    console.error("Exception during password update:", error);
    message.value = "パスワード更新処理中にエラーが発生しました。";
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
            <CardTitle>パスワード更新</CardTitle>
            <CardDescription v-if="stage === 'request'">
              下記フォームより新しいパスワードを設定してください。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div v-if="stage === 'request'">
              <form @submit="onSubmit" class="space-y-6">
                <FormField v-slot="{ componentField }" name="password">
                  <FormItem>
                    <FormLabel>新しいパスワード</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="新しいパスワードを入力"
                        v-bind="componentField"
                        autocomplete="new-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>

                <FormField v-slot="{ componentField }" name="confirmPassword">
                  <FormItem>
                    <FormLabel>パスワードの確認</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="パスワードを再入力"
                        v-bind="componentField"
                        autocomplete="new-password"
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
                  {{ loading ? "処理中..." : "パスワードを更新する" }}
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
            <p class="text-sm text-destructive">
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
