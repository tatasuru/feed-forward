<script setup lang="ts">
import { ref, computed } from "vue";

const supabase = useSupabaseClient();

type FormTemplate = {
  id: number;
  category: string;
  description: string;
  is_featured: boolean;
  name: string;
  item_count: number;
  preview_items: {
    name: string;
    description: string;
    display_order: number;
    rating_code: string;
    rating_type: string;
  }[];
};

type RatingPerCriteria = {
  name: string;
  description: string;
  display_order: number;
  rating_code: string;
  rating_type: string;
  value?: number;
};

/********************************
 * for forms preview
 ********************************/
const ratingPerCriteria = ref<RatingPerCriteria[]>([]);

const hoverStarIndexObj = ref<{
  [key: number]: number;
}>({
  0: -1,
  1: -1,
  2: -1,
});

function clickPreviewButton(id: number, e: Event) {
  e.preventDefault();
  e.stopPropagation();
  hoverStarIndexObj.value = {
    0: -1,
    1: -1,
    2: -1,
  };

  const template = newTemplate.value?.find((template) => template.id === id);
  if (template) {
    ratingPerCriteria.value = template.preview_items.map((item) => ({
      name: item.name,
      description: item.description,
      display_order: item.display_order,
      rating_code: item.rating_code,
      rating_type: item.rating_type,
      value: 0,
    }));
    console.log(
      "Preview items for template ID",
      id,
      ":",
      ratingPerCriteria.value
    );
  } else {
    console.error("Template not found for ID:", id);
    ratingPerCriteria.value = [];
  }
}

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
        .from("template_catalog")
        .select("*")
        .order("is_featured", { ascending: false });

      if (error) throw new Error(error.message);
      console.log("Fetched templates:", templates);
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
  <div id="create-project" class="flex flex-col w-full gap-8">
    <PageTitle
      title="テンプレート選択"
      description="テンプレートからフィードバックフォームを作成できます。"
      size="large"
    />

    <div class="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6">
      <Card
        v-for="template in newTemplate"
        :key="template.id"
        class="cursor-pointer hover:shadow-lg transition-shadow duration-200 grid grid-rows-subgrid row-span-3"
      >
        <NuxtImg
          :src="`/${template.category}-feedback-thumbnail.png`"
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
                @click="(e: Event) => clickPreviewButton(template.id, e)"
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
                    v-if="criteria.rating_code === 'star'"
                    class="flex flex-col gap-2"
                  >
                    <div class="flex flex-col gap-1">
                      <p class="text-sm font-medium">
                        {{ criteria.name }}
                      </p>
                      <span class="flex text-xs text-muted-foreground">
                        {{ criteria.description }}
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
                          @click="hoverStarIndexObj[criteriaIndex] = index"
                        >
                          <Icon
                            v-if="hoverStarIndexObj[criteriaIndex] >= index"
                            name="mdi:star"
                            class="!size-6 text-yellow-500"
                          />
                          <Icon
                            v-else
                            name="mdi:star-outline"
                            class="!size-6 text-muted-foreground hover:text-yellow-500"
                          />
                        </Button>
                      </div>
                      <span class="text-sm text-muted-foreground">
                        {{
                          hoverStarIndexObj[criteriaIndex] < 0
                            ? 0
                            : hoverStarIndexObj[criteriaIndex] + 1
                        }}/5
                      </span>
                    </div>
                  </div>

                  <!-- for scale_10 -->
                  <div
                    v-else-if="criteria.rating_code === 'scale_10'"
                    class="flex flex-col gap-2"
                  >
                    <div class="flex flex-col gap-1">
                      <p class="text-sm font-medium">
                        {{ criteria.name }}
                      </p>
                      <span class="flex text-xs text-muted-foreground">
                        {{ criteria.description }}
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
                          @click="hoverStarIndexObj[criteriaIndex] = index - 1"
                        >
                          {{ index }}
                        </Button>
                      </div>
                      <span class="text-sm text-muted-foreground">
                        {{
                          hoverStarIndexObj[criteriaIndex] < 0
                            ? 0
                            : hoverStarIndexObj[criteriaIndex] + 1
                        }}/10
                      </span>
                    </div>
                  </div>

                  <!-- for radio -->
                  <div
                    v-if="criteria.rating_code === 'radio'"
                    class="flex flex-col gap-2"
                  >
                    <div class="flex flex-col gap-1">
                      <p class="text-sm font-medium">
                        {{ criteria.name }}
                      </p>
                      <span class="flex text-xs text-muted-foreground">
                        {{ criteria.description }}
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
              :to="`/create-form/${template.id}`"
              class="flex items-center gap-1"
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
