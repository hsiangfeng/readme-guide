<script setup lang="ts">
import { localized } from '#shared/utils/locales'
import { PROJECT_TYPES } from '#shared/utils/projectTypes'

/** 四種專案在這一塊各自要注意的事，每一列連到那一種的範本 */
defineProps<{ texts: Record<string, string> }>()

const { t, locale } = useI18n()
const paths = useSitePaths()
</script>

<template>
  <section aria-labelledby="guide-types">
    <SectionTitle id="guide-types">{{ t('guide.typesTitle') }}</SectionTitle>
    <ul class="mt-[22px] mb-0 list-none border-t border-line p-0">
      <li v-for="type in PROJECT_TYPES" :key="type.id" class="grid grid-cols-[minmax(0,1fr)] gap-x-6 gap-y-1.5 border-b border-line py-4 md:grid-cols-[208px_minmax(0,1fr)]">
        <div>
          <p class="m-0 text-[16px] font-bold">{{ localized(type.name, locale) }}</p>
          <NuxtLink :to="paths.template(type.id)" class="font-mono text-[12.5px] text-amber no-underline hover:text-amber-hover">{{ type.file }} <span aria-hidden="true">→</span></NuxtLink>
        </div>
        <p class="m-0 text-[15.5px] leading-[1.85] text-ink-2"><RichText :text="texts[type.id] ?? ''" /></p>
      </li>
    </ul>
  </section>
</template>
