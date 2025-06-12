import { defineStore } from "pinia";

export const useSidebarStore = defineStore("sidebar", () => {
  const isSidebarOpen = ref<boolean>(true);
  const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value;
  };

  return { isSidebarOpen, toggleSidebar };
});
