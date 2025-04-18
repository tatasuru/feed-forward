import { defineStore } from "pinia";

type Profile = {
  display_name: string;
  email: string;
  avatar_url: string;
  bio: string;
  website: string;
};

export const useStore = defineStore("userInfo", () => {
  const profile = ref<Profile>({
    display_name: "",
    email: "",
    avatar_url: "",
    bio: "",
    website: "",
  });

  return { profile };
});
