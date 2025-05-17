<script setup lang="ts">
import type { ProjectWithFeedback } from "@/types/projects.types";
import { format } from "date-fns";
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
  twitterCard: "summary_large_image",
});

const { id } = useRoute().params;
const supabase = useSupabaseClient();
const supabaseUser = useSupabaseUser();
const preview = computed(() => {
  return (
    linkPreview.value || {
      title: "No Title",
      description: "No Description",
      images: [],
    }
  );
});
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
    title: string;
    criteria_id: string;
    rating: number;
  }[]
>([]);
const isOwner = computed(() => {
  return projectWithFeedback.value?.owner.id === supabaseUser.value?.id;
});
const isUserLoggedIn = computed(() => {
  return supabaseUser.value ? true : false;
});

const { getRatingPerCriteria } = useRatingCalculation();
const { getSessionId, setFeedbackId } = useSessionId();

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
      const { data, error } = await supabase.rpc(
        "get_project_with_feedback_by_short_id",
        {
          p_short_id: id,
        }
      );

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

const { data: linkPreview, pending } = await useLazyAsyncData(
  "linkPreviewForProject",
  async () => {
    try {
      if (!projectDetails.value) return;

      if (!projectDetails.value.project.resource_url) {
        return {
          title: "No Title",
          description: "No Description",
          images: [],
        };
      }

      const encodedUrl = encodeURIComponent(
        projectDetails.value.project.resource_url
      );
      const { data, error } = await useFetch<{
        title: string;
        description: string;
        images: string[];
      }>(`/api/link-preview?url=${encodedUrl}`);

      if (error.value) {
        console.error("Error fetching link preview:", error.value);
        return {
          title: "No Title",
          description: "No Description",
          images: [],
        };
      }

      return {
        title: data.value?.title || "No Title",
        description: data.value?.description || "No Description",
        images: data.value?.images || [],
      };
    } catch (error) {
      console.error("Error fetching link preview:", error);
      return {
        title: "No Title",
        description: "No Description",
        images: [],
      };
    }
  },
  {
    server: true,
    watch: [projectDetails],
  }
);

const { data: userFeedbackData } = await useAsyncData(
  "userFeedbackData",
  async () => {
    if (!projectDetails.value)
      return {
        exists: false,
        feedback: null,
        initialValues: {
          overallComment: "",
          isAnonymous: false,
          ratings: {},
        },
      };

    try {
      // 1.get user feedback
      const userFeedBack = await checkExistingFeedback();

      // 2. set loading to false
      isLoading.value = false;

      return userFeedBack;
    } catch (error) {
      console.error("Error fetching related data:", error);
      return {
        exists: false,
        feedback: null,
        initialValues: {
          overallComment: "",
          isAnonymous: false,
          ratings: {},
        },
      };
    }
  },
  {
    server: true,
  }
);

