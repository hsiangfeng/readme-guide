<script setup lang="ts">
import { CHECK_COMMAND } from '#shared/utils/site'

/** 檢查工具區：標題、說明、示意結果、動作列 */
const { t } = useI18n()
</script>

<template>
  <section id="lint" aria-labelledby="lint-title" class="border-t border-line bg-surface">
    <PageContainer class="py-14 sm:py-20">
      <CommandEyebrow :text="CHECK_COMMAND" />
      <h2 id="lint-title" class="mt-3.5 mb-0 text-[clamp(1.625rem,1.2rem+1.6vw,2.125rem)] leading-[1.3] font-black">{{ t('lint.title') }}</h2>
      <p class="mt-2.5 mb-0 text-[16px] text-ink-2">
        <span class="block">{{ t('lint.lead1') }}</span>
        <span class="block">{{ t('lint.lead2') }}</span>
      </p>
      <LintReport class="mt-8" />
      <LintActions class="mt-5" />
    </PageContainer>
  </section>
</template>
