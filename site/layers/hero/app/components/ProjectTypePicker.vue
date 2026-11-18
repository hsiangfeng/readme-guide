<script setup lang="ts">
import type { ProjectType } from '#shared/types/project'
import { localized } from '#shared/utils/locales'
import { PROJECT_TYPES } from '#shared/utils/projectTypes'

/**
 * 專案類型選擇：單選，第一個是「讓 AI 判斷」。
 * 用單選鈕群組的鍵盤操作：Tab 進出整組，方向鍵換選項，Home／End 跳到頭尾。
 */
const model = defineModel<ProjectType | null>({ required: true })

const { t, locale } = useI18n()
const labelId = useId()

/** 所有選項：「讓 AI 判斷」加四種類型 */
const options = computed(() => [
  { value: null, label: t('hero.autoType') },
  ...PROJECT_TYPES.map((type) => ({ value: type.id, label: localized(type.name, locale.value) })),
])

/** 每個選項的按鈕（依位置存），方向鍵換選項時要把焦點移過去 */
const buttons: HTMLButtonElement[] = []

/**
 * 記下某個位置的按鈕。
 * @param element 按鈕元素
 * @param index 選項的位置
 */
function setButton(element: unknown, index: number) {
  if (element instanceof HTMLButtonElement) buttons[index] = element
}

/**
 * 選某一個選項並把焦點移過去。
 * @param index 選項的位置
 */
function select(index: number) {
  const option = options.value[index]
  if (!option) return
  model.value = option.value
  buttons[index]?.focus()
}

/**
 * 方向鍵、Home、End 換選項（到底會繞回另一頭）。
 * @param event 鍵盤事件
 * @param index 目前選項的位置
 */
function onKeydown(event: KeyboardEvent, index: number) {
  const last = options.value.length - 1
  const next: Record<string, number> = {
    ArrowRight: index === last ? 0 : index + 1,
    ArrowDown: index === last ? 0 : index + 1,
    ArrowLeft: index === 0 ? last : index - 1,
    ArrowUp: index === 0 ? last : index - 1,
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
  <div>
    <p :id="labelId" class="m-0 text-[13px] text-ink-2">{{ t('hero.pickerLabel') }}</p>
    <div role="radiogroup" :aria-labelledby="labelId" class="mt-2.5 flex flex-wrap gap-2">
      <button
        v-for="(option, index) in options"
        :key="option.value ?? 'auto'"
        :ref="(element) => setButton(element, index)"
        type="button"
        role="radio"
        :aria-checked="model === option.value"
        :tabindex="model === option.value ? 0 : -1"
        class="h-[38px] rounded-md border px-3.5 text-[14px] transition-[color,background-color,border-color] duration-150 hover:border-amber hover:text-amber"
        :class="model === option.value ? 'border-amber bg-amber-soft font-bold text-amber' : 'border-line bg-bg text-ink'"
        @click="select(index)"
        @keydown="onKeydown($event, index)"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>
