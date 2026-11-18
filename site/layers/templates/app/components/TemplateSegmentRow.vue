<script setup lang="ts">
import type { ProjectTypeInfo } from '#shared/utils/projectTypes'
import type { TemplateSegment } from '../utils/splitTemplate'

/**
 * 範本的一段與它的說明。1024 以上：原文｜線｜說明三欄，原文一段一段接成同一個框；
 * 比較窄時說明在上、原文在下，每一段各自一個框。
 */
const props = defineProps<{
  segment: TemplateSegment
  type: ProjectTypeInfo
  position: 'first' | 'middle' | 'last' | 'only'
}>()

/** 原文框的邊框與圓角（寬螢幕接成一個框，窄螢幕各自一個框） */
const codeClass = computed(() => {
  const wide = {
    first: 'lg:rounded-none lg:border-b-0 lg:pt-5 lg:pb-0',
    middle: 'lg:rounded-none lg:border-y-0 lg:py-0',
    last: 'lg:rounded-t-none lg:border-t-0 lg:pt-0 lg:pb-[22px]',
    only: 'lg:rounded-t-none lg:pt-5 lg:pb-[22px]',
  }[props.position]
  return `rounded-[10px] border border-line py-3 ${wide}`
})
</script>

<template>
  <li class="mb-8 last:mb-0 lg:mb-0 lg:grid lg:grid-cols-[minmax(0,1fr)_56px_336px]">
    <TemplateBlockNote class="mb-3 lg:col-start-3 lg:row-start-1 lg:mb-0 lg:pb-3.5" :class="position === 'first' || position === 'only' ? 'lg:mt-[18px]' : 'lg:-mt-0.5'" :segment="segment" :type="type" />
    <div
      aria-hidden="true"
      class="hidden items-center lg:col-start-2 lg:row-start-1 lg:flex lg:self-start"
      :class="position === 'first' || position === 'only' ? 'lg:mt-8' : 'lg:mt-3'"
    >
      <span class="relative -ml-1 size-[7px] flex-none bg-amber" />
      <span class="flex-1 border-t border-amber" />
    </div>
    <TemplateLines class="bg-surface lg:col-start-1 lg:row-start-1" :class="codeClass" :segment="segment" />
  </li>
</template>
