<script setup lang="ts">
import { localeInfo } from '#shared/utils/locales'

const { locale, t } = useI18n()

/** `<html lang>` 用的語言標籤 */
const htmlLang = computed(() => localeInfo(locale.value).tag)

// 標題、描述、canonical、語言對應、分享卡片、結構化資料由每一頁自己的 usePageSeo 設定
useHead({
  htmlAttrs: { lang: htmlLang },
})
</script>

<template>
  <div>
    <a
      href="#main"
      class="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-amber focus:px-4 focus:py-2 focus:font-bold focus:text-amber-ink"
    >{{ t('common.skipToContent') }}</a>
    <SiteHeader />
    <main id="main" tabindex="-1" class="outline-none">
      <NuxtPage />
    </main>
    <SiteFooter />
    <LazyLocaleFontTc v-if="locale === 'zh-tw'" />
  </div>
</template>
