import type { CommandLine } from '../types'

/**
 * 指令框「複製」出去的文字：只有指令本身，一行一個；不含 `$ `、說明與示意的結果。
 * 檢查工具的 CMD003 就是在抓「指令前面有 $」，網站自己複製出去的指令不能有。
 * @param lines 指令框裡的每一行
 */
export function commandCopyText(lines: readonly CommandLine[]): string {
  return lines.filter((line) => line.kind === 'command').map((line) => line.text.replace(/^\$\s+/, '')).join('\n')
}
