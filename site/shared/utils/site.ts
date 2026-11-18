/**
 * 網站的固定連結與指令。正式網址是 readme-guide.com，原始碼在 GitHub 的 hsiangfeng/readme-guide。
 * 網站上出現的指令字串都集中在這裡，要改只改這一處。
 */

/** 正式網址 */
export const SITE_URL = 'https://readme-guide.com'

/** 專案在 GitHub 上的「帳號/repo 名稱」（建置時用它讀星星數，見 githubStars.ts） */
export const REPO_SLUG = 'hsiangfeng/readme-guide'

/** 專案的 GitHub 頁面（原始碼） */
export const REPO_URL = `https://github.com/${REPO_SLUG}`

/** 頁尾的部落格連結 */
export const BLOG_URL = 'https://israynotarray.com/'

/** 開 Issue 的網址 */
export const ISSUES_URL = `${REPO_URL}/issues`

/**
 * 撰寫指南（skills/readme-guide/SKILL.md）在網站上的路徑。建置時原文複製過來，
 * 同一套規則的 references、範本、rules/ 也一起放上網站（見 modules/guideFiles.ts）。
 */
export const SKILL_PATH = '/skill.md'

/** 撰寫指南的完整網址 */
export const SKILL_URL = `${SITE_URL}${SKILL_PATH}`

/** 給 AI 的第一行指令：把撰寫指南印出來讀 */
export const SKILL_COMMAND = `curl -fsSL ${SKILL_URL}`

/** 檢查工具在 npm 上的套件名稱 */
export const CHECKER_PACKAGE = 'readme-guide'

/** 給人照打的檢查指令（範本頁、檢查項目頁、首頁檢查工具區） */
export const CHECK_COMMAND = `npx ${CHECKER_PACKAGE}@latest check README.md`

/** 給 AI 跑的檢查指令：多一個 --yes，不用停下來等人確認要不要下載套件 */
export const AI_CHECK_COMMAND = `npx --yes ${CHECKER_PACKAGE}@latest check README.md`
