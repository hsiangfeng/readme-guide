<script setup lang="ts">
/** 內頁的二級標題，前面帶琥珀色的 `##` */
withDefaults(defineProps<{ id?: string, size?: 'md' | 'lg' }>(), { id: undefined, size: 'lg' })
</script>

<template>
  <h2 :id="id" class="m-0 leading-[1.4] font-black" :class="size === 'lg' ? 'text-[clamp(1.5rem,1.2rem+1vw,1.6875rem)]' : 'text-[24px]'">
    <span aria-hidden="true" class="mr-3 font-mono font-bold text-amber">##</span><slot />
  </h2>
</template>
