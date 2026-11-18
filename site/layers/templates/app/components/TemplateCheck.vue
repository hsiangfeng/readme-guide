<script setup lang="ts">
import type { Localized } from '#shared/types/rules'
import { localized } from '#shared/utils/locales'
import { placeholderBare } from '#shared/utils/placeholders'
import { CHECK_COMMAND } from '#shared/utils/site'
import type { CommandLine } from '#layers/core/app/types'

/**
 * 「填完，讓工具對一次」：說明工具會抓什麼，下面是可以複製的指令與示意結果。
 * 示意結果是「還有沒填的地方」那條規則的訊息（rules/rules.json），換進範本第一個要填的地方。
 */
const props = defineProps<{
  sample: { severity: Localized | undefined, message: Localized | null } | null
  /** 範本第一個要填的地方 */
  first: { line: number, column: number, text: string } | null
}>()

const { t, locale } = useI18n()

const lines = computed<CommandLine[]>(() => {
  const result: CommandLine[] = [{ text: CHECK_COMMAND, kind: 'command' }]
  if (props.sample?.message && props.sample.severity && props.first) {
    const message = formatRuleMessage(localized(props.sample.message, locale.value), { text: props.first.text })
    result.push({ text: `${props.first.line}:${props.first.column}　${localized(props.sample.severity, locale.value)}　${message}`, kind: 'error', gapBefore: true })
    result.push({ text: '…', kind: 'muted' })
  }
  return result
})
</script>

<template>
  <section aria-labelledby="template-check" class="min-w-0">
    <SectionTitle id="template-check">{{ t('templatePage.check.title') }}</SectionTitle>
    <p class="mt-3 mb-0 text-[15.5px] leading-[1.85] text-ink-2">
      <i18n-t keypath="templatePage.check.lead1" tag="span" scope="global" class="block">
        <template #placeholder><Placeholder class="font-mono text-[13.5px]">{{ placeholderBare(locale) }}</Placeholder></template>
      </i18n-t>
      <span class="block">{{ t('templatePage.check.lead2') }}</span>
    </p>
    <CommandBox class="mt-5" :lines="lines" />
    <p class="mt-3 mb-0 text-[13px] text-ink-2">{{ t('common.checkCommand.note') }}</p>
  </section>
</template>
