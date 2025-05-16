export default defineNuxtRouteMiddleware(async (to, _from) => {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();
  const store = useStore();

  // Check if the user is authenticated
  if (user.value) {
    // Handle profile setup for authenticated users
    try {
      let userData;

      // Fetch user data if not already in store
      if (store.profile.email === "") {
        const { data, error } = await supabase.rpc("get_current_user");
        if (error) {
          console.error("Error fetching user data:", error);
          return;
        }

        userData = data;
        store.profile = {
          display_name: data.display_name,
          email: data.email,
          avatar_url: data.avatar_url,
          bio: data.bio,
          website: data.website,
        };
      } else {
        userData = store.profile;
      }

      // Check if user needs to complete setup (only for non-project routes when authenticated)
      if (!userData?.display_name && to.path !== "/setup") {
        console.log("Redirecting to setup - missing display_name");
        return navigateTo("/setup");
      }

      // Redirect away from setup if profile is complete
      if (userData?.display_name && to.path === "/setup") {
        return navigateTo("/");
      }
    } catch (err) {
      console.error("Exception in auth middleware:", err);
    }
  }
});
