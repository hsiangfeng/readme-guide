<script setup lang="ts">
import type { SiteNavItem } from '../composables/useSiteNav'

/** 手機與平板展開的選單：導覽連結直排，最下面放 GitHub */
defineProps<{ id: string, items: readonly SiteNavItem[], active: string, currentType: 'true' | 'page' }>()
const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <div :id="id" class="border-t border-line lg:hidden">
    <PageContainer class="pb-5">
      <SiteNav :items="items" :active="active" :current-type="currentType" direction="column" @navigate="emit('close')" />
      <GithubLink class="mt-4 w-fit" />
    </PageContainer>
  </div>
</template>
