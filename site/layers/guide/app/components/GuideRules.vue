<script setup lang="ts">
import type { Localized, RuleData } from '#shared/types/rules'
import type { BlockInfo } from '#shared/utils/blocks'
import { localized } from '#shared/utils/locales'

/**
 * 這一塊檢查工具會對的項目（已實作的），用跟檢查項目頁一樣的可展開列；
 * 下面寫還有幾條規劃中，以及連到全部檢查項目。
 */
defineProps<{
  block: BlockInfo
  rules: readonly RuleData[]
  plannedCount: number
  labels: { severities: Record<string, Localized>, statuses: Record<string, Localized> }
}>()

const { t, locale } = useI18n()
const paths = useSitePaths()

/** 展開了哪幾條 */
const opened = ref<Record<string, boolean>>({})
</script>

<template>
  <section aria-labelledby="guide-rules">
    <SectionTitle id="guide-rules">{{ t('guide.rules.title') }}</SectionTitle>
    <template v-if="rules.length > 0">
      <p class="mt-3 mb-0 text-[15.5px] text-ink-2">{{ t('guide.rules.lead') }}</p>
      <div class="mt-5 overflow-hidden rounded-[10px] border border-line bg-surface">
        <div class="flex h-11 items-center justify-between border-b border-line px-4 font-mono text-[12.5px] text-ink-2">
          <span>{{ block.number }} {{ localized(block.name, locale) }}</span>
          <span>{{ t('common.rule.count', { n: rules.length }, rules.length) }}</span>
        </div>
        <ul class="m-0 list-none p-0">
          <RuleRow v-for="rule in rules" :key="rule.id" v-model:open="opened[rule.id]" :rule="rule" :labels="labels" />
        </ul>
      </div>
    </template>
    <p v-else class="mt-4 mb-0 rounded-[10px] border border-dashed border-line p-4 text-[14px] text-ink-2">{{ t('guide.rules.none') }}</p>
    <div class="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
      <p class="m-0 text-[13.5px] text-ink-2">
        <template v-if="plannedCount > 0">{{ t('guide.rules.planned', { n: plannedCount }, plannedCount) }}</template>
      </p>
      <ArrowLink :to="paths.rules()">{{ t('guide.rules.all') }}</ArrowLink>
    </div>
  </section>
</template>
