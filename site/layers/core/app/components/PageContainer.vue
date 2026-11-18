<script setup lang="ts">
/** 內容寬度：桌機 1200px（左右各留 40px），手機左右留 16px */
withDefaults(defineProps<{ as?: string }>(), { as: 'div' })
</script>

<template>
  <component :is="as" class="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-10">
    <slot />
  </component>
</template>
