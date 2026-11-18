<script setup lang="ts">
/** 樣本：整段只有一個連結（只是示意，不能點）。旁邊用小字寫出網址，網址不折行 */
defineProps<{ label: string, url: string }>()
</script>

<template>
  <p class="m-0 text-[14.5px]">
    <span class="font-bold underline">{{ label }}</span>
    <span class="ml-3 inline-block whitespace-nowrap text-paper-ink-2">{{ url.replace(/^https?:\/\//, '') }}</span>
  </p>
</template>
