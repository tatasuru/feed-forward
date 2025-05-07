<script setup lang="ts">
import type { ProjectWithFeedback } from "@/types/projects.types";
import { constructNow, format } from "date-fns";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import * as z from "zod";
import { toast } from "vue-sonner";

definePageMeta({
  middleware: "auth",
  title: "プロジェクト詳細",
  description:
    "Feed Forwardのプロジェクト詳細ページです。プロジェクトの詳細を確認できます。",
  ogTitle: "Feed Forward プロジェクト詳細",
  ogDescription:
    "Feed Forwardのプロジェクト詳細ページです。プロジェクトの詳細を確認できます。",
  ogImage: "/logo.png",
  twitterCard: "summary_large_image",
});

const { id } = useRoute().params;
const supabase = useSupabaseClient();
const supabaseUser = useSupabaseUser();
const preview = ref();
const isLoading = ref<boolean>(true);
const isSubmitting = ref<boolean>(false);

const projectWithFeedback = computed<ProjectWithFeedback>(() => {
  return projectDetails.value as ProjectWithFeedback;
});
const badgeColors = {
  design: "bg-blue/20 text-blue",
  demo: "bg-pink/20 text-pink",
  plan: "bg-purple/20 text-purple",
};
const progressBarColors = ["bg-pink", "bg-blue", "bg-purple"];
const hoverStarIndexObj = ref<{
  [key: number]: number;
}>({
  0: -1,
  1: -1,
  2: -1,
});
const isAlreadyRated = ref<boolean>(false);
const currentFeedbackId = ref<string | null>(null);
const ratingPerCriteria = ref<
  {
    criteria_id: string;
    rating: number;
  }[]
>([]);

/******************************
 * form setup
 ******************************/
const formSchema = toTypedSchema(
  z.object({
    overallComment: z
      .string()
      .min(2, "コメントは2文字以上入力してください")
      .max(1000, "コメントは1000文字以内で入力してください"),
    isAnonymous: z.boolean().default(false),
    ratings: z.record(
      z
        .number({
          message: "評価は1から5の間で入力してください",
        })
        .min(0, {
          message: "評価は1から5の間で入力してください",
        })
        .max(5, {
          message: "評価は1から5の間で入力してください",
        })
    ),
  })
);

const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    overallComment: "",
    isAnonymous: false,
    ratings: {},
  },
});

const onSubmit = form.handleSubmit(async (values) => {
  try {
    isSubmitting.value = true;

    // submit feedback
    await submitFeedback(values);

    setTimeout(() => {
      toast.success("フィードバックを送信しました。");
      isAlreadyRated.value = true;
      isSubmitting.value = false;
    }, 2000);
  } catch (error) {
    console.error("Form validation error:", error);
    toast.error("フィードバックの送信に失敗しました。");
    isSubmitting.value = false;
    return;
  }
});

/******************************
 * Lifecycle Hooks
 ******************************/
const { data: projectDetails } = await useAsyncData(
  "projectDetails",
  async () => {
    try {
      const { data, error } = await supabase.rpc("get_project_with_feedback", {
        p_project_id: id,
      });

      if (error) throw new Error(error.message);
      return data;
    } catch (error) {
      console.error("Error fetching project details:", error);
      return null;
    }
  },
  {
    server: true,
  }
);

const { data: relatedData } = await useAsyncData(
  "projectRelatedData",
  async () => {
    if (!projectDetails.value)
      return {
        preview: null,
        userFeedback: null,
        ratingPerCriteria: [],
      };

    try {
      // 1.get preview data
      const preview = await getLinkPreview(
        projectWithFeedback.value.project.resource_url
      );

      // 2.get user feedback
      const userFeedBack = await checkExistingFeedback();

      // 3.get rating per criteria
      const ratingPerCriteria = await getRatingPerCriteria();

      // 4. set loading to false
      isLoading.value = false;

      return {
        preview,
        userFeedBack,
        ratingPerCriteria,
      };
    } catch (error) {
      console.error("Error fetching related data:", error);
      return {
        preview: null,
        userFeedback: null,
        ratingPerCriteria: [],
      };
    }
  },
  {
    server: true,
  }
);

