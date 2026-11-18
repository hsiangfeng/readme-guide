/**
 * 網站的固定連結與數字。repo 預計改名為 readme-guide（見 PLAN.md 第 9 節），
 * 改名前這些網址會 404；GitHub 改名後會自動把舊網址轉到新的。
 */

/** 正式網址（還沒上線） */
export const SITE_URL = 'https://readme-guide.com'

/** 專案在 GitHub 上的「帳號/repo 名稱」（建置時用它讀星星數，見 githubStars.ts） */
export const REPO_SLUG = 'hsiangfeng/readme-guide'

/** 專案的 GitHub 頁面 */
export const REPO_URL = `https://github.com/${REPO_SLUG}`

/** 給 AI 執行的下載指令裡用的網址 */
export const CLONE_URL = `${REPO_URL}.git`

/** 頁尾的部落格連結 */
export const BLOG_URL = 'https://israynotarray.com/'

/** 開 Issue 的網址 */
export const ISSUES_URL = `${REPO_URL}/issues`

/** 在專案資料夾裡跑檢查工具的兩行指令（範本頁與檢查項目頁共用） */
export const CHECK_COMMANDS: readonly string[] = [
  `git clone ${CLONE_URL}`,
  'node readme-guide/lint/bin/readme-guide.mjs check README.md',
]
