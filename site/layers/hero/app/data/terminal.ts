import { DEFAULT_PROJECT_TYPE } from '#shared/utils/projectTypes'
import { AI_CHECK_COMMAND, SKILL_COMMAND } from '#shared/utils/site'
import type { TerminalLine } from '../types'

/**
 * 主視覺右邊的終端機示意：AI 從網站讀撰寫指南、看專案、問問題、照範本寫、跑檢查工具、寫好 README 的過程。
 * 兩行指令跟指令卡、檢查工具區用的是同一份（shared/utils/site.ts）；
 * 其他文字都在訊息檔 `hero.terminal.*`，這裡只決定順序與樣式。
 */
export const TERMINAL_LINES: readonly TerminalLine[] = [
  { kind: 'command', text: SKILL_COMMAND },
  { kind: 'ok', key: 'hero.terminal.readGuide' },
  { kind: 'step', key: 'hero.terminal.scan' },
  { kind: 'step', key: 'hero.terminal.detect', value: { projectType: DEFAULT_PROJECT_TYPE } },
  { kind: 'question', key: 'hero.terminal.askUrl', gapBefore: true },
  { kind: 'answer', key: 'hero.terminal.answerUrl' },
  { kind: 'question', key: 'hero.terminal.askAccount' },
  { kind: 'answer', key: 'hero.terminal.answerAccount' },
  { kind: 'step', key: 'hero.terminal.fetchTemplate', value: { text: DEFAULT_PROJECT_TYPE }, gapBefore: true },
  { kind: 'command', text: AI_CHECK_COMMAND },
  { kind: 'step', key: 'hero.terminal.checkResult', value: { key: 'hero.terminal.noProblems' } },
  { kind: 'ok', key: 'hero.terminal.written' },
  { kind: 'caret' },
]
