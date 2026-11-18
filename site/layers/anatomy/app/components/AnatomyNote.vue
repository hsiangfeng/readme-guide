<script setup lang="ts">
import { localized } from '#shared/utils/locales'
import type { BlockInfo } from '#shared/utils/blocks'

/**
 * 解剖圖旁的說明：編號、名稱（連到這一塊的完整寫法）、為什麼要有這一塊。
 * 寬螢幕放在左邊的說明靠右對齊、編號在右；比較窄時一律靠左、編號在前。
 */
defineProps<{
  block: BlockInfo
  /** 「為什麼」的訊息 key */
  why: string | undefined
  side: 'left' | 'right'
}>()

const { t, locale } = useI18n()
const paths = useSitePaths()
</script>

<template>
  <div class="flex items-start gap-3.5 xl:items-center" :class="side === 'left' && 'xl:flex-row-reverse xl:text-right'">
    <BlockBadge :number="block.number" />
    <div class="min-w-0">
      <h3 class="m-0 text-[17px] leading-[1.5] font-bold">
        <NuxtLink
          :to="paths.guide(block.id)"
          class="text-ink underline decoration-line-strong decoration-1 underline-offset-[5px] transition-[color,text-decoration-color] duration-150 hover:text-amber hover:decoration-amber"
        >{{ localized(block.name, locale) }}</NuxtLink>
      </h3>
      <p v-if="why" class="m-0 text-[14px] leading-[1.7] text-ink-2">{{ t(why) }}</p>
    </div>
  </div>
</template>
