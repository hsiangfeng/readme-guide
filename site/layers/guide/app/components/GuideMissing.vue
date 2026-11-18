<script setup lang="ts">
/** 內容檔還沒寫好時：說明這一頁還在準備（開頭的說明已經換成 rules/blocks.json 的摘要） */
const { t } = useI18n()
</script>

<template>
  <section class="rounded-[10px] border border-dashed border-line-strong px-5 py-5">
    <h2 class="m-0 text-[18px] font-bold">{{ t('guide.missing.title') }}</h2>
    <p class="mt-1.5 mb-0 text-[15px] text-ink-2">{{ t('guide.missing.body') }}</p>
  </section>
</template>
