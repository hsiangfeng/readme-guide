<script setup lang="ts">
import { blockInfo } from '#shared/utils/blocks'
import { localized } from '#shared/utils/locales'
import type { ProjectTypeInfo } from '#shared/utils/projectTypes'
import { isSegmentRequired, type TemplateSegment } from '../utils/splitTemplate'

/**
 * 範本一段旁邊的說明：編號、名稱、必填或選填（照 rules/project-types.json）、
 * 這一塊的摘要（rules/blocks.json）、連到完整寫法。
 */
const props = defineProps<{ segment: TemplateSegment, type: ProjectTypeInfo }>()

const { t, locale } = useI18n()
const paths = useSitePaths()

const block = computed(() => (props.segment.block ? blockInfo(props.segment.block) : null))
const required = computed(() => isSegmentRequired(props.segment, props.type.required))
</script>

<template>
  <div v-if="block" class="flex items-start gap-3.5">
    <BlockBadge :number="block.number" />
    <div class="min-w-0">
      <div class="flex min-h-7 flex-wrap items-center gap-x-2.5 gap-y-1">
        <span class="text-[16.5px] leading-[1.5] font-bold">{{ localized(block.name, locale) }}</span>
        <SmallTag :tone="required ? 'accent' : 'plain'">{{ t(required ? 'common.need.required' : 'common.need.optional') }}</SmallTag>
      </div>
      <p class="mt-0.5 mb-0 text-[13.5px] leading-[1.7] text-ink-2">{{ localized(block.summary, locale) }}</p>
      <!-- 連結自己一行：接在句子後面會讓最後一行只剩一兩個字 -->
      <NuxtLink :to="paths.guide(block.id)" class="mt-1 inline-block text-[13.5px] leading-[1.7] font-bold whitespace-nowrap text-amber no-underline hover:text-amber-hover">{{ t('templatePage.fullGuide') }} <span aria-hidden="true">→</span></NuxtLink>
    </div>
  </div>
  <div v-else />
</template>
