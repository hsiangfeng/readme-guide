/**
 * 目前捲到哪一個區塊。看的是畫面 35%～40% 高度那一條帶子，碰到哪個區塊就是哪個；
 * 都沒碰到時維持上一個。伺服器端一律回傳第一個。
 * 換頁之後會重新找一次區塊（頂端列在每一頁都在，換到別頁再回來也要能用）。
 * @param ids 區塊的 id，照畫面由上到下的順序
 * @param rootMargin 觀察範圍（預設是畫面 35%～40% 那一條）
 */
export function useActiveSection(ids: () => readonly string[], rootMargin = '-35% 0px -60% 0px') {
  const active = ref(ids()[0] ?? '')
  const route = useRoute()
  let observer: IntersectionObserver | null = null

  /** 重新觀察現在畫面上有的區塊 */
  function observe() {
    observer?.disconnect()
    const list = ids()
    const visible = new Set<string>()
    observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target.id)
        else visible.delete(entry.target.id)
      }
      const current = list.find((id) => visible.has(id))
      if (current) active.value = current
    }, { rootMargin })
    for (const id of list) {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    }
  }

  onMounted(() => {
    observe()
    watch([() => route.path, ids], () => nextTick(observe))
  })
  onBeforeUnmount(() => observer?.disconnect())

  return active
}
