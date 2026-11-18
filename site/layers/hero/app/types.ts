/** 終端機示意句子裡反白的部分 */
export type TerminalValue = { key: string } | { projectType: string } | { text: string }

/** 終端機示意畫面的一行 */
export type TerminalLine = { gapBefore?: boolean } & (
  /** 使用者打的指令（原文，不翻譯） */
  | { kind: 'command', text: string }
  /** 完成的步驟，綠色勾勾 */
  | { kind: 'ok', key: string }
  /** 進行中的步驟；`value` 是句子裡要反白的部分：訊息 key、專案類型（顯示 rules/ 裡的名稱），或原文（例如類型代號 web-app） */
  | { kind: 'step', key: string, value?: TerminalValue }
  /** AI 問使用者的問題 */
  | { kind: 'question', key: string }
  /** 使用者的回答 */
  | { kind: 'answer', key: string }
  /** 最後一行的游標 */
  | { kind: 'caret' }
)
