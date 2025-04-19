export default defineNuxtRouteMiddleware(async (to, _from) => {
  const user = useSupabaseUser();
  const supabase = useSupabaseClient();
  const { data: userData, error } = await supabase.rpc("get_current_user");

  if (!user.value && to.path === "/reset-password") {
    return;
  }

  if (!user.value && to.path !== "/login") {
    return navigateTo("/login");
  }

  if (user.value && to.path === "/login") {
    return navigateTo("/");
  }

  if (user.value && !userData?.display_name && to.path !== "/setup") {
    return navigateTo("/setup");
  }

  if (user.value && userData?.display_name && to.path === "/setup") {
    return navigateTo("/");
  }
});