watch(
  relatedData,
  (newData) => {
    if (!newData) return;

    // 1. set preview data
    preview.value = newData.preview;

    // 2. check if user feedback exists
    if (newData.userFeedBack?.exists && newData.userFeedBack.feedback.ratings) {
      isAlreadyRated.value = true;
    } else {
      isAlreadyRated.value = false;
    }

    // 3. set rating per criteria
    ratingPerCriteria.value = newData.ratingPerCriteria || [];

    // 4. set initial values for ratings
    const initialRatings: Record<number, number> = {};
    projectWithFeedback.value?.evaluation_criteria.forEach((_, index) => {
      initialRatings[index] = -1;
      hoverStarIndexObj.value[index] = -1;
    });

    if (newData.userFeedBack?.exists && newData.userFeedBack.feedback.ratings) {
      const ratingsByCriteriaId: Record<string, any> = {};
      newData.userFeedBack.feedback.ratings.forEach((rating: any) => {
        ratingsByCriteriaId[rating.criteria_id] = rating;
      });

      projectWithFeedback.value?.evaluation_criteria.forEach(
        (criteria, index) => {
          const rating = ratingsByCriteriaId[criteria.id];
          if (rating) {
            initialRatings[index] = rating.rating;
            hoverStarIndexObj.value[index] = rating.rating - 1;
          }
        }
      );

      isAlreadyRated.value = true;
    } else {
      isAlreadyRated.value = false;
    }

    // Set initial values for ratings
    form.setFieldValue(
      "overallComment",
      newData.userFeedBack?.feedback?.overall_comment || ""
    );
    form.setFieldValue(
      "isAnonymous",
      newData.userFeedBack?.feedback?.is_anonymous || false
    );
    form.setFieldValue("ratings", initialRatings);
  },
  { immediate: true }
);

/******************************
 * HELPER FUNCTIONS
 ******************************/

async function getLinkPreview(url: string) {
  try {
    const encodedUrl = encodeURIComponent(url);
    const { data, error } = await useFetch(
      `/api/link-preview?url=${encodedUrl}`
    );

    if (error.value) {
      console.error("Error fetching link preview:", error.value);
      return {
        title: "No Title",
        description: "No Description",
        images: [],
      };
    }

    return data.value;
  } catch (error) {
    console.error("Error fetching link preview:", error);
    throw error;
  }
}

async function submitFeedback(values: {
  overallComment: string;
  isAnonymous: boolean;
  ratings: Record<number, number>;
}) {
  try {
    const ratingsObject: Record<string, number> = {};

    // initialize ratingsObject with the project ID
    projectWithFeedback.value.evaluation_criteria.forEach((criteria, index) => {
      const rating = values.ratings[index];
      if (rating && rating > 0) {
        ratingsObject[criteria.id] = Number(rating);
      }
    });

    if (isAlreadyRated.value) {
      const { data, error } = await supabase.rpc(
        "update_feedback_with_ratings",
        {
          p_feedback_id: currentFeedbackId.value,
          p_comment: values.overallComment,
          p_is_anonymous: values.isAnonymous,
          p_ratings: ratingsObject,
        }
      );

      if (error) {
        console.error("RPC呼び出しエラー:", error);
        throw error;
      }

      return data.feedback_id;
    } else {
      // submit feedback
      const { data, error } = await supabase.rpc("save_feedback_with_ratings", {
        p_project_id: id,
        p_user_id: supabaseUser.value?.id,
        p_comment: values.overallComment,
        p_is_anonymous: values.isAnonymous,
        p_ratings: ratingsObject,
      });

      if (error) {
        console.error("RPC呼び出しエラー:", error);
        throw error;
      }

      return data.feedback_id;
    }
  } catch (error) {
    console.error("フィードバック保存中にエラーが発生しました:", error);
    throw error;
  }
}

