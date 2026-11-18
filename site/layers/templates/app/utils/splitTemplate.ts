import { BLOCKS } from '#shared/utils/blocks'
import { matchHeading, parseHeadingLine, sectionInfo } from '#shared/utils/headings'
import { countPlaceholders } from '#shared/utils/placeholders'

/*
 * 把範本原文依標題切成八塊：每個標題用 rules/headings.json 的正式標題與別名對到章節，再對到塊。
 * 第一個二級標題之前的內容（一級標題、一句話、狀態）算第一塊；三級標題跟著它上面的二級標題。
 */

/** 範本的一段：屬於同一塊、連在一起的幾行 */
export interface TemplateSegment {
  /** 塊的代號；對不到章節的標題是 null */
  block: string | null
  /** 第一行的行號（從 1 開始） */
  startLine: number
  lines: string[]
  /** 這一段裡對到的章節代號 */
  sections: string[]
  /** 這一段裡沒對到章節的標題（應該是空的） */
  unmatched: string[]
}

/** 切好的範本 */
export interface SplitTemplate {
  segments: TemplateSegment[]
  lineCount: number
  placeholderCount: number
}

/**
 * 把範本原文切成好幾段。
 * @param markdown 範本原文
 */
export function splitTemplate(markdown: string): SplitTemplate {
  const lines = markdown.replace(/\r\n/g, '\n').replace(/\n$/, '').split('\n')
  const segments: TemplateSegment[] = []
  let current: TemplateSegment = { block: BLOCKS[0]?.id ?? null, startLine: 1, lines: [], sections: [], unmatched: [] }
  let inFence = false

  lines.forEach((line, index) => {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence
    const heading = inFence ? null : parseHeadingLine(line)
    if (heading && heading.level >= 2) {
      const ids = matchHeading(heading.text, heading.level)
      const block = ids[0] ? sectionInfo(ids[0]).block : null
      // 二級標題一定開新的一段（換到別的塊時）；三級標題只有對到別的塊才開新的一段
      const startsNew = heading.level === 2 ? block !== current.block || block === null : block !== null && block !== current.block
      if (startsNew && current.lines.length > 0) {
        segments.push(current)
        current = { block, startLine: index + 1, lines: [], sections: [], unmatched: [] }
      }
      else if (startsNew) {
        current.block = block
      }
      if (ids.length > 0) current.sections.push(...ids.filter((id) => !current.sections.includes(id)))
      else current.unmatched.push(line)
    }
    current.lines.push(line)
  })
  if (current.lines.length > 0) segments.push(current)

  return { segments, lineCount: lines.length, placeholderCount: countPlaceholders(markdown) }
}

/**
 * 某一段在某種專案類型裡是不是必填：段裡任何一個章節是那種類型的必填就算；第一塊一律必填。
 * @param segment 範本的一段
 * @param required 那種類型必填的章節代號
 */
export function isSegmentRequired(segment: TemplateSegment, required: readonly string[]): boolean {
  if (segment.block === BLOCKS[0]?.id) return true
  return segment.sections.some((id) => required.includes(id))
}
