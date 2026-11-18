<script setup lang="ts">
import { countIssues, pickSampleRules, SAMPLE_FILE, SAMPLE_ISSUES } from '../data/sampleReport'

/** 檢查工具的示意結果：檔名、一筆一筆的問題、總結。嚴重度與訊息照 rules/rules.json */
const { t } = useI18n()

const { data } = await useRules('home-sample', (file) => ({ rules: pickSampleRules(file.rules), severities: file.severities }))

const rows = computed(() => SAMPLE_ISSUES.flatMap((issue) => {
  const rule = data.value?.rules[issue.ruleId]
  return rule ? [{ issue, rule }] : []
}))

const counts = computed(() => countIssues(rows.value.map((row) => row.rule.severity)))
</script>

<template>
  <div role="group" :aria-label="t('lint.reportLabel')" class="rounded-[10px] border border-line bg-bg">
    <div class="px-2 pt-[18px] pb-[22px] font-mono text-[14px] leading-[1.6]">
      <p class="m-0 px-4 pb-2 font-bold underline underline-offset-4">{{ SAMPLE_FILE }}</p>
      <ul class="m-0 list-none p-0">
        <LintRow v-for="row in rows" :key="row.issue.ruleId" :issue="row.issue" :rule="row.rule" :severity-label="data ? data.severities[row.rule.severity] : undefined" />
      </ul>
      <LintSummary class="mt-3.5" :counts="counts" />
    </div>
  </div>
</template>
