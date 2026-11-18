<script setup lang="ts">
import type { RuleStatus } from '#shared/types/rules'
import type { GuideContent } from '../types'

/**
 * 改之前、改之後：左邊兩份 README 片段，右邊是改之前那份的問題、改之後的提醒。
 * 1024 以下改直排：問題接在改之前的片段下面，提醒接在改之後的片段下面。
 */
defineProps<{
  content: GuideContent
  /** 內容檔提到的規則各是什麼狀態（不在 rules.json 的是 null） */
  ruleStatus: Record<string, RuleStatus | null>
}>()

const { t } = useI18n()
</script>

<template>
  <section aria-labelledby="guide-before-after">
    <SectionTitle id="guide-before-after">{{ t('guide.beforeAfter.title') }}</SectionTitle>
    <p class="mt-3 mb-0 text-[15.5px] text-ink-2">{{ t('guide.beforeAfter.lead') }}</p>
    <div class="mt-6 grid grid-cols-[minmax(0,1fr)] items-start gap-x-8 gap-y-7 lg:grid-cols-[minmax(0,1fr)_304px]">
      <GuideCodeCard tone="before" :label="t('guide.beforeAfter.before')" :lines="content.before.lines" />
      <GuideNotes :notes="content.notes" :rule-status="ruleStatus" />
      <GuideCodeCard tone="after" :label="t('guide.beforeAfter.after')" :lines="content.after.lines" />
      <GuideTip :tip="content.tip" />
    </div>
  </section>
</template>
