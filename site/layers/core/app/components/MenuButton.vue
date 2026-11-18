<script setup lang="ts">
/** 手機與平板的選單開關 */
defineProps<{ open: boolean, controls: string }>()
defineEmits<{ toggle: [] }>()

const { t } = useI18n()
</script>

<template>
  <button
    type="button"
    class="flex size-[34px] items-center justify-center rounded-md border border-line bg-bg text-ink"
    :aria-expanded="open"
    :aria-controls="controls"
    :aria-label="open ? t('common.nav.closeMenu') : t('common.nav.openMenu')"
    @click="$emit('toggle')"
  >
    <IconClose v-if="open" />
    <IconMenu v-else />
  </button>
</template>
