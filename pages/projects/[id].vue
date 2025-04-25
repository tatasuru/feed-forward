<script setup lang="ts">
import type { ProjectWithFeedback } from "@/types/projects.types";
import { constructNow, format } from "date-fns";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import * as z from "zod";

const { id } = useRoute().params;
const supabase = useSupabaseClient();
const supabaseUser = useSupabaseUser();
const preview = ref();

const projectWithFeedback = ref<ProjectWithFeedback>({} as ProjectWithFeedback);
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
    // submit feedback
    await submitFeedback(values);
  } catch (error) {
    console.error("Form validation error:", error);
    return;
  }
});

/******************************
 * Lifecycle Hooks
 ******************************/
// Fetch project details and link preview
try {
  projectWithFeedback.value = await getProjectDetails(id as string);
  preview.value = await getLinkPreview(
    projectWithFeedback.value.project.resource_url
  );

  const initialRatings: Record<number, number> = {};

  const userFeedBack = await checkExistingFeedback();
  console.log("userFeedBack", userFeedBack);

  if (userFeedBack?.exists) {
    userFeedBack.feedback.ratings.forEach(
      (rating: { rating: number }, index: number) => {
        initialRatings[index] = rating.rating;
        hoverStarIndexObj.value[index] = rating.rating - 1;
      }
    );
    isAlreadyRated.value = true;
  } else {
    projectWithFeedback.value.evaluation_criteria.forEach((_, index) => {
      initialRatings[index] = -1;
      hoverStarIndexObj.value[index] = -1;
    });
    isAlreadyRated.value = false;
  }

  // Set initial values for ratings
  form.setFieldValue("overallComment", userFeedBack?.feedback.overall_comment);
  form.setFieldValue("isAnonymous", userFeedBack?.feedback.is_anonymous);
  form.setFieldValue("ratings", initialRatings);
} catch (error) {
  console.error("Error fetching project details or link preview:", error);
}

/******************************
 * HELPER FUNCTIONS
 ******************************/
async function getProjectDetails(id: string) {
  try {
    const { data, error } = await supabase.rpc("get_project_with_feedback", {
      p_project_id: id,
    });

    if (error) {
      throw new Error(`Error fetching project details: ${error.message}`);
    }

    return data as ProjectWithFeedback;
  } catch (error) {
    console.error("Error fetching project details:", error);
    throw error;
  }
}

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
    const { data, error } = await supabase.rpc("get_user_feedback", {
      p_project_id: id,
      p_user_id: supabaseUser.value?.id,
    });

    if (error) {
      console.error("フィードバック取得エラー:", error);
      throw error;
    }

    if (data.status === "success") {
      const feedback = data.feedback;

      const initialValues: Record<string, any> = {
        overallComment: feedback.overall_comment || "",
        isAnonymous: feedback.is_anonymous || false,
        ratings: {},
      };

      if (feedback.ratings && feedback.ratings.length > 0) {
        feedback.ratings.forEach((rating: any) => {
          initialValues.ratings[rating.criteria_id] = rating.rating;
        });
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
  const ratings = projectWithFeedback.value.feedback;
  console.log("Ratings:", ratings);

  // if (!ratings || ratings.length === 0) {
  //   return "0.0";
  // }

  // const totalRating = ratings.reduce((acc, rating) => {
  //   return acc + rating.ratings[criteriaId];
  // }, 0);

  // const average = totalRating / ratings.length;

  // return average.toFixed(1);
}
</script>

<template>
  <div id="projects" class="grid w-full gap-8">
    <div
      v-if="projectWithFeedback.project"
      class="flex flex-col gap-4 items-start justify-between"
    >
      <Button as-child variant="ghost">
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
          <span class="text-sm text-muted-foreground">
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
          <span class="text-sm text-muted-foreground">
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
        v-if="projectWithFeedback.project"
        class="flex flex-col gap-8 border border-muted-foreground/20 rounded-lg p-8 w-full"
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
                v-if="preview.images?.[0]"
                :src="preview?.images?.[0] || 'no-image.png'"
                :alt="preview?.title || ''"
                class="object-cover object-center h-52 md:h-96 rounded-t-sm"
              />
              <NuxtImg
                v-else="!preview.images?.[0]"
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
                ) in projectWithFeedback.evaluation_criteria"
                class="flex flex-col gap-2"
              >
                <div class="flex justify-between items-center">
                  <p class="text-sm">{{ criteria.name }}</p>
                  <p class="text-sm">平均: 4.2/5</p>
                </div>
                <Progress
                  :model-value="33"
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
        class="md:sticky top-[90px] flex flex-col gap-8 border border-muted-foreground/20 rounded-lg p-8 min-h-fit h-[calc(100vh-110px)] w-full"
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
            ) in projectWithFeedback.evaluation_criteria"
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
          <Button variant="main" class="w-full cursor-pointer">送信する</Button>
        </form>
      </div>
    </div>
  </div>
</template>
