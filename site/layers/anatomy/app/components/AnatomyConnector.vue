<script setup lang="ts">
/** 解剖圖上從說明拉到樣本的線，靠樣本那頭有一個小方塊 */
defineProps<{ side: 'left' | 'right' }>()
</script>

<template>
  <div aria-hidden="true" class="items-center self-center" :class="side === 'right' && 'flex-row-reverse'">
    <span class="flex-1 border-t border-amber" />
    <span class="relative size-[7px] flex-none bg-amber" :class="side === 'left' ? '-mr-1' : '-ml-1'" />
  </div>
</template>
