<script setup lang="ts">
import { beforeCjk, localized } from '#shared/utils/locales'
import { placeholderShort } from '#shared/utils/placeholders'
import { templatePath, type ProjectTypeInfo } from '#shared/utils/projectTypes'

/** 範本頁的開頭：像指令的小字、標題、這種類型的說明（rules/project-types.json） */
defineProps<{ type: ProjectTypeInfo }>()

const { t, locale } = useI18n()
</script>

<template>
  <header>
    <CommandEyebrow :text="`cat ${templatePath(type.id, locale)}`" />
    <div class="mt-3.5 flex flex-wrap items-end justify-between gap-x-16 gap-y-6">
      <h1 class="m-0 flex-[0_1_auto] text-[clamp(2rem,1.5rem+2vw,2.75rem)] leading-[1.3] font-black tracking-[-0.01em] whitespace-pre-line">{{ t('templatePage.title', { type: beforeCjk(localized(type.name, locale), locale) }) }}</h1>
      <p class="m-0 mb-2 flex-[0_1_520px] text-[16px] leading-[1.9] text-ink-2">
        <span class="block">{{ localized(type.description, locale) }}</span>
        <i18n-t keypath="templatePage.lead" tag="span" scope="global" class="block">
          <template #placeholder><Placeholder class="font-mono text-[14px]">{{ placeholderShort(locale) }}</Placeholder></template>
        </i18n-t>
      </p>
    </div>
  </header>
</template>
