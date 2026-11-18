<script setup lang="ts">
import type { GuideContent } from '../types'

/** 這一塊要有哪幾樣東西：標題、必填或選填、怎麼寫 */
defineProps<{ content: GuideContent }>()

const { t } = useI18n()

/** 必填、選填、有條件各用哪一種標籤 */
const NEED_TONE = { required: 'accent', optional: 'plain', conditional: 'outline' } as const
</script>

<template>
  <section aria-labelledby="guide-parts">
    <SectionTitle id="guide-parts">{{ content.partsTitle }}</SectionTitle>
    <ul class="mt-[22px] mb-0 list-none border-t border-line p-0">
      <li v-for="part in content.parts" :key="part.heading" class="grid grid-cols-[minmax(0,1fr)] gap-x-6 gap-y-2 border-b border-line py-[18px] md:grid-cols-[208px_minmax(0,1fr)]">
        <div class="flex flex-wrap items-center gap-2.5">
          <code class="font-mono text-[14.5px] font-bold">{{ part.heading }}</code>
          <SmallTag :tone="NEED_TONE[part.need] ?? 'plain'">{{ t(`common.need.${part.need}`) }}</SmallTag>
        </div>
        <p class="m-0 text-[15.5px] leading-[1.85] text-ink-2">
          <RichText :text="part.text" /><template v-if="part.emphasis?.trim()"> <span class="text-ink"><RichText :text="part.emphasis" /></span></template>
        </p>
      </li>
    </ul>
  </section>
</template>
