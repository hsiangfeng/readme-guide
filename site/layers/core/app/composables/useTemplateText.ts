import { readTemplate } from '../data/templateFiles'

/**
 * 在產生靜態頁時讀範本原文。
 * @param types 要讀哪幾種類型
 */
export function useTemplateTexts(types: () => readonly string[]) {
  const { locale } = useI18n()
  return useAsyncData(
    () => `templates:${locale.value}:${types().join(',')}`,
    async () => {
      const entries = await Promise.all(types().map(async (type) => [type, await readTemplate(type, locale.value)] as const))
      return Object.fromEntries(entries) as Record<string, string>
    },
  )
}
