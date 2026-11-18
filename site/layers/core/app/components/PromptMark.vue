<script setup lang="ts">
/**
 * 指令前面裝飾用的 `$ `。字是 CSS 產生的（`.prompt-mark::before`），
 * 選取或「複製」都不會帶到它，報讀器也不念。全站畫 `$` 一律用這個元件。
 */
</script>

<template>
  <span class="prompt-mark select-none" aria-hidden="true" />
</template>
