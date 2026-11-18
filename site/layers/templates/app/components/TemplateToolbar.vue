<script setup lang="ts">
import { promptToText } from '#shared/utils/aiPrompt'
import { LOCALES } from '#shared/utils/locales'
import type { ProjectTypeInfo } from '#shared/utils/projectTypes'

/**
 * 範本上方的動作列：複製範本、下載範本檔、複製「請 AI 照這份寫」的指令；
 * 右邊是行數與要填幾個地方，以及另一種語言的同一份範本。
 */
const props = defineProps<{
  type: ProjectTypeInfo
  text: string
  lineCount: number
  placeholderCount: number
}>()

const { t, locale } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const prompt = useWritePrompt(() => props.type.id)
const otherLocale = computed(() => LOCALES.find((item) => item.code !== locale.value)!)

/** 下載用的網址（檔案內容直接放在連結裡，不用另外產生檔案） */
const downloadHref = computed(() => `data:text/markdown;charset=utf-8,${encodeURIComponent(props.text)}`)
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
    <div class="flex flex-wrap items-center gap-3">
      <CopyButton :label="t('templatePage.copy')" :text="text" size="lg" />
      <a
        :href="downloadHref"
        :download="type.file"
        class="inline-flex h-11 items-center gap-2 rounded-md border border-line-strong bg-bg px-4 text-[14.5px] font-bold text-ink no-underline motion-safe:transition-[transform,border-color] motion-safe:duration-[120ms] motion-safe:hover:-translate-y-px"
      >
        <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11" /><path d="M7 11l5 5 5-5" /><path d="M5 20h14" /></svg>
        <span>{{ t('templatePage.download', { file: type.file }) }}</span>
      </a>
      <CopyButton :label="t('templatePage.copyPrompt')" :text="() => promptToText(prompt)" variant="outline" />
    </div>
    <div class="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13.5px] text-ink-2">
      <span class="font-mono">{{ t('templatePage.stats', { lines: lineCount, placeholders: placeholderCount }) }}</span>
      <ArrowLink :to="switchLocalePath(otherLocale.code)" size="sm" :lang="otherLocale.tag" :hreflang="otherLocale.tag">{{ t('templatePage.otherLanguage') }}</ArrowLink>
    </div>
  </div>
</template>
