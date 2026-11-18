<script setup lang="ts">
import { BLOCKS } from '#shared/utils/blocks'
import type { ProjectType } from '#shared/types/project'

/**
 * 解剖圖下方：複製這份範本（複製 templates/<語言>/<類型>.md 的原文）、看這份範本、看每一塊的完整寫法、之後會加的類型。
 */
const props = defineProps<{
  type: ProjectType
  /** 範本原文 */
  templateText: string
}>()

const { t } = useI18n()
const paths = useSitePaths()

const firstBlock = BLOCKS[0]!
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border-t border-line pt-5">
    <div class="flex flex-wrap items-center gap-x-5 gap-y-3">
      <CopyButton :label="t('anatomy.copyTemplate')" :text="() => props.templateText" variant="outline" />
      <ArrowLink :to="paths.template(type)">{{ t('anatomy.viewTemplate') }}</ArrowLink>
      <ArrowLink :to="paths.guide(firstBlock.id)">{{ t('anatomy.fullGuide') }}</ArrowLink>
    </div>
    <p class="m-0 font-mono text-[13px] text-ink-2"># {{ t('anatomy.comingSoon') }}</p>
  </div>
</template>
