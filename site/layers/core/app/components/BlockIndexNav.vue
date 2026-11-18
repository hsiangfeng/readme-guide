<script setup lang="ts">
import type { IndexGroup } from '../types'

/**
 * 八塊的索引（寫法頁與檢查項目頁的左邊）：依讀者的三個問題分組，目前這一塊標出來。
 * 每一項可以帶條數（檢查項目頁）。最下面可以放別的連結（slot）。
 */
defineProps<{
  /** 最上面那行像指令的小字 */
  command: string
  groups: readonly IndexGroup[]
  /** 目前這一塊的代號 */
  current: string | null
  /** 目前這一塊是頁面本身（page）還是捲到的位置（location） */
  currentType?: 'page' | 'location'
}>()

const emit = defineEmits<{ navigate: [id: string] }>()

const { t } = useI18n()
</script>

<template>
  <nav :aria-label="t('common.blockIndex.label')" class="text-[14.5px]">
    <p class="m-0 font-mono text-[12.5px] text-amber"><PromptMark />{{ command }}</p>
    <div v-for="group in groups" :key="group.id">
      <p class="mt-[22px] mb-0 pb-1.5 pl-3.5 text-[12.5px] font-medium text-ink-2">{{ group.label }}</p>
      <ul class="m-0 list-none p-0">
        <li v-for="item in group.items" :key="item.id">
          <NuxtLink
            :to="item.to"
            :aria-current="item.id === current ? (currentType ?? 'page') : undefined"
            class="flex items-baseline gap-3 border-l-2 px-3 py-[7px] no-underline transition-[color,background-color,border-color] duration-150 hover:border-l-line-strong hover:text-ink"
            :class="item.id === current ? 'border-l-amber! bg-surface font-bold text-ink' : 'border-l-line text-ink-2'"
            @click="emit('navigate', item.id)"
          >
            <span class="font-mono text-[12.5px] font-normal" :class="item.id === current ? 'text-amber' : 'text-ink-2'">{{ item.number }}</span>
            <span>{{ item.name }}</span>
            <span v-if="item.count !== undefined" class="ml-auto font-mono text-[12.5px] font-normal text-ink-2">{{ item.count }}</span>
          </NuxtLink>
        </li>
      </ul>
    </div>
    <slot />
  </nav>
</template>
