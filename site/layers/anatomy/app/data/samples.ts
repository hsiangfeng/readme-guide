import type { ProjectType } from '#shared/types/project'
import { samplePath, SAMPLE_FIXTURES } from '#shared/utils/samples'

// 類型對到哪一份範例、範例檔的路徑放在 shared/（llms.txt 也要用），這裡只負責讀原文
export { SAMPLE_FIXTURES, samplePath }

/** 範例原檔（建置時讀進來，產生靜態頁時用） */
const files = import.meta.glob<string>('../../../../../lint/fixtures/*/README*.md', { query: '?raw', import: 'default' })

/**
 * 讀範例原文。
 * @param type 專案類型
 * @param locale 網站語言代碼
 */
export async function readSample(type: ProjectType, locale: string): Promise<string> {
  const path = samplePath(type, locale)
  const load = files[`../../../../../${path}`]
  if (!load) throw new Error(`找不到範例檔 ${path}`)
  return load()
}
