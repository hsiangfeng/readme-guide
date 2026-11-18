<script setup lang="ts">
import type { ProjectType } from '#shared/types/project'
import { promptToText } from '#shared/utils/aiPrompt'

/**
 * 給 AI 的指令卡：畫面上顯示的和複製出去的是同一份內容。
 * 選了專案類型時，指令裡多一句說明是哪一種專案、照哪一份範本。
 */
const props = defineProps<{ projectType: ProjectType | null }>()

const { t } = useI18n()

/** 指令的每一行 */
const lines = useWritePrompt(() => props.projectType)

/** 指令內容的區塊（剪貼簿不能用時，把它選起來讓使用者自己複製） */
const body = ref<HTMLElement | null>(null)

/** 複製失敗：選取整段指令 */
function selectPrompt() {
  if (!body.value) return
  const range = document.createRange()
  range.selectNodeContents(body.value)
  const selection = window.getSelection()
  selection?.removeAllRanges()
  selection?.addRange(range)
}
</script>

<template>
  <div class="overflow-hidden rounded-lg border border-amber bg-surface">
    <div class="flex min-h-12 items-center justify-between gap-3 border-b border-line py-1.5 pr-1.5 pl-[18px]">
      <span class="font-mono text-[12.5px] text-ink-2">{{ t('hero.prompt.label') }}</span>
      <CopyButton :label="t('hero.prompt.copy')" :text="() => promptToText(lines)" size="sm" @failed="selectPrompt" />
    </div>
    <div ref="body" class="px-[18px] pt-[18px] pb-[22px] font-mono text-[13.5px] leading-[27px]">
      <p
        v-for="(line, index) in lines"
        :key="index"
        class="m-0 [overflow-wrap:anywhere]"
        :class="[line.accent && 'text-amber', line.gapBefore && 'mt-[27px]']"
      >
        {{ line.text }}
      </p>
    </div>
  </div>
</template>
