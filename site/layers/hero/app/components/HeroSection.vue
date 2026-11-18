<script setup lang="ts">
import type { ProjectType } from '#shared/types/project'

/**
 * 主視覺：左邊是標題、專案類型選擇、給 AI 的指令卡；右邊是終端機示意。
 * 選的專案類型會改變指令卡的內容。
 */
const { t } = useI18n()

/** 選的專案類型；null 是「讓 AI 判斷」 */
const projectType = ref<ProjectType | null>(null)
</script>

<template>
  <section id="ai" aria-labelledby="hero-title">
    <PageContainer class="flex flex-wrap items-center gap-x-12 gap-y-12 pt-10 pb-14 sm:pt-[72px] sm:pb-[88px]">
      <div class="min-w-0 flex-[0_1_520px]">
        <HeroIntro />
        <ProjectTypePicker v-model="projectType" class="mt-8" />
        <PromptCard :project-type="projectType" class="mt-4" />
        <p class="mt-3 mb-0 text-[13px] text-ink-2">{{ t('hero.note') }}</p>
      </div>
      <TerminalDemo class="min-w-0 flex-[1_1_560px]" />
    </PageContainer>
  </section>
</template>
