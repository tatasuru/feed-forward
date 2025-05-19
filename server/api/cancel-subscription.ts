import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async (event) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  const supabase = createClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string
  );

  try {
    const body = await readBody(event);
    const { subscriptionId } = body;

    if (!subscriptionId) {
      throw new Error("subscriptionId is required");
    }

    // cancel the subscription
    const canceledSubscription = await stripe.subscriptions.update(
      subscriptionId,
      {
        cancel_at_period_end: true,
      }
    );

    // update the subscription in Supabase
    const { error } = await supabase
      .from("subscriptions")
      .update({
        cancel_at_period_end: canceledSubscription.cancel_at_period_end,
        canceled_at: canceledSubscription.canceled_at
          ? new Date(canceledSubscription.canceled_at * 1000)
          : null,
        status: canceledSubscription.status,
      })
      .eq("stripe_subscription_id", subscriptionId);

    if (error) {
      console.error("Supabase update error:", error);
      throw new Error("Failed to update subscription in Supabase");
    }

    return {
      message: "Subscription cancellation scheduled successfully.",
    };
  } catch (error: any) {
    console.error("Subscription cancellation failed:", error);
    return sendError(
      event,
      createError({
        statusCode: 500,
        statusMessage: error.message,
      })
    );
  }
});
