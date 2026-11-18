import type { GuideContent } from '../types'

/*
 * 讀 site/content/guide/<語言>/<塊>.json。檔案在產生靜態頁時才讀；
 * 還沒寫好的檔案不會讓建置失敗，那一頁顯示「內容還在準備」。新增檔案後不用改程式。
 */

const files = import.meta.glob<GuideContent>('../../../../content/guide/*/*.json', { import: 'default' })

/**
 * 內容檔在 repo 裡的路徑。
 * @param lang 資料檔的語言代碼（zh-TW、en）
 * @param slug 塊的代號
 */
export function guideContentPath(lang: string, slug: string): string {
  return `site/content/guide/${lang}/${slug}.json`
}

/**
 * 讀某一塊的內容；檔案還沒有就回傳 null。
 * @param lang 資料檔的語言代碼
 * @param slug 塊的代號
 */
export async function readGuideContent(lang: string, slug: string): Promise<GuideContent | null> {
  const load = files[`../../../../content/guide/${lang}/${slug}.json`]
  return load ? load() : null
}

/** 現有的內容檔（語言/塊），測試用 */
export function existingGuideContent(): string[] {
  return Object.keys(files).map((key) => key.replace('../../../../content/guide/', '').replace(/\.json$/, ''))
}
