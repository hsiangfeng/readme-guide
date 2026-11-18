<script setup lang="ts">
import { TERMINAL_LINES } from '../data/terminal'

/** 主視覺右邊的終端機示意畫面，下面附說明這只是示意 */
const { t } = useI18n()
</script>

<template>
  <figure class="m-0">
    <div class="overflow-hidden rounded-[10px] border border-line bg-surface">
      <WindowBar :title="t('hero.terminal.title')" class="border-b border-line" />
      <div
        role="group"
        :aria-label="t('hero.terminal.label')"
        class="px-[18px] pt-5 pb-6 font-mono text-[13px] leading-[26px] sm:px-[26px] sm:pt-6 sm:pb-7 sm:text-[14px] sm:leading-[31px]"
      >
        <TerminalLine v-for="(line, index) in TERMINAL_LINES" :key="index" :line="line" />
      </div>
    </div>
    <figcaption class="mt-3 text-[13px] text-ink-2">{{ t('hero.terminalNote') }}</figcaption>
  </figure>
</template>
