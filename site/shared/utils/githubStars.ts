/**
 * 頂端列 GitHub 按鈕上的星星數：建置時向 GitHub 的公開 API 讀一次，寫進產生出來的網站，
 * 瀏覽器不會再發任何請求。讀不到（repo 還沒改名、離線、超過次數限制）或回來的資料不對時，
 * 回傳失敗的原因，由呼叫的地方把星星數藏起來，不顯示假的數字，也不讓建置失敗。
 */

/** GitHub REST API 的版本（https://docs.github.com/en/rest/about-the-rest-api/api-versions） */
export const GITHUB_API_VERSION = '2026-03-10'

/** 等 API 回應的上限；超過就當作讀不到，不要拖住建置 */
const TIMEOUT_MS = 5000

export type StarResult = { ok: true, stars: number } | { ok: false, reason: string }

export interface FetchStarsOptions {
  /** 「帳號/repo 名稱」，例如 hsiangfeng/readme-guide */
  repo: string
  /** 有的話放進 Authorization（CI 用內建的 workflow 權杖拿比較高的次數上限）；本機不用 */
  token?: string
  /** 測試時換成假的 fetch */
  fetch?: typeof globalThis.fetch
}

/**
 * 把一個值當成星星數檢查：要是 0 以上的整數，不是的話回傳 null。
 * @param value API 回來的 stargazers_count，或寫進網站設定裡的值
 */
export function parseStarCount(value: unknown): number | null {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 ? value : null
}

/**
 * 向 GitHub 讀 repo 的星星數。不會丟出錯誤：失敗時回傳原因，原因裡不會帶到權杖。
 * @param options 要讀的 repo、權杖（可省略）
 */
export async function fetchGithubStars(options: FetchStarsOptions): Promise<StarResult> {
  const doFetch = options.fetch ?? globalThis.fetch
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': GITHUB_API_VERSION,
    'User-Agent': 'readme-guide-site-build',
  }
  if (options.token) headers.Authorization = `Bearer ${options.token}`

  let response: Response
  try {
    response = await doFetch(`https://api.github.com/repos/${options.repo}`, { headers, signal: AbortSignal.timeout(TIMEOUT_MS) })
  }
  catch (error) {
    // 錯誤訊息只取名稱：連線失敗或逾時，不把整個錯誤物件印出來
    const name = error instanceof Error ? error.name : 'Error'
    return { ok: false, reason: `連不到 GitHub（${name}）` }
  }

  if (!response.ok) return { ok: false, reason: `GitHub 回應 HTTP ${response.status}` }

  let body: unknown
  try {
    body = await response.json()
  }
  catch {
    return { ok: false, reason: 'GitHub 回來的不是 JSON' }
  }

  const stars = parseStarCount(body && typeof body === 'object' ? (body as Record<string, unknown>).stargazers_count : undefined)
  if (stars === null) return { ok: false, reason: 'GitHub 回來的資料裡沒有正確的星星數' }
  return { ok: true, stars }
}
