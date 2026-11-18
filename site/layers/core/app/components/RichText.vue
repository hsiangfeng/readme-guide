<script setup lang="ts">
/** 一段文字，反引號包起來的部分畫成程式碼樣式（規則說明、內容檔的文字都用這個） */
const props = defineProps<{ text: string }>()

const parts = computed(() => splitInlineCode(props.text))
</script>

<template>
  <template v-for="(part, index) in parts" :key="index">
    <InlineCode v-if="part.code">{{ part.text }}</InlineCode>
    <template v-else>{{ part.text }}</template>
  </template>
</template>
