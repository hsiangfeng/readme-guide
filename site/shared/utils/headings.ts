import { headingsFile } from '../data/rules'
import type { SectionData } from '../types/rules'
import { dataLang } from './locales'

/*
 * 固定章節的標題（rules/headings.json）：正式標題、別名、對到哪一塊。
 * 比對方式跟檢查工具（lint/src/sections.js）一樣：不分大小寫，去掉表情符號、開頭編號、
 * 結尾冒號與括號補充；「A / B」這種雙語標題任一邊對到就算；同名時層級相同的優先。
 */

const EMOJI = /[\p{Extended_Pictographic}\u{FE0F}\u{200D}\u{20E3}]/gu

/**
 * 標題文字正規化。
 * @param text 標題文字
 */
export function normalizeHeading(text: string): string {
  return text
    .replace(EMOJI, '')
    .replace(/　/g, ' ')
    .trim()
    .replace(/^(?:\d+(?:\.\d+)*[.)、]?|[一二三四五六七八九十]+、)\s*/, '')
    .replace(/\s*[（(][^）)]*[）)]\s*$/, '')
    .replace(/\s*[:：]\s*$/, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

/** 每個正規化後的名稱對到哪些章節 */
const aliasIndex = (() => {
  const index = new Map<string, Set<string>>()
  const add = (alias: string, ids: string[]) => {
    const key = normalizeHeading(alias)
    if (!index.has(key)) index.set(key, new Set())
    for (const id of ids) index.get(key)!.add(id)
  }
  for (const section of headingsFile.sections) {
    for (const title of Object.values(section.title)) add(title, [section.id])
    for (const aliases of Object.values(section.aliases)) for (const alias of aliases) add(alias, [section.id])
  }
  for (const combo of headingsFile.combined) {
    for (const aliases of Object.values(combo.aliases)) for (const alias of aliases) add(alias, combo.sections)
  }
  return index
})()

/** 所有固定章節 */
export const SECTIONS: readonly SectionData[] = headingsFile.sections

/**
 * 依代號取得章節；不認得的代號丟錯。
 * @param id 章節代號
 */
export function sectionInfo(id: string): SectionData {
  const section = SECTIONS.find((item) => item.id === id)
  if (!section) throw new Error(`rules/headings.json 裡沒有「${id}」這個章節`)
  return section
}

/**
 * 某個章節在某種語言的正式標題（不含 `##`）。
 * @param id 章節代號
 * @param locale 網站語言代碼
 */
export function officialHeading(id: string, locale: string): string {
  return sectionInfo(id).title[dataLang(locale)]
}

/**
 * 某個章節的正式標題寫成 Markdown，例如 `## 安裝與執行`。
 * @param id 章節代號
 * @param locale 網站語言代碼
 */
export function officialHeadingLine(id: string, locale: string): string {
  return `${'#'.repeat(sectionInfo(id).level)} ${officialHeading(id, locale)}`
}

/**
 * 找出一個標題對到哪些章節；對不到回傳空陣列。
 * @param text 標題文字（不含 `#`）
 * @param level 標題層級
 */
export function matchHeading(text: string, level: number): string[] {
  const candidates = [normalizeHeading(text)]
  const parts = text.split(/\s*[/／|｜]\s*|\s+[-–—]\s+/).map(normalizeHeading).filter(Boolean)
  if (parts.length > 1) candidates.push(...parts)
  const hit = candidates.map((candidate) => aliasIndex.get(candidate)).find(Boolean)
  if (!hit) return []
  const found = [...hit]
  if (found.length === 1) return found
  const isCombined = headingsFile.combined.some((combo) => combo.sections.length === found.length && combo.sections.every((id) => found.includes(id)))
  if (isCombined) return found
  const sameLevel = found.filter((id) => sectionInfo(id).level === level)
  return (sameLevel.length > 0 ? sameLevel : found).slice(0, 1)
}

/**
 * 解析一行 Markdown 標題（`## 功能` → 層級 2、文字「功能」）；不是標題回傳 null。
 * @param line 一行文字
 */
export function parseHeadingLine(line: string): { level: number, text: string } | null {
  const match = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line)
  return match ? { level: match[1]!.length, text: match[2]! } : null
}
