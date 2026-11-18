<script setup lang="ts">
/** 樣本：截圖的位置（畫一個虛線框代表圖，框裡寫圖的替代文字；不載入任何圖片） */
defineProps<{ alt: string }>()
</script>

<template>
  <div
    role="img"
    :aria-label="alt"
    class="flex min-h-[132px] items-center justify-center gap-2 border border-dashed border-paper-border bg-paper-shot px-5 py-4 text-center text-[13px] leading-[1.6] text-paper-ink-2"
  >
    <IconImage class="flex-none" />
    <span aria-hidden="true">{{ alt }}</span>
  </div>
</template>
