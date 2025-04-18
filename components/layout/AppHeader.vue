<script setup lang="ts">
import ColorModeMenu from "@/components/layout/ColorModeMenu.vue";
const router = useRouter();

const pageMenu = [
  {
    name: "HOME",
    link: "/",
  },
  {
    name: "MY PROJECTS",
    link: "/projects",
  },
  {
    name: "DISCOVERY",
    link: "/discovery",
  },
  {
    name: "CREATE PROJECT",
    link: "/projects/create",
  },
  {
    name: "ANALYTICS",
    link: "/analytics",
  },
];

// for active link
const currentPath = router.currentRoute.value.path;
const isActive = (path: string) => {
  return currentPath === path;
};
</script>

<template>
  <header
    class="flex items-center justify-between p-4 w-full fixed top-0 shadow-md z-10 bg-background"
  >
    <h1 class="text-xl md:text-2xl font-bold gradient-text">FeedForward</h1>
    <NavigationMenu class="md:flex hidden">
      <NavigationMenuList>
        <NavigationMenuItem v-for="menu in pageMenu" :key="menu.name">
          <NavigationMenuLink
            :href="menu.link"
            :class="[
              isActive(menu.link)
                ? 'bg-purple dark:bg-purple/40 text-white hover:bg-purple hover:text-white focus:bg-purple focus:text-white'
                : 'text-black hover:bg-purple/10 hover:text-purple focus:bg-purple/10 focus:text-purple',
            ]"
            class="px-4 py-2 rounded-md dark:text-white"
          >
            {{ menu.name }}
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
    <div class="items-center gap-2 flex">
      <Button :variant="'outline'" :size="'icon'" class="cursor-pointer">
        <Icon name="solar:bell-bold" class="dark:text-white text-black" />
      </Button>
      <ColorModeMenu />
      <!-- hamburger menu -->
      <Sheet>
        <SheetTrigger as-child>
          <Button
            :variant="'outline'"
            :size="'icon'"
            class="cursor-pointe md:hidden"
          >
            <Icon
              name="solar:hamburger-menu-linear"
              class="dark:text-white text-black"
            />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle class="text-xl md:text-2xl font-bold gradient-text">
              FeedForward
            </SheetTitle>
            <SheetDescription />
          </SheetHeader>

          <nav class="space-y-4 w-full p-4">
            <div v-for="menu in pageMenu" :key="menu.name" class="w-full">
              <router-link
                :to="menu.link"
                :class="[
                  'flex items-center w-full px-4 py-3 rounded-md transition-colors duration-200 text-sm',
                  isActive(menu.link)
                    ? 'bg-purple dark:bg-purple/40 text-white font-medium'
                    : 'text-black dark:text-white hover:bg-purple/10 hover:text-purple',
                ]"
              >
                {{ menu.name }}
              </router-link>
            </div>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  </header>
</template>
