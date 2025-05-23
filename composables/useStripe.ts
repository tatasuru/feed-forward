// composables/useStripe.ts
import { loadStripe } from "@stripe/stripe-js";
import type { Stripe } from "@stripe/stripe-js";

let stripeInstance: Stripe | null = null;

export const useStripe = () => {
  const getStripe = async (): Promise<Stripe | null> => {
    if (stripeInstance) return stripeInstance;

    const config = useRuntimeConfig();
    const stripeApiKey = config.public.stripeApiKey;

    stripeInstance = await loadStripe(stripeApiKey as string);
    return stripeInstance;
  };

  return {
    getStripe,
  };
};
