<script setup lang="ts">
import type { Localized, RuleData } from '#shared/types/rules'
import { ISSUES_URL } from '#shared/utils/site'

/**
 * 所有規則：左邊八塊索引（篩完的條數、捲到哪一組），右邊篩選與依八塊分組的規則。
 * 網址帶 #規則代號 進來（或之後改了網址的 #）：被篩掉就放寬篩選，展開那一條並捲過去。
 */
const props = defineProps<{
  rules: readonly RuleData[]
  labels: { severities: Record<string, Localized>, statuses: Record<string, Localized> }
}>()

const { t } = useI18n()
const { filters, visible, groups, chipCounts, plannedCount, reveal } = useRuleFilters(() => props.rules)

/** 展開了哪幾條 */
const opened = ref<Record<string, boolean>>({})

/**
 * 某一組的錨點 id。
 * @param block 塊的代號；null 是整份文件
 */
function groupId(block: string | null): string {
  return `rules-${block ?? 'whole'}`
}

const groupIds = computed(() => groups.value.map((group) => groupId(group.block?.id ?? null)))
const activeGroup = useActiveSection(() => groupIds.value, '-15% 0px -75% 0px')

/** 依網址的 #代號 展開並捲到那一條 */
async function openFromHash() {
  const id = decodeURIComponent(window.location.hash.slice(1))
  if (!props.rules.some((rule) => rule.id === id)) return
  reveal(id)
  opened.value[id] = true
  await nextTick()
  const element = document.getElementById(id)
  element?.scrollIntoView({ block: 'start' })
  element?.querySelector('button')?.focus({ preventScroll: true })
}

onMounted(() => {
  openFromHash()
  window.addEventListener('hashchange', openFromHash)
})
onBeforeUnmount(() => window.removeEventListener('hashchange', openFromHash))

const resultText = computed(() => t('rulesPage.filters.result', { n: visible.value.length }, visible.value.length))
</script>

<template>
  <section class="border-t border-line">
    <PageContainer class="pt-10 pb-20 sm:pt-14 sm:pb-24 lg:grid lg:grid-cols-[232px_minmax(0,1fr)] lg:items-start lg:gap-16">
      <RulesIndex class="hidden lg:sticky lg:top-6 lg:block" :groups="groups" :active="activeGroup" :group-id="groupId" />
      <div class="min-w-0">
        <RulesFilters v-model="filters" :chip-counts="chipCounts" :planned-count="plannedCount" :severities="labels.severities" />
        <p class="sr-only" aria-live="polite">{{ resultText }}</p>
        <RulesGroup
          v-for="group in groups"
          :id="groupId(group.block?.id ?? null)"
          :key="groupId(group.block?.id ?? null)"
          v-model:opened="opened"
          class="mt-11 scroll-mt-6"
          :group="group"
          :all-rules="rules"
          :labels="labels"
        />
        <div class="mt-14 flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border-t border-line pt-6">
          <p class="m-0 text-[14.5px] text-ink-2">{{ t('rulesPage.feedback') }}</p>
          <a :href="ISSUES_URL" class="inline-flex items-center gap-1.5 text-[14.5px] font-bold text-amber no-underline hover:text-amber-hover">{{ t('rulesPage.feedbackLink') }} <span aria-hidden="true">→</span></a>
        </div>
      </div>
    </PageContainer>
  </section>
</template>
