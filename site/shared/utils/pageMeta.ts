import { blockInfo } from './blocks'
import { beforeCjk, localized } from './locales'
import { projectTypeInfo } from './projectTypes'
import type { SitePage } from './seo'

/** 把訊息 key 換成文字的函式（vue-i18n 的 `t`，可以帶參數） */
export type MetaTranslate = (key: string, params?: Record<string, string>) => string

/** 一頁的標題與描述 */
export interface PageMeta {
  /** 這一頁的名稱（不含站名；結構化資料的主要節點用） */
  name: string
  /** 麵包屑上的短名稱：寫法頁是塊名、範本頁是類型名（都讀 rules/），首頁、檢查項目頁用訊息檔的短名稱 */
  crumb: string
  /** `<title>`：放得下就在後面加站名 */
  title: string
  /** meta description */
  description: string
}

/** 標題的長度上限（半形字寬；中文算兩個）。超過時不加站名 */
export const TITLE_MAX_WIDTH = 60

/**
 * 字串的顯示寬度：中日韓文字與全形符號算 2，其他算 1（搜尋結果的標題是照像素截斷的，中文大約是英文的兩倍寬）。
 * @param text 文字
 */
export function textWidth(text: string): number {
  let width = 0
  for (const char of text) width += /[ᄀ-ᅟ⺀-꓏가-힣豈-﫿︰-﹏＀-｠￠-￦]/.test(char) ? 2 : 1
  return width
}

/**
 * 某一頁的標題與描述。文字的格式在訊息檔（`*.meta.*`），塊與類型的名稱讀 rules/。
 * @param page 哪一頁
 * @param locale 網站語言代碼
 * @param t 翻譯函式
 */
export function pageMeta(page: SitePage, locale: string, t: MetaTranslate): PageMeta {
  const { name, crumb, description } = pageText(page, locale, t)
  const withSuffix = `${name}${t('common.meta.titleSuffix')}`
  return { name, crumb, title: textWidth(withSuffix) <= TITLE_MAX_WIDTH ? withSuffix : name, description }
}

/** 不含站名的標題、麵包屑名稱與描述 */
function pageText(page: SitePage, locale: string, t: MetaTranslate): Omit<PageMeta, 'title'> {
  switch (page.kind) {
    case 'home':
      return { name: t('common.meta.title'), crumb: t('common.meta.home'), description: t('common.meta.description') }
    case 'guide': {
      const block = blockInfo(page.id!)
      const blockName = localized(block.name, locale)
      return {
        name: t('guide.meta.title', { name: blockName }),
        crumb: blockName,
        description: t(`guide.meta.descriptions.${block.id}`),
      }
    }
    case 'template': {
      const type = projectTypeInfo(page.id!)
      const typeName = localized(type.name, locale)
      return {
        name: t('templatePage.meta.title', { type: beforeCjk(typeName, locale) }),
        crumb: typeName,
        description: t('templatePage.meta.description', { description: localized(type.description, locale) }),
      }
    }
    case 'rules':
      return { name: t('rulesPage.meta.title'), crumb: t('common.footer.rules'), description: t('rulesPage.meta.description') }
  }
}
