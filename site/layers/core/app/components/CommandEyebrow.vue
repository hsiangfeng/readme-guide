<script setup lang="ts">
/**
 * 區塊標題上方那行像指令的小字，前面帶 `$ `。看起來能照打，所以一定要是真的能跑的指令
 * （從 readme-guide 資料夾裡、或照「怎麼跑」的方式執行）；不是指令的（例如 404）把 prompt 關掉。
 */
withDefaults(defineProps<{ text: string, prompt?: boolean }>(), { prompt: true })
</script>

<template>
  <p class="m-0 font-mono text-[13.5px] font-medium text-amber [overflow-wrap:anywhere]"><PromptMark v-if="prompt" />{{ text }}</p>
</template>
