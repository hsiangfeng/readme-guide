<script setup lang="ts">
/** 樣本：資料夾結構（```text 區塊裡「路徑、空白、說明」的每一行），左邊路徑、右邊放什麼 */
const props = defineProps<{ lines: readonly string[] }>()

const rows = computed(() => props.lines.map((line) => {
  const [, path = '', text = ''] = /^(\S+)\s+(.*)$/.exec(line) ?? []
  return { path, text }
}))
</script>

<template>
  <dl class="m-0 grid grid-cols-[max-content_minmax(0,1fr)] gap-x-5 gap-y-1 text-[14px]">
    <template v-for="row in rows" :key="row.path">
      <dt><code class="font-mono text-[13px] font-bold whitespace-nowrap">{{ row.path }}</code></dt>
      <dd class="m-0 text-paper-ink-2"><SampleInline :text="row.text" /></dd>
    </template>
  </dl>
</template>
