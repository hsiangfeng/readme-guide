<script setup lang="ts">
import { checkPromptText } from '#shared/utils/aiPrompt'
import { CHECK_COMMAND } from '#shared/utils/site'
import type { CommandLine } from '#layers/core/app/types'

/** 「怎麼跑」：說明、複製給 AI 的指令（跟首頁檢查工具區同一份）、在專案資料夾裡執行的指令 */
const { t } = useI18n()

const lines = computed<CommandLine[]>(() => [
  { text: CHECK_COMMAND, kind: 'command' },
  { text: `# ${t('rulesPage.run.hint')}`, kind: 'comment' },
])

/** 組出要複製給 AI 的指令 */
const promptText = () => checkPromptText(t)
</script>

<template>
  <section aria-labelledby="rules-run" class="border-t border-line bg-surface">
    <PageContainer class="grid items-center gap-x-16 gap-y-8 py-12 lg:grid-cols-[360px_minmax(0,1fr)]">
      <div>
        <h2 id="rules-run" class="m-0 text-[24px] leading-[1.4] font-black">{{ t('rulesPage.run.title') }}</h2>
        <p class="mt-2.5 mb-0 text-[15px] leading-[1.85] text-ink-2">{{ t('rulesPage.run.body') }}</p>
        <CopyButton class="mt-[18px]" :label="t('lint.copyPrompt')" :text="promptText" />
      </div>
      <CommandBox class="min-w-0" :lines="lines" tone="bg" />
    </PageContainer>
  </section>
</template>
