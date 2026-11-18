<script setup lang="ts">
/**
 * 樣本：表格（例如環境變數）。英數字串（變數名稱、網址）一律不從中間折斷：
 * 第一、二欄不換行，其他欄至少留幾個字寬；真的放不下時表格自己橫向捲動，整頁不會跟著捲。
 */
defineProps<{ head: readonly string[], rows: readonly (readonly string[])[] }>()
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full border-collapse text-left text-[13px] leading-[1.6]">
      <thead>
        <tr>
          <th v-for="cell in head" :key="cell" scope="col" class="border-b-[1.5px] border-paper-ink py-1.5 pr-3 font-bold whitespace-nowrap last:pr-0">{{ cell }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in rows" :key="index">
          <td v-for="(cell, column) in row" :key="column" class="border-b border-paper-line py-1.5 pr-3 align-top last:pr-0" :class="column < 2 ? 'whitespace-nowrap' : 'min-w-[6.5em] text-paper-ink-2'">
            <SampleInline :text="cell" :strong-code="column === 0" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
