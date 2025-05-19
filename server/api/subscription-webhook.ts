import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export default eventHandler(async (event) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  const supabase = createClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string
  );

  const sig = getHeader(event, "stripe-signature") as string;
  const rawBody = await readRawBody(event);

  let stripeEvent: Stripe.Event;

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      rawBody!,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed.", err);
    return sendError(
      event,
      createError({ statusCode: 400, statusMessage: "Invalid signature" })
    );
  }

  const type = stripeEvent.type;

  try {
    switch (type) {
      case "checkout.session.completed": {
        const session = stripeEvent.data.object as Stripe.Checkout.Session;
        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id;

        const supabaseUserId = session.metadata?.supabase_user_id;

        if (!supabaseUserId) {
          console.warn("supabase_user_id が metadata に含まれていません");
          break;
        }

        // get product list
        const lineItems = await stripe.checkout.sessions.listLineItems(
          session.id,
          {
            limit: 1,
          }
        );
        const priceId = lineItems.data[0].price?.id;
        const productId = lineItems.data[0].price?.product as string;
        const product = await stripe.products.retrieve(productId);
        const productName = product.name;

        // get next billing date
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );
        const currentPeriodStart = new Date(
          subscription.items.data[0].current_period_start * 1000
        );
        const currentPeriodEnd = new Date(
          subscription.items.data[0].current_period_end * 1000
        );

        // supabase insert subscriptions table
        const { error } = await supabase.from("subscriptions").insert([
          {
            supabase_user_id: supabaseUserId,
            stripe_subscription_id: session.subscription,
            stripe_customer_id: customerId,
            status: subscription.status,
            price_id: priceId,
            price: lineItems.data[0].price?.unit_amount,
            product_name: productName,
            current_period_start: currentPeriodStart,
            current_period_end: currentPeriodEnd,
            cancel_at_period_end: false,
            canceled_at: null,
          },
        ]);

        if (error) console.error("profiles更新エラー:", error);
        break;
      }

      default:
        console.log(`Unhandled event type ${type}`);
    }
  } catch (error) {
    console.error("Webhook handler failed.", error);
    return sendError(
      event,
      createError({ statusCode: 500, statusMessage: "Webhook handler failed" })
    );
  }

  return { received: true };
});
