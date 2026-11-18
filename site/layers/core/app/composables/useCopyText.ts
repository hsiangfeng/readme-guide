/** 複製按鈕的狀態：還沒按、已複製、複製失敗 */
export type CopyState = 'idle' | 'copied' | 'failed'

/**
 * 複製文字，並在按鈕上短暫顯示結果，時間到自動回到原本的樣子。
 * @param resetAfter 顯示「已複製」幾毫秒（失敗的提示留兩倍時間，讓人看得到）
 */
export function useCopyText(resetAfter = 2000) {
  const state = ref<CopyState>('idle')
  let timer: ReturnType<typeof setTimeout> | undefined

  /**
   * 複製文字並更新狀態。
   * @param text 要複製的文字
   */
  async function copy(text: string): Promise<boolean> {
    const copied = await writeClipboard(text)
    state.value = copied ? 'copied' : 'failed'
    clearTimeout(timer)
    timer = setTimeout(() => {
      state.value = 'idle'
    }, copied ? resetAfter : resetAfter * 2)
    return copied
  }

  onBeforeUnmount(() => clearTimeout(timer))

  return { state, copy }
}
