<script setup lang="ts">
import { localized } from '#shared/utils/locales'
import { countRules } from '#shared/utils/ruleCatalog'
import { CHECKER_ID, checkerNode, sitePage } from '#shared/utils/seo'

/**
 * 檢查項目頁：上面幾個數字與怎麼跑，下面是依八塊分組的所有規則，可以篩選、展開。
 * 數字、分組、每一條的文字都從 rules/rules.json 算，不寫死。網址帶 #規則代號 會自動展開並捲到那一條。
 */
const { t, locale } = useI18n()

const { data } = await useRules('rules-page', (file) => ({ rules: file.rules, severities: file.severities, statuses: file.statuses }))

const rules = computed(() => data.value?.rules ?? [])
const counts = computed(() => countRules(rules.value))
const labels = computed(() => (data.value ? { severities: data.value.severities, statuses: data.value.statuses } : null))

// 檢查項目頁：主角是檢查工具，列出頁面上一進來就看得到的規則（已實作的；規劃中的要打開開關才看得到，不放）
usePageSeo(sitePage('rules'), () => ({
  type: 'WebPage',
  breadcrumb: true,
  extra: {
    about: { '@id': CHECKER_ID },
    mainEntity: {
      '@type': 'ItemList',
      'name': t('rulesPage.meta.title'),
      'itemListElement': rules.value
        .filter((rule) => rule.status === 'implemented')
        .map((rule, index) => ({ '@type': 'ListItem', 'position': index + 1, 'name': `${rule.id} ${localized(rule.title, locale.value)}` })),
    },
  },
  nodes: [checkerNode(t('common.meta.checkerName'), t('lint.lead1'))],
}))
</script>

<template>
  <div class="border-t border-line">
    <RulesHeader :counts="counts" :severities="data?.severities ?? null" />
    <RulesRun />
    <RulesCatalog v-if="labels" :rules="rules" :labels="labels" />
  </div>
</template>
