<script setup lang="ts">
/** 八塊結構的大標題與右邊的說明 */
const { t } = useI18n()
</script>

<template>
  <div class="flex flex-wrap items-end justify-between gap-x-16 gap-y-6">
    <i18n-t
      id="anatomy-title"
      keypath="anatomy.title"
      tag="h2"
      scope="global"
      class="m-0 flex-[0_1_auto] text-[clamp(1.875rem,1.2rem+2.4vw,2.5rem)] leading-[1.3] font-black tracking-[-0.01em] whitespace-pre-line"
    >
      <template #highlight><span class="text-amber">{{ t('anatomy.highlight') }}</span></template>
    </i18n-t>
    <p class="m-0 mb-1.5 flex-[0_1_520px] text-[16px] leading-[1.9] text-ink-2">
      <span class="block">{{ t('anatomy.lead1') }}</span>
      <span class="block">{{ t('anatomy.lead2') }}</span>
    </p>
  </div>
</template>
