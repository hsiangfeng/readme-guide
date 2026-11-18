import enCommon from '../../i18n/locales/en/common'
import enGuide from '../../i18n/locales/en/guide'
import enRules from '../../i18n/locales/en/rules'
import enTemplates from '../../i18n/locales/en/templates'
import zhCommon from '../../i18n/locales/zh-tw/common'
import zhGuide from '../../i18n/locales/zh-tw/guide'
import zhRules from '../../i18n/locales/zh-tw/rules'
import zhTemplates from '../../i18n/locales/zh-tw/templates'
import { createTranslator, type Messages } from '#shared/utils/messages'
import type { MetaTranslate } from '#shared/utils/pageMeta'

/** 每種語言、產生 llms.txt 要用到的文案（頁面標題與描述） */
const MESSAGES: Record<string, Messages> = {
  'en': Object.assign({}, enCommon, enGuide, enTemplates, enRules) as Messages,
  'zh-tw': Object.assign({}, zhCommon, zhGuide, zhTemplates, zhRules) as Messages,
}

/**
 * 某種語言的翻譯函式。
 * @param locale 網站語言代碼
 */
export function siteTranslator(locale: string): MetaTranslate {
  const messages = MESSAGES[locale]
  if (!messages) throw new Error(`沒有 ${locale} 的文案`)
  return createTranslator(messages)
}
