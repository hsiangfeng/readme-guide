<script setup lang="ts">
import type { ChecklistItem } from '../../types'

/** 樣本：打勾清單，做完的打勾、還沒做的空框 */
defineProps<{ items: readonly ChecklistItem[] }>()
</script>

<template>
  <ul class="m-0 flex list-none flex-col gap-[5px] p-0 text-[14.5px]">
    <li v-for="item in items" :key="item.text" class="flex items-start gap-[9px]">
      <span v-if="item.done" aria-hidden="true" class="mt-[5px] flex size-[15px] flex-none items-center justify-center bg-paper-ink">
        <svg aria-hidden="true" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="text-paper"><path d="M5 12l5 5 9-10" /></svg>
      </span>
      <span v-else aria-hidden="true" class="mt-[5px] size-[15px] flex-none border-[1.5px] border-paper-ink" />
      <span><SampleInline :text="item.text" /></span>
    </li>
  </ul>
</template>
