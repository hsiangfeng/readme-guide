<script setup lang="ts">
import { BLOCK_GROUPS } from '#shared/utils/blocks'

/** 八塊依讀者的三個問題分成三組；每組涵蓋哪幾塊照 rules/blocks.json 算 */
const { t } = useI18n()
</script>

<template>
  <ol class="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-x-10 gap-y-5 p-0">
    <li v-for="group in BLOCK_GROUPS" :key="group.id" class="border-t border-line-strong pt-3.5">
      <p class="m-0 flex items-baseline gap-3">
        <span class="font-mono text-[13px] font-bold whitespace-nowrap text-amber">{{ group.range }}</span>
        <strong class="text-[17px] font-bold">{{ t(`anatomy.questions.${group.id}.title`) }}</strong>
      </p>
      <p class="mt-0.5 mb-0 text-[14px] text-ink-2">{{ t(`anatomy.questions.${group.id}.body`) }}</p>
    </li>
  </ol>
</template>
