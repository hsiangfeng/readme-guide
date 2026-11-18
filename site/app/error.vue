<script setup lang="ts">
import type { NuxtError } from '#app'
import { localeInfo } from '#shared/utils/locales'

/**
 * 找不到頁面（與其他錯誤）：保留頂端列與頁尾，一句話說明，連回首頁。
 */
defineProps<{ error: NuxtError }>()

const { locale, t } = useI18n()
const paths = useSitePaths()

useHead({
  htmlAttrs: { lang: computed(() => localeInfo(locale.value).tag) },
  title: () => `${t('common.notFound.title')}｜${t('common.brand')}`,
  meta: [{ name: 'robots', content: 'noindex' }],
})
</script>

<template>
  <div>
    <SiteHeader />
    <main id="main" class="border-t border-line">
      <PageContainer class="py-24 sm:py-32">
        <CommandEyebrow text="404" :prompt="false" />
        <h1 class="mt-4 mb-0 text-[clamp(2rem,1.5rem+2vw,2.75rem)] leading-[1.3] font-black">{{ t('common.notFound.title') }}</h1>
        <p class="mt-3 mb-0 text-[16px] text-ink-2">{{ t('common.notFound.body') }}</p>
        <ArrowLink class="mt-8" :to="paths.home()" size="lg">{{ t('common.notFound.home') }}</ArrowLink>
      </PageContainer>
    </main>
    <SiteFooter />
    <LazyLocaleFontTc v-if="locale === 'zh-tw'" />
  </div>
</template>
