<script setup lang="ts">
/** 樣本：使用技術的標籤 */
defineProps<{ tags: readonly string[] }>()
</script>

<template>
  <ul class="m-0 flex list-none flex-wrap gap-2 p-0 font-mono text-[12.5px] font-medium">
    <li v-for="tag in tags" :key="tag" class="border border-paper-border px-[9px] py-[3px]">{{ tag }}</li>
  </ul>
</template>
