import { BLOCKS } from '#shared/utils/blocks'
import { LOCALES } from '#shared/utils/locales'
import { pageMeta } from '#shared/utils/pageMeta'
import { PROJECT_TYPES } from '#shared/utils/projectTypes'
import { samplePath } from '#shared/utils/samples'
import { PERSON_ID, localizedPath, pageUrl, SITE_PAGES } from '#shared/utils/seo'
import { CHECK_COMMANDS, REPO_URL } from '#shared/utils/site'

/**
 * 給 AI 讀的站台說明（llms.txt）：這是什麼、作者、有哪些東西，最重要的是「要幫人寫 README，去讀 SKILL.md」。
 * 八塊與類型的名稱讀 rules/，頁面標題與描述讀訊息檔，都不寫死。
 */
export default defineEventHandler((event) => {
  const en = siteTranslator('en')
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

Read \`skills/readme-guide/SKILL.md\` in the repository and follow it: ${REPO_URL}

It tells you what to read, what to ask the person, which template to use, and to run the checker before you finish:

\`\`\`bash
${CHECK_COMMANDS.join('\n')}
\`\`\`

## What the guide has

- The eight blocks, in reading order: ${BLOCKS.map((block) => `${block.number} ${block.name.en}`).join('; ')}
- Templates: ${PROJECT_TYPES.map((type) => `${type.name.en} (templates/en/${type.id}.md, templates/zh-TW/${type.id}.md)`).join('; ')}
- Filled-in examples to compare against (each template filled in for one sample project): ${PROJECT_TYPES.map((type) => `${type.name.en} (${samplePath(type.id, 'en')}, ${samplePath(type.id, 'zh-tw')})`).join('; ')}
- Rules for AI agents: skills/readme-guide/
- Checker: lint/ (no install needed; Node.js 22 or later)

${pages.join('\n\n')}

## Entity

Person canonical: ${PERSON_ID}
`
})
