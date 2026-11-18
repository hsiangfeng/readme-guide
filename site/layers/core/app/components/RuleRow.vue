<script setup lang="ts">
import type { Localized, RuleData } from '#shared/types/rules'
import { localized } from '#shared/utils/locales'
import { PROJECT_TYPES } from '#shared/utils/projectTypes'

/**
 * 一條檢查規則：一列可以展開，展開後是「為什麼要檢查」「怎麼修」，有例子的話右邊放改之前／改成。
 * 寫法頁與檢查項目頁共用。列的 id 是規則代號，網址帶 #代號 就能直接連到這一條。
 * 寬螢幕一列排開；手機（768 以下）分三行：代號與嚴重度、名稱、標籤。
 */
const props = defineProps<{
  rule: RuleData
  /** 嚴重度與狀態的名稱（rules/rules.json） */
  labels: { severities: Record<string, Localized>, statuses: Record<string, Localized> }
}>()

const open = defineModel<boolean>('open', { default: false })

const { t, locale } = useI18n()
const panelId = useId()

const lang = computed(() => dataLang(locale.value))
const planned = computed(() => props.rule.status !== 'implemented')

/** 「只有網頁專案、作品集」：規則不是四種類型都適用時才顯示 */
const onlyTypes = computed(() => {
  if (PROJECT_TYPES.every((type) => props.rule.types.includes(type.id))) return null
  const names = PROJECT_TYPES.filter((type) => props.rule.types.includes(type.id)).map((type) => localized(type.name, locale.value))
  return t('common.rule.onlyTypes', { types: names.join(t('common.rule.typeSeparator')) })
})

const example = computed(() => props.rule.example?.[lang.value] ?? null)
const hasExample = computed(() => !!example.value && (example.value.before.length > 0 || example.value.after.length > 0))
</script>

<template>
  <li :id="rule.id" class="scroll-mt-6 border-t border-line first:border-t-0">
    <button
      type="button"
      :aria-expanded="open"
      :aria-controls="panelId"
      class="grid w-full grid-cols-[auto_auto_minmax(0,1fr)_22px] items-center gap-x-3 gap-y-1 border-0 px-4 py-3 text-left text-ink transition-[background-color] duration-150 hover:bg-hover md:min-h-12 md:grid-cols-[104px_52px_minmax(0,1fr)_auto_22px] md:gap-x-1 md:py-0"
      :class="open ? 'bg-hover' : 'bg-transparent'"
      @click="open = !open"
    >
      <span class="font-mono text-[13px] text-ink-2">{{ rule.id }}</span>
      <span class="text-[13.5px] font-bold" :class="rule.severity === 'error' ? 'text-danger' : 'text-amber'">{{ localized(labels.severities[rule.severity]!, locale) }}</span>
      <span class="col-span-4 row-start-2 text-[15px] md:col-span-1 md:row-start-1 md:col-start-3 md:py-2.5 md:pr-3" :class="planned && 'text-ink-2'">
        {{ localized(rule.title, locale) }}
      </span>
      <span
        v-if="planned || onlyTypes || rule.needsProject"
        class="col-span-4 row-start-3 flex flex-wrap gap-1.5 md:col-span-1 md:row-start-1 md:col-start-4 md:justify-end"
      >
        <SmallTag v-if="planned">{{ localized(labels.statuses[rule.status]!, locale) }}</SmallTag>
        <SmallTag v-if="onlyTypes">{{ onlyTypes }}</SmallTag>
        <SmallTag v-if="rule.needsProject">{{ t('common.rule.needsProject') }}</SmallTag>
      </span>
      <span aria-hidden="true" class="col-start-4 row-start-1 flex justify-end text-ink-2 md:col-start-5">
        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" class="motion-safe:transition-transform motion-safe:duration-150" :class="open && 'rotate-180'"><path d="M6 9l6 6 6-6" /></svg>
      </span>
    </button>
    <div
      v-show="open"
      :id="panelId"
      class="grid gap-x-8 gap-y-6 bg-hover px-4 pt-1.5 pb-6 md:pl-[120px]"
      :class="hasExample && 'lg:grid-cols-[minmax(0,1fr)_300px]'"
    >
      <div>
        <p class="m-0 text-[12.5px] text-ink-2">{{ t('common.rule.why') }}</p>
        <p class="mt-1 mb-0 text-[14.5px] leading-[1.85]"><RichText :text="localized(rule.description, locale)" /></p>
        <p class="mt-4 mb-0 text-[12.5px] text-ink-2">{{ t('common.rule.fix') }}</p>
        <p class="mt-1 mb-0 text-[14.5px] leading-[1.85]"><RichText :text="localized(rule.fix, locale)" /></p>
      </div>
      <RuleExample v-if="hasExample && example" :example="example" />
    </div>
  </li>
</template>
