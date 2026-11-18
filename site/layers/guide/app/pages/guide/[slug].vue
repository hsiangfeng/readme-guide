<script setup lang="ts">
import { adjacentBlocks, BLOCKS, blockInfo } from '#shared/utils/blocks'
import { localized } from '#shared/utils/locales'
import { sitePage } from '#shared/utils/seo'

/**
 * 每一塊的完整寫法：左邊八塊索引，右邊是這一塊的寫法。
 * 編號、名稱、上一塊下一塊、檢查項目都讀 rules/；寫法內容讀 site/content/guide/。內容檔還沒有時照樣產生這一頁。
 */
const route = useRoute()
const slug = String(route.params.slug)

if (!BLOCKS.some((block) => block.id === slug)) {
  throw createError({ statusCode: 404, statusMessage: 'Not Found', fatal: true })
}

const { locale } = useI18n()

const block = blockInfo(slug)
const { previous, next } = adjacentBlocks(slug)
const { data } = await useGuidePage(slug)

const summary = computed(() => localized(block.summary, locale.value))

// 寫法頁是一篇教怎麼寫某一塊的技術文章
usePageSeo(sitePage('guide', slug), { type: 'TechArticle', breadcrumb: true })
</script>

<template>
  <div class="border-t border-line">
    <PageContainer class="pt-10 pb-20 sm:pt-14 sm:pb-24 lg:grid lg:grid-cols-[232px_minmax(0,1fr)] lg:items-start lg:gap-16">
      <GuideIndex :current="block" />
      <article class="min-w-0" aria-labelledby="guide-title">
        <GuideHeader :block="block" :why="data?.content?.why ?? summary" />
        <template v-if="data?.content">
          <GuideFacts class="mt-10" :content="data.content" />
          <GuideParts class="mt-16" :content="data.content" />
          <GuideBeforeAfter class="mt-16" :content="data.content" :rule-status="data.ruleStatus" />
          <GuideTypes class="mt-16" :texts="data.content.types" />
        </template>
        <GuideMissing v-else class="mt-10" />
        <GuideRules
          v-if="data"
          class="mt-16"
          :block="block"
          :rules="data.rules"
          :planned-count="data.plannedCount"
          :labels="data.labels"
        />
        <GuidePager class="mt-[72px]" :previous="previous" :next="next" />
      </article>
    </PageContainer>
  </div>
</template>
