<script setup lang="ts">
/** 樣本：一般清單或編號清單 */
defineProps<{ items: readonly string[], ordered: boolean }>()
</script>

<template>
  <component :is="ordered ? 'ol' : 'ul'" class="m-0 pl-5 text-[14.5px] marker:text-paper-ink-2" :class="ordered ? 'list-decimal' : 'list-disc'">
    <li v-for="(item, index) in items" :key="index"><SampleInline :text="item" /></li>
  </component>
</template>
