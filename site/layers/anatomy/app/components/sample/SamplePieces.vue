<script setup lang="ts">
import type { SamplePiece } from '../../types'

/** 樣本的一列：依每一段的種類挑對應的元件，段與段之間留固定的間距 */
defineProps<{ pieces: readonly SamplePiece[] }>()

/**
 * 資料夾結構那種 ```text 區塊：每一行都是「路徑、兩個以上空白、說明」，畫成兩欄。
 * @param piece 程式碼區塊
 */
function isPathList(piece: Extract<SamplePiece, { kind: 'code' }>): boolean {
  return piece.lang === 'text' && piece.lines.length > 0 && piece.lines.every((line) => /^\S+\s{2,}\S/.test(line))
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <template v-for="(piece, index) in pieces" :key="index">
      <SampleHeading v-if="piece.kind === 'heading'" :level="piece.level" :text="piece.text" :class="index > 0 && 'mt-2'" />
      <SampleTitle v-else-if="piece.kind === 'title'" :text="piece.text" />
      <p v-else-if="piece.kind === 'text'" class="m-0 text-[14.5px] whitespace-pre-line text-paper-ink-2"><SampleInline :text="piece.text" /></p>
      <SampleLink v-else-if="piece.kind === 'link'" :label="piece.label" :url="piece.url" />
      <SampleShot v-else-if="piece.kind === 'shot'" :alt="piece.alt" />
      <SampleChecklist v-else-if="piece.kind === 'checklist'" :items="piece.items" />
      <SampleTags v-else-if="piece.kind === 'list' && piece.tags" :tags="piece.items" />
      <SampleList v-else-if="piece.kind === 'list'" :items="piece.items" :ordered="piece.ordered" />
      <SamplePaths v-else-if="piece.kind === 'code' && isPathList(piece)" :lines="piece.lines" />
      <SampleCode v-else-if="piece.kind === 'code'" :lines="piece.lines" />
      <SampleTable v-else-if="piece.kind === 'table'" :head="piece.head" :rows="piece.rows" />
    </template>
  </div>
</template>
