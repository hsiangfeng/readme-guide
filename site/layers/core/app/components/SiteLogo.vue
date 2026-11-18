<script setup lang="ts">
/** 左上角的品牌：琥珀色長條加 README Guide，連回目前語言的首頁 */
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <NuxtLink :to="localePath('/')" class="flex shrink-0 items-center gap-2.5 text-ink no-underline">
    <span aria-hidden="true" class="h-5 w-2.5 bg-amber" />
    <span class="font-mono text-[15px] font-extrabold">{{ t('common.brand') }}</span>
  </NuxtLink>
</template>
