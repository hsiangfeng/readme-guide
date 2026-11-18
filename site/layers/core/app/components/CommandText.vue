<script setup lang="ts">
/**
 * 一行指令的文字：寬度不夠時優先在空白處換行，網址這種一整段的字盡量留在同一行
 * （不然會在 `readme-` 的連字號後面斷開，看起來像兩段）；一段本身就比畫面寬時才在中間斷。
 * 每一段之間留真正的空白，選取後複製還是原本的指令。
 */
const props = defineProps<{ text: string }>()

const parts = computed(() => props.text.split(' '))
</script>

<template>
  <template v-for="(part, index) in parts" :key="index">
    <span class="inline-block max-w-full [overflow-wrap:anywhere]">{{ part }}</span>{{ index < parts.length - 1 ? ' ' : '' }}
  </template>
</template>
