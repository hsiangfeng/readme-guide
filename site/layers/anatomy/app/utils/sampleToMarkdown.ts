import type { SamplePiece, SampleRow } from '../types'

/**
 * 把解剖圖上的每一列轉回 Markdown。測試拿它跟 lint/fixtures/ 的原檔逐字比對：
 * 對得上，就表示畫面上的每一段都是檔案原文、沒有漏也沒有多。
 * @param rows 解剖圖的每一列
 */
export function sampleToMarkdown(rows: readonly SampleRow[]): string {
  return `${rows.flatMap((row) => row.pieces.map(pieceToMarkdown)).join('\n\n')}\n`
}

/**
 * 一段轉回 Markdown。
 * @param piece 樣本的一段
 */
function pieceToMarkdown(piece: SamplePiece): string {
  switch (piece.kind) {
    case 'title':
      return `# ${piece.text}`
    case 'heading':
      return `${'#'.repeat(piece.level)} ${piece.text}`
    case 'text':
      return piece.text
    case 'link':
      return `[${piece.label}](${piece.url})`
    case 'shot':
      return `![${piece.alt}](${piece.src})`
    case 'checklist':
      return piece.items.map((item) => `- [${item.done ? 'x' : ' '}] ${item.text}`).join('\n')
    case 'list':
      return piece.items.map((item, index) => `${piece.ordered ? `${index + 1}.` : '-'} ${item}`).join('\n')
    case 'code':
      return ['```' + piece.lang, ...piece.lines, '```'].join('\n')
    case 'table': {
      const row = (cells: readonly string[]) => `| ${cells.join(' | ')} |`
      return [row(piece.head), piece.divider, ...piece.rows.map(row)].join('\n')
    }
  }
}
