<script setup lang="ts">
import type { GuideBeforeLine } from '../types'

/**
 * 改之前／改之後的 README 片段。改之前那份有問題的字畫波浪底線，行尾的圓圈數字對到右邊的問題。
 * 片段太寬時在卡片裡橫向捲動，整頁不會跟著捲。
 */
defineProps<{
  tone: 'before' | 'after'
  label: string
  lines: readonly GuideBeforeLine[]
}>()

/**
 * 這一行是 Markdown 標題還是程式碼框的開頭結尾（畫面上分別用粗體與灰色）。
 * @param text 一行文字
 */
function lineStyle(text: string): string {
  if (/^#{1,6}\s/.test(text)) return 'font-bold'
  if (text.startsWith('```')) return 'text-ink-2'
  return ''
}
</script>

<template>
  <figure class="m-0 min-w-0 overflow-hidden rounded-[10px] border border-line bg-surface">
    <figcaption class="flex h-11 items-center justify-between gap-3 border-b border-line px-4">
      <span class="flex items-center gap-2 text-[14px] font-bold" :class="tone === 'before' ? 'text-danger' : 'text-ok'">
        <svg v-if="tone === 'before'" aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        <svg v-else aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
        {{ label }}
      </span>
      <span class="font-mono text-[12.5px] text-ink-2">README.md</span>
    </figcaption>
    <div class="relative overflow-x-auto px-[18px] pt-[18px] pb-[22px] font-mono text-[13.5px] leading-[26px]">
      <div v-for="(line, index) in lines" :key="index" class="min-h-[26px] whitespace-pre">
        <template v-if="typeof line === 'string'"><span :class="lineStyle(line)">{{ line }}</span></template>
        <template v-else>
          <span :class="lineStyle(unmark(line.text))"><template v-for="(piece, pieceIndex) in splitMarked(line.text)" :key="pieceIndex"><span
            v-if="piece.marked"
            class="underline decoration-danger decoration-wavy decoration-1 underline-offset-4"
          >{{ piece.text }}</span><template v-else>{{ piece.text }}</template></template></span>
          <span v-for="note in line.notes" :key="note" class="ml-2 inline-flex size-[22px] items-center justify-center rounded-full border border-danger align-[1px] font-mono text-[12px] leading-none font-bold text-danger">
            <span aria-hidden="true">{{ note }}</span><span class="sr-only">{{ $t('guide.beforeAfter.noteNumber', { n: note }) }}</span>
          </span>
        </template>
      </div>
    </div>
  </figure>
</template>
