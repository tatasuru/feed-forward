<script setup lang="ts">
const router = useRouter();
const colorMode = useColorMode();
const supabase = useSupabaseClient();
const store = useStore();
const isOpen = ref<boolean>(false);

const pageMenu = [
  {
    name: "ダッシュボード",
    link: "/",
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
  // {
  //   name: "DISCOVERY",
  //   link: "/discovery",
  // },
  // {
  //   name: "ANALYTICS",
  //   link: "/analytics",
  // },
];

// for active link - changed to computed property for reactivity
const isActive = (path: string) => {
  return router.currentRoute.value.path === path;
};

// for logout
const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Logout error:", error);
  } else {
    window.location.href = "/login";
  }
};
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
    <NavigationMenu class="md:flex hidden">
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
    <div class="items-center gap-1 md:gap-2 flex">
      <Button
        :variant="'ghost'"
        class="cursor-pointer rounded-full"
        size="icon"
      >
        <Icon
          name="solar:bell-line-duotone"
          class="dark:text-white text-black !size-5 flex"
        />
      </Button>

      <DropdownMenu>
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
          class="w-56"
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
            class="cursor-pointer text-destructive hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive"
            @click="logout"
          >
            <Icon name="mdi:logout" class="size-4" />
            ログアウト
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <!-- hamburger menu -->
      <Sheet :open="isOpen" @update:open="isOpen = $event">
        <SheetTrigger as-child>
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
            <!-- <SheetDescription /> -->
          </SheetHeader>

          <nav class="space-y-4 w-full p-4">
            <div v-for="menu in pageMenu" :key="menu.name" class="w-full">
              <NuxtLink
                :to="menu.link"
                :class="[
                  'flex items-center w-full px-4 py-3 rounded-md transition-colors duration-200 text-sm',
                  isActive(menu.link)
                    ? 'bg-purple dark:bg-purple/40 text-white font-medium'
                    : 'text-black dark:text-white hover:bg-purple/10 hover:text-purple',
                ]"
                @click="isOpen = false"
              >
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
