<script setup lang="ts">
import { blockInfo } from '#shared/utils/blocks'
import { localized } from '#shared/utils/locales'
import type { Localized } from '#shared/types/rules'
import type { SampleRule } from '../data/sampleReport'
import type { LintIssue } from '../types'

/**
 * 檢查結果的一筆。桌機（768 以上）照設計稿排成四欄；手機改直排：
 * 第一行位置與嚴重度，第二行問題，第三行屬於哪一塊。
 */
const props = defineProps<{
  issue: LintIssue
  rule: SampleRule
  /** 嚴重度的名稱（rules/rules.json） */
  severityLabel: Localized | undefined
}>()

const { t, locale } = useI18n()

const block = computed(() => {
  const id = props.rule.block ?? props.issue.block
  return id ? blockInfo(id) : null
})

const message = computed(() => formatRuleMessage(localized(props.rule.messages[props.issue.message]!, locale.value), props.issue.params))
</script>

<template>
  <li
    class="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 px-4 py-2.5 transition-[color,background-color,border-color] duration-150 hover:bg-surface md:min-h-10 md:grid-cols-[80px_72px_minmax(0,1fr)_minmax(250px,auto)] md:items-center md:gap-x-0 md:px-0 md:py-0"
  >
    <span class="text-ink-2 md:px-4">
      <template v-if="issue.position">{{ issue.position }}</template>
      <template v-else><span aria-hidden="true">—</span><span class="sr-only">{{ t('lint.noPosition') }}</span></template>
    </span>
    <span class="font-bold" :class="rule.severity === 'error' ? 'text-danger' : 'text-amber'">{{ severityLabel ? localized(severityLabel, locale) : rule.severity }}</span>
    <span class="col-span-2 mt-1 md:col-span-1 md:mt-0 md:py-2">{{ message }}</span>
    <span v-if="block" class="col-span-2 mt-0.5 md:col-span-1 md:mt-0 md:px-4 md:text-right md:whitespace-nowrap">
      <span class="text-amber">{{ block.number }}</span>
      <span class="ml-2.5 text-ink-2">{{ localized(block.name, locale) }}</span>
    </span>
  </li>
</template>
