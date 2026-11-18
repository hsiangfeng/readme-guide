/*
 * 改之前那份的一行：`[[…]]` 包起來的是有問題的地方（畫面上畫波浪底線）。
 */

/** 一行切開後的一段 */
export interface MarkedPiece {
  text: string
  marked: boolean
}

/**
 * 把一行依 `[[…]]` 切成一般文字與有問題的文字。
 * @param text 一行文字
 */
export function splitMarked(text: string): MarkedPiece[] {
  return text.split(/(\[\[.*?\]\])/).filter(Boolean).map((part) => (
    part.startsWith('[[') && part.endsWith(']]')
      ? { text: part.slice(2, -2), marked: true }
      : { text: part, marked: false }
  ))
}

/**
 * 去掉 `[[`、`]]` 之後的純文字（量寬度用）。
 * @param text 一行文字
 */
export function unmark(text: string): string {
  return text.replaceAll('[[', '').replaceAll(']]', '')
}

/**
 * 一行在等寬字型裡佔幾個半形字元的寬度（中文、全形字算兩個）。
 * @param text 一行文字
 */
export function displayWidth(text: string): number {
  let width = 0
  for (const char of text) {
    const code = char.codePointAt(0)!
    const wide = (code >= 0x1100 && code <= 0x115F) || (code >= 0x2E80 && code <= 0xA4CF) || (code >= 0xAC00 && code <= 0xD7A3)
      || (code >= 0xF900 && code <= 0xFAFF) || (code >= 0xFE30 && code <= 0xFE4F) || (code >= 0xFF00 && code <= 0xFF60)
      || (code >= 0xFFE0 && code <= 0xFFE6) || (code >= 0x1F300 && code <= 0x1FAFF) || (code >= 0x20000 && code <= 0x3FFFD)
    width += wide ? 2 : 1
  }
  return width
}
