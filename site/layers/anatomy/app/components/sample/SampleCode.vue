<script setup lang="ts">
/** 樣本：程式碼區塊。每行不折行，太長時區塊自己橫向捲動（指令從中間折斷會讓人照抄抄錯） */
defineProps<{ lines: readonly string[] }>()
</script>

<template>
  <div class="overflow-x-auto bg-paper-ink px-3.5 py-3 font-mono text-xs leading-[1.8] text-ink">
    <p v-for="(line, index) in lines" :key="index" class="m-0 w-max min-w-full whitespace-pre">{{ line || ' ' }}</p>
  </div>
</template>
