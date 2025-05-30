<script setup lang="ts">
import type { Notification } from "@/types/notifications.type";
import { format } from "date-fns";
import { toast } from "vue-sonner";

const router = useRouter();
const colorMode = useColorMode();
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const store = useStore();
const isOpen = ref<boolean>(false);
const pageMenu = [
  {
    name: "ダッシュボード",
    link: "/dashboard",
    icon: "mdi:home",
  },
  {
    name: "マイプロジェクト",
    link: "/my-projects",
    icon: "mdi:folder",
  },
  {
    name: "新規プロジェクト作成",
    link: "/create-project",
    icon: "mdi:plus-circle-outline",
  },
  {
    name: "みんなのプロジェクト",
    link: "/projects",
    icon: "mdi:earth",
  },
  {
    name: "各種設定",
    link: "/settings/account",
    icon: "mdi:cog-outline",
  },
];
const unreadNotifications = ref<Notification[]>([]);

// for active link - changed to computed property for reactivity
const isActive = (path: string) => {
  if (path === "/") {
    return router.currentRoute.value.path === path;
  }

  if (path.includes("settings")) {
    return router.currentRoute.value.path.includes("settings");
  }

  return router.currentRoute.value.path.includes(path);
};

// for logout
const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Logout error:", error);
    toast.error("ログアウトに失敗しました");
    return;
  } else {
    window.location.href = "/confirm";
  }
};

// get unread notifications
async function fetchUnreadNotifications() {
  const { data, error } = await supabase.rpc("get_user_notifications", {
    p_user_id: user.value?.id,
    p_unread_only: true,
  });

  if (error) {
    console.error("通知の取得に失敗しました:", error);
    return [];
  }

  return data.notifications || [];
}

// read notifications post
async function markNotificationAsRead(notificationId: string) {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId);

  if (error) {
    console.error("通知の既読処理に失敗しました:", error);
    return false;
  }

  unreadNotifications.value = await fetchUnreadNotifications();

  return true;
}

// subscribe to notifications
supabase
  .channel("custom-insert-channel")
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "notifications",
      filter: `user_id=eq.${user.value?.id}`,
    },
    async (payload) => {
      unreadNotifications.value = await fetchUnreadNotifications();
    }
  )
  .subscribe();

onMounted(async () => {
  if (user.value) {
    unreadNotifications.value = await fetchUnreadNotifications();
  }
});
</script>

