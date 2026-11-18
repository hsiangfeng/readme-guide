<script setup lang="ts">
import type { ProjectType } from '#shared/types/project'
import { DEFAULT_PROJECT_TYPE, PROJECT_TYPES } from '#shared/utils/projectTypes'

/**
 * 八塊結構：標題與說明、三個問題、四種範本的分頁、解剖圖、動作列。
 * 分頁換的是解剖圖中間那份 README（lint/fixtures/ 裡「範本填完的樣子」）和旁邊的「為什麼」；
 * 「複製這份範本」複製的是 templates/ 裡的範本原文。
 */
const { t } = useI18n()

/** 選的範本 */
const selected = ref<ProjectType>(DEFAULT_PROJECT_TYPE)

/** 四種範本的原文（產生靜態頁時讀好） */
const { data: templateTexts } = await useTemplateTexts(() => PROJECT_TYPES.map((type) => type.id))

/** 四種類型「範本填完的樣子」（產生靜態頁時讀好、拆好） */
const { data: samples, error } = await useAnatomySamples()
if (error.value) throw createError({ statusCode: 500, statusMessage: error.value.message, fatal: true })
const sample = computed(() => samples.value?.[selected.value])

const baseId = useId()
const panelId = `${baseId}-panel`

/**
 * 某個分頁的 id。
 * @param type 專案類型
 */
function tabId(type: ProjectType) {
  return `${baseId}-tab-${type}`
}
</script>

<template>
  <section aria-labelledby="anatomy-title" class="border-t border-line">
    <PageContainer class="pt-14 pb-16 sm:pt-20 sm:pb-[88px]">
      <div id="anatomy">
        <!-- 真的能跑的指令：中間那份 README 就是這個檔 -->
        <CommandEyebrow v-if="sample" :text="`cat ${sample.path}`" />
        <AnatomyIntro class="mt-3.5" />
        <QuestionGroups class="mt-11" />
      </div>
      <div id="templates" class="mt-[52px]">
        <TemplateTabs v-model="selected" :panel-id="panelId" :tab-id="tabId" />
        <div :id="panelId" role="tabpanel" :aria-labelledby="tabId(selected)" tabindex="0" class="mt-8 xl:mt-11">
          <AnatomyDiagram v-if="sample" :sample="sample" :window-title="t('anatomy.windowTitle')" />
        </div>
        <AnatomyActions :type="selected" :template-text="templateTexts?.[selected] ?? ''" class="mt-10" />
      </div>
    </PageContainer>
  </section>
</template>
