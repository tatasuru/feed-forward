// server/api/create-subscription-checkout.ts
import Stripe from "stripe";

export default defineEventHandler(async (event) => {
  try {
    // リクエストボディを取得
    const body = await readBody(event);
    const { priceId, supabaseUserId } = body;

    // initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

    // const customer = await stripe.customers.create({
    //   metadata: {
    //     supabase_user_id: supabaseUserId,
    //   },
    // });

    // create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      // customer: customer.id,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.BASE_URL}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.BASE_URL}/subscription-cancel`,
      metadata: {
        supabase_user_id: supabaseUserId,
      },
    });

    return { sessionId: session.id } as { sessionId: string };
  } catch (error: any) {
    return createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }
});
