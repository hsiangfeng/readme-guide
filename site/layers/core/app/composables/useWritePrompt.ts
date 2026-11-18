import type { ProjectType } from '#shared/types/project'
import { buildPromptLines } from '#shared/utils/aiPrompt'
import { projectTypeInfo } from '#shared/utils/projectTypes'
import { SKILL_COMMAND } from '#shared/utils/site'

/**
 * 「請 AI 照指南寫 README」的指令（首頁的指令卡與範本頁的複製按鈕共用）。
 * 第一行叫 AI 把網站上的撰寫指南印出來讀；選了專案類型時多一句是哪一種專案、用哪一份範本（類型代號，例如 web-app）。
 * @param type 專案類型；null 是讓 AI 判斷
 */
export function useWritePrompt(type: () => ProjectType | null) {
  const { t } = useI18n()
  return computed(() => {
    const current = type()
    return buildPromptLines(t, {
      intro: 'hero.prompt.run',
      command: SKILL_COMMAND,
      body: ['hero.prompt.body1', 'hero.prompt.body2'],
      hint: current ? t(projectTypeInfo(current).promptHint, { id: current }) : undefined,
    })
  })
}
