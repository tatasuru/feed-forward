<script setup lang="ts">
definePageMeta({
  title: "フォームプレビュー",
  layout: "custom",
  description: "公開されているフィードバックフォームの詳細ページです。",
  ogTitle: "フォームプレビュー",
  ogDescription: "公開されているフィードバックフォームの詳細ページです。",
  twitterCard: "summary_large_image",
});

const supabase = useSupabaseClient();
const route = useRoute();

/********************************
 * for forms preview
 ********************************/
const { data: myFormsDetails } = await useAsyncData(
  `myFormsDetails`,
  async () => {
    try {
      const { data, error } = await supabase
        .from("my_forms")
        .select("*")
        .eq("id", route.params.id);

      if (error) throw new Error(error.message);
      return data[0];
    } catch (error) {
      console.error("Error fetching form templates:", error);
      return [];
    }
  }
);
</script>

<template>
  <StarForm
    :form-title="myFormsDetails.title"
    :form-description="myFormsDetails.description"
    :type="myFormsDetails.form_type"
    :feedback-items="myFormsDetails?.feedback_items"
    :preview="true"
    size="large"
  />
</template>
