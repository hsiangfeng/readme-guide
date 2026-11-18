<script setup lang="ts">
/** 八塊的編號方框（01～08；整份文件是 —） */
withDefaults(defineProps<{ number: string, size?: 'md' | 'lg' }>(), { size: 'md' })
</script>

<template>
  <span
    class="flex flex-none items-center justify-center border border-amber font-mono font-bold text-amber"
    :class="size === 'lg' ? 'h-[42px] w-[58px] rounded-lg text-[19px] font-extrabold' : 'h-7 w-[38px] rounded-md text-[13px]'"
  >{{ number }}</span>
</template>
