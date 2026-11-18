<script setup lang="ts">
import { BLOCK_GROUPS, WHOLE_DOCUMENT_NUMBER } from '#shared/utils/blocks'
import { localized } from '#shared/utils/locales'
import type { RuleGroup } from '#shared/utils/ruleCatalog'
import type { IndexGroup } from '#layers/core/app/types'

/** 檢查項目頁左邊的索引：每一塊篩完後剩幾條，點了捲到那一組；捲到哪一組就標哪一組 */
const props = defineProps<{
  groups: readonly RuleGroup[]
  /** 目前捲到的那一組的錨點 id */
  active: string
  groupId: (block: string | null) => string
}>()

const { t, locale } = useI18n()

/**
 * 某一塊篩完剩幾條。
 * @param block 塊的代號；null 是整份文件
 */
function countOf(block: string | null): number {
  return props.groups.find((group) => (group.block?.id ?? null) === block)?.rules.length ?? 0
}

const indexGroups = computed<IndexGroup[]>(() => [
  ...BLOCK_GROUPS.map((group) => ({
    id: group.id,
    label: localized(group.question, locale.value),
    items: group.blocks.map((block) => ({
      id: props.groupId(block.id),
      number: block.number,
      name: localized(block.name, locale.value),
      to: `#${props.groupId(block.id)}`,
      count: countOf(block.id),
    })),
  })),
  {
    id: 'whole',
    label: t('rulesPage.wholeDocumentGroup'),
    items: [{ id: props.groupId(null), number: WHOLE_DOCUMENT_NUMBER, name: t('rulesPage.wholeDocument'), to: `#${props.groupId(null)}`, count: countOf(null) }],
  },
])
</script>

<template>
  <BlockIndexNav command="ls rules/" :groups="indexGroups" :current="active" current-type="location" />
</template>
