<script setup lang="ts">
import { ref, computed } from "vue";

const supabase = useSupabaseClient();

type FormTemplate = {
  id: number;
  form_type: string;
  description: string;
  is_featured: boolean;
  name: string;
  thumbnail: string;
  item_count: number;
  preview_data: {
    id: number;
    title: string;
    type: "star" | "scale_10" | "radio";
    question: string;
    required: boolean;
    options?: string[]; // for radio type
    max_rating?: number; // for scale_10 type and star type
  }[];
};

type RatingPerCriteria = {
  id: number;
  title: string;
  type: "star" | "scale_10" | "radio";
  question: string;
  required: boolean;
  options?: string[]; // for radio type
  max_rating?: number; // for scale_10 type and star type
  value?: number;
};

/********************************
 * for forms preview
 ********************************/
const ratingPerCriteria = ref<RatingPerCriteria[]>([]);

/********************************
 * for form templates
 ********************************/
const newTemplate = computed(() => {
  return formTemplates.value;
});
const { data: formTemplates } = await useAsyncData(
  "projectsList",
  async () => {
    try {
      let { data: templates, error } = await supabase
        .from("form_template_catalog")
        .select("*")
        .order("is_featured", { ascending: false });

      if (error) throw new Error(error.message);
      return templates as FormTemplate[];
    } catch (error) {
      console.error("Error fetching projects:", error);
      return [];
    }
  },
  {
    server: true,
  }
);
</script>

<template>
  <div id="create-project" class="flex flex-col w-full gap-4">
    <div class="flex items-center justify-between">
      <PageTitle
        title="テンプレート選択"
        description="テンプレートからフィードバックフォームを作成できます。"
        size="large"
      />

      <div class="relative w-full max-w-sm items-center">
        <Input
          id="search"
          type="text"
          placeholder="テンプレート検索..."
          class="pl-10"
        />
        <div
          class="absolute start-0 inset-y-0 flex items-center justify-center px-2"
        >
          <Icon
            name="solar:magnifer-linear"
            class="!size-5 text-muted-foreground"
          />
        </div>
      </div>
    </div>

    <div class="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6">
      <Card
        v-for="template in newTemplate"
        :key="template.id"
        class="cursor-pointer hover:shadow-lg transition-shadow duration-200 grid grid-rows-subgrid row-span-3"
      >
        <NuxtImg
          :src="template.thumbnail"
          :alt="`${template.name}テンプレート`"
          class="w-full h-32 object-contain rounded-t-md"
        />

        <CardHeader class="flex h-fit">
          <div class="flex flex-col gap-1">
            <CardTitle class="text-sm font-semibold">
              {{ template.name }}
            </CardTitle>
            <CardDescription class="text-xs text-muted-foreground">
              {{ template.description }}
            </CardDescription>
          </div>
        </CardHeader>

        <CardFooter class="flex flex-col gap-4 w-full">
          <Dialog>
            <DialogTrigger as-child>
              <Button
                variant="link"
                type="button"
                class="p-0 size-fit text-xs text-purple hover:underline cursor-pointer"
                @click="ratingPerCriteria = template.preview_data"
              >
                プレビューを見る
              </Button>
            </DialogTrigger>
            <DialogContent class="sm:max-w-[700px]">
              <DialogHeader>
                <DialogTitle>{{ template.name }}</DialogTitle>
                <DialogDescription>
                  {{ template.description }}
                </DialogDescription>
              </DialogHeader>

              <div
                class="flex flex-col gap-6 border p-6 rounded-md w-full max-w-[600px] mx-auto"
              >
                <div
                  v-for="(criteria, criteriaIndex) in ratingPerCriteria"
                  :key="criteriaIndex"
                >
                  <!-- for star -->
                  <div
                    v-if="criteria.type === 'star'"
                    class="flex flex-col gap-2"
                  >
                    <div class="flex flex-col gap-1">
                      <p class="text-sm font-medium">
                        {{ criteria.title }}
                      </p>
                      <span class="flex text-xs text-muted-foreground">
                        {{ criteria.question }}
                      </span>
                    </div>
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
                          <Icon
                            name="mdi:star-outline"
                            class="!size-6 text-muted-foreground hover:text-yellow-500"
                          />
                        </Button>
                      </div>
                      <span class="text-sm text-muted-foreground"> 0/5 </span>
                    </div>
                  </div>

                  <!-- for scale_10 -->
                  <div
                    v-else-if="criteria.type === 'scale_10'"
                    class="flex flex-col gap-2"
                  >
                    <div class="flex flex-col gap-1">
                      <p class="text-sm font-medium">
                        {{ criteria.title }}
                      </p>
                      <span class="flex text-xs text-muted-foreground">
                        {{ criteria.question }}
                      </span>
                    </div>
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <Button
                          v-for="index in 10"
                          :key="index"
                          variant="outline"
                          type="button"
                          size="icon"
                          class="cursor-pointer"
                        >
                          {{ index }}
                        </Button>
                      </div>
                      <span class="text-sm text-muted-foreground"> 0/10 </span>
                    </div>
                  </div>

                  <!-- for radio -->
                  <div
                    v-if="criteria.type === 'radio'"
                    class="flex flex-col gap-2"
                  >
                    <div class="flex flex-col gap-1">
                      <p class="text-sm font-medium">
                        {{ criteria.title }}
                      </p>
                      <span class="flex text-xs text-muted-foreground">
                        {{ criteria.question }}
                      </span>
                    </div>
                    <div class="flex flex-col gap-2">
                      <RadioGroup>
                        <div
                          v-for="(option, index) in [
                            'はい',
                            'いいえ',
                            'どちらでもない',
                          ]"
                          :key="index"
                          class="flex items-center gap-2"
                        >
                          <RadioGroupItem
                            :id="`option-${index}-${criteriaIndex}`"
                            :value="index"
                            class="cursor-pointer"
                          />
                          <Label
                            :for="`option-${index}-${criteriaIndex}`"
                            class="cursor-pointer text-xs font-normal"
                          >
                            {{ option }}
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </div>

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

                <Button variant="default" class="w-full cursor-pointer">
                  フィードバックを送信する
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="main" class="w-full cursor-pointer" as-child>
            <NuxtLink
              :to="`/create-form/${template.form_type}`"
              class="flex items-center gap-1"
              :class="
                template.form_type !== 'star' &&
                'opacity-50 pointer-events-none'
              "
            >
              <Icon name="mdi:plus" />
              このテンプレートを使う
            </NuxtLink>
          </Button>
        </CardFooter>
      </Card>
    </div>
  </div>
</template>
