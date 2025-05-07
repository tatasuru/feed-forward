<script setup lang="ts">
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { toast } from "vue-sonner";
import { useImageUpload } from "@/composables/useImageUpload";
import SettingLayout from "@/components/layout/SettingLayout.vue";

definePageMeta({
  middleware: "auth",
});

type formValues = {
  displayName: string;
  avatarUrl: string;
  bio: string;
  website: string;
};

const supabase = useSupabaseClient();
const user = useSupabaseUser();
const isSubmitting = ref<boolean>(false);
const profile = ref<any>(null);
const store = useStore();

/********************************
 * Form setup
 ********************************/
const formSchema = toTypedSchema(
  z.object({
    displayName: z
      .string({
        required_error: "表示名は必須です",
        invalid_type_error: "表示名は文字列である必要があります",
      })
      .min(2, "表示名は2文字以上で入力してください")
      .max(50, "表示名は50文字以内で入力してください"),
    avatarUrl: z
      .string({
        invalid_type_error: "プロフィール画像は文字列である必要があります",
      })
      .url("URL形式で入力してください")
      .or(z.literal(""))
      .optional(),
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
  })
);

const form = useForm({
  validationSchema: formSchema,
});

const onSubmit = form.handleSubmit((values) => {
  try {
    isSubmitting.value = true;

    setTimeout(() => {
      registrationProfile(values as formValues);
      toast.success("プロフィールを更新しました");
    }, 1000);
  } catch (error) {
    console.error("Validation error:", error);
    toast.error("プロフィールの更新に失敗しました");
    isSubmitting.value = false;
    return;
  }
});

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

/********************************
 * HELPER FUNCTIONS
 ********************************/
async function registrationProfile(values: formValues) {
  const { displayName, avatarUrl, bio, website } = values;
  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: displayName,
      avatar_url: uploadedImageUrl.value || avatarUrl,
      email: store.profile.email,
      bio: bio,
      website: website,
    })
    .eq("id", user.value?.id);

  store.profile = {
    ...store.profile,
    display_name: displayName,
    avatar_url: uploadedImageUrl.value || avatarUrl,
    bio: bio,
    website: website,
  };
}

/********************************
 * LIFECYCLE HOOKS
 ********************************/
onMounted(() => {
  // Check if user is logged in
  profile.value = store.profile;

  // set default values
  uploadedImageUrl.value = store.profile.avatar_url;
  form.setValues({
    displayName: store.profile.display_name,
    avatarUrl: store.profile.avatar_url,
    bio: store.profile.bio,
    website: store.profile.website,
  });
});
</script>

<template>
  <SettingLayout>
    <div class="flex flex-col gap-8 md:gap-12">
      <div class="flex flex-col gap-4">
        <PageTitle
          title="アカウント設定"
          description="アカウントの設定を行います"
          size="small"
        />
        <Separator />
      </div>

      <form @submit="onSubmit" class="flex flex-col gap-8 w-full">
        <!-- display name -->
        <FormField v-slot="{ componentField }" name="displayName">
          <FormItem>
            <FormLabel> 表示名 </FormLabel>
            <FormControl>
              <Input
                type="text"
                placeholder="たろうくん"
                v-bind="componentField"
                :default-value="store.profile.display_name"
              />
            </FormControl>
            <FormDescription>
              フィードバックした際に表示される名前です。
            </FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>

        <!-- avatar image -->
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
                  @change="(e: Event) => handleMainImageUpload(e)"
                />

                <!-- preview -->
                <div class="flex items-center justify-center">
                  <Avatar class="!size-10 self-start row-span-3">
                    <AvatarImage :src="uploadedImageUrl" alt="User Avatar" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                </div>

                <!-- description -->
                <div
                  v-if="!isUploading"
                  class="flex flex-col items-center gap-2"
                >
                  <span class="text-sm text-muted-foreground">
                    クリックかドラック&ドロップで画像をアップロードできます。
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

        <!-- bio -->
        <FormField v-slot="{ componentField }" name="bio">
          <FormItem>
            <FormLabel>ひとことあいさつ・自己紹介</FormLabel>
            <FormControl>
              <Textarea
                type="text"
                placeholder="こんにちは！よろしくお願いします！"
                v-bind="componentField"
                :default-value="store.profile.bio"
              />
            </FormControl>
            <FormDescription>
              自己紹介やひとことあいさつを入力してください。
            </FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>

        <!-- website -->
        <FormField v-slot="{ componentField }" name="website">
          <FormItem>
            <FormLabel>ポートフォリオサイト</FormLabel>
            <FormControl>
              <Input
                type="text"
                placeholder="https://example.com"
                v-bind="componentField"
                :default-value="store.profile.website"
              />
            </FormControl>
            <FormDescription>
              自分のポートフォリオサイトやSNSのURLを入力してください。
            </FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>

        <div class="flex items-center justify-end">
          <Button
            size="sm"
            type="submit"
            class="cursor-pointer gradient-bg md:w-fit w-full text-white"
            :disabled="isSubmitting || isUploading"
          >
            {{ isSubmitting ? "更新中..." : "更新する" }}
          </Button>
        </div>
      </form>
    </div>
  </SettingLayout>
</template>
