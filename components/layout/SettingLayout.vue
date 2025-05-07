<script setup lang="ts">
definePageMeta({
  middleware: "auth",
});

const route = useRoute();
const currentPath = computed(() => {
  return route.path;
});

const settingsMenu = [
  {
    name: "アカウント設定",
    link: "/settings/account",
    icon: "mdi:account",
  },
  {
    name: "プラン設定",
    link: "/settings/plan",
    icon: "mdi:credit-card",
  },
  {
    name: "通知設定",
    link: "/settings/notification",
    icon: "mdi:bell",
  },
  {
    name: "セキュリティ設定",
    link: "/settings/security",
    icon: "mdi:shield-check",
  },
];
</script>

<template>
  <div id="settings" class="grid w-full gap-8">
    <PageTitle
      title="各種設定"
      description="アカウントの設定や通知の管理を行います"
      size="large"
    />

    <div class="flex flex-col md:flex-row gap-6 md:gap-12 items-start">
      <!-- left -->
      <NavigationMenu
        class="md:w-[200px] flex-none max-w-none items-start justify-start [&>div]:w-full"
      >
        <NavigationMenuList
          class="w-full overflow-auto justify-start md:flex-col"
        >
          <NavigationMenuItem
            v-for="menu in settingsMenu"
            :key="menu.name"
            class="min-w-fit md:w-full"
          >
            <NuxtLink
              :to="menu.link"
              class="w-full text-left rounded-md py-2 px-4 flex items-center gap-2 flex-row dark:text-white text-sm"
              :class="
                currentPath === menu.link
                  ? 'bg-purple text-background hover:bg-purple hover:text-background'
                  : 'hover:bg-purple/10 hover:text-purple transition-colors'
              "
            >
              <Icon :name="menu.icon" class="!size-5" />
              {{ menu.name }}
            </NuxtLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      <Separator
        orientation="vertical"
        class="hidden md:block h-[calc(100vh-200px)]"
      />

      <!-- right -->
      <slot />
    </div>
  </div>
</template>
