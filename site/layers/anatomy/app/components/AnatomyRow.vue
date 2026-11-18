<script setup lang="ts">
import type { BlockInfo } from '#shared/utils/blocks'
import type { SamplePiece } from '../types'

/**
 * 解剖圖的一列：一塊樣本、拉出去的線、旁邊的說明。
 * 1280 以上用同一組五欄格線，每一列的樣本接在一起看起來是同一張紙；比較窄時樣本和說明上下排。
 */
const props = defineProps<{
  block: BlockInfo
  /** 這一列的樣本內容 */
  pieces: readonly SamplePiece[]
  /** 「為什麼」的訊息 key */
  why: string | undefined
  /** 要不要在旁邊標出是哪一塊（同一塊第二次出現時不標） */
  note: boolean
  /** 說明放在樣本的哪一邊（寬螢幕） */
  side: 'left' | 'right'
  /** 在樣本裡的位置 */
  position: 'first' | 'middle' | 'last'
}>()

/** 樣本紙面的圓角與留白 */
const paperClass = computed(() => {
  if (props.position === 'first') return 'rounded-b-[10px] pt-6 sm:pt-[30px] xl:rounded-none'
  if (props.position === 'last') return 'rounded-[10px] pt-5 xl:rounded-t-none xl:pt-0 xl:pb-[30px]'
  return 'rounded-[10px] pt-5 xl:rounded-none xl:pt-0'
})
</script>

<template>
  <li class="mb-9 last:mb-0 xl:mb-0 xl:grid xl:grid-cols-[minmax(0,1fr)_60px_minmax(0,540px)_60px_minmax(0,1fr)]">
    <div class="bg-paper px-5 pb-[18px] text-paper-ink sm:px-8 xl:col-start-3 xl:row-start-1" :class="paperClass">
      <div :class="position !== 'first' && 'xl:border-t xl:border-dashed xl:border-paper-line xl:pt-4'">
        <SamplePieces :pieces="pieces" />
      </div>
    </div>
    <AnatomyConnector
      v-if="note"
      class="hidden xl:row-start-1 xl:flex"
      :class="side === 'left' ? 'xl:col-start-2' : 'xl:col-start-4'"
      :side="side"
    />
    <AnatomyNote
      v-if="note"
      class="mt-3.5 xl:row-start-1 xl:mt-0 xl:self-center"
      :class="side === 'left' ? 'xl:col-start-1' : 'xl:col-start-5'"
      :block="block"
      :why="why"
      :side="side"
    />
  </li>
</template>
