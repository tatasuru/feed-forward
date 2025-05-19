// composables/useStripe.ts
import { loadStripe } from "@stripe/stripe-js";
import type { Stripe } from "@stripe/stripe-js";

// ストライプインスタンスをキャッシュするための変数
let stripeInstance: Stripe | null = null;

export const useStripe = () => {
  const getStripe = async (): Promise<Stripe | null> => {
    // すでにインスタンスがある場合は再利用
    if (stripeInstance) return stripeInstance;

    // setup関数の中でのみuseRuntimeConfigを呼び出せるため、
    // コンポーネントやページで使用されることを想定
    const config = useRuntimeConfig();
    const stripeApiKey = config.public.stripeApiKey;

    // Stripeを初期化
    stripeInstance = await loadStripe(stripeApiKey as string);
    return stripeInstance;
  };

  return {
    getStripe,
  };
};
