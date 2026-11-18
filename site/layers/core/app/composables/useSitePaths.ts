/**
 * 站內各頁的網址（自動加上語言前綴與尾斜線）。網址規則見 PLAN.md 第 5 節。
 */
export function useSitePaths() {
  const localePath = useLocalePath()
  return {
    /** 首頁；可以帶區塊錨點 */
    home: (hash?: string) => `${localePath('/')}${hash ? `#${hash}` : ''}`,
    /** 某一塊的完整寫法 */
    guide: (block: string) => localePath(`/guide/${block}/`),
    /** 某種類型的範本 */
    template: (type: string) => localePath(`/templates/${type}/`),
    /** 檢查項目；可以帶規則代號當錨點 */
    rules: (hash?: string) => `${localePath('/rules/')}${hash ? `#${hash}` : ''}`,
  }
}
