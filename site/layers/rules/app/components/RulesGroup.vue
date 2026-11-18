<script setup lang="ts">
import type { Localized, RuleData } from '#shared/types/rules'
import { WHOLE_DOCUMENT_NUMBER } from '#shared/utils/blocks'
import { localized } from '#shared/utils/locales'
import type { RuleGroup } from '#shared/utils/ruleCatalog'

/**
 * 一組規則：編號、名稱、條數、連到這一塊的完整寫法，下面是可展開的規則列。
 * 沒有規則時寫一句話說明，不會整組消失：這一塊根本沒有已實作的規則，或是被篩選篩光了。
 */
const props = defineProps<{
  group: RuleGroup
  /** 所有規則（判斷是篩光了還是本來就沒有） */
  allRules: readonly RuleData[]
  labels: { severities: Record<string, Localized>, statuses: Record<string, Localized> }
}>()

const opened = defineModel<Record<string, boolean>>('opened', { required: true })

const { t, locale } = useI18n()
const paths = useSitePaths()

const blockId = computed(() => props.group.block?.id ?? null)
const titleId = computed(() => `rules-title-${blockId.value ?? 'whole'}`)

/** 這一塊本來就沒有已實作的規則 */
const noImplemented = computed(() => !props.allRules.some((rule) => rule.block === blockId.value && rule.status === 'implemented'))

/**
 * 展開或收起某一條。
 * @param id 規則代號
 * @param open 要不要展開
 */
function setOpen(id: string, open: boolean) {
  opened.value = { ...opened.value, [id]: open }
}
</script>

<template>
  <section :aria-labelledby="titleId">
    <div class="flex flex-wrap items-center gap-x-3.5 gap-y-2">
      <BlockBadge :number="group.block?.number ?? WHOLE_DOCUMENT_NUMBER" />
      <h3 :id="titleId" class="m-0 text-[20px] leading-[1.4] font-bold">{{ group.block ? localized(group.block.name, locale) : t('rulesPage.wholeDocument') }}</h3>
      <span class="font-mono text-[12.5px] text-ink-2">{{ t('common.rule.count', { n: group.rules.length }, group.rules.length) }}</span>
      <ArrowLink v-if="group.block" class="ml-auto" :to="paths.guide(group.block.id)" size="sm">{{ t('rulesPage.guideLink') }}</ArrowLink>
    </div>
    <p v-if="!group.block" class="mt-2 mb-0 text-[14px] text-ink-2">{{ t('rulesPage.wholeDocumentNote') }}</p>
    <ul v-if="group.rules.length > 0" class="mt-3.5 mb-0 list-none overflow-hidden rounded-[10px] border border-line bg-surface p-0">
      <RuleRow
        v-for="rule in group.rules"
        :key="rule.id"
        :open="!!opened[rule.id]"
        :rule="rule"
        :labels="labels"
        @update:open="setOpen(rule.id, $event)"
      />
    </ul>
    <p v-else class="mt-3.5 mb-0 rounded-[10px] border border-dashed border-line p-4 text-[14px] text-ink-2">
      {{ noImplemented ? t('rulesPage.noImplemented') : t('rulesPage.filteredEmpty') }}
    </p>
  </section>
</template>
