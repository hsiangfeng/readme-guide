<script setup lang="ts">
import type { RuleStatus } from '#shared/types/rules'
import type { GuideNote } from '../types'

/**
 * 改之前那份的問題，編號對到片段行尾的圓圈。每個問題下面寫檢查工具抓不抓得到：
 * 提到的規則都已實作 →「檢查工具會抓」；有規劃中的 →「之後會加進檢查工具」；沒有規則 →「工具看不出來，要自己確認」。
 */
const props = defineProps<{
  notes: readonly GuideNote[]
  ruleStatus: Record<string, RuleStatus | null>
}>()

const { t } = useI18n()

/**
 * 某個問題的規則說明。
 * @param note 問題
 */
function ruleLabel(note: GuideNote): string {
  const ids = note.rules ?? []
  if (ids.length === 0) return t('guide.noteRule.none')
  const allImplemented = ids.every((id) => props.ruleStatus[id] === 'implemented')
  return t(allImplemented ? 'guide.noteRule.implemented' : 'guide.noteRule.planned')
}
</script>

<template>
  <ol :aria-label="t('guide.beforeAfter.notesLabel')" class="m-0 flex list-none flex-col gap-3.5 p-0">
    <li v-for="(note, index) in notes" :key="note.title" class="flex gap-3">
      <span aria-hidden="true" class="mt-0.5 flex size-[22px] flex-none items-center justify-center rounded-full border border-danger font-mono text-[12px] font-bold text-danger">{{ index + 1 }}</span>
      <div class="min-w-0">
        <p class="m-0 text-[15px] font-bold"><span class="sr-only">{{ t('guide.beforeAfter.noteNumber', { n: index + 1 }) }}：</span>{{ note.title }}</p>
        <p class="mt-0.5 mb-0 text-[13.5px] text-ink-2"><RichText :text="note.text" /></p>
        <p class="mt-1 mb-0 text-[12px]">
          <template v-if="note.rules?.length">
            <span class="font-mono text-amber">{{ note.rules.join(' · ') }}</span>
            <span class="ml-2 text-ink-2">{{ ruleLabel(note) }}</span>
          </template>
          <span v-else class="text-ink-2">{{ ruleLabel(note) }}</span>
        </p>
      </div>
    </li>
  </ol>
</template>