async function checkExistingFeedback() {
  try {
    const { data, error } = await supabase.rpc("check_user_feedback", {
      p_project_id: id,
      p_user_id: supabaseUser.value?.id,
    });

    if (error) {
      console.error("フィードバック確認エラー:", error);
      throw error;
    }

    if (data.exists) {
      currentFeedbackId.value = data.feedback_id;
      return await getUserFeedback();
    }

    return null;
  } catch (error) {
    console.error("フィードバック確認中にエラーが発生しました:", error);
    throw error;
  }
}

async function getUserFeedback() {
  try {
    const { data, error } = await supabase.rpc("get_user_provided_feedback", {
      p_user_id: supabaseUser.value?.id,
      p_project_id: id,
    });

    if (error) {
      console.error("フィードバック取得エラー:", error);
      throw error;
    }

    if (data) {
      const feedback = data.feedbacks[0];

      const initialValues: Record<string, any> = {
        overallComment: feedback.overall_comment || "",
        isAnonymous: feedback.is_anonymous || false,
        ratings: {},
      };

      // set initial values for ratings
      if (feedback.ratings && feedback.ratings.length > 0) {
        projectWithFeedback.value.evaluation_criteria.forEach(
          (criteria, index) => {
            const matchingRating = feedback.ratings.find(
              (rating: any) => rating.criteria_id === criteria.id
            );

            if (matchingRating) {
              initialValues.ratings[index] = matchingRating.rating;
            } else {
              initialValues.ratings[index] = -1;
            }
          }
        );
      }

      return {
        exists: true,
        feedback: feedback,
        initialValues: initialValues,
      };
    }

    return {
      exists: false,
    };
  } catch (error) {
    console.error("フィードバック取得中にエラーが発生しました:", error);
    throw error;
  }
}

async function getRatingPerCriteria() {
  const feedbacks = projectWithFeedback.value.feedbacks || [];
  const ratingAvgByCriteriaId: Record<string, number> = {};
  const ratingCountByCriteriaId: Record<string, number> = {};

  // 1. insert feedbacks into each criteria variable
  feedbacks.forEach((feedback) => {
    feedback.ratings.forEach((rating) => {
      if (!ratingAvgByCriteriaId[rating.criteria_id]) {
        ratingAvgByCriteriaId[rating.criteria_id] = 0;
        ratingCountByCriteriaId[rating.criteria_id] = 0;
      }
      ratingAvgByCriteriaId[rating.criteria_id] += rating.rating;
      ratingCountByCriteriaId[rating.criteria_id]++;
    });
  });

  // 2. calculate average rating for each criteria
  Object.keys(ratingAvgByCriteriaId).forEach((criteriaId) => {
    if (ratingCountByCriteriaId[criteriaId] > 0) {
      ratingAvgByCriteriaId[criteriaId] =
        ratingAvgByCriteriaId[criteriaId] / ratingCountByCriteriaId[criteriaId];
    }
  });

  // 3. set the average rating to the ratingPerCriteria
  return projectWithFeedback.value.evaluation_criteria.map((criteria) => {
    return {
      criteria_id: criteria.id,
      rating: ratingAvgByCriteriaId[criteria.id] || 0,
    };
  });
}
</script>

