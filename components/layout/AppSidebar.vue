<script setup lang="ts">
import { useSidebarStore } from "@/stores/sidebar";
const sidebarStore = useSidebarStore();

// Menu items.
const items = [
  {
    title: "ダッシュボード",
    url: "/dashboard",
    icon: "mdi:view-dashboard",
  },
  {
    title: "マイフォーム",
    url: "/my-forms",
    icon: "mdi:folder-multiple",
  },
  {
    title: "設定",
    url: "/settings/account",
    icon: "mdi:cog",
  },
];

const route = useRoute();
const isActive = (url: string) => {
  return (
    route.path.includes(url) ||
    (url === "/" && route.path === "/dashboard") ||
    (url.includes("/settings") && route.path.startsWith("/settings"))
  );
};
</script>

<template>
  <Sidebar collapsible="icon" :open="sidebarStore.isSidebarOpen">
    <SidebarHeader
      class="flex flex-row items-center gap-2"
      data-slot="sidebar-header"
      data-sidebar="header"
    >
      <NuxtImg
        src="/logo.png"
        alt="Feed Forward Logo"
        width="24"
        height="24"
        class="rounded-full"
      />
      <span
        v-if="sidebarStore.isSidebarOpen"
        class="text-2xl font-bold gradient-text whitespace-nowrap overflow-hidden"
      >
        Feed Forward
      </span>
    </SidebarHeader>
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>メニュー</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in items" :key="item.title">
              <SidebarMenuButton
                asChild
                class="hover:bg-purple/20 hover:text-purple focus:bg-purple/20 focus:text-purple active:bg-purple/20 active:text-purple"
                :class="{
                  'bg-purple/20 text-purple': isActive(item.url),
                }"
              >
                <NuxtLink :to="item.url">
                  <Icon :name="item.icon" />
                  <span v-if="sidebarStore.isSidebarOpen">
                    {{ item.title }}
                  </span>
                </NuxtLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <Separator />

      <SidebarGroup>
        <SidebarGroupLabel v-if="sidebarStore.isSidebarOpen">
          アクション
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                class="hover:bg-purple/20 hover:text-purple focus:bg-purple/20 focus:text-purple active:bg-purple/20 active:text-purple"
                :class="{
                  'bg-purple/20 text-purple': isActive('/create-form'),
                }"
              >
                <NuxtLink to="/create-form">
                  <Icon name="mdi:plus" />
                  <span v-if="sidebarStore.isSidebarOpen">フォームを作成</span>
                </NuxtLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  </Sidebar>
</template>
