<script setup lang="ts">
/**
 * 複製按鈕：按下去把文字複製到剪貼簿，按鈕上短暫顯示「已複製」。
 * 剪貼簿不能用時顯示「請手動複製」，並通知外面（例如把文字選起來讓使用者自己複製）。
 */
defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  /** 按鈕文字 */
  label: string
  /** 要複製的文字；用函式的話按下去才組 */
  text: string | (() => string)
  /** 實心琥珀色、外框，或外框加深色底 */
  variant?: 'solid' | 'outline'
  size?: 'xs' | 'sm' | 'md' | 'lg'
}>(), { variant: 'solid', size: 'md' })

const emit = defineEmits<{ failed: [] }>()

const { t } = useI18n()
const { state, copy } = useCopyText()

/** 按鈕上現在顯示的字 */
const currentLabel = computed(() => {
  if (state.value === 'copied') return t('common.copy.copied')
  if (state.value === 'failed') return t('common.copy.failed')
  return props.label
})

/** 給螢幕報讀器的結果 */
const announcement = computed(() => {
  if (state.value === 'copied') return t('common.copy.announceCopied')
  if (state.value === 'failed') return t('common.copy.announceFailed')
  return ''
})

const sizeClass = {
  xs: 'h-8 gap-1.5 rounded-[5px] px-3 text-[13px]',
  sm: 'h-9 gap-2 rounded-[5px] px-3.5 text-[14px]',
  md: 'h-[42px] gap-2 rounded-md px-4 text-[14.5px]',
  lg: 'h-[46px] gap-2 rounded-md px-5 text-[15px]',
}

const variantClass = {
  solid: 'border-0 bg-amber text-amber-ink',
  outline: 'border border-line-strong bg-bg text-ink',
}

/** 按下去：組文字、複製，失敗就通知外面 */
async function onClick() {
  const text = typeof props.text === 'function' ? props.text() : props.text
  const copied = await copy(text)
  if (!copied) emit('failed')
}
</script>

<template>
  <button
    v-bind="$attrs"
    type="button"
    class="inline-flex shrink-0 items-center font-bold whitespace-nowrap motion-safe:transition-[transform,background-color,border-color] motion-safe:duration-[120ms] motion-safe:hover:-translate-y-px"
    :class="[sizeClass[size], variantClass[variant]]"
    @click="onClick"
  >
    <IconCheck v-if="state === 'copied'" :size="size === 'lg' ? 16 : 15" />
    <IconCopy v-else :size="size === 'lg' ? 16 : 15" />
    <span>{{ currentLabel }}</span>
  </button>
  <span class="sr-only" aria-live="polite">{{ announcement }}</span>
</template>
