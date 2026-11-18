<script setup lang="ts">
import type { RuleExample } from '#shared/types/rules'

/** 規則的例子：改之前（紅叉）與改成（綠勾）；改之前是空的就只畫改成 */
defineProps<{ example: RuleExample }>()

const { t } = useI18n()
</script>

<template>
  <div class="self-start rounded-lg border border-line bg-bg px-4 pt-3.5 pb-4 font-mono text-[13px] leading-[25px]">
    <template v-if="example.before.length > 0">
      <p class="m-0 text-ink-2">{{ t('common.rule.before') }}</p>
      <p v-for="(line, index) in example.before" :key="`b${index}`" class="m-0 flex items-start gap-2 text-danger [overflow-wrap:anywhere]">
        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" class="mt-[5px] flex-none"><path d="M6 6l12 12M18 6L6 18" /></svg>
        <span>{{ line }}</span>
      </p>
    </template>
    <template v-if="example.after.length > 0">
      <p class="mb-0 text-ink-2" :class="example.before.length > 0 ? 'mt-2.5' : 'mt-0'">{{ t('common.rule.after') }}</p>
      <p v-for="(line, index) in example.after" :key="`a${index}`" class="m-0 flex items-start gap-2 text-ok [overflow-wrap:anywhere]">
        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="mt-[5px] flex-none"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
        <span>{{ line }}</span>
      </p>
    </template>
  </div>
</template>
