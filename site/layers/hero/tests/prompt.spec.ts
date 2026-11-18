import { describe, expect, it } from 'vitest'
import { buildPromptLines, checkPromptText, promptToText } from '../../../shared/utils/aiPrompt'
import { AI_CHECK_COMMAND, SKILL_COMMAND, SKILL_URL } from '../../../shared/utils/site'

/** 測試用的翻譯函式：直接回傳 key，方便看出順序 */
const t = (key: string) => key

describe('給 AI 的指令', () => {
  const options = { intro: 'run', command: 'curl -fsSL https://example.com/guide.md', body: ['body1', 'body2'] }

  it('沒選類型時：先執行指令、要做的事、提醒，三段', () => {
    expect(promptToText(buildPromptLines(t, options))).toBe(
      'run\ncurl -fsSL https://example.com/guide.md\n\nbody1\nbody2\n\ncommon.prompt.caution',
    )
  })

  it('選了類型時，在提醒前面多一段那個類型的說明', () => {
    const hint = '這是一個網頁專案，請用 web-app 這份範本。'
    const lines = buildPromptLines(t, { ...options, hint })
    expect(lines.map((line) => line.text)).toEqual(['run', 'curl -fsSL https://example.com/guide.md', 'body1', 'body2', hint, 'common.prompt.caution'])
    expect(lines.find((line) => line.text === hint)?.gapBefore).toBe(true)
  })

  it('指令那一行標成指令樣式', () => {
    expect(buildPromptLines(t, options).filter((line) => line.accent).map((line) => line.text)).toEqual(['curl -fsSL https://example.com/guide.md'])
  })

  it('首頁的指令：從網站抓撰寫指南，不叫人下載整份專案', () => {
    expect(SKILL_COMMAND).toBe(`curl -fsSL ${SKILL_URL}`)
    expect(SKILL_URL).toBe('https://readme-guide.com/skill.md')
  })

  it('「複製給 AI 的指令」：跑 npm 上的檢查工具（帶 --yes，AI 不用停下來確認）', () => {
    expect(checkPromptText(t)).toBe(`lint.prompt.run\n${AI_CHECK_COMMAND}\n\nlint.prompt.body1\n\ncommon.prompt.caution`)
    expect(AI_CHECK_COMMAND).toBe('npx --yes readme-guide@latest check README.md')
  })
})
