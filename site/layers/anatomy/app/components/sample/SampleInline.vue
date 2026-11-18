<script setup lang="ts">
/**
 * 樣本裡的一段文字：反引號包起來的畫成等寬字（不折行），`[文字](網址)` 畫成底線文字（只是示意，不能點）。
 */
const props = defineProps<{
  text: string
  /** 程式碼用粗體（表格第一欄的變數名稱） */
  strongCode?: boolean
}>()

/** 切成一般文字、程式碼、連結 */
const parts = computed(() => props.text.split(/(`[^`]+`|\[[^\]]+\]\([^)]+\))/).filter(Boolean).map((part) => {
  if (part.startsWith('`')) return { kind: 'code' as const, text: part.slice(1, -1) }
  const link = /^\[([^\]]+)\]\([^)]+\)$/.exec(part)
  if (link) return { kind: 'link' as const, text: link[1]! }
  return { kind: 'text' as const, text: part }
}))
</script>

<template>
  <template v-for="(part, index) in parts" :key="index">
    <code v-if="part.kind === 'code'" class="font-mono text-[0.92em] whitespace-nowrap" :class="strongCode && 'font-bold'">{{ part.text }}</code>
    <span v-else-if="part.kind === 'link'" class="underline">{{ part.text }}</span>
    <template v-else>{{ part.text }}</template>
  </template>
</template>
