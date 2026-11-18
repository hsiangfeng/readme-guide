<script setup lang="ts">
import { checkerNode, sitePage } from '#shared/utils/seo'

/** 首頁：交給 AI 寫 → 八塊結構解剖圖 → 檢查工具（頂端列與頁尾在 app.vue） */
const { t } = useI18n()

// 檢查工具在首頁下方有一整區介紹，用 SoftwareSourceCode 描述（說明就是那一區的第一句）
usePageSeo(sitePage('home'), () => ({
  type: 'WebPage',
  nodes: [checkerNode(t('common.meta.checkerName'), t('lint.lead1'))],
}))
</script>

<template>
  <div>
    <HeroSection />
    <AnatomySection />
    <LintSection />
  </div>
</template>
