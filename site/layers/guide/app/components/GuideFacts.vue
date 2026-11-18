<script setup lang="ts">
import { LOCALES } from '#shared/utils/locales'
import { matchHeading, officialHeadingLine, parseHeadingLine } from '#shared/utils/headings'
import type { GuideContent } from '../types'

/**
 * 三個重點：標題固定這樣寫（附另一種語言的正式標題）、誰要寫、讀的人在問。
 * 另一種語言的標題從 rules/headings.json 找；對不到就不顯示。
 */
const props = defineProps<{ content: GuideContent }>()

const { t, locale } = useI18n()

const otherLocale = computed(() => LOCALES.find((item) => item.code !== locale.value)!.code)

/** 每個標題配上另一種語言的寫法 */
const headings = computed(() => props.content.headings.map((heading) => {
  const parsed = parseHeadingLine(heading)
  const section = parsed ? matchHeading(parsed.text, parsed.level)[0] : undefined
  return { heading, other: section ? officialHeadingLine(section, otherLocale.value) : null }
}))
</script>

<template>
  <dl class="m-0 grid grid-cols-[minmax(0,1fr)] gap-x-8 gap-y-6 md:grid-cols-3">
    <div class="border-t border-line-strong pt-3.5">
      <dt class="text-[13px] text-ink-2">{{ t('guide.facts.headings') }}</dt>
      <dd v-for="item in headings" :key="item.heading" class="mt-1.5 mb-0">
        <code class="font-mono text-[15.5px] font-bold">{{ item.heading }}</code>
        <span v-if="item.other" class="mt-1 block text-[13px] text-ink-2">{{ t('guide.facts.otherLang') }} <code class="font-mono">{{ item.other }}</code></span>
      </dd>
    </div>
    <div class="border-t border-line-strong pt-3.5">
      <dt class="text-[13px] text-ink-2">{{ t('guide.facts.who') }}</dt>
      <dd class="mt-1.5 mb-0 text-[16px] font-bold">{{ content.who }}</dd>
      <dd class="mt-1 mb-0 text-[13px] text-ink-2">{{ content.whoNote }}</dd>
    </div>
    <div class="border-t border-line-strong pt-3.5">
      <dt class="text-[13px] text-ink-2">{{ t('guide.facts.question') }}</dt>
      <dd class="mt-1.5 mb-0 text-[16px] font-bold">{{ content.question }}</dd>
      <dd class="mt-1 mb-0 text-[13px] text-ink-2">{{ content.questionNote }}</dd>
    </div>
  </dl>
</template>
