<script setup lang="ts">
import { Home, Settings, ChevronRight } from "lucide-vue-next";
import { cn } from "@/lib/utils";

type Item = {
  title: string;
  url?: string;
  icon?: Component;
  children?: Item[];
};

// Menu items.
const items: Item[] = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Settings",
    icon: Settings,
    children: [
      {
        title: "User",
        url: "/settings/user",
      },
    ],
  },
];

const isOpen = ref(false);
const router = useRouter();

const isActive = (path: string) => {
  return router.currentRoute.value.path === path;
};
</script>

<template>
  <Sidebar>
    <SidebarHeader class="flex items-center flex-row gap-1">
      <SidebarLogo>
        <NuxtImg
          src="/logo.svg"
          alt="logo"
          class="size-8 dark:brightness-100 dark:invert"
          width="40"
          height="40"
        />
      </SidebarLogo>
      <h1 class="text-2xl font-bold">Link Manager</h1>
    </SidebarHeader>
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu v-for="item in items" :key="item.title">
            <Collapsible
              default-open
              classs="group/collapsible"
              :open="isOpen"
              @update:open="isOpen = $event"
            >
              <SidebarMenuItem>
                <!-- collapsible trigger -->
                <CollapsibleTrigger
                  v-if="item.children"
                  as-child
                  class="group/collapsible"
                  :class="
                    cn(
                      isActive(item.url || '') ? 'bg-muted' : '',
                      'cursor-pointer'
                    )
                  "
                >
                  <SidebarMenuButton
                    :class="
                      cn(
                        isActive(item.url || '') ? 'bg-muted' : '',
                        'cursor-pointer justify-between'
                      )
                    "
                  >
                    <div class="flex items-center gap-2">
                      <component :is="item.icon" class="h-4 w-4" />
                      {{ item.title }}
                    </div>
                    <ChevronRight
                      :class="
                        cn(
                          isOpen ? 'rotate-90' : '',
                          'transition-transform duration-100'
                        )
                      "
                    />
                  </SidebarMenuButton>
                </CollapsibleTrigger>

                <!-- link button -->
                <SidebarMenuButton v-else as-child>
                  <router-link
                    :to="item.url || ''"
                    :class="
                      cn(
                        isActive(item.url || '') ? 'bg-muted' : '',
                        'cursor-pointer justify-between'
                      )
                    "
                  >
                    <div class="flex items-center gap-2">
                      <component :is="item.icon" class="h-4 w-4" />
                      {{ item.title }}
                    </div>
                  </router-link>
                </SidebarMenuButton>

                <!-- collapsible content -->
                <CollapsibleContent v-if="item.children">
                  <SidebarMenuSub>
                    <SidebarMenuSubItem
                      v-for="child in item.children"
                      :key="child.title"
                    >
                      <SidebarMenuButton as-child>
                        <router-link
                          :to="child.url || ''"
                          :class="
                            cn(
                              isActive(child.url || '') ? 'bg-muted' : '',
                              'cursor-pointer justify-between'
                            )
                          "
                        >
                          {{ child.title }}
                        </router-link>
                      </SidebarMenuButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  </Sidebar>
</template>
