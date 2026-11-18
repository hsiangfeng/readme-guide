<script setup lang="ts">
withDefaults(defineProps<{ size?: number }>(), { size: 13 })
</script>

<template>
  <svg aria-hidden="true" :width="size" :height="size" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5l2.9 6 6.6 1-4.8 4.6 1.1 6.5L12 17.5l-5.8 3.1 1.1-6.5L2.5 9.5l6.6-1z" /></svg>
</template>
