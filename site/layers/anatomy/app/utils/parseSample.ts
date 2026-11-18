import { matchHeading, parseHeadingLine, sectionInfo } from '#shared/utils/headings'
import type { ChecklistItem, SamplePiece, SampleRow } from '../types'

/** 第一個二級標題之前（專案名稱、一句話說明、狀態）屬於哪一塊 */
const TITLE_BLOCK = 'title'

/** 「使用技術」那一節：清單畫成標籤 */
const TAGS_SECTION = 'tech'

/**
 * 把一份 README（範本填完的樣子）拆成解剖圖的每一列。
 * 每個章節用 rules/headings.json 判斷屬於哪一塊；連續屬於同一塊的章節併成一列。
 * 只認範例會用到的 Markdown：標題、段落、整段的連結或圖片、清單、打勾清單、程式碼區塊、表格。
 * 認不得的寫法照原文當成一段文字，`sampleToMarkdown` 轉回去會對不上，測試會抓到。
 * @param markdown README 原文
 */
export function parseSample(markdown: string): SampleRow[] {
  const rows: { block: string, pieces: SamplePiece[] }[] = []
  let block = TITLE_BLOCK
  let section: string | undefined
  const push = (piece: SamplePiece) => {
    const last = rows.at(-1)
    if (last && last.block === block) last.pieces.push(piece)
    else rows.push({ block, pieces: [piece] })
  }

  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  let index = 0
  while (index < lines.length) {
    const line = lines[index]!
    if (line.trim() === '') {
      index++
      continue
    }

    // 程式碼區塊：到下一個 ``` 為止，中間的空行也算
    const fence = /^```(\S*)\s*$/.exec(line)
    if (fence) {
      const end = lines.findIndex((item, at) => at > index && /^```\s*$/.test(item))
      const stop = end === -1 ? lines.length : end
      push({ kind: 'code', lang: fence[1]!, lines: lines.slice(index + 1, stop) })
      index = stop + 1
      continue
    }

    // 其他的段落：到空行為止
    const end = lines.findIndex((item, at) => at > index && item.trim() === '')
    const paragraph = lines.slice(index, end === -1 ? lines.length : end)
    index = end === -1 ? lines.length : end

    const heading = paragraph.length === 1 ? parseHeadingLine(line) : null
    if (heading?.level === 1) {
      push({ kind: 'title', text: heading.text })
      continue
    }
    if (heading) {
      if (heading.level === 2) {
        const ids = matchHeading(heading.text, heading.level)
        section = ids[0]
        // 認不得的二級標題留在上一塊
        if (section) block = sectionInfo(section).block
      }
      push({ kind: 'heading', level: heading.level, text: heading.text })
      continue
    }
    push(paragraphPiece(paragraph, section === TAGS_SECTION))
  }
  return rows
}

/**
 * 一個段落（沒有空行的幾行）是哪一種。
 * @param paragraph 段落的每一行
 * @param tags 清單要不要畫成標籤
 */
function paragraphPiece(paragraph: string[], tags: boolean): SamplePiece {
  const text = paragraph.join('\n')
  const checklist = paragraph.map((item) => /^- \[( |x)\] (.*)$/.exec(item))
  if (checklist.every(Boolean)) {
    return { kind: 'checklist', items: checklist.map((match): ChecklistItem => ({ done: match![1] === 'x', text: match![2]! })) }
  }
  const bullets = paragraph.map((item) => /^- (.*)$/.exec(item))
  if (bullets.every(Boolean)) return { kind: 'list', ordered: false, items: bullets.map((match) => match![1]!), ...(tags ? { tags } : {}) }
  const numbered = paragraph.map((item, at) => new RegExp(`^${at + 1}\\. (.*)$`).exec(item))
  if (numbered.every(Boolean)) return { kind: 'list', ordered: true, items: numbered.map((match) => match![1]!) }
  if (paragraph.length >= 2 && paragraph.every((item) => /^\|.*\|$/.test(item)) && /^\|[\s:|-]+\|$/.test(paragraph[1]!)) {
    const cells = (row: string) => row.slice(1, -1).split('|').map((cell) => cell.trim())
    return { kind: 'table', head: cells(paragraph[0]!), divider: paragraph[1]!, rows: paragraph.slice(2).map(cells) }
  }
  const image = /^!\[([^\]]*)\]\(([^)\s]+)\)$/.exec(text)
  if (image) return { kind: 'shot', alt: image[1]!, src: image[2]! }
  const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(text)
  if (link) return { kind: 'link', label: link[1]!, url: link[2]! }
  return { kind: 'text', text }
}
