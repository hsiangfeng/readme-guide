<script setup lang="ts">
import { localized } from '#shared/utils/locales'
import { PROJECT_TYPES } from '#shared/utils/projectTypes'

/** 「不確定用哪一份？」：四種類型的說明（rules/project-types.json），其他三種連到各自的範本頁 */
defineProps<{ current: string }>()

const { t, locale } = useI18n()
const paths = useSitePaths()
</script>

<template>
  <section aria-labelledby="template-others" class="min-w-0">
    <SectionTitle id="template-others">{{ t('templatePage.others.title') }}</SectionTitle>
    <ul class="mt-[18px] mb-0 list-none border-t border-line p-0">
      <li v-for="type in PROJECT_TYPES" :key="type.id" class="border-b border-line py-3.5">
        <div class="flex items-baseline justify-between gap-4">
          <span class="text-[16px] font-bold">{{ localized(type.name, locale) }}</span>
          <span v-if="type.id === current" class="text-[12.5px] text-ink-2">{{ t('templatePage.others.current') }}</span>
          <NuxtLink v-else :to="paths.template(type.id)" class="font-mono text-[12.5px] whitespace-nowrap text-amber no-underline hover:text-amber-hover">{{ type.file }} <span aria-hidden="true">→</span></NuxtLink>
        </div>
        <p class="mt-0.5 mb-0 text-[14px] leading-[1.75] text-ink-2">{{ localized(type.description, locale) }}</p>
      </li>
    </ul>
  </section>
</template>
