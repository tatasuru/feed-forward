<script setup lang="ts">
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";

const formSchema = toTypedSchema(
  z.object({
    username: z.string().min(2).max(50),
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
  <div id="create-project" class="grid w-full h-full gap-8">
    <div class="flex flex-col gap-4">
      <!-- header -->
      <div
        class="flex items-center justify-between w-full sticky top-0 z-10 bg-background border-b border-border py-4"
      >
        <PageTitle title="フィードバックフォームの作成" size="medium" />
        <Button variant="main" class="cursor-pointer">保存する</Button>
      </div>

      <!-- main -->
      <div
        class="w-full h-full grid grid-cols-[1fr_auto_1fr] items-start gap-8"
      >
        <!-- edit form -->
        <div class="w-full h-full p-4">
          <form @submit="onSubmit" class="flex flex-col gap-8 w-full h-full">
            <div class="flex flex-col gap-6 p-8 border rounded-md shadow-sm">
              <PageTitle
                title="1.フォームの基本情報"
                description="フォームの基本情報を入力してください。"
                size="small"
              />
              <div class="flex flex-col gap-6">
                <FormField v-slot="{ componentField }" name="formName">
                  <FormItem>
                    <FormLabel>フォームの名前</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="プロジェクト"
                        v-bind="componentField"
                      />
                    </FormControl>
                    <FormDescription class="text-xs">
                      マイフォーム一覧で表示されるフォームの名前を入力してください。
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                </FormField>
                <FormField v-slot="{ componentField }" name="formDescription">
                  <FormItem>
                    <FormLabel>フォームの説明</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="このフォームはフィードバックを収集するためのものです。"
                        v-bind="componentField"
                      />
                    </FormControl>
                    <FormDescription class="text-xs">
                      フォームの目的や内容を簡潔に説明してください。
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                </FormField>
              </div>
            </div>
            <div class="flex flex-col gap-6 p-8 border rounded-md shadow-sm">
              <PageTitle
                title="2.フィードバック項目の設定"
                description="フィードバックを収集するための項目を設定してください。"
                size="small"
              />
              <div
                class="flex flex-col gap-6 border-2 p-6 rounded-md border-pink border-dashed"
              >
                <FormField v-slot="{ componentField }" name="formName">
                  <FormItem>
                    <FormLabel> 項目1の名前 </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="プロジェクト"
                        v-bind="componentField"
                      />
                    </FormControl>
                    <FormDescription class="text-xs">
                      実際に表示するフィードバック項目の名前を入力してください。
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                </FormField>
                <FormField v-slot="{ componentField }" name="formDescription">
                  <FormItem>
                    <FormLabel>項目1の説明</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="このフォームはフィードバックを収集するためのものです。"
                        v-bind="componentField"
                      />
                    </FormControl>
                    <FormDescription class="text-xs">
                      フィードバックを収集するための項目を設定します。
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                </FormField>
              </div>

              <div class="flex flex-col gap-2">
                <Button
                  variant="mainOutline"
                  type="button"
                  class="w-full cursor-pointer self-center border-dashed"
                >
                  <Icon name="mdi:plus" class="!size-4" />
                  フィードバック項目を追加
                </Button>
                <span class="flex self-center text-xs text-muted-foreground">
                  残り2つまで
                </span>
              </div>
            </div>
            <div class="flex flex-col gap-6 p-8 border rounded-md shadow-sm">
              <PageTitle
                title="3.フォームの見た目"
                description="フォームの見た目を設定してください。"
                size="small"
              />
              <div class="flex flex-col gap-6">
                <FormField v-slot="{ componentField }" name="formName">
                  <FormItem>
                    <FormLabel> カラー </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="プロジェクト"
                        v-bind="componentField"
                      />
                    </FormControl>
                    <FormDescription class="text-xs">
                      フォームの見た目を設定するためのカラーを入力してください。
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                </FormField>
              </div>
            </div>
          </form>
        </div>

        <!-- separator -->
        <Separator class="w-px h-full bg-border" orientation="vertical" />

        <!-- preview -->
        <div
          class="w-full h-fit flex flex-col justify-center items-center gap-4 p-4 sticky top-20 z-10"
        >
          <!-- <PageTitle
            title="プレビュー"
            size="small"
            class="text-muted-foreground"
          /> -->

          <div
            class="flex flex-col gap-6 border p-6 rounded-md w-full max-w-[520px] h-fit mx-auto shadow-sm"
          >
            <!-- rating -->
            <div class="border-2 border-pink border-dashed p-4 rounded-md">
              <p class="text-sm font-medium">フィードバック項目</p>
              <span class="text-xs text-muted-foreground">
                フィードバックを収集するための項目を設定します。
              </span>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <Button
                    v-for="(_, index) in [1, 2, 3, 4, 5]"
                    :key="index"
                    variant="ghost"
                    type="button"
                    size="icon"
                    class="cursor-pointer rounded-full hover:bg-yellow-500/20 dark:hover:bg-yellow-500/20"
                  >
                    <!-- <Icon name="mdi:star" class="!size-6 text-yellow-500" /> -->
                    <Icon
                      name="mdi:star-outline"
                      class="!size-6 text-muted-foreground hover:text-yellow-500"
                    />
                  </Button>
                </div>
                <span class="text-sm text-muted-foreground"> 0/5 </span>
              </div>
            </div>

            <!-- comment -->
            <div>
              <p class="text-sm font-medium">コメント</p>
              <Textarea
                type="text"
                placeholder="フィードバックを入力"
                class="w-full h-36 border border-muted-foreground/20 rounded-md p-4"
              />
              <span class="text-xs text-muted-foreground">
                フィードバックで伝えたい想いがあればご記入ください。
              </span>
            </div>

            <!-- anonymous -->
            <div name="isAnonymous">
              <div class="flex items-center justify-between">
                <p class="text-sm text-muted-foreground">
                  匿名でフィードバックをする
                </p>
                <Switch class="cursor-pointer data-[state=checked]:bg-purple" />
              </div>
            </div>
            <Button variant="main" class="w-full cursor-pointer">
              フィードバックを送信する
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
