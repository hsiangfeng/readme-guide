<script setup lang="ts">
import type { BlockInfo } from '#shared/utils/blocks'
import { dataLang, localized } from '#shared/utils/locales'
import { guideContentPath } from '../data/content'

/** 寫法頁的開頭：像指令的小字、編號與名稱、為什麼要有這一塊 */
defineProps<{ block: BlockInfo, why: string }>()

const { locale } = useI18n()
</script>

<template>
  <header>
    <!-- 真的能跑的指令：這一頁的內容就在 repo 的這個檔 -->
    <CommandEyebrow :text="`cat ${guideContentPath(dataLang(locale), block.id)}`" />
    <div class="mt-5 flex items-center gap-[18px]">
      <BlockBadge :number="block.number" size="lg" />
      <h1 id="guide-title" class="m-0 text-[clamp(2rem,1.4rem+2.4vw,3rem)] leading-[1.25] font-black tracking-[-0.01em]">{{ localized(block.name, locale) }}</h1>
    </div>
    <p class="mt-5 mb-0 text-[17px] leading-[1.8] sm:text-[19px]">{{ why }}</p>
  </header>
</template>
