export default defineNuxtRouteMiddleware(async (to, _from) => {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();

  // for redirecting to setup page if user is not set up
  try {
    const { data: userData, error } = await supabase.rpc("get_current_user");
    if (error) {
      console.error("Error fetching user data:", error);
    }

    if (user.value && !userData?.display_name && to.path !== "/setup") {
      return navigateTo("/setup");
    } else if (user.value && userData?.display_name && to.path === "/setup") {
      return navigateTo("/");
    }
  } catch (err) {
    console.error("Exception in auth middleware:", err);
  }
});
