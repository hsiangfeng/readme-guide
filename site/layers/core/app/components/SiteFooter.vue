<script setup lang="ts">
import { BLOCKS } from '#shared/utils/blocks'
import { LOCALES, localized } from '#shared/utils/locales'
import { PROJECT_TYPES } from '#shared/utils/projectTypes'
import { BLOG_URL, REPO_URL } from '#shared/utils/site'

/**
 * 頁尾：上面是全站導覽（八塊的寫法、範本、檢查項目，讓每一頁都能從任何一頁兩次點擊內到達，搜尋引擎也爬得到），
 * 下面是品牌、署名、GitHub、部落格、換到另一個語言。塊與類型的清單讀 rules/。
 */
const { t, locale } = useI18n()
const paths = useSitePaths()

/** 全站導覽的三欄 */
const sitemap = computed(() => [
  { id: 'guide', title: t('common.footer.guide'), links: BLOCKS.map((block) => ({ to: paths.guide(block.id), number: block.number, label: localized(block.name, locale.value) })) },
  { id: 'templates', title: t('common.footer.templates'), links: PROJECT_TYPES.map((type) => ({ to: paths.template(type.id), number: undefined, label: localized(type.name, locale.value) })) },
  { id: 'rules', title: t('common.footer.rules'), links: [{ to: paths.rules(), number: undefined, label: t('common.footer.allRules') }] },
])
const switchLocalePath = useSwitchLocalePath()

/** 另一個語言（繁中頁顯示 English，英文頁顯示繁體中文） */
const otherLocale = computed(() => LOCALES.find((item) => item.code !== locale.value)!)

const linkClass = 'text-ink-2 no-underline transition-[color,background-color,border-color] duration-150 hover:text-ink'
</script>

<template>
  <footer class="border-t border-line">
    <PageContainer as="nav" :aria-label="t('common.footer.sitemap')" class="grid gap-x-10 gap-y-8 pt-10 pb-2 text-[13.5px] sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
      <div v-for="column in sitemap" :key="column.id">
        <p class="m-0 font-mono text-[12.5px] font-bold text-ink">{{ column.title }}</p>
        <ul class="m-0 mt-3 grid list-none gap-x-8 gap-y-2 p-0" :class="column.id === 'guide' && 'sm:grid-cols-2'">
          <li v-for="link in column.links" :key="link.to">
            <NuxtLink :to="link.to" :class="linkClass"><span v-if="link.number" class="mr-2 font-mono text-[12px]">{{ link.number }}</span>{{ link.label }}</NuxtLink>
          </li>
        </ul>
      </div>
    </PageContainer>
    <PageContainer class="flex flex-wrap items-center justify-between gap-4 py-[30px] text-[13.5px] text-ink-2">
      <div class="flex flex-wrap items-center gap-2.5">
        <span class="font-mono font-extrabold text-ink">{{ t('common.brand') }}</span>
        <span aria-hidden="true">·</span>
        <span lang="zh-Hant-TW">{{ t('common.byline') }}</span>
      </div>
      <nav :aria-label="t('common.footer.label')" class="flex flex-wrap gap-6">
        <a :href="REPO_URL" :class="linkClass">{{ t('common.footer.github') }}</a>
        <a :href="BLOG_URL" :class="linkClass">{{ t('common.footer.blog') }}</a>
        <NuxtLink
          :to="switchLocalePath(otherLocale.code)"
          :lang="otherLocale.tag"
          :hreflang="otherLocale.tag"
          :class="linkClass"
        >{{ otherLocale.nativeName }}</NuxtLink>
      </nav>
    </PageContainer>
  </footer>
</template>
