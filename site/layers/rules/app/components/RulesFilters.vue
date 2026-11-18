<script setup lang="ts">
import type { Localized, RuleSeverity } from '#shared/types/rules'
import { localized } from '#shared/utils/locales'
import { PROJECT_TYPES } from '#shared/utils/projectTypes'
import type { RuleFilters } from '#shared/utils/ruleCatalog'

/**
 * 篩選：專案類型（單選）、只看錯誤／警告／對照專案檔案（各自開關）、顯示規劃中（開關）。
 * 都是一般按鈕，Tab 移動、Enter 或空白鍵切換。
 */
defineProps<{
  chipCounts: { error: number, warning: number, needsProject: number }
  plannedCount: number
  severities: Record<string, Localized>
}>()

const filters = defineModel<RuleFilters>({ required: true })

const { t, locale } = useI18n()
const typeLabelId = useId()
const onlyLabelId = useId()

/**
 * 切換某個開關。
 * @param key 篩選條件
 */
function toggle(key: 'error' | 'warning' | 'needsProject' | 'showPlanned') {
  filters.value[key] = !filters.value[key]
}

/**
 * 嚴重度的名稱。
 * @param severity 嚴重度
 */
function severityName(severity: RuleSeverity, labels: Record<string, Localized>): string {
  return labels[severity] ? localized(labels[severity]!, locale.value) : severity
}

const chipClass = 'inline-flex h-9 items-center gap-1.5 rounded-md border px-[13px] text-[13.5px] transition-[color,background-color,border-color] duration-150 hover:border-amber'
const onClass = 'border-amber bg-amber-soft font-bold text-amber'
const offClass = 'border-line bg-bg text-ink'
</script>

<template>
  <div role="group" :aria-label="t('rulesPage.filters.label')" class="grid items-center gap-x-0 gap-y-3 sm:grid-cols-[76px_minmax(0,1fr)]">
    <span :id="typeLabelId" class="text-[13px] text-ink-2">{{ t('rulesPage.filters.type') }}</span>
    <div role="group" :aria-labelledby="typeLabelId" class="flex flex-wrap gap-2">
      <button type="button" :class="[chipClass, filters.type === null ? onClass : offClass]" :aria-pressed="filters.type === null" @click="filters.type = null">
        {{ t('rulesPage.filters.all') }}
      </button>
      <button
        v-for="type in PROJECT_TYPES"
        :key="type.id"
        type="button"
        :class="[chipClass, filters.type === type.id ? onClass : offClass]"
        :aria-pressed="filters.type === type.id"
        @click="filters.type = type.id"
      >
        {{ localized(type.name, locale) }}
      </button>
    </div>
    <span :id="onlyLabelId" class="text-[13px] text-ink-2">{{ t('rulesPage.filters.only') }}</span>
    <div class="flex flex-wrap items-center gap-2">
      <div role="group" :aria-labelledby="onlyLabelId" class="flex flex-wrap gap-2">
        <button type="button" :class="[chipClass, filters.error ? onClass : offClass]" :aria-pressed="filters.error" @click="toggle('error')">
          <span class="font-bold text-danger">{{ severityName('error', severities) }}</span> {{ chipCounts.error }}
        </button>
        <button type="button" :class="[chipClass, filters.warning ? onClass : offClass]" :aria-pressed="filters.warning" @click="toggle('warning')">
          <span class="font-bold text-amber">{{ severityName('warning', severities) }}</span> {{ chipCounts.warning }}
        </button>
        <button type="button" :class="[chipClass, filters.needsProject ? onClass : offClass]" :aria-pressed="filters.needsProject" @click="toggle('needsProject')">
          {{ t('rulesPage.filters.needsProject') }} {{ chipCounts.needsProject }}
        </button>
      </div>
      <button
        v-if="plannedCount > 0 || filters.showPlanned"
        type="button"
        role="switch"
        :aria-checked="filters.showPlanned"
        class="flex min-h-9 items-center gap-2.5 border-0 bg-transparent text-[13.5px] text-ink-2 sm:ml-auto"
        @click="toggle('showPlanned')"
      >
        <span>{{ t('rulesPage.filters.showPlanned', { n: plannedCount }) }}</span>
        <span aria-hidden="true" class="flex h-[22px] w-[38px] rounded-[11px] border p-0.5 transition-[border-color,background-color] duration-150" :class="filters.showPlanned ? 'border-amber bg-amber-soft' : 'border-line-strong'">
          <span class="size-4 rounded-full transition-transform duration-150" :class="filters.showPlanned ? 'translate-x-4 bg-amber' : 'bg-ink-2'" />
        </span>
      </button>
    </div>
  </div>
</template>
