import { conventionsFile } from '../data/rules'
import { dataLang } from './locales'

/*
 * 範本裡待填的地方，例如 {{請填：專案名稱}}、{{FILL: project name}}。格式照 rules/conventions.json。
 */

/** 每次都建新的正規表示式，避免共用 lastIndex */
export function placeholderPattern(): RegExp {
  const { pattern, flags } = conventionsFile.placeholder
  return new RegExp(pattern, flags.includes('g') ? flags : `${flags}g`)
}

/** 一行文字切成一般文字與待填文字 */
export interface TextPiece {
  text: string
  placeholder: boolean
}

/**
 * 把一行切成一般文字與待填文字（畫面上待填的部分要標色）。
 * @param line 一行文字
 */
export function splitPlaceholders(line: string): TextPiece[] {
  const pieces: TextPiece[] = []
  let last = 0
  for (const match of line.matchAll(placeholderPattern())) {
    if (match.index > last) pieces.push({ text: line.slice(last, match.index), placeholder: false })
    pieces.push({ text: match[0], placeholder: true })
    last = match.index + match[0].length
  }
  if (last < line.length) pieces.push({ text: line.slice(last), placeholder: false })
  return pieces
}

/**
 * 是不是在介紹寫法本身的待填文字（說明只有刪節號，例如 {{請填：…}}）。
 * 照 rules/conventions.json 的 `syntaxMention`：這種不算待填的地方，檢查工具不報，網站也不算進「要填的地方」。
 * @param text 一個待填文字
 */
export function isSyntaxMention(text: string): boolean {
  const mention = conventionsFile.placeholder.syntaxMention
  return mention ? new RegExp(mention.pattern, mention.flags.replace('g', '')).test(text) : false
}

/**
 * 數一段文字裡有幾個待填的地方（介紹寫法本身的 {{請填：…}} 不算）。
 * @param text 文字
 */
export function countPlaceholders(text: string): number {
  return [...text.matchAll(placeholderPattern())].filter((match) => !isSyntaxMention(match[0])).length
}

/**
 * 待填文字的範例（rules/conventions.json），例如 {{請填：專案名稱}}。
 * @param locale 網站語言代碼
 */
export function placeholderExample(locale: string): string {
  return conventionsFile.placeholder.examples[dataLang(locale)]
}

/**
 * 省略說明的待填文字，例如 {{請填：…}}。
 * @param locale 網站語言代碼
 */
export function placeholderShort(locale: string): string {
  return placeholderExample(locale).replace(/([:：]\s*).*?(\}\})$/, '$1…$2')
}

/**
 * 只有開頭的待填文字，例如 {{請填}}。
 * @param locale 網站語言代碼
 */
export function placeholderBare(locale: string): string {
  return placeholderExample(locale).replace(/\s*[:：].*?(\}\})$/, '$1')
}

/**
 * 找第一個待填的地方與它的位置（行、欄都從 1 開始）。
 * @param text 範本原文
 */
export function firstPlaceholder(text: string): { line: number, column: number, text: string } | null {
  const lines = text.split('\n')
  for (const [index, line] of lines.entries()) {
    const match = [...line.matchAll(placeholderPattern())].find((item) => !isSyntaxMention(item[0]))
    if (match) return { line: index + 1, column: match.index + 1, text: match[0] }
  }
  return null
}
