import { PROJECT_TYPES, templatePath } from '#shared/utils/projectTypes'
import { LOCALES } from '#shared/utils/locales'

/*
 * 讀 templates/<語言>/<類型>.md 的原文（範本頁與首頁「複製這份範本」共用）。
 * 檔案在產生靜態頁時才讀；少了任何一個就丟錯，讓建置直接失敗並說出缺哪個檔。
 */

const files = import.meta.glob<string>('../../../../../templates/*/*.md', { query: '?raw', import: 'default' })

/**
 * 某個範本在上面那份清單裡的 key。
 * @param path repo 裡的路徑，例如 templates/zh-TW/web-app.md
 */
function globKey(path: string): string {
  return `../../../../../${path}`
}

/** 所有應該存在的範本路徑（四種類型 × 兩種語言） */
export function expectedTemplatePaths(): string[] {
  return LOCALES.flatMap((locale) => PROJECT_TYPES.map((type) => templatePath(type.id, locale.code)))
}

/** 找不到的範本路徑 */
export function missingTemplatePaths(): string[] {
  return expectedTemplatePaths().filter((path) => !files[globKey(path)])
}

/**
 * 讀一份範本的原文；檔案不在就丟錯。
 * @param type 專案類型
 * @param locale 網站語言代碼
 */
export async function readTemplate(type: string, locale: string): Promise<string> {
  const path = templatePath(type, locale)
  const load = files[globKey(path)]
  if (!load) throw new Error(`找不到範本檔 ${path}：範本頁與首頁「複製這份範本」都要讀它`)
  return load()
}
