import { describe, expect, it } from 'vitest'
import { buildPromptLines, promptToText } from '../../../shared/utils/aiPrompt'

/** 測試用的翻譯函式：直接回傳 key，方便看出順序 */
const t = (key: string) => key

describe('給 AI 的指令', () => {
  const options = { cloneUrl: 'https://example.com/guide.git', body: ['read1', 'read2'] }

  it('沒選類型時：下載、要做的事、提醒，三段', () => {
    expect(promptToText(buildPromptLines(t, options))).toBe(
      'common.prompt.run\ngit clone https://example.com/guide.git\n\nread1\nread2\n\ncommon.prompt.caution',
    )
  })

  it('選了類型時，在提醒前面多一段那個類型的說明', () => {
    const hint = '這是一個網頁專案，請照 templates/zh-TW/web-app.md 這份範本寫。'
    const lines = buildPromptLines(t, { ...options, hint })
    expect(lines.map((line) => line.text)).toEqual([
      'common.prompt.run',
      'git clone https://example.com/guide.git',
      'read1',
      'read2',
      hint,
      'common.prompt.caution',
    ])
    expect(lines.find((line) => line.text === hint)?.gapBefore).toBe(true)
  })

  it('下載指令那一行標成指令樣式', () => {
    expect(buildPromptLines(t, options).filter((line) => line.accent).map((line) => line.text)).toEqual(['git clone https://example.com/guide.git'])
  })
})
