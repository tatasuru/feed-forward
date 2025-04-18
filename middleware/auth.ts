export default defineNuxtRouteMiddleware((to, _from) => {
  const user = useSupabaseUser();
  const store = useStore();

  if (!user.value && to.path !== "/login") {
    return navigateTo("/login");
  }

  if (user.value && to.path === "/login") {
    return navigateTo("/");
  }
});
