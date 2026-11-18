/** 網站支援的語言代碼（也是網址前綴；英文沒有前綴） */
export type LocaleCode = 'en' | 'zh-tw'

/** 專案類型代號，清單在 rules/project-types.json */
export type ProjectType = string

/** 八塊的代號，清單與順序在 rules/blocks.json */
export type BlockId = string

/** 檢查工具的嚴重度：只有兩級 */
export type Severity = 'error' | 'warning'
