// server/api/retrieve-subscription.ts
import Stripe from "stripe";

// for Stripe subscription object with plan nickname
interface StripeSubscriptionWithPlan extends Stripe.Subscription {
  plan: {
    nickname: string;
  };
}

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const sessionId = query.sessionId as string;

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

    // セッション情報を取得
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });

    const subscription = session.subscription as StripeSubscriptionWithPlan;

    return {
      plan: subscription.plan?.nickname,
      status: subscription?.status,
      startDate: subscription?.start_date,
    };
  } catch (error: any) {
    return createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }
});
