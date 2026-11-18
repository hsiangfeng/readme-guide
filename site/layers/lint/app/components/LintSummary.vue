<script setup lang="ts">
/** 檢查結果的總結：幾個問題、其中幾個錯誤幾個警告；有錯誤就用紅色 */
const props = defineProps<{ counts: { total: number, errors: number, warnings: number } }>()

const { t } = useI18n()

const text = computed(() => t('lint.summary', {
  problems: t('lint.problems', props.counts.total),
  errors: t('lint.errors', props.counts.errors),
  warnings: t('lint.warnings', props.counts.warnings),
}))
</script>

<template>
  <p class="m-0 px-4 font-bold" :class="counts.errors > 0 ? 'text-danger' : 'text-ok'">
    <span aria-hidden="true">{{ counts.errors > 0 ? '✖︎ ' : '✓ ' }}</span>{{ text }}
  </p>
</template>
