<script setup lang="ts">
import { localized } from '#shared/utils/locales'
import { projectTypeInfo } from '#shared/utils/projectTypes'
import type { TerminalLine } from '../types'

/** 終端機示意的一行，依種類決定前面的符號和顏色 */
defineProps<{ line: TerminalLine }>()

const { t, locale } = useI18n()

/**
 * 反白部分的文字。
 * @param value 訊息 key 或專案類型
 */
function valueText(value: { key: string } | { projectType: string }): string {
  return 'key' in value ? t(value.key) : localized(projectTypeInfo(value.projectType).name, locale.value)
}
</script>

<template>
  <p class="m-0 [overflow-wrap:anywhere]" :class="line.gapBefore && 'mt-[26px] sm:mt-[31px]'">
    <template v-if="line.kind === 'command'">
      <PromptMark class="text-ink-2" />{{ line.text }}
    </template>
    <span v-else-if="line.kind === 'ok'" class="text-ok"><span aria-hidden="true">✓ </span>{{ t(line.key) }}</span>
    <span v-else-if="line.kind === 'step'" class="text-ink-2">
      <span aria-hidden="true">› </span>
      <i18n-t v-if="line.value" :keypath="line.key" tag="span" scope="global">
        <template #value><span class="text-ink">{{ valueText(line.value) }}</span></template>
      </i18n-t>
      <template v-else>{{ t(line.key) }}</template>
    </span>
    <template v-else-if="line.kind === 'question'">
      <span class="font-bold text-amber" aria-hidden="true">? </span>{{ t(line.key) }}
    </template>
    <span v-else-if="line.kind === 'answer'" class="block pl-[18px]">
      <span class="text-ink-2">{{ t('hero.terminal.you') }} › </span>{{ t(line.key) }}
    </span>
    <template v-else>
      <PromptMark class="text-ink-2" />
      <span class="caret-blink inline-block h-4 w-2 bg-amber align-[-3px]" aria-hidden="true" />
    </template>
  </p>
</template>
