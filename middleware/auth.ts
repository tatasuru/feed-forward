export default defineNuxtRouteMiddleware(async (to, _from) => {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();
  const store = useStore();

  const exceptionPages = [
    "/login",
    "/confirm",
    "/reset-password",
    "/update-password",
    "/setup",
  ];

  let userData;

  // for redirecting to login page if user is not logged in
  if (!user.value && !exceptionPages.includes(to.path)) {
    return navigateTo("/login");
  }

  // for redirecting to setup page if user is not set up
  try {
    if (user.value) {
      if (store.profile.email === "") {
        const { data, error } = await supabase.rpc("get_current_user");
        userData = data;
        store.profile = {
          display_name: data.display_name,
          email: data.email,
          avatar_url: data.avatar_url,
          bio: data.bio,
          website: data.website,
        };

        if (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        userData = store.profile;
      }

      if (!userData?.display_name && to.path !== "/setup") {
        return navigateTo("/setup");
      } else if (user.value && userData?.display_name && to.path === "/setup") {
        return navigateTo("/");
      }
    }
  } catch (err) {
    console.error("Exception in auth middleware:", err);
  }
});
