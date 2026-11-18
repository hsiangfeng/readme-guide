<script setup lang="ts">
/** 小標籤：必填（琥珀底）、一般（外框灰字，例如「選填」「對照專案檔案」）、外框一般字色（「有條件」） */
withDefaults(defineProps<{ tone?: 'accent' | 'plain' | 'outline' }>(), { tone: 'plain' })

const toneClass = {
  accent: 'border-amber-soft bg-amber-soft text-amber',
  plain: 'border-line text-ink-2',
  outline: 'border-line text-ink',
}
</script>

<template>
  <span
    class="inline-flex h-[22px] items-center rounded border px-2 text-[12px] font-medium whitespace-nowrap"
    :class="toneClass[tone]"
  ><slot /></span>
</template>
