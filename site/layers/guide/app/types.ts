/*
 * 「每一塊的完整寫法」內容檔的型別，格式見 site/content/guide/README.md。
 */

/** 這一塊要有的一樣東西 */
export interface GuidePart {
  heading: string
  need: 'required' | 'optional' | 'conditional'
  text: string
  emphasis?: string
}

/** 改之前的一行：沒問題的直接是字串；有問題的帶 `[[…]]` 與對到第幾個問題 */
export type GuideBeforeLine = string | { text: string, notes: number[] }

/** 改之前那份的一個問題 */
export interface GuideNote {
  title: string
  text: string
  /** 檢查工具會抓的規則代號 */
  rules?: string[]
}

/** 一個內容檔 */
export interface GuideContent {
  slug: string
  headings: string[]
  why: string
  question: string
  questionNote: string
  who: string
  whoNote: string
  partsTitle: string
  parts: GuidePart[]
  before: { lines: GuideBeforeLine[] }
  notes: GuideNote[]
  after: { lines: string[] }
  tip: { title: string, paragraphs: string[] }
  types: Record<string, string>
}
