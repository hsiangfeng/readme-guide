<script setup lang="ts">
import { LOCALES } from '#shared/utils/locales'

/** 語言切換：繁中／EN 兩個連結，目前的語言反白 */
const { t, locale } = useI18n()
const switchLocalePath = useSwitchLocalePath()
</script>

<template>
  <div role="group" :aria-label="t('common.language.label')" class="flex shrink-0 overflow-hidden rounded-md border border-line">
    <NuxtLink
      v-for="item in LOCALES"
      :key="item.code"
      :to="switchLocalePath(item.code)"
      :lang="item.tag"
      :hreflang="item.tag"
      :aria-current="item.code === locale ? 'true' : undefined"
      class="flex h-[34px] items-center px-3 text-[13px] no-underline transition-[color,background-color,border-color]"
      :class="item.code === locale ? 'bg-ink font-bold text-bg' : 'bg-bg text-ink-2 hover:text-ink'"
    >{{ item.shortName }}</NuxtLink>
  </div>
</template>
