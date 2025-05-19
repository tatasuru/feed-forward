<script setup lang="ts">
import SettingLayout from "@/components/layout/SettingLayout.vue";
import { toast } from "vue-sonner";

definePageMeta({
  middleware: "auth",
  title: "プラン設定",
  description:
    "Feed Forwardのプラン設定ページです。プラン変更や利用状況の確認ができます。",
  ogTitle: "Feed Forward プラン設定",
  ogDescription:
    "Feed Forwardのプラン設定ページです。プラン変更や利用状況の確認ができます。",
  twitterCard: "summary_large_image",
});

type UserSubscription = {
  id: string;
  supabase_user_id: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  status: string;
  price_id: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  canceled_at: string;
  product_name: string;
  price: number;
  currency: string;
};

const user = useSupabaseUser();
const supabase = useSupabaseClient();
const isLoading = ref<boolean>(false);
const isCreateSubscribe = ref<boolean>(false);
const isCancelSubscribe = ref<boolean>(false);
const userSubscription = ref<UserSubscription>();
const formatDate = (date: string) => {
  return date.replace(/-/g, "/").replace(/T.+/, "");
};
const formatter = new Intl.NumberFormat("ja-JP");

/*********************************
 * LIFECYCLE
 ********************************/
const subscription = await getUserSubscription();
if (subscription) {
  userSubscription.value = subscription[0];
}

async function getUserSubscription() {
  try {
    isLoading.value = true;

    const { data: userSubscription, error } = await supabase.rpc(
      "get_subscription_by_user_id",
      { user_id: user.value?.id }
    );

    if (error) throw new Error(error.message);

    isLoading.value = false;

    return userSubscription;
  } catch (error) {
    console.error("Error fetching projects:", error);
    return null;
  }
}

/********************************
 * Stripe
 ********************************/
const { getStripe } = useStripe();

// create a Stripe Checkout Session
const handleCheckout = async () => {
  isCreateSubscribe.value = true;

  // 1. create a Checkout Session
  const { data } = await useFetch<{
    sessionId: string;
  }>("/api/create-subscription-checkout", {
    method: "POST",
    body: {
      priceId: "price_1RQMQXPvIgYbVbMx2rLb4kh1",
      supabaseUserId: user.value?.id,
    },
  });

  // 2. redirect to Checkout
  if (data.value && data.value.sessionId) {
    // instantiate Stripe.js
    const stripe = await getStripe();

    if (stripe) {
      // redirect to Checkout
      await stripe.redirectToCheckout({
        sessionId: data.value.sessionId,
      });
    }

    isCreateSubscribe.value = false;
  }
};

// cancel subscription
const handleCancel = async () => {
  isCancelSubscribe.value = true;

  const { data } = await useFetch<{
    message: string;
  }>("/api/cancel-subscription", {
    method: "POST",
    body: {
      subscriptionId: userSubscription.value?.stripe_subscription_id,
    },
  });

  if (data.value && data.value.message) {
    // Handle the response message
    const subscription = await getUserSubscription();
    if (subscription) {
      userSubscription.value = subscription;
    }
    toast.success("サブスクリプションをキャンセルしました");
    isCancelSubscribe.value = false;
  } else {
    // Handle error
    toast.error("サブスクリプションのキャンセルに失敗しました");
    console.error("Error canceling subscription");
    isCancelSubscribe.value = false;
  }
};
</script>

<template>
  <SettingLayout>
    <div class="flex flex-col gap-8 md:gap-8">
      <div class="flex flex-col gap-4">
        <PageTitle
          title="プラン設定"
          description="プランの設定を行います"
          size="small"
        />
        <Separator />
      </div>

      <div class="flex flex-col gap-4">
        <!-- details -->
        <Card v-if="!isLoading">
          <CardContent class="flex flex-col md:flex-row justify-between gap-4">
            <div class="flex items-center gap-4">
              <NuxtImg
                src="logo.png"
                alt="plan"
                class="w-16 h-16 rounded-full object-cover"
                width="64"
                height="64"
              />
              <div class="flex flex-col gap-2">
                <div class="flex flex-col gap-px">
                  <h3 class="text-base font-bold">
                    {{
                      userSubscription?.product_name
                        ? userSubscription?.product_name
                        : "フリープラン"
                    }}
                  </h3>
                  <span class="text-sm gradient-text font-bold">
                    {{
                      userSubscription?.price
                        ? `${formatter.format(userSubscription?.price)} 円 / 月`
                        : "無料"
                    }}
                  </span>
                </div>
                <span
                  v-if="
                    userSubscription?.current_period_end &&
                    !userSubscription?.cancel_at_period_end
                  "
                  class="text-xs text-muted-foreground"
                >
                  サブスクリプションは
                  {{ formatDate(userSubscription?.current_period_end) }}
                  に自動更新されます。
                </span>
                <span v-if="userSubscription?.cancel_at_period_end">
                  <span class="text-xs text-destructive-foreground">
                    サブスクリプションは
                    {{ formatDate(userSubscription?.current_period_end) }}
                    にキャンセルされます。
                  </span>
                </span>
              </div>
            </div>
            <Button
              v-if="userSubscription?.product_name !== 'スタータープラン'"
              @click="handleCheckout"
              variant="main"
              class="cursor-pointer text-sm md:min-w-[150px]"
              :disabled="
                userSubscription?.cancel_at_period_end || isCreateSubscribe
              "
            >
              {{ isCreateSubscribe ? "処理中..." : "スタータープランへ" }}
            </Button>
            <Button
              v-if="userSubscription?.product_name === 'スタータープラン'"
              variant="mainOutline"
              class="cursor-pointer text-sm md:min-w-[150px]"
              :disabled="
                userSubscription?.cancel_at_period_end || isCreateSubscribe
              "
            >
              {{ isCreateSubscribe ? "処理中..." : "プランを変更" }}
            </Button>
          </CardContent>
        </Card>

        <Skeleton v-if="isLoading" class="h-[200px] md:h-[130px] w-full" />

        <!-- cancel -->
        <Card>
          <CardContent class="flex flex-col md:flex-row justify-between gap-4">
            <div class="flex flex-col gap-px">
              <h3 class="text-base font-bold">
                サブスクリプションのキャンセル
              </h3>
              <p class="text-sm text-muted-foreground">
                サブスクリプションをキャンセルする場合は、キャンセルボタンをクリックしてください。
              </p>
            </div>
            <Button
              variant="outline"
              class="cursor-pointer text-sm text-destructive-foreground border-destructive hover:bg-destructive/10 hover:text-destructive-foreground md:min-w-[120px]"
              @click="handleCancel"
              :disabled="
                userSubscription?.cancel_at_period_end ||
                !userSubscription ||
                isCancelSubscribe
              "
            >
              {{ isCancelSubscribe ? "処理中..." : "キャンセル" }}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  </SettingLayout>
</template>
