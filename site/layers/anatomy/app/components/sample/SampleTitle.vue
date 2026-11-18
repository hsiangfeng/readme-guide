<script setup lang="ts">
/** 樣本：專案名稱（README 的一級標題） */
defineProps<{ text: string }>()
</script>

<template>
  <p class="m-0 text-[clamp(1.375rem,1.1rem+1vw,1.6875rem)] leading-[1.35] font-black">{{ text }}</p>
</template>
