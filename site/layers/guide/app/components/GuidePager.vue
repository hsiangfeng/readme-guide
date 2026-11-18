<script setup lang="ts">
import type { BlockInfo } from '#shared/utils/blocks'
import { localized } from '#shared/utils/locales'

/** 上一塊、下一塊（第一塊沒有上一塊，最後一塊沒有下一塊） */
defineProps<{ previous: BlockInfo | null, next: BlockInfo | null }>()

const { t, locale } = useI18n()
const paths = useSitePaths()

const cardClass = 'block rounded-[10px] border border-line px-5 py-[18px] no-underline transition-[background-color,border-color] duration-150 hover:border-amber hover:bg-surface'
</script>

<template>
  <nav :aria-label="t('guide.pager')" class="grid gap-5 sm:grid-cols-2">
    <NuxtLink v-if="previous" :to="paths.guide(previous.id)" :class="cardClass" rel="prev">
      <span class="block text-[13px] text-ink-2"><span aria-hidden="true">← </span>{{ t('guide.previous') }}</span>
      <span class="mt-2 flex items-center gap-3">
        <BlockBadge :number="previous.number" />
        <span class="text-[18px] font-bold">{{ localized(previous.name, locale) }}</span>
      </span>
    </NuxtLink>
    <span v-else class="hidden sm:block" />
    <NuxtLink v-if="next" :to="paths.guide(next.id)" :class="cardClass" class="sm:text-right" rel="next">
      <span class="block text-[13px] text-ink-2">{{ t('guide.next') }}<span aria-hidden="true"> →</span></span>
      <span class="mt-2 flex items-center gap-3 sm:flex-row-reverse">
        <BlockBadge :number="next.number" />
        <span class="text-[18px] font-bold">{{ localized(next.name, locale) }}</span>
      </span>
    </NuxtLink>
  </nav>
</template>
