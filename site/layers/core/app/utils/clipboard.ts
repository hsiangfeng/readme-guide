/**
 * 把文字寫進剪貼簿。先用 Clipboard API；不能用時（不是 HTTPS、瀏覽器太舊、權限被擋）
 * 改用隱藏的文字框加 `execCommand('copy')`。兩種都失敗就回傳 false，讓畫面提示使用者手動複製。
 * @param text 要複製的文字
 */
export async function writeClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
  }
  catch {
    // 被拒絕就改走下面的舊方法
  }
  return legacyCopy(text)
}

/**
 * 舊方法：放一個看不見的文字框、選取後複製，結束後把焦點還給原本的元素。
 * @param text 要複製的文字
 */
function legacyCopy(text: string): boolean {
  const previousFocus = document.activeElement as HTMLElement | null
  const area = document.createElement('textarea')
  area.value = text
  area.setAttribute('readonly', '')
  area.style.position = 'fixed'
  area.style.top = '-1000px'
  area.style.opacity = '0'
  document.body.appendChild(area)
  area.select()
  let copied = false
  try {
    copied = document.execCommand('copy')
  }
  catch {
    copied = false
  }
  area.remove()
  previousFocus?.focus()
  return copied
}
