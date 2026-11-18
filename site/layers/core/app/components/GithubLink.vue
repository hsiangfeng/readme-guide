<script setup lang="ts">
import { parseStarCount } from '#shared/utils/githubStars'
import { REPO_URL } from '#shared/utils/site'

/** 頂端列的 GitHub 按鈕，帶星星數；建置時讀不到星星數就只顯示按鈕（見 nuxt.config.ts） */
const { t } = useI18n()
const stars = parseStarCount(useRuntimeConfig().public.githubStars)
</script>

<template>
  <a
    :href="REPO_URL"
    class="flex h-[34px] shrink-0 items-center gap-2 rounded-md border border-line px-3 text-[13px] font-medium text-ink no-underline motion-safe:transition-transform motion-safe:duration-[120ms] motion-safe:hover:-translate-y-px"
  >
    <span>{{ t('common.github.label') }}</span>
    <span v-if="stars !== null" class="flex items-center gap-1 font-mono text-amber" data-github-stars>
      <IconStar />
      <span aria-hidden="true">{{ stars }}</span>
      <span class="sr-only">{{ t('common.github.stars', { count: stars }) }}</span>
    </span>
  </a>
</template>
