<script setup lang="ts">
/** 主視覺左上：指令小字、大標題、說明 */
const { t } = useI18n()
</script>

<template>
  <div>
    <CommandEyebrow :text="t('hero.eyebrow')" />
    <!-- 標題用 whitespace-pre-line 照訊息檔的換行斷行，所以文字要緊貼標籤寫在同一行 -->
    <h1 id="hero-title" class="mt-5 mb-0 text-[clamp(2.25rem,1.35rem+3.6vw,3.25rem)] leading-[1.28] font-black tracking-[-0.01em] whitespace-pre-line">{{ t('hero.title') }}</h1>
    <p class="mt-[22px] mb-0 text-[16.5px] leading-[1.9] text-ink-2">{{ t('hero.lead') }}</p>
  </div>
</template>
