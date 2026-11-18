<script setup lang="ts">
import { splitPlaceholders } from '#shared/utils/placeholders'
import type { TemplateSegment } from '../utils/splitTemplate'

/** 範本原文的幾行：左邊行號，標題粗體、程式碼框的開頭結尾灰色，要填的地方琥珀色底 */
defineProps<{ segment: TemplateSegment }>()

/**
 * 一行的樣式。
 * @param line 一行文字
 */
function lineStyle(line: string): string {
  if (/^#{1,6}\s/.test(line)) return 'font-bold'
  if (/^\s*(```|~~~)/.test(line)) return 'text-ink-2'
  return ''
}
</script>

<template>
  <div class="overflow-x-auto pr-[18px] pl-3 font-mono text-[13.5px] leading-6">
    <div v-for="(line, index) in segment.lines" :key="index" class="grid min-h-6 grid-cols-[30px_minmax(0,1fr)] gap-4">
      <span aria-hidden="true" class="text-right text-line-strong select-none">{{ segment.startLine + index }}</span>
      <span class="min-w-0 [overflow-wrap:anywhere] whitespace-pre-wrap" :class="lineStyle(line)"><template v-for="(piece, pieceIndex) in splitPlaceholders(line)" :key="pieceIndex"><Placeholder v-if="piece.placeholder">{{ piece.text }}</Placeholder><template v-else>{{ piece.text }}</template></template></span>
    </div>
  </div>
</template>
