<script setup lang="ts">
import { localized } from '#shared/utils/locales'
import { PROJECT_TYPES } from '#shared/utils/projectTypes'

/**
 * 四種範本的切換：每一個都是連到那一種範本頁的連結（換頁），目前這一種標出來。
 * 窄螢幕放不下四個時可以橫向滑動，整頁不會跟著捲。
 */
defineProps<{ current: string }>()

const { t, locale } = useI18n()
const paths = useSitePaths()
</script>

<template>
  <nav :aria-label="t('templatePage.tabsLabel')" class="overflow-x-auto [scrollbar-width:thin]">
    <ul class="m-0 flex min-w-max list-none border-b border-line p-0">
      <li v-for="type in PROJECT_TYPES" :key="type.id" class="-mb-px">
        <NuxtLink
          :to="paths.template(type.id)"
          :aria-current="type.id === current ? 'page' : undefined"
          class="flex h-14 items-center gap-3 border-b-2 px-[18px] no-underline transition-[color,background-color,border-color] duration-150 lg:min-w-[255px]"
          :class="type.id === current ? 'border-amber bg-surface text-ink' : 'border-transparent text-ink-2 hover:bg-surface hover:text-ink'"
        >
          <span class="font-mono text-[13px]" :class="type.id === current && 'text-amber'">{{ type.file }}</span>
          <span class="text-[15px] font-bold">{{ localized(type.name, locale) }}</span>
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>
