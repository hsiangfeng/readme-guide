<script setup lang="ts">
import type { SiteNavItem } from '../composables/useSiteNav'

/** 導覽連結；桌機橫排在頂端列，手機直排在展開的選單裡 */
const props = withDefaults(defineProps<{
  items: readonly SiteNavItem[]
  /** 目前該標出來的導覽代號 */
  active: string
  /** aria-current 的值：首頁是捲動位置（true），內頁是所在頁面（page） */
  currentType?: 'true' | 'page'
  direction?: 'row' | 'column'
}>(), { direction: 'row', currentType: 'true' })

const emit = defineEmits<{ navigate: [] }>()

const { t } = useI18n()

const isRow = computed(() => props.direction === 'row')
</script>

<template>
  <nav :aria-label="t('common.nav.label')">
    <ul class="m-0 flex list-none p-0" :class="isRow ? 'items-center gap-8' : 'flex-col'">
      <li v-for="item in items" :key="item.id">
        <NuxtLink
          :to="item.to"
          :aria-current="item.id === active ? currentType : undefined"
          class="no-underline transition-[color,background-color,border-color] duration-150 hover:text-ink"
          :class="[
            item.id === active ? 'text-ink' : 'text-ink-2',
            isRow ? 'text-[14.5px] font-medium' : 'flex min-h-12 items-center border-b border-line text-[16px] font-medium',
          ]"
          @click="emit('navigate')"
        >{{ t(item.label) }}</NuxtLink>
      </li>
    </ul>
  </nav>
</template>
