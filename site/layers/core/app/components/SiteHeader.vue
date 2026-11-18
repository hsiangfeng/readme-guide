<script setup lang="ts">
/**
 * 頂端列：品牌、導覽、語言切換、GitHub。
 * 桌機（1024 以上）導覽直接排開；比較窄時導覽和 GitHub 收進選單。
 */
const { items, active, currentType } = useSiteNav()

/** 選單是否打開 */
const menuOpen = ref(false)
const menuId = useId()
/** 選單開關按鈕（按 Esc 關選單時焦點回到這裡） */
const menuButton = ref<{ $el: HTMLElement } | null>(null)

/** 按 Esc 關選單，焦點放回開關按鈕 */
function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape' || !menuOpen.value) return
  menuOpen.value = false
  menuButton.value?.$el.focus()
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
  // 視窗拉寬到桌機版時，選單已經沒有用了，順手關掉
  const wide = window.matchMedia('(min-width: 1024px)')
  const onWide = (event: MediaQueryListEvent) => {
    if (event.matches) menuOpen.value = false
  }
  wide.addEventListener('change', onWide)
  onBeforeUnmount(() => {
    document.removeEventListener('keydown', onKeydown)
    wide.removeEventListener('change', onWide)
  })
})
</script>

<template>
  <header class="border-b border-line">
    <PageContainer class="flex min-h-16 items-center justify-between gap-6">
      <SiteLogo />
      <SiteNav class="hidden lg:block" :items="items" :active="active" :current-type="currentType" />
      <div class="flex items-center gap-3">
        <LanguageSwitch />
        <GithubLink class="hidden lg:flex" />
        <MenuButton ref="menuButton" class="lg:hidden" :open="menuOpen" :controls="menuId" @toggle="menuOpen = !menuOpen" />
      </div>
    </PageContainer>
    <MobileMenu v-if="menuOpen" :id="menuId" :items="items" :active="active" :current-type="currentType" @close="menuOpen = false" />
  </header>
</template>
