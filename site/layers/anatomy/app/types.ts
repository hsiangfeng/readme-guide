import type { BlockId, ProjectType } from '#shared/types/project'

/*
 * 解剖圖的資料型別。中間那份 README 直接讀 lint/fixtures/ 裡「範本填完的樣子」，
 * 拆成一段一段（標題、文字、清單、程式碼……），再照 rules/headings.json 分到八塊。文字一律是檔案裡的原文。
 */

/** 打勾清單的一項 */
export interface ChecklistItem {
  text: string
  /** 做完了沒（畫面上打勾或空框） */
  done: boolean
}

/** 樣本 README 裡的一段，依種類決定怎麼畫 */
export type SamplePiece =
  /** 一級標題：專案名稱 */
  | { kind: 'title', text: string }
  /** 章節標題（二級或三級） */
  | { kind: 'heading', level: number, text: string }
  /** 一段文字（可以有行內程式碼與連結） */
  | { kind: 'text', text: string }
  /** 整段只有一個連結 */
  | { kind: 'link', label: string, url: string }
  /** 整段只有一張圖（畫面上只畫出位置，不載入圖） */
  | { kind: 'shot', alt: string, src: string }
  /** 打勾清單 */
  | { kind: 'checklist', items: readonly ChecklistItem[] }
  /** 一般清單；`tags` 是「使用技術」那一塊，畫成標籤 */
  | { kind: 'list', ordered: boolean, items: readonly string[], tags?: boolean }
  /** 程式碼區塊 */
  | { kind: 'code', lang: string, lines: readonly string[] }
  /** 表格；`divider` 是表頭下面那行原文 */
  | { kind: 'table', head: readonly string[], divider: string, rows: readonly (readonly string[])[] }

/** 解剖圖的一列：連續屬於同一塊的幾段 */
export interface SampleRow {
  block: BlockId
  pieces: readonly SamplePiece[]
}

/** 一份樣本 README：照檔案順序的每一列 */
export interface ParsedSample {
  type: ProjectType
  /** 來源檔（repo 根目錄起算），給指令標頭用 */
  path: string
  rows: readonly SampleRow[]
}
