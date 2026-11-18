import { DEFAULT_PROJECT_TYPE } from '#shared/utils/projectTypes'
import { CLONE_URL } from '#shared/utils/site'
import type { TerminalLine } from '../types'

/**
 * 主視覺右邊的終端機示意：AI 下載指南、看專案、問問題、寫好 README 的過程。
 * 文字都在訊息檔 `hero.terminal.*`，這裡只決定順序與樣式。
 */
export const TERMINAL_LINES: readonly TerminalLine[] = [
  { kind: 'command', text: `git clone ${CLONE_URL}` },
  { kind: 'ok', key: 'hero.terminal.downloaded' },
  { kind: 'step', key: 'hero.terminal.readGuide' },
  { kind: 'step', key: 'hero.terminal.scan' },
  { kind: 'step', key: 'hero.terminal.detect', value: { projectType: DEFAULT_PROJECT_TYPE } },
  { kind: 'question', key: 'hero.terminal.askUrl', gapBefore: true },
  { kind: 'answer', key: 'hero.terminal.answerUrl' },
  { kind: 'question', key: 'hero.terminal.askAccount' },
  { kind: 'answer', key: 'hero.terminal.answerAccount' },
  { kind: 'step', key: 'hero.terminal.applyTemplate', gapBefore: true },
  { kind: 'step', key: 'hero.terminal.runCheck', value: { key: 'hero.terminal.checkResult' } },
  { kind: 'ok', key: 'hero.terminal.written' },
  { kind: 'caret' },
]
