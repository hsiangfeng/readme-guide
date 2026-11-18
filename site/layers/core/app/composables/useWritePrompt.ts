import type { ProjectType } from '#shared/types/project'
import { buildPromptLines } from '#shared/utils/aiPrompt'
import { projectTypeInfo, templatePath } from '#shared/utils/projectTypes'
import { CLONE_URL } from '#shared/utils/site'

/**
 * 「請 AI 照指南寫 README」的指令（首頁的指令卡與範本頁的複製按鈕共用）。
 * 選了專案類型時多一句是哪一種專案、照哪一份範本（templates/<語言>/<類型>.md）。
 * @param type 專案類型；null 是讓 AI 判斷
 */
export function useWritePrompt(type: () => ProjectType | null) {
  const { t, locale } = useI18n()
  return computed(() => {
    const current = type()
    return buildPromptLines(t, {
      cloneUrl: CLONE_URL,
      body: ['hero.prompt.read1', 'hero.prompt.read2', 'hero.prompt.read3'],
      hint: current ? t(projectTypeInfo(current).promptHint, { path: templatePath(current, locale.value) }) : undefined,
    })
  })
}