watch(
  userFeedbackData,
  async (newData) => {
    // for handling the case when user is not logged in
    if (projectDetails.value.project.status !== "active") {
      await navigateTo("/");
      return;
    }

    if (!newData) {
      form.setFieldValue("isAnonymous", isUserLoggedIn.value ? false : true);
      return;
    }

    // 1. set rating per criteria
    ratingPerCriteria.value = getRatingPerCriteria(projectWithFeedback.value);

    // 2. set initial values for ratings
    const initialRatings: Record<number, number> = {};
    projectWithFeedback.value?.evaluation_criteria.forEach((_, index) => {
      initialRatings[index] = -1;
      hoverStarIndexObj.value[index] = -1;
    });

    if (newData.exists && newData.feedback?.ratings) {
      const ratingsByCriteriaId: Record<string, any> = {};
      newData.feedback.ratings.forEach((rating: any) => {
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
      newData.feedback?.overall_comment || ""
    );
    form.setFieldValue("isAnonymous", newData.feedback?.is_anonymous || false);
    form.setFieldValue("ratings", initialRatings);
  },
  { immediate: true }
);

/******************************
 * FORM ACTIONS
 ******************************/
async function submitFeedback(values: {
  overallComment: string;
  isAnonymous: boolean;
  ratings: Record<number, number>;
}) {
  try {
    const sessionId = getSessionId();
    const ratingsObject: Record<string, number> = {};

    // initialize ratingsObject with the project ID
    projectWithFeedback.value.evaluation_criteria.forEach((criteria, index) => {
      const rating = values.ratings[index];
      if (rating && rating > 0) {
        ratingsObject[criteria.id] = Number(rating);
      }
    });

    if (supabaseUser.value?.id) {
      if (isAlreadyRated.value) {
        return await submitUpdateFeedbackWithExistUser(values, ratingsObject);
      } else {
        // submit feedback
        return await submitNewFeedbackWithExistUser(
          values,
          ratingsObject,
          sessionId
        );
      }
    } else {
      if (isAlreadyRated.value) {
        return await submitUpdateFeedbackWithAnonymousUser(
          values,
          ratingsObject,
          sessionId
        );
      } else {
        return await submitNewFeedbackWithAnonymousUser(
          values,
          ratingsObject,
          sessionId
        );
      }
    }
  } catch (error) {
    console.error("フィードバック保存中にエラーが発生しました:", error);
    throw error;
  }
}

async function submitNewFeedbackWithExistUser(
  values: {
    overallComment: string;
    isAnonymous: boolean;
    ratings: Record<number, number>;
  } = {
    overallComment: "",
    isAnonymous: false,
    ratings: {},
  },
  ratingsObject: Record<string, number> = {},
  sessionId: string
) {
  // submit feedback
  const { data, error } = await supabase.rpc(
    "save_feedback_with_ratings_by_short_id",
    {
      p_short_id: id,
      p_user_id: supabaseUser.value?.id || null,
      p_comment: values.overallComment,
      p_is_anonymous: values.isAnonymous,
      p_ratings: ratingsObject,
      p_session_id: sessionId,
    }
  );

  if (error) {
    console.error("RPC呼び出しエラー:", error);
    throw error;
  }

  if (data.success) {
    setFeedbackId(id as string, data.feedback_id);
  }

  return data.feedback_id;
}

async function submitUpdateFeedbackWithExistUser(
  values: {
    overallComment: string;
    isAnonymous: boolean;
    ratings: Record<number, number>;
  } = {
    overallComment: "",
    isAnonymous: false,
    ratings: {},
  },
  ratingsObject: Record<string, number> = {}
) {
  // submit feedback
  const { data, error } = await supabase.rpc("update_feedback_with_ratings", {
    p_feedback_id: currentFeedbackId.value,
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

async function submitNewFeedbackWithAnonymousUser(
  values: {
    overallComment: string;
    isAnonymous: boolean;
    ratings: Record<number, number>;
  } = {
    overallComment: "",
    isAnonymous: false,
    ratings: {},
  },
  ratingsObject: Record<string, number> = {},
  sessionId: string
) {
  // submit feedback
  const { data, error } = await supabase.rpc(
    "save_feedback_with_ratings_by_short_id",
    {
      p_short_id: id,
      p_user_id: supabaseUser.value?.id || null,
      p_comment: values.overallComment,
      p_is_anonymous: values.isAnonymous,
      p_ratings: ratingsObject,
      p_session_id: sessionId,
    }
  );

  if (error) {
    console.error("RPC呼び出しエラー:", error);
    throw error;
  }

  if (data.success) {
    setFeedbackId(id as string, data.feedback_id);
  }

  return data.feedback_id;
}

async function submitUpdateFeedbackWithAnonymousUser(
  values: {
    overallComment: string;
    isAnonymous: boolean;
    ratings: Record<number, number>;
  } = {
    overallComment: "",
    isAnonymous: false,
    ratings: {},
  },
  ratingsObject: Record<string, number> = {},
  sessionId: string
) {
  const { data, error } = await supabase.rpc(
    "update_feedback_with_ratings_by_session",
    {
      p_short_id: id,
      p_session_id: sessionId,
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
}

/******************************
 * HELPER FUNCTIONS
 ******************************/
async function checkExistingFeedback() {
  try {
    if (supabaseUser.value?.id) {
      const { data, error } = await supabase.rpc(
        "check_user_feedback_by_short_id",
        {
          p_short_id: id,
          p_user_id: supabaseUser.value?.id,
        }
      );

      if (error) {
        console.error("フィードバック確認エラー:", error);
        throw error;
      }

      if (data.exists) {
        currentFeedbackId.value = data.feedback_id;
        return await getUserFeedback();
      }

      return {
        exists: false,
        feedback: null,
        initialValues: {
          overallComment: "",
          isAnonymous: false,
          ratings: {},
        },
      };
    } else {
      const sessionId = getSessionId();
      const { data, error } = await supabase.rpc(
        "check_feedback_by_session_and_short_id",
        {
          p_short_id: id,
          p_session_id: sessionId,
        }
      );

      if (error) throw error;

      if (data.exists) {
        currentFeedbackId.value = data.feedback_id;
        return await getAnonymousFeedback(sessionId);
      }
    }
    return null;
  } catch (error) {
    console.error("フィードバック確認中にエラーが発生しました:", error);
    throw error;
  }
}

async function getUserFeedback() {
  try {
    const { data, error } = await supabase.rpc(
      "get_user_provided_feedback_by_short_id",
      {
        p_user_id: supabaseUser.value?.id,
        p_short_id: id,
      }
    );

    if (error) {
      console.error("フィードバック取得エラー:", error);
      throw error;
    }

    if (data) {
      return buildFeedbackResponse(data.feedbacks[0]);
    }

    return {
      exists: false,
      feedback: null,
      initialValues: {
        overallComment: "",
        isAnonymous: false,
        ratings: {},
      },
    };
  } catch (error) {
    console.error("フィードバック取得中にエラーが発生しました:", error);
    throw error;
  }
}

async function getAnonymousFeedback(sessionId: string) {
  try {
    const { data, error } = await supabase.rpc(
      "get_feedback_by_session_and_short_id",
      {
        p_short_id: id,
        p_session_id: sessionId,
      }
    );

    if (error) throw error;

    if (data.exists) {
      return buildFeedbackResponse(data.feedback);
    }

    return {
      exists: false,
      feedback: null,
      initialValues: {
        overallComment: "",
        isAnonymous: false,
        ratings: {},
      },
    };
  } catch (error) {
    console.error("匿名フィードバック取得中にエラーが発生しました:", error);
    throw error;
  }
}

function buildFeedbackResponse(feedback: {
  overall_comment: string;
  is_anonymous: boolean;
  ratings: Array<{
    criteria_id: string;
    rating: number;
  }>;
}) {
  const initialValues: Record<string, any> = {
    overallComment: feedback.overall_comment || "",
    isAnonymous: feedback.is_anonymous || false,
    ratings: {},
  };

  // set initial values for ratings
  if (feedback.ratings && feedback.ratings.length > 0) {
    projectWithFeedback.value.evaluation_criteria.forEach((criteria, index) => {
      const matchingRating = feedback.ratings.find(
        (rating: any) => rating.criteria_id === criteria.id
      );

      if (matchingRating) {
        initialValues.ratings[index] = matchingRating.rating;
      } else {
        initialValues.ratings[index] = -1;
      }
    });
  }

  return {
    exists: true,
    feedback: feedback,
    initialValues: initialValues,
  };
}
</script>

<template>
  <div id="projects" class="grid w-full gap-8">
    <div
      v-if="projectWithFeedback?.project"
      class="flex flex-col gap-4 items-start justify-between"
    >
      <Button
        v-if="isUserLoggedIn"
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
                  target="_blank"
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
            <div
              v-if="projectWithFeedback.project.description"
              v-html="projectWithFeedback.project.description"
              class="prose prose-sm project-description text-sm"
            />
            <p v-else class="text-sm text-muted-foreground leading-5">
              説明文がありません
            </p>
          </div>

          <!-- feedback subject  -->
          <div class="flex flex-col gap-4 w-full">
            <PageTitle title="フィードバック対象" size="small" />
            <NuxtLink
              v-if="linkPreview"
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

            <div v-if="pending">
              <Skeleton class="h-[300px] md:h-[470px] rounded-sm" />
            </div>
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
                <div class="flex justify-between items-end">
                  <div class="flex flex-col gap-px max-w-4/6">
                    <p class="text-sm">{{ criteria.name }}</p>
                    <p class="text-xs text-muted-foreground">
                      {{ criteria.description }}
                    </p>
                  </div>
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
        :class="isOwner ? 'pointer-events-none bg-muted' : ''"
      >
        <PageTitle
          title="フィードバックを送る"
          description="このプロジェクトに対するフィードバックを提供してください"
          size="medium"
        />

        <div v-if="isOwner" class="p-4 bg-muted-foreground/20 rounded-md">
          <p class="text-sm text-muted-foreground">
            あなたはこのプロジェクトのオーナーです。<br />
            フィードバックを送信することはできません。
          </p>
        </div>

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
              <span class="text-xs text-muted-foreground">
                {{ criteria.description }}
              </span>
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
                  :disabled="!isUserLoggedIn"
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
