<script setup lang="ts">
/** 視窗的標題列：三個點加標題，終端機與解剖圖共用 */
defineProps<{ title: string }>()
</script>

<template>
  <div class="flex h-10 items-center gap-3.5 px-4">
    <div aria-hidden="true" class="flex gap-[7px]">
      <span v-for="dot in 3" :key="dot" class="size-[11px] rounded-full bg-dot" />
    </div>
    <span class="min-w-0 truncate font-mono text-[12.5px] text-ink-2">{{ title }}</span>
  </div>
</template>
