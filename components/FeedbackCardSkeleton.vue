<script setup lang="ts"></script>

<template>
  <div
    class="flex items-start gap-4 hover:scale-103 transition-transform duration-200 ease-in-out cursor-pointer border rounded-lg p-4"
  >
    <!-- avatar -->
    <Skeleton class="size-10 shrink-0 rounded-full" />

    <div class="flex flex-col gap-4 w-full">
      <!-- description -->
      <div class="flex flex-col gap-2">
        <Skeleton class="w-[200px] h-5" />
        <Skeleton class="w-[220px] md:w-[300px] h-5" />
      </div>

      <!-- rating -->
      <div class="flex flex-col gap-2">
        <Skeleton class="w-[180px] h-5" />
        <Skeleton class="w-[180px] h-5" />
        <Skeleton class="w-[180px] h-5" />
      </div>

      <!-- date and user -->
      <div class="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
        <div class="flex items-center gap-1">
          <Icon
            name="mdi:clock-outline"
            class="!size-4 text-muted-foreground"
          />

          <Skeleton class="w-[100px] h-5" />
        </div>
        <div class="flex items-center gap-1">
          <Icon
            name="mdi:file-document-outline"
            class="!size-4 text-muted-foreground"
          />
          <Skeleton class="w-[100px] h-5" />
        </div>
      </div>
    </div>
  </div>
</template>
