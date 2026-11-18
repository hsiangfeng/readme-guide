/** 八塊索引的一項 */
export interface IndexItem {
  id: string
  number: string
  name: string
  to: string
  /** 條數（檢查項目頁） */
  count?: number
}

/** 八塊索引的一組（一個問題） */
export interface IndexGroup {
  id: string
  label: string
  items: IndexItem[]
}

/** 指令框的一行 */
export interface CommandLine {
  text: string
  /** command：要執行的指令；comment：說明；error：示意的錯誤輸出；muted：其他輸出 */
  kind: 'command' | 'comment' | 'error' | 'muted'
  /** 前面空一行 */
  gapBefore?: boolean
}
