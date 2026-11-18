import type { LocaleCode } from '../types/project'
import type { DataLang, Localized } from '../types/rules'

/** 一種介面語言的設定 */
export interface LocaleInfo {
  /** 網址前綴與程式裡的代碼 */
  code: LocaleCode
  /** BCP 47 語言標籤，給 `<html lang>` 用 */
  tag: string
  /** 用該語言自己的寫法寫的完整名稱（頁尾的換語言連結） */
  nativeName: string
  /** 頂端列語言切換上的短名稱 */
  shortName: string
  /** rules/、templates/、內容檔用的語言代碼 */
  dataLang: DataLang
}

/** 所有網站語言，順序就是頂端列語言切換的順序（照設計稿：繁中在前） */
export const LOCALES: readonly LocaleInfo[] = [
  { code: 'zh-tw', tag: 'zh-Hant-TW', nativeName: '繁體中文', shortName: '繁中', dataLang: 'zh-TW' },
  { code: 'en', tag: 'en', nativeName: 'English', shortName: 'EN', dataLang: 'en' },
]

/** 預設語言（網址沒有前綴） */
export const DEFAULT_LOCALE: LocaleCode = 'en'

/**
 * 取得某個語言的設定；不認得的代碼一律當英文。
 * @param code 語言代碼
 */
export function localeInfo(code: string): LocaleInfo {
  return LOCALES.find((locale) => locale.code === code) ?? LOCALES.find((locale) => locale.code === DEFAULT_LOCALE)!
}

/**
 * 網站語言代碼換成資料檔的語言代碼（zh-tw → zh-TW）。
 * @param code 網站語言代碼
 */
export function dataLang(code: string): DataLang {
  return localeInfo(code).dataLang
}

/**
 * 從兩種語言的文字裡取出目前語言的那一份。
 * @param text 兩種語言的文字
 * @param code 網站語言代碼
 */
export function localized<T>(text: Localized<T>, code: string): T {
  return text[dataLang(code)]
}

/**
 * 中文句子裡接在英數字後面的名稱補一個空白（「後端 API」接「的」要寫成「後端 API 的」）。
 * 只處理繁中；英文的文案本來就有空白。
 * @param text 要放進句子的名稱
 * @param code 網站語言代碼
 */
export function beforeCjk(text: string, code: string): string {
  return dataLang(code) === 'zh-TW' && /[A-Za-z0-9]$/.test(text) ? `${text} ` : text
}
