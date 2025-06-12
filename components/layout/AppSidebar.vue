<script setup lang="ts">
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
</script>

<template>
  <Sidebar>
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
      <span class="text-2xl font-bold gradient-text">Feed Forward</span>
    </SidebarHeader>
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>メニュー</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in items" :key="item.title">
              <SidebarMenuButton asChild>
                <NuxtLink :to="item.url">
                  <Icon :name="item.icon" />
                  <span>{{ item.title }}</span>
                </NuxtLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  </Sidebar>
</template>
