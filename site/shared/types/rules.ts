/*
 * rules/ 資料檔的型別。欄位照 rules/README.md；網站只讀不改。
 * 文字一律是 `{ "zh-TW": …, "en": … }`，網站的語言代碼 zh-tw 對到 zh-TW。
 */

/** 資料檔的語言代碼 */
export type DataLang = 'zh-TW' | 'en'

/** 兩種語言的文字 */
export type Localized<T = string> = Record<DataLang, T>

/** 讀者的三個問題 */
export interface BlockGroupData {
  id: string
  question: Localized
}

/** 八塊裡的一塊（rules/blocks.json） */
export interface BlockData {
  slug: string
  group: string
  name: Localized
  summary: Localized
}

export interface BlocksFile {
  groups: BlockGroupData[]
  blocks: BlockData[]
}

/** 一個固定章節（rules/headings.json） */
export interface SectionData {
  id: string
  block: string
  level: number
  title: Localized
  aliases: Localized<string[]>
}

/** 幾個章節合在一起寫的標題，例如「線上展示與畫面」 */
export interface CombinedSectionData {
  sections: string[]
  aliases: Localized<string[]>
}

export interface HeadingsFile {
  sections: SectionData[]
  combined: CombinedSectionData[]
}

/** 一種專案類型（rules/project-types.json） */
export interface ProjectTypeData {
  id: string
  name: Localized
  description: Localized
  required: string[]
  optional: string[]
  typeSpecific: string[]
}

export interface ProjectTypesFile {
  default: string
  types: ProjectTypeData[]
}

/** 寫法慣例（rules/conventions.json），網站只用得到待填文字的格式 */
export interface ConventionsFile {
  placeholder: {
    pattern: string
    flags: string
    examples: Localized
    /** 說明只有刪節號的 {{請填：…}}：在介紹寫法本身，不算待填的地方（選填） */
    syntaxMention?: {
      pattern: string
      flags: string
    }
  }
}

/** 嚴重度：只有兩級 */
export type RuleSeverity = 'error' | 'warning'

/** 實作狀態 */
export type RuleStatus = 'implemented' | 'planned'

/** 改之前／改成的例子（選填；before 可能是空的） */
export interface RuleExample {
  before: string[]
  after: string[]
}

/** 一條檢查規則（rules/rules.json） */
export interface RuleData {
  id: string
  /** 屬於哪一塊；null 是整份文件都適用 */
  block: string | null
  /** 選填，只出現在 block 是 null 的規則：跟哪幾塊最相關（寫法頁會一起列出來） */
  relatedBlocks?: string[]
  category: string
  severity: RuleSeverity
  /** 適用的專案類型 */
  types: string[]
  /** 要對照專案裡的檔案才判斷得出來 */
  needsProject: boolean
  status: RuleStatus
  title: Localized
  description: Localized
  fix: Localized
  messages: Record<string, Localized>
  example?: Localized<RuleExample>
}

export interface RulesFile {
  severities: Record<RuleSeverity, Localized>
  statuses: Record<RuleStatus, Localized>
  rules: RuleData[]
}
