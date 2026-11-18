<script setup lang="ts">
import { blockInfo } from '#shared/utils/blocks'
import { projectTypeInfo } from '#shared/utils/projectTypes'
import type { ParsedSample } from '../types'

/**
 * 解剖圖：中間是一份「範本填完的樣子」，照檔案順序一列一列畫；旁邊標出每一列是八塊裡的哪一塊、為什麼要有。
 * 這種類型沒有的塊（例如課程範例沒有環境變數）就不標，不會指向空白的地方。
 * 同一塊在檔案裡被別的塊隔開、出現第二次時，第二次只畫內容、不再標一次。
 */
const props = defineProps<{ sample: ParsedSample, windowTitle: string }>()

/** 每一列要不要標、標在哪一邊（左右輪流） */
const rows = computed(() => {
  const seen = new Set<string>()
  let noteIndex = 0
  return props.sample.rows.map((row, index) => {
    const first = !seen.has(row.block)
    seen.add(row.block)
    const side: 'left' | 'right' = noteIndex % 2 === 0 ? 'left' : 'right'
    if (first) noteIndex++
    return {
      row,
      block: blockInfo(row.block),
      note: first,
      side,
      position: index === 0 ? 'first' as const : index === props.sample.rows.length - 1 ? 'last' as const : 'middle' as const,
      why: `anatomy.templates.${projectTypeInfo(props.sample.type).messageKey}.why.${row.block}`,
    }
  })
})
</script>

<template>
  <div>
    <div class="xl:grid xl:grid-cols-[minmax(0,1fr)_60px_minmax(0,540px)_60px_minmax(0,1fr)]">
      <WindowBar :title="windowTitle" class="rounded-t-[10px] border border-b-0 border-line bg-surface xl:col-start-3" />
    </div>
    <ol class="m-0 list-none p-0">
      <AnatomyRow
        v-for="item in rows"
        :key="`${sample.type}-${item.row.block}-${item.position}-${item.row.pieces.length}`"
        :block="item.block"
        :pieces="item.row.pieces"
        :why="item.note ? item.why : undefined"
        :note="item.note"
        :side="item.side"
        :position="item.position"
      />
    </ol>
  </div>
</template>
