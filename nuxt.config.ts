// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-04-18",

  app: {
    head: {
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1",
    },
  },

  devtools: { enabled: true },

  ssr: true,

  runtimeConfig: {
    // client side
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY,
      baseUrl: process.env.BASE_URL,
    },
    // server side
    private: {},
  },

  modules: [
    "@nuxt/eslint",
    "@nuxt/fonts",
    "@nuxt/icon",
    "@nuxt/image",
    "@nuxt/scripts",
    "@nuxt/test-utils",
    "shadcn-nuxt",
    "@nuxtjs/color-mode",
    "@nuxtjs/supabase",
    "@formkit/auto-animate/nuxt",
    "@pinia/nuxt",
    "@nuxtjs/device",
  ],

  colorMode: {
    classSuffix: "",
    preference: "dark",
  },

  css: ["~/assets/css/tailwind.css"],

  vite: {
    plugins: [tailwindcss()],
  },

  shadcn: {
    prefix: "",
    componentDir: "./components/shadcn-ui",
  },

  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    redirect: true,
    redirectOptions: {
      login: "/login",
      callback: "/confirm",
      include: undefined,
      exclude: ["/login", "/reset-password", "/update-password"],
      cookieRedirect: false,
    },
    // cookieOptions: {
    //   maxAge: 60 * 60 * 8,
    //   sameSite: "lax",
    //   secure: true,
    // },
  },

  pinia: {
    storesDirs: ["./stores/**"],
  },

  image: {
    dir: "assets/images",
  },
});
