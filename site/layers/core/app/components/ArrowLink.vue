<script setup lang="ts">
/** 琥珀色粗體文字連結，後面帶箭頭（通往別頁或別的區塊） */
withDefaults(defineProps<{ to: string, size?: 'sm' | 'md' | 'lg' }>(), { size: 'md' })

const sizeClass = { sm: 'text-[13.5px]', md: 'text-[14.5px]', lg: 'text-[15px]' }
</script>

<template>
  <NuxtLink
    :to="to"
    class="inline-flex items-center gap-1.5 font-bold text-amber no-underline transition-[color,background-color,border-color] hover:text-amber-hover"
    :class="sizeClass[size]"
  >
    <slot />
    <span aria-hidden="true">→</span>
  </NuxtLink>
</template>
