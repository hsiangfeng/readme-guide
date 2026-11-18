import { AI_CHECK_COMMAND } from './site'

/** 給 AI 的指令裡的一行 */
export interface PromptLine {
  text: string
  /** 指令本身（畫面上用琥珀色） */
  accent?: boolean
  /** 前面空一行，跟上一段分開 */
  gapBefore?: boolean
}

/** 把訊息 key 換成文字的函式（就是 vue-i18n 的 `t`） */
export type Translate = (key: string) => string

/** 組指令要用的內容 */
export interface PromptOptions {
  /** 第一行：請 AI 先執行下面那行指令（訊息 key） */
  intro: string
  /** 要 AI 執行的指令（原文，不翻譯；畫面上用琥珀色） */
  command: string
  /** 中間那一段要 AI 做什麼（訊息 key，一個 key 一行） */
  body: readonly string[]
  /** 多加的一句（已經翻好的文字，例如選了專案類型時的說明）；沒有就不加 */
  hint?: string
}

/**
 * 組出給 AI 的指令：先執行一行指令、再照結果做事、最後提醒不確定要先問。
 * 畫面上的指令卡與複製到剪貼簿的文字都從這裡來，兩邊才不會對不上。
 * @param t 翻譯函式
 * @param options 指令內容
 */
export function buildPromptLines(t: Translate, options: PromptOptions): PromptLine[] {
  const lines: PromptLine[] = [
    { text: t(options.intro) },
    { text: options.command, accent: true },
    ...options.body.map((key, index) => ({ text: t(key), gapBefore: index === 0 })),
  ]
  if (options.hint) lines.push({ text: options.hint, gapBefore: true })
  lines.push({ text: t('common.prompt.caution'), gapBefore: true })
  return lines
}

/**
 * 把指令的每一行接成要複製的純文字，分段的地方空一行。
 * @param lines 指令的每一行
 */
export function promptToText(lines: readonly PromptLine[]): string {
  return lines.map((line) => (line.gapBefore ? `\n${line.text}` : line.text)).join('\n')
}

/**
 * 「複製給 AI 的指令」：叫 AI 跑檢查工具、照結果修到沒有錯誤（首頁檢查工具區與檢查項目頁共用）。
 * @param t 翻譯函式
 */
export function checkPromptText(t: Translate): string {
  return promptToText(buildPromptLines(t, { intro: 'lint.prompt.run', command: AI_CHECK_COMMAND, body: ['lint.prompt.body1'] }))
}
