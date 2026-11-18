import { projectTypesFile } from '../data/rules'
import type { ProjectType } from '../types/project'
import type { Localized } from '../types/rules'
import { dataLang } from './locales'

/*
 * 四種專案類型：順序、名稱、說明、必填章節全部照 rules/project-types.json。
 */

/** 一種專案類型 */
export interface ProjectTypeInfo {
  id: ProjectType
  /** 範本檔名（templates/<語言>/ 底下） */
  file: string
  name: Localized
  description: Localized
  /** 必填的章節代號 */
  required: readonly string[]
  /** 選了這個類型時，給 AI 的指令裡多加的那一句（訊息 key） */
  promptHint: string
  /** 訊息檔裡用的名稱（`web-app` → `webApp`） */
  messageKey: string
}

/**
 * `web-app` 轉成 `webApp`（訊息 key 用）。
 * @param id 專案類型代號
 */
function camelCase(id: string): string {
  return id.replace(/-(\w)/g, (_, letter: string) => letter.toUpperCase())
}

/** 四種專案類型，順序就是畫面上的順序 */
export const PROJECT_TYPES: readonly ProjectTypeInfo[] = projectTypesFile.types.map((type) => ({
  id: type.id,
  file: `${type.id}.md`,
  name: type.name,
  description: type.description,
  required: type.required,
  promptHint: `hero.prompt.hint.${camelCase(type.id)}`,
  messageKey: camelCase(type.id),
}))

/** 沒指定時用的類型 */
export const DEFAULT_PROJECT_TYPE: ProjectType = projectTypesFile.default

/**
 * 依代號取得專案類型；不認得的代號丟錯。
 * @param id 專案類型代號
 */
export function projectTypeInfo(id: ProjectType): ProjectTypeInfo {
  const type = PROJECT_TYPES.find((item) => item.id === id)
  if (!type) throw new Error(`rules/project-types.json 裡沒有「${id}」這種類型`)
  return type
}

/**
 * 範本檔在 repo 裡的路徑，例如 templates/zh-TW/web-app.md。
 * @param id 專案類型代號
 * @param locale 網站語言代碼
 */
export function templatePath(id: ProjectType, locale: string): string {
  return `templates/${dataLang(locale)}/${projectTypeInfo(id).file}`
}
