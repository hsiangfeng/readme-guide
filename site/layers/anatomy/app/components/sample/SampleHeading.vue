<script setup lang="ts">
/** 樣本 README 裡的章節標題（原文；只是示意的樣子，不是這一頁的標題，所以不用 h2／h3） */
defineProps<{ level: number, text: string }>()
</script>

<template>
  <p class="m-0" :class="level <= 2 ? 'text-[17px] font-black' : 'text-[15px] font-bold'">{{ text }}</p>
</template>
