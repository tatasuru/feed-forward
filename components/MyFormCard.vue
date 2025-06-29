<script setup lang="ts">
interface FeedbackItem {
  id: string;
  name: string;
  question: string;
  type?: "star" | "scale_10" | "radio";
  required?: boolean;
  options?: string[]; // for radio type
  maxRating?: number; // for scale_10 type and star type
}

interface form {
  id: string;
  user_id: string;
  form_type: "star" | "scale_10" | "radio";
  title: string;
  description: string;
  feedback_items: FeedbackItem[];
  is_published: boolean;
  embed_code?: string;
  thumbnail: string;
  created_at: string;
  updated_at: string;
}

const props = defineProps<{
  myForm: form;
}>();
</script>

<template>
  <Card
    class="cursor-pointer hover:shadow-lg transition-shadow duration-200 grid grid-rows-subgrid row-span-3"
  >
    <NuxtImg
      :src="props.myForm.thumbnail"
      :alt="`${props.myForm.title}のサムネイル`"
      class="w-full h-32 object-contain rounded-t-md"
    />

    <CardHeader class="flex flex-col gap-2 h-fit">
      <div class="flex flex-col gap-1">
        <CardTitle class="text-sm font-semibold">
          {{ props.myForm.title }}
        </CardTitle>
        <CardDescription class="text-xs text-muted-foreground">
          {{ props.myForm.description }}
        </CardDescription>
      </div>
      <div class="flex items-center gap-2">
        <Badge
          variant="outline"
          class="text-xs rounded-full leading-1 py-1.5"
          :class="{
            'bg-yellow-100 text-yellow-600 border-yellow-100':
              props.myForm.form_type === 'star',
            'bg-blue-100 text-blue-600 border-blue-100':
              props.myForm.form_type === 'scale_10',
            'bg-green-100 text-green-600 border-green-100':
              props.myForm.form_type === 'radio',
          }"
        >
          {{ props.myForm.form_type }}
        </Badge>

        <p class="text-xs text-muted-foreground">
          作成日時:
          {{ new Date(props.myForm.created_at).toLocaleDateString("ja-JP") }}
        </p>
      </div>
    </CardHeader>

    <CardFooter class="flex flex-col gap-2 w-full">
      <Button
        variant="link"
        type="button"
        class="p-0 size-fit text-xs text-purple hover:underline cursor-pointer gap-1"
        as-child
      >
        <NuxtLink
          :to="`/my-forms/${props.myForm.id}/edit`"
          class="flex items-center gap-1"
        >
          <Icon name="mdi:pencil" />
          フォームを編集する
        </NuxtLink>
      </Button>
      <Button variant="main" class="w-full cursor-pointer" as-child>
        <NuxtLink
          :to="`/my-forms/${props.myForm.id}/detail`"
          class="flex items-center gap-1"
        >
          フォーム詳細
          <Icon name="mdi:arrow-right" />
        </NuxtLink>
      </Button>
    </CardFooter>
  </Card>
</template>
