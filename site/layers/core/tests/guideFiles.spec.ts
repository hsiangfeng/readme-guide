import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { GUIDE_ASSET_DIRS, guideAsset, guideFileHeaders, listGuideFiles } from '../../../server/utils/guideFiles'
import { allPagePaths } from '../../../shared/utils/seo'
import { SKILL_PATH } from '../../../shared/utils/site'

/*
 * 放上網站的撰寫指南原始檔：清單照 repo 現有的檔案算、每個網址都對得到來源、不跟頁面撞。
 * 不斷言 SKILL.md 的內文（另外有人在改），只看檔案在不在、對不對得上。產生出來的檔案另外由 tests-output/guideFiles.spec.ts 逐位元組比對。
 */

const repoRoot = join(__dirname, '../../../..')
const files = listGuideFiles(repoRoot)
const count = (dir: string, extension: string) => readdirSync(join(repoRoot, dir)).filter((name) => name.endsWith(extension)).length

describe('放上網站的撰寫指南原始檔', () => {
  it('四類都在：SKILL 1 份＋references 全部＋範本兩種語言全部＋rules/ 的 JSON 全部', () => {
    expect(files.filter((file) => file.path === SKILL_PATH)).toHaveLength(1)
    expect(files.filter((file) => file.path.startsWith('/skill/references/'))).toHaveLength(count('skills/readme-guide/references', '.md'))
    expect(files.filter((file) => file.path.startsWith('/templates/'))).toHaveLength(count('templates/en', '.md') + count('templates/zh-TW', '.md'))
    expect(files.filter((file) => file.path.startsWith('/rules/'))).toHaveLength(count('rules', '.json'))
    expect(files).toHaveLength(1 + count('skills/readme-guide/references', '.md') + count('templates/en', '.md') + count('templates/zh-TW', '.md') + count('rules', '.json'))
  })

  it('每個網址都對到原本那個檔案（伺服器資源的資料夾＋檔名＝來源）', () => {
    for (const file of files) {
      const asset = guideAsset(file.path)
      expect(asset, file.path).not.toBeNull()
      expect(`${GUIDE_ASSET_DIRS[asset!.base]}/${asset!.key}`, file.path).toBe(file.source)
    }
  })

  it('清單以外的網址不會對到檔案以外的東西；頁面的網址都不在清單裡', () => {
    expect(guideAsset('/templates/web-app/')).toEqual({ base: 'guide-templates', key: 'web-app/' })
    const paths = new Set(files.map((file) => file.path))
    for (const page of allPagePaths()) expect(paths.has(page), page).toBe(false)
    for (const file of files) expect(file.path.endsWith('/'), file.path).toBe(false)
  })

  it('標頭：Markdown 與 JSON 都標明 UTF-8，不給搜尋引擎收錄', () => {
    expect(guideFileHeaders('markdown')).toEqual({ 'Content-Type': 'text/markdown; charset=utf-8', 'X-Robots-Tag': 'noindex' })
    expect(guideFileHeaders('json')).toEqual({ 'Content-Type': 'application/json; charset=utf-8', 'X-Robots-Tag': 'noindex' })
  })
})
