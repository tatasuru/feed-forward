<script setup lang="ts">
const supabase = useSupabaseClient();
const isFirstLogin = ref<boolean>(false);

async function checkFirstLogin() {
  const { data: userData, error } = await supabase.rpc("get_current_user");
  console.log("ユーザー情報:", userData);

  if (error) {
    console.error("ユーザー情報取得エラー:", error);
    return;
  }

  if (!userData.display_name) {
    isFirstLogin.value = true;
    return;
  }

  isFirstLogin.value = false;
  return;
}

onMounted(() => {
  checkFirstLogin();
});
</script>

<template>
  <div>
    <h1>Home</h1>
    <p>
      {{ isFirstLogin ? "初回ログインです。" : "初回ログインではありません。" }}
    </p>
  </div>
</template>
