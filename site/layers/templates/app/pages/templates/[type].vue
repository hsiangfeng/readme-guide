<script setup lang="ts">
import { firstPlaceholder } from '#shared/utils/placeholders'
import { beforeCjk, localeInfo, localized } from '#shared/utils/locales'
import { PROJECT_TYPES, projectTypeInfo } from '#shared/utils/projectTypes'
import { PERSON_REF, sitePage } from '#shared/utils/seo'

/**
 * 範本頁：一份範本的原文，依標題切成八塊，右邊說明每一塊必填或選填、要注意什麼。
 * 類型、塊的名稱與說明、必填章節都讀 rules/；範本原文讀 templates/<語言>/<類型>.md。
 */
const route = useRoute()
const typeId = String(route.params.type)

if (!PROJECT_TYPES.some((type) => type.id === typeId)) {
  throw createError({ statusCode: 404, statusMessage: 'Not Found', fatal: true })
}

const { t, locale } = useI18n()
const type = projectTypeInfo(typeId)
const { data, error } = await useTemplatePage(typeId)
if (error.value) throw createError({ statusCode: 500, statusMessage: error.value.message, fatal: true })

const split = computed(() => (data.value ? splitTemplate(data.value.text) : null))
const typeName = computed(() => localized(type.name, locale.value))
const description = computed(() => localized(type.description, locale.value))

// 範本頁：網頁本身是 WebPage，頁面主角是那份可以複製、下載的 Markdown 範本
usePageSeo(sitePage('template', typeId), () => ({
  type: 'WebPage',
  breadcrumb: true,
  extra: {
    mainEntity: {
      '@type': 'CreativeWork',
      'name': t('templatePage.meta.title', { type: beforeCjk(typeName.value, locale.value) }),
      'description': description.value,
      'encodingFormat': 'text/markdown',
      'inLanguage': localeInfo(locale.value).tag,
      'isAccessibleForFree': true,
      'author': PERSON_REF,
    },
  },
}))
</script>

<template>
  <div class="border-t border-line">
    <PageContainer class="pt-10 pb-20 sm:pt-16 sm:pb-[88px]">
      <TemplateHeader :type="type" />
      <TemplateTypeLinks class="mt-11" :current="type.id" />
      <template v-if="data && split">
        <TemplateToolbar class="mt-7" :type="type" :text="data.text" :line-count="split.lineCount" :placeholder-count="split.placeholderCount" />
        <TemplateSource class="mt-7" :type="type" :segments="split.segments" />
      </template>
      <div class="mt-[72px] grid items-start gap-x-16 gap-y-12 lg:grid-cols-2">
        <TemplateCheck :sample="data?.sample ?? null" :first="data ? firstPlaceholder(data.text) : null" />
        <TemplateOthers :current="type.id" />
      </div>
    </PageContainer>
  </div>
</template>
