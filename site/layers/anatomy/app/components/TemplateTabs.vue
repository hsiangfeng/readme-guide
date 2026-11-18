<script setup lang="ts">
import type { ProjectType } from '#shared/types/project'
import { localized } from '#shared/utils/locales'
import { PROJECT_TYPES } from '#shared/utils/projectTypes'

/**
 * 四種範本的分頁。鍵盤：Tab 進出整組，左右方向鍵換分頁（選了就切換），Home／End 跳到頭尾。
 * 窄螢幕放不下四個時可以橫向滑動，整頁不會跟著橫向捲動。
 */
const model = defineModel<ProjectType>({ required: true })

defineProps<{
  /** 分頁內容的 id */
  panelId: string
  /** 取得某個分頁按鈕的 id */
  tabId: (type: ProjectType) => string
}>()

const { t, locale } = useI18n()

/** 每個分頁的按鈕（依位置存），方向鍵換分頁時要把焦點移過去 */
const tabs: HTMLButtonElement[] = []

/**
 * 記下某個位置的按鈕。
 * @param element 按鈕元素
 * @param index 分頁的位置
 */
function setTab(element: unknown, index: number) {
  if (element instanceof HTMLButtonElement) tabs[index] = element
}

/**
 * 選某個分頁並把焦點移過去。
 * @param index 分頁的位置
 */
function select(index: number) {
  const type = PROJECT_TYPES[index]
  if (!type) return
  model.value = type.id
  tabs[index]?.focus()
}

/**
 * 左右方向鍵、Home、End 換分頁（到底會繞回另一頭）。
 * @param event 鍵盤事件
 * @param index 目前分頁的位置
 */
function onKeydown(event: KeyboardEvent, index: number) {
  const last = PROJECT_TYPES.length - 1
  const next: Record<string, number> = {
    ArrowRight: index === last ? 0 : index + 1,
    ArrowLeft: index === 0 ? last : index - 1,
    Home: 0,
    End: last,
  }
  const target = next[event.key]
  if (target === undefined) return
  event.preventDefault()
  select(target)
}
</script>

<template>
  <div class="overflow-x-auto [scrollbar-width:thin]">
    <div
      role="tablist"
      :aria-label="t('anatomy.tabsLabel')"
      class="flex min-w-max border-b border-line lg:grid lg:min-w-0 lg:grid-cols-4"
    >
      <button
        v-for="(type, index) in PROJECT_TYPES"
        :id="tabId(type.id)"
        :key="type.id"
        :ref="(element) => setTab(element, index)"
        type="button"
        role="tab"
        :aria-selected="model === type.id"
        :aria-controls="panelId"
        :tabindex="model === type.id ? 0 : -1"
        class="flex h-14 shrink-0 items-center gap-3 border-0 border-b-2 px-[18px] text-left whitespace-nowrap transition-[color,background-color,border-color] duration-150"
        :class="model === type.id ? 'border-amber bg-surface text-ink' : 'border-bg bg-bg text-ink-2 hover:bg-surface hover:text-ink'"
        @click="select(index)"
        @keydown="onKeydown($event, index)"
      >
        <span class="font-mono text-[13px]" :class="model === type.id && 'text-amber'">{{ type.file }}</span>
        <span class="text-[15px] font-bold">{{ localized(type.name, locale) }}</span>
      </button>
    </div>
  </div>
</template>