<template>
  <div id="projects" class="grid w-full gap-8">
    <div
      v-if="projectWithFeedback?.project"
      class="flex flex-col gap-4 items-start justify-between"
    >
      <Button
        as-child
        variant="ghost"
        class="!p-0 hover:bg-transparent hover:text-muted-foreground"
      >
        <NuxtLink to="/projects" class="text-muted-foreground">
          <Icon name="mdi:arrow-left" class="!size-4 text-muted-foreground" />
          前のページへ戻る
        </NuxtLink>
      </Button>

      <PageTitle :title="projectWithFeedback.project.title" size="large" />

      <div class="flex items-center gap-4">
        <Badge
          variant="default"
          class="text-xs rounded-full border"
          :class="badgeColors[projectWithFeedback.project.project_type]"
        >
          {{ projectWithFeedback.project.project_type }}
        </Badge>

        <div class="flex items-center gap-px">
          <Icon
            name="mdi:calendar-month"
            class="!size-4 text-muted-foreground"
          />
          <span class="text-xs md:text-sm text-muted-foreground">
            作成日:
            {{
              format(
                new Date(projectWithFeedback.project.created_at),
                "yyyy/MM/dd"
              )
            }}
          </span>
        </div>

        <div
          v-if="projectWithFeedback.project.deadline"
          class="flex items-center gap-1"
        >
          <Icon
            name="mdi:clock-remove-outline"
            class="!size-4 text-muted-foreground"
          />
          <span class="text-xs md:text-sm text-muted-foreground">
            期限:
            {{
              format(
                new Date(projectWithFeedback.project.deadline),
                "yyyy/MM/dd"
              )
            }}
          </span>
        </div>
      </div>
    </div>

    <div class="grid md:grid-cols-[1fr_500px] gap-4">
      <!-- left -->
      <div
        v-if="projectWithFeedback?.project"
        class="flex flex-col gap-8 border border-muted-foreground/20 rounded-lg p-4 md:p-8 w-full"
      >
        <PageTitle
          title="プロジェクトの詳細"
          description="フィードバックを求めているプロジェクトの詳細"
          size="medium"
        />

        <div class="flex flex-col gap-12">
          <!-- profile -->
          <div class="flex flex-col gap-4 w-full">
            <PageTitle title="ユーザー情報" size="small" />

            <div class="flex items-start gap-4">
              <Avatar class="cursor-pointer size-20">
                <AvatarImage
                  :src="
                    projectWithFeedback.owner.avatar_url || 'default-avatar.png'
                  "
                  alt="avatar"
                />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div class="flex flex-col gap-1">
                <p class="text-lg font-semibold">
                  {{ projectWithFeedback.owner.display_name }}
                </p>
                <p
                  v-if="projectWithFeedback.owner.bio"
                  class="text-sm text-muted-foreground"
                >
                  {{ projectWithFeedback.owner.bio }}
                </p>
                <NuxtLink
                  v-if="projectWithFeedback.owner.website"
                  :to="projectWithFeedback.owner.website"
                  class="text-sm text-link flex items-center gap-1"
                >
                  <Icon name="mdi:link" class="!size-4 text-link" />
                  サイトへ
                </NuxtLink>
              </div>
            </div>
          </div>

          <!-- overview -->
          <div class="flex flex-col gap-4 w-full">
            <PageTitle title="概要" size="small" />
            <p class="text-sm text-muted-foreground leading-5">
              {{ projectWithFeedback.project.description }}
            </p>
          </div>

          <!-- feedback subject  -->
          <div class="flex flex-col gap-4 w-full">
            <PageTitle title="フィードバック対象" size="small" />
            <NuxtLink
              :to="projectWithFeedback.project.resource_url"
              class="flex flex-col gap-3 border border-muted-foreground/20 rounded-sm"
              target="_blank"
            >
              <NuxtImg
                v-if="preview?.images?.[0]"
                :src="preview?.images?.[0] || 'no-image.png'"
                :alt="preview?.title || ''"
                class="object-cover object-center h-52 md:h-96 rounded-t-sm"
              />
              <NuxtImg
                v-else="!preview?.images?.[0]"
                src="no-image.png"
                :alt="preview?.title || ''"
                class="object-contain object-center h-52 md:h-96 rounded-t-sm bg-muted-foreground/22"
              />

              <div class="flex flex-col gap-2 p-4">
                <p class="text-base">
                  {{ preview?.title ? preview?.title : "No Title" }}
                </p>
                <p class="text-sm text-muted-foreground leading-6">
                  {{
                    preview?.description
                      ? preview?.description
                      : "No Description"
                  }}
                </p>
              </div>
            </NuxtLink>
          </div>

          <!-- feedback items -->
          <div class="flex flex-col gap-4 w-full">
            <PageTitle title="評価項目" size="small" />

            <div class="flex flex-col gap-4">
              <div
                v-for="(
                  criteria, index
                ) in projectWithFeedback?.evaluation_criteria"
                class="flex flex-col gap-2"
              >
                <div class="flex justify-between items-center">
                  <p class="text-sm">{{ criteria.name }}</p>
                  <p class="text-sm">
                    平均:
                    {{
                      ratingPerCriteria[index]
                        ? ratingPerCriteria[index].rating.toFixed(1)
                        : 0
                    }}
                    / 5.0
                  </p>
                </div>

                <Progress
                  :model-value="
                    ratingPerCriteria[index]
                      ? (ratingPerCriteria[index].rating / 5) * 100
                      : 0
                  "
                  :indicator-color="progressBarColors[index]"
                  class="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- right -->
      <div
        class="md:sticky md:top-[90px] flex flex-col gap-8 border border-muted-foreground/20 rounded-lg p-4 md:p-8 min-h-fit h-[calc(100vh-110px)] w-full"
      >
        <PageTitle
          title="フィードバックを送る"
          description="このプロジェクトに対するフィードバックを提供してください"
          size="medium"
        />

        <div
          v-if="isAlreadyRated"
          class="p-4 bg-muted-foreground/20 rounded-md"
        >
          <p class="text-sm text-muted-foreground">
            すでにフィードバックを送信済みです。<br />
            フィードバックの内容を変更する場合は、再度フィードバックを送信してください。
          </p>
        </div>

        <form @submit="onSubmit" class="flex flex-col gap-6">
          <!-- rating -->
          <FormField
            v-for="(
              criteria, criteriaIndex
            ) in projectWithFeedback?.evaluation_criteria"
            v-slot="{ componentField }"
            :name="`ratings.${criteriaIndex}`"
          >
            <FormItem>
              <FormLabel>{{ criteria.name }}</FormLabel>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <FormControl>
                    <Button
                      v-for="(_, index) in [1, 2, 3, 4, 5]"
                      :key="index"
                      v-bind="componentField"
                      variant="ghost"
                      type="button"
                      size="icon"
                      class="cursor-pointer rounded-full hover:bg-yellow-500/20 dark:hover:bg-yellow-500/20"
                      @click="
                        hoverStarIndexObj[criteriaIndex] = index;
                        form.setFieldValue(
                          `ratings.${criteriaIndex}`,
                          index + 1
                        );
                      "
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
                  </FormControl>
                </div>
                <span class="text-sm text-muted-foreground">
                  {{
                    hoverStarIndexObj[criteriaIndex] < 0
                      ? 0
                      : hoverStarIndexObj[criteriaIndex] + 1
                  }}/5
                </span>
              </div>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- comment -->
          <FormField v-slot="{ componentField }" name="overallComment">
            <FormItem>
              <FormLabel>コメント</FormLabel>
              <FormControl>
                <Textarea
                  type="text"
                  placeholder="フィードバックを入力"
                  class="w-full h-36 border border-muted-foreground/20 rounded-md p-4"
                  v-bind="componentField"
                />
              </FormControl>
              <FormDescription>
                フィードバックで伝えたい想いがあればご記入ください。
              </FormDescription>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- anonymous -->
          <FormField v-slot="{ value, handleChange }" name="isAnonymous">
            <FormItem class="flex items-center justify-between">
              <FormLabel class="text-sm text-muted-foreground"
                >匿名でフィードバックをする</FormLabel
              >
              <FormControl>
                <Switch
                  :model-value="value"
                  class="cursor-pointer data-[state=checked]:bg-purple"
                  @update:model-value="handleChange"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          <Button
            variant="main"
            class="w-full cursor-pointer"
            :disabled="isSubmitting"
          >
            {{
              isAlreadyRated
                ? isSubmitting
                  ? "フィードバックを更新中..."
                  : "フィードバックを更新する"
                : isSubmitting
                ? "フィードバックを送信中..."
                : "フィードバックを送信する"
            }}
          </Button>
        </form>
      </div>
    </div>
  </div>
</template>
