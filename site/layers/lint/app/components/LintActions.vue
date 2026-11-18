<script setup lang="ts">
import { buildPromptLines, promptToText } from '#shared/utils/aiPrompt'
import { CLONE_URL } from '#shared/utils/site'

/** 檢查工具區下方：複製給 AI 的指令（叫 AI 跑檢查工具並修好）、看檢查項目 */
const { t } = useI18n()
const paths = useSitePaths()

/** 組出要複製的指令 */
function promptText() {
  return promptToText(buildPromptLines(t, {
    cloneUrl: CLONE_URL,
    body: ['lint.prompt.read1', 'lint.prompt.read2'],
  }))
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-5">
    <CopyButton :label="t('lint.copyPrompt')" :text="promptText" size="lg" />
    <ArrowLink :to="paths.rules()" size="lg">{{ t('lint.rulesLink') }}</ArrowLink>
  </div>
</template>
