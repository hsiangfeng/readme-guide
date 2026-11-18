import { describe, expect, it } from 'vitest'
import { BLOCK_GROUPS } from '../../../shared/utils/blocks'
import { MESSAGE_FILES as FILES } from '../../../shared/utils/messages'
import { PROJECT_TYPES } from '../../../shared/utils/projectTypes'

const modules = import.meta.glob<{ default: Messages }>('../../../i18n/locales/*/*.ts', { eager: true })

/**
 * 某種語言的所有文案合在一起。
 * @param locale 語言代碼
 */
function load(locale: string): Messages {
  return Object.assign({}, ...FILES.map((file) => {
    const module = modules[`../../../i18n/locales/${locale}/${file}.ts`]
    if (!module) throw new Error(`少了文案檔 i18n/locales/${locale}/${file}.ts`)
    return module.default
  }))
}

/**
 * 介面文案檔的檢查：兩種語言的 key 要一模一樣，插入的變數（`{count}` 這種）也要一樣；
 * 漏一個 key 或打錯變數名稱，畫面上就會直接露出 key 或少一段字。
 */

type Messages = { [key: string]: string | Messages }

/**
 * 把巢狀的文案攤平成「a.b.c → 文字」。
 * @param messages 文案
 * @param prefix 目前的路徑
 */
function flatten(messages: Messages, prefix = ''): Map<string, string> {
  const result = new Map<string, string>()
  for (const [key, value] of Object.entries(messages)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'string') result.set(path, value)
    else for (const [child, text] of flatten(value, path)) result.set(child, text)
  }
  return result
}

const en = flatten(load('en'))
const zh = flatten(load('zh-tw'))

/**
 * 取出文字裡用到哪些變數（`{'@'}` 這種字面值不算；英文單複數兩種寫法會重複出現，只算一次）。
 * @param text 文案
 */
function placeholders(text: string): string[] {
  return [...new Set([...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]!))].sort()
}

describe('介面文案', () => {
  it('繁中與英文的 key 一樣', () => {
    expect([...zh.keys()].sort()).toEqual([...en.keys()].sort())
  })

  it('每個 key 的插入變數一樣', () => {
    for (const [key, text] of en) {
      expect(placeholders(zh.get(key) ?? ''), key).toEqual(placeholders(text))
    }
  })

  it('兩種語言都有的檔案一樣多', () => {
    const files = (locale: string) => Object.keys(modules).filter((path) => path.includes(`/${locale}/`)).map((path) => path.split('/').at(-1)).sort()
    expect(files('zh-tw')).toEqual(files('en'))
    expect(files('en')).toEqual(FILES.map((file) => `${file}.ts`).sort())
  })

  it('rules/ 裡的每種專案類型、每個問題都有對應的文案', () => {
    for (const type of PROJECT_TYPES) expect(en.has(type.promptHint), type.promptHint).toBe(true)
    for (const group of BLOCK_GROUPS) {
      expect(en.has(`anatomy.questions.${group.id}.title`), group.id).toBe(true)
      expect(en.has(`anatomy.questions.${group.id}.body`), group.id).toBe(true)
    }
  })

  it('沒有沒跳脫的 @（vue-i18n 會當成連結語法）', () => {
    for (const [key, text] of [...en, ...zh]) {
      expect(text.replaceAll("{'@'}", ''), key).not.toContain('@')
    }
  })
})

describe('vue-i18n 的特殊字元', () => {
  it('沒跳脫的 | 只能用在複數文案（每一段都有字）；要顯示 | 得寫成 {\'|\'}，不然產生頁面時會編譯失敗', () => {
    for (const [key, text] of [...en, ...zh]) {
      const parts = text.replaceAll("{'|'}", '').split('|')
      if (parts.length > 1) for (const part of parts) expect(part.trim(), key).not.toBe('')
    }
  })
})
