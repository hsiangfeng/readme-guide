<script setup lang="ts">
import type { GuideContent } from '../types'

/** 改之後旁邊的提醒，左邊一條綠線 */
defineProps<{ tip: GuideContent['tip'] }>()
</script>

<template>
  <aside class="self-start border-l-2 border-ok py-0.5 pl-4">
    <p class="m-0 text-[15px] font-bold">{{ tip.title }}</p>
    <p v-for="(paragraph, index) in tip.paragraphs" :key="index" class="mb-0 text-[13.5px] leading-[1.75] text-ink-2" :class="index === 0 ? 'mt-1' : 'mt-3.5'">
      <RichText :text="paragraph" />
    </p>
  </aside>
</template>
