<script setup lang="ts">
import type { BlockInfo } from '#shared/utils/blocks'
import { dataLang, localized } from '#shared/utils/locales'
import { DEFAULT_PROJECT_TYPE } from '#shared/utils/projectTypes'

/**
 * 寫法頁左邊的八塊索引。1024 以上固定在左邊；比較窄時收成頁面最上面一個可以展開的清單。
 */
const props = defineProps<{ current: BlockInfo }>()

const { t, locale } = useI18n()
const paths = useSitePaths()
const groups = useBlockIndex(paths.guide)

const open = ref(false)
const panelId = useId()
const route = useRoute()

// 換到別一塊就收起來
watch(() => route.path, () => {
  open.value = false
})

const currentLabel = computed(() => t('guide.indexCurrent', { number: props.current.number, name: localized(props.current.name, locale.value) }))
</script>

<template>
  <div class="mb-8 lg:sticky lg:top-6 lg:mb-0">
    <button
      type="button"
      class="flex min-h-12 w-full items-center justify-between gap-3 rounded-lg border border-line bg-surface px-4 text-left lg:hidden"
      :aria-expanded="open"
      :aria-controls="panelId"
      @click="open = !open"
    >
      <span class="min-w-0">
        <span class="block text-[12.5px] text-ink-2">{{ t('guide.indexToggle') }}</span>
        <span class="block truncate text-[15px] font-bold">{{ currentLabel }}</span>
      </span>
      <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" class="flex-none text-ink-2" :class="open && 'rotate-180'"><path d="M6 9l6 6 6-6" /></svg>
    </button>
    <div :id="panelId" class="mt-3 lg:mt-0 lg:block" :class="open ? 'block' : 'hidden'">
      <BlockIndexNav :command="`ls site/content/guide/${dataLang(locale)}/`" :groups="groups" :current="current.id">
        <div class="mt-[26px] flex flex-col gap-2 border-t border-line pt-[18px] text-[14px]">
          <ArrowLink :to="paths.template(DEFAULT_PROJECT_TYPE)" size="sm">{{ t('guide.templatesLink') }}</ArrowLink>
          <ArrowLink :to="paths.rules()" size="sm">{{ t('guide.rulesLink') }}</ArrowLink>
        </div>
      </BlockIndexNav>
    </div>
  </div>
</template>