<template>
  <header
    class="flex items-center justify-between p-2 px-4 md:p-4 w-full fixed top-0 shadow-md z-10 bg-background border-b"
  >
    <NuxtLink to="/">
      <h1 class="text-xl md:text-2xl font-bold gradient-text">FeedForward</h1>
    </NuxtLink>

    <!-- loading bar -->
    <NuxtLoadingIndicator
      :color="'#8658e1'"
      :height="4"
      :duration="5000"
      :throttle="0"
    />

    <!-- page menus -->
    <NavigationMenu v-if="user" class="md:flex hidden">
      <NavigationMenuList>
        <NavigationMenuItem v-for="menu in pageMenu" :key="menu.name">
          <NuxtLink
            :to="menu.link"
            :class="[
              isActive(menu.link)
                ? 'bg-purple dark:bg-purple/40 text-white hover:bg-purple hover:text-white focus:bg-purple focus:text-white'
                : 'text-foreground hover:bg-purple/10 hover:text-purple focus:bg-purple/10 focus:text-purple',
            ]"
            class="px-4 py-2 rounded-md dark:text-white flex items-center gap-1 text-sm"
          >
            <Icon :name="menu.icon" class="!size-5" />
            {{ menu.name }}
          </NuxtLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>

    <!-- right menu -->
    <div class="items-center gap-1 md:gap-2 flex">
      <!-- notification menu -->
      <DropdownMenu v-if="user">
        <DropdownMenuTrigger as-child>
          <Button
            :variant="'ghost'"
            class="cursor-pointer rounded-full relative"
            size="icon"
          >
            <Icon
              name="solar:bell-line-duotone"
              class="dark:text-white text-black !size-5 flex"
            />
            <Badge
              v-if="unreadNotifications.length > 0"
              variant="destructive"
              class="absolute top-0 right-0 rounded-full p-0 w-4 h-4 flex items-center justify-center text-xs text-white"
            >
              {{ unreadNotifications.length }}
            </Badge>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="bottom"
          align="end"
          :side-offset="4"
          :align-offset="0"
          class="w-64 md:w-96"
        >
          <DropdownMenuLabel>通知一覧</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            v-for="notification in unreadNotifications"
            :key="notification.id"
            class="cursor-pointer"
          >
            <NuxtLink
              :to="`/my-projects/${notification.metadata.project_short_id}/details`"
              @click="markNotificationAsRead(notification.id)"
            >
              <div class="flex items-start gap-4">
                <Avatar :size="'sm'" class="cursor-pointer">
                  <AvatarImage
                    v-if="notification.metadata.provider_avatar_url"
                    :src="notification.metadata.provider_avatar_url"
                    alt="avatar"
                  />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div
                  v-if="notification.type === 'deadline_expired'"
                  class="flex flex-col gap-1"
                >
                  <p>
                    {{ notification.message }}
                  </p>
                  <span class="text-xs text-muted-foreground">
                    {{ format(notification.created_at, "yyyy/MM/dd") }}
                  </span>
                </div>
                <div
                  v-if="notification.type === 'feedback_received'"
                  class="flex flex-col gap-1"
                >
                  <p>
                    {{
                      notification.metadata.provider_display_name
                        ? notification.metadata.provider_display_name
                        : "Unknown User"
                    }}
                    さんから
                    {{ notification.message }}
                  </p>
                  <span class="text-xs text-muted-foreground">
                    {{ format(notification.created_at, "yyyy/MM/dd") }}
                  </span>
                </div>
                <div
                  v-if="notification.type === 'project_active'"
                  class="flex flex-col gap-1"
                >
                  <p>
                    {{ notification.message }}
                  </p>
                  <span class="text-xs text-muted-foreground">
                    {{ format(notification.created_at, "yyyy/MM/dd") }}
                  </span>
                </div>
                <div
                  v-if="notification.type === 'feedback_rated'"
                  class="flex flex-col gap-1"
                >
                  <p>
                    {{ notification.message }}
                  </p>
                  <span class="text-xs text-muted-foreground">
                    {{ format(notification.created_at, "yyyy/MM/dd") }}
                  </span>
                </div>
              </div>
            </NuxtLink>
          </DropdownMenuItem>
          <DropdownMenuItem v-if="unreadNotifications.length === 0">
            現在通知はありません
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <!-- avatar menu -->
      <DropdownMenu v-if="user">
        <DropdownMenuTrigger as-child>
          <Avatar :size="'sm'" class="cursor-pointer">
            <AvatarImage :src="store.profile.avatar_url" alt="avatar" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="bottom"
          align="end"
          :side-offset="4"
          :align-offset="0"
          class="min-w-56"
        >
          <div class="flex flex-col gap-1 p-2">
            <p class="text-sm">{{ store.profile.display_name }}</p>
            <p class="text-sm">{{ store.profile.email }}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            v-if="colorMode.preference === 'light'"
            @click="colorMode.preference = 'dark'"
            class="cursor-pointer"
          >
            <Icon name="radix-icons:moon" class="size-4" />
            Dark mode
          </DropdownMenuItem>
          <DropdownMenuItem
            v-else-if="colorMode.preference === 'dark'"
            @click="colorMode.preference = 'light'"
            class="cursor-pointer"
          >
            <Icon name="radix-icons:sun" class="size-4" />
            light mode
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            class="cursor-pointer text-destructive-foreground hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive-foreground"
            @click="logout"
          >
            <Icon name="mdi:logout" class="size-4" />
            ログアウト
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <!-- signIn and login buttons  -->
      <div v-if="!user" class="flex items-center gap-2 md:gap-6">
        <Button
          :variant="'ghost'"
          class="cursor-pointer p-2 h-fit"
          @click="
            colorMode.preference =
              colorMode.preference === 'dark' ? 'light' : 'dark'
          "
        >
          <Icon
            v-if="colorMode.preference === 'dark'"
            name="solar:sun-bold-duotone"
            class="dark:text-white text-black !size-5 flex md:hidden"
          />
          <Icon
            v-else-if="colorMode.preference === 'light'"
            name="solar:moon-bold-duotone"
            class="dark:text-white text-black !size-5 hidden md:flex"
          />
        </Button>
        <div class="flex items-center gap-2">
          <Button
            :variant="'main'"
            class="py-1 md:py-4 h-fit md:h-9 rounded-sm"
            as-child
          >
            <NuxtLink
              :to="{
                name: 'login',
                query: {
                  tab: 'signup',
                },
              }"
            >
              新規登録
            </NuxtLink>
          </Button>
          <Button
            :variant="'mainOutline'"
            class="py-1 md:py-4 h-fit md:h-9 hidden md:flex rounded-sm"
            as-child
          >
            <NuxtLink
              :to="{
                name: 'login',
                query: {
                  tab: 'signin',
                },
              }"
            >
              ログイン
            </NuxtLink>
          </Button>
        </div>
      </div>

      <!-- hamburger menu -->
      <Sheet :open="isOpen" @update:open="isOpen = $event">
        <SheetTrigger v-if="user" as-child>
          <Button
            :variant="'ghost'"
            class="cursor-pointer rounded-full flex md:hidden"
            size="icon"
            @click="isOpen = true"
          >
            <Icon
              name="solar:hamburger-menu-linear"
              class="dark:text-white text-black !size-5 flex"
            />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle class="text-xl md:text-2xl font-bold gradient-text">
              FeedForward
            </SheetTitle>
          </SheetHeader>

          <nav class="space-y-4 w-full p-4">
            <div v-for="menu in pageMenu" :key="menu.name" class="w-full">
              <NuxtLink
                :to="menu.link"
                :class="[
                  'flex items-center w-full px-4 py-3 rounded-md transition-colors duration-200 text-sm gap-2',
                  isActive(menu.link)
                    ? 'bg-purple dark:bg-purple/40 text-white font-medium'
                    : 'text-black dark:text-white hover:bg-purple/10 hover:text-purple',
                ]"
                @click="isOpen = false"
              >
                <Icon :name="menu.icon" class="!size-4" />
                {{ menu.name }}
              </NuxtLink>
            </div>
          </nav>

          <Separator />

          <div class="p-4">
            <Button
              :variant="'ghost'"
              class="cursor-pointer w-full justify-center text-destructive hover:bg-destructive/10 hover:text-destructive"
              @click="logout"
            >
              <Icon name="mdi:logout" class="size-4 mr-2" />
              ログアウト
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  </header>
</template>
