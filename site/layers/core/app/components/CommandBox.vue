<script setup lang="ts">
import type { CommandLine } from '../types'

/**
 * 「在你的專案資料夾裡執行」的指令框：上面一列標題與複製按鈕，下面是指令。
 * 複製出去的只有指令本身（不含 `$ `、說明與示意的結果）。
 */
const props = withDefaults(defineProps<{
  lines: readonly CommandLine[]
  /** 框的底色：放在一般背景上用 surface，放在 surface 區塊上用 bg */
  tone?: 'surface' | 'bg'
}>(), { tone: 'surface' })

const { t } = useI18n()

/** 要複製的文字 */
const copyText = computed(() => commandCopyText(props.lines))

const lineClass = {
  command: '',
  comment: 'text-ink-2',
  error: 'text-danger',
  muted: 'text-ink-2',
}
</script>

<template>
  <div class="overflow-hidden rounded-[10px] border border-line" :class="tone === 'surface' ? 'bg-surface' : 'bg-bg'">
    <div class="flex min-h-11 items-center justify-between gap-3 border-b border-line py-1.5 pr-1.5 pl-4">
      <span class="font-mono text-[12.5px] text-ink-2">{{ t('common.checkCommand.title') }}</span>
      <CopyButton :label="t('common.checkCommand.copy')" :text="copyText" variant="outline" size="xs" />
    </div>
    <div class="px-4 pt-4 pb-[18px] font-mono text-[13.5px] leading-[26px] [overflow-wrap:anywhere]">
      <p v-for="(line, index) in lines" :key="index" class="m-0" :class="[lineClass[line.kind], line.gapBefore && 'mt-[26px]']">
        <PromptMark v-if="line.kind === 'command'" class="text-ink-2" />{{ line.text }}
      </p>
    </div>
  </div>
</template>
