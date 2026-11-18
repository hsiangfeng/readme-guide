<script setup lang="ts">
import type { Localized, RuleSeverity } from '#shared/types/rules'
import { localized } from '#shared/utils/locales'
import type { RuleCounts } from '#shared/utils/ruleCatalog'

/** 檢查項目頁的開頭：標題、說明、三個數字（全部從 rules/rules.json 算） */
defineProps<{ counts: RuleCounts, severities: Record<RuleSeverity, Localized> | null }>()

const { t, locale } = useI18n()
</script>

<template>
  <PageContainer class="pt-10 pb-12 sm:pt-16 sm:pb-14">
    <CommandEyebrow text="cat rules/rules.json" />
    <div class="mt-3.5 flex flex-wrap items-end justify-between gap-x-16 gap-y-6">
      <h1 class="m-0 flex-[0_1_auto] text-[clamp(2rem,1.5rem+2vw,2.75rem)] leading-[1.3] font-black tracking-[-0.01em] whitespace-pre-line">{{ t('rulesPage.title') }}</h1>
      <p class="m-0 mb-2 flex-[0_1_540px] text-[16px] leading-[1.9] text-ink-2">
        <span class="block">{{ t('rulesPage.lead1') }}</span>
        <span class="block">{{ t('rulesPage.lead2') }}</span>
      </p>
    </div>
    <dl class="mt-11 mb-0 grid gap-x-10 gap-y-6 md:grid-cols-3">
      <div class="flex flex-col border-t border-line-strong pt-3.5">
        <dt class="order-2 mt-1 text-[15px] font-bold">{{ t('rulesPage.stats.implementedLabel') }}</dt>
        <dd class="order-1 m-0 font-mono text-[24px] leading-[1.4] font-extrabold">{{ t('rulesPage.stats.implemented', { n: counts.implemented }) }}</dd>
        <dd class="order-3 mx-0 mt-0.5 mb-0 text-[13.5px] text-ink-2">{{ t('rulesPage.stats.plannedNote', { n: counts.planned }) }}</dd>
      </div>
      <div class="flex flex-col border-t border-line-strong pt-3.5">
        <dt class="order-2 mt-1 text-[15px] font-bold">{{ t('rulesPage.stats.severityLabel') }}</dt>
        <dd class="order-1 m-0 font-mono text-[24px] leading-[1.4] font-extrabold">
          {{ t('rulesPage.stats.severity', {
            errors: counts.errors,
            warnings: counts.warnings,
            errorLabel: severities ? localized(severities.error, locale) : '',
            warningLabel: severities ? localized(severities.warning, locale) : '',
          }) }}
        </dd>
        <dd class="order-3 mx-0 mt-0.5 mb-0 text-[13.5px] text-ink-2">{{ t('rulesPage.stats.severityNote') }}</dd>
      </div>
      <div class="flex flex-col border-t border-line-strong pt-3.5">
        <dt class="order-2 mt-1 text-[15px] font-bold">{{ t('rulesPage.stats.projectLabel') }}</dt>
        <dd class="order-1 m-0 font-mono text-[24px] leading-[1.4] font-extrabold">{{ t('rulesPage.stats.project', { n: counts.needsProject }) }}</dd>
        <dd class="order-3 mx-0 mt-0.5 mb-0 text-[13.5px] text-ink-2">{{ t('rulesPage.stats.projectNote') }}</dd>
      </div>
    </dl>
  </PageContainer>
</template>
