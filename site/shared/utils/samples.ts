import type { ProjectType } from '../types/project'
import { dataLang } from './locales'

/**
 * 每種專案類型「範本填完的樣子」：對到 lint/fixtures/ 裡的一份範例。
 * 這幾份同時是檢查工具的測試範例，都要能通過檢查；網站的解剖圖直接讀原檔，llms.txt 列出它們的路徑。
 * 範例資料夾的名稱看不出是哪一種類型，對應寫在這裡（rules/ 多一種類型時，測試會要求補上）。
 */
export const SAMPLE_FIXTURES: Readonly<Record<ProjectType, string>> = {
  'web-app': 'breakfast-order',
  'course-example': 'breakfast-vue-lesson',
  'portfolio': 'breakfast-portfolio',
  'backend-api': 'breakfast-api',
}

/**
 * 某種類型、某種語言的範例檔路徑（repo 根目錄起算）。繁中是 README.md，英文是 README.en.md。
 * @param type 專案類型
 * @param locale 網站語言代碼
 */
export function samplePath(type: ProjectType, locale: string): string {
  const dir = SAMPLE_FIXTURES[type]
  if (!dir) throw new Error(`專案類型「${type}」沒有對應的範例，請在 shared/utils/samples.ts 補上`)
  return `lint/fixtures/${dir}/${dataLang(locale) === 'en' ? 'README.en.md' : 'README.md'}`
}
