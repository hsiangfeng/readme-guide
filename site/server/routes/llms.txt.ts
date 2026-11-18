import { BLOCKS } from '#shared/utils/blocks'
import { LOCALES } from '#shared/utils/locales'
import { pageMeta } from '#shared/utils/pageMeta'
import { PROJECT_TYPES } from '#shared/utils/projectTypes'
import { samplePath } from '#shared/utils/samples'
import { PERSON_ID, localizedPath, pageUrl, SITE_PAGES } from '#shared/utils/seo'
import { AI_CHECK_COMMAND, CHECKER_PACKAGE, REPO_URL, SITE_URL, SKILL_URL } from '#shared/utils/site'

/**
 * 給 AI 讀的站台說明（llms.txt）：這是什麼、作者、有哪些東西，最重要的是「要幫人寫 README，去讀網站上的 skill.md」。
 * 八塊與類型的名稱讀 rules/，頁面標題與描述讀訊息檔，放上網站的原始檔照 modules/guideFiles.ts 的清單列，都不寫死。
 */
export default defineEventHandler((event) => {
  const en = siteTranslator('en')
  /** 放上網站的原始檔（網站上的路徑） */
  const guideFiles = useRuntimeConfig().guideFiles as string[]
  /** 範本的語言資料夾（en、zh-TW） */
  const templateLangs = [...new Set(LOCALES.map((locale) => locale.dataLang))]
  const urlsUnder = (prefix: string) => guideFiles.filter((path) => path.startsWith(prefix)).map((path) => `${SITE_URL}${path}`)
  const pages = LOCALES.map((locale) => {
    const t = siteTranslator(locale.code)
    const list = SITE_PAGES.map((page) => {
      const meta = pageMeta(page, locale.code, t)
      return `- [${meta.name}](${pageUrl(localizedPath(locale.code, page.path))}): ${meta.description}`
    })
    return `## Pages (${locale.code === 'en' ? 'English' : 'Traditional Chinese, Taiwan'})\n\n${list.join('\n')}`
  })

  setHeader(event, 'content-type', 'text/plain; charset=utf-8')
  return `# ${en('common.brand')}

> How to write a good README: eight blocks in a fixed order, a template for each kind of project, rules an AI agent can follow, and a checker that runs on Node.js. English and Traditional Chinese.

Author: Ray, the author of https://israynotarray.com (brand: 是 Ray 不是 Array).

## If you are helping someone write a README

Read the writing guide at ${SKILL_URL} (raw Markdown) and follow it. You do not need to clone the repository: every file the guide refers to is on this site.

Before you finish, run the checker and fix what it reports:

\`\`\`bash
${AI_CHECK_COMMAND}
\`\`\`

## What the guide has

- The eight blocks, in reading order: ${BLOCKS.map((block) => `${block.number} ${block.name.en}`).join('; ')}
- Templates (raw Markdown): ${PROJECT_TYPES.map((type) => `${type.name.en} (${templateLangs.map((lang) => `${SITE_URL}/templates/${lang}/${type.file}`).join(', ')})`).join('; ')}
- Rules for AI agents: ${SKILL_URL}, with references: ${urlsUnder('/skill/references/').join(', ')}
- Rule data (JSON): ${urlsUnder('/rules/').join(', ')}
- Checker: the npm package \`${CHECKER_PACKAGE}\` (Node.js 22 or later; no install needed with npx)
- Source code: ${REPO_URL} (filled-in examples of each template, for comparison: ${PROJECT_TYPES.map((type) => `${type.name.en} ${samplePath(type.id, 'en')}, ${samplePath(type.id, 'zh-tw')}`).join('; ')})

${pages.join('\n\n')}

## Entity

Person canonical: ${PERSON_ID}
`
})
