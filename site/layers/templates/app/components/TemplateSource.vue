<script setup lang="ts">
import { templatePath, type ProjectTypeInfo } from '#shared/utils/projectTypes'
import type { TemplateSegment } from '../utils/splitTemplate'

/**
 * 範本原文：上面一條視窗列，下面一段一段接起來看起來是同一份檔案，每一段右邊拉線到那一塊的說明。
 * 1024 以下說明改放在每一段上面。
 */
const props = defineProps<{ type: ProjectTypeInfo, segments: readonly TemplateSegment[] }>()

const { t, locale } = useI18n()

/**
 * 這一段在檔案裡的位置（決定上下的圓角與邊框）。
 * @param index 第幾段
 */
function position(index: number): 'first' | 'middle' | 'last' | 'only' {
  if (props.segments.length === 1) return 'only'
  if (index === 0) return 'first'
  return index === props.segments.length - 1 ? 'last' : 'middle'
}
</script>

<template>
  <div>
    <div class="hidden lg:grid lg:grid-cols-[minmax(0,1fr)_56px_336px]">
      <WindowBar :title="t('templatePage.windowTitle', { path: templatePath(type.id, locale) })" class="rounded-t-[10px] border border-b-0 border-line bg-surface" />
    </div>
    <ol class="m-0 list-none p-0">
      <TemplateSegmentRow
        v-for="(segment, index) in segments"
        :key="segment.startLine"
        :segment="segment"
        :type="type"
        :position="position(index)"
      />
    </ol>
  </div>
</template>
