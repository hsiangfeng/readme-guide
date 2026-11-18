import type { MetaTranslate } from './pageMeta'

/** 介面文案檔：每種語言都是這幾個檔（i18n/locales/<語言>/<檔名>.ts） */
export const MESSAGE_FILES = ['common', 'hero', 'anatomy', 'lint', 'guide', 'templates', 'rules'] as const

/** 文案檔的內容（巢狀） */
export type Messages = { [key: string]: string | Messages }

/**
 * 不經過 vue-i18n 也能取文案的翻譯函式（給網站地圖、llms.txt、測試用）。
 * 支援 `{name}` 參數與 `{'@'}` 這種字面寫法；找不到 key 直接丟錯。
 * @param messages 一種語言的全部文案
 */
export function createTranslator(messages: Messages): MetaTranslate {
  return (key, params) => {
    const value = key.split('.').reduce<string | Messages | undefined>((node, part) => (typeof node === 'object' ? node[part] : undefined), messages)
    if (typeof value !== 'string') throw new Error(`找不到文案：${key}`)
    return value.replace(/\{'([^']*)'\}|\{(\w+)\}/g, (match, literal: string | undefined, name: string | undefined) => {
      if (literal !== undefined) return literal
      const param = params?.[name!]
      if (param === undefined) throw new Error(`文案 ${key} 少了參數 ${name}`)
      return param
    })
  }
}
