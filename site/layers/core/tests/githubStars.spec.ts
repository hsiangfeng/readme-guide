import { describe, expect, it, vi } from 'vitest'
import { fetchGithubStars, GITHUB_API_VERSION, parseStarCount } from '#shared/utils/githubStars'
import { REPO_SLUG } from '#shared/utils/site'

/** 測試用的假權杖（不是真的） */
const TOKEN = 'test-token-not-real-0123456789'

/**
 * 假的 fetch：每次都回同一個結果，並記下被呼叫時的參數。
 * @param respond 產生回應的函式，或要丟出的錯誤
 */
function fakeFetch(respond: () => Response | Promise<Response>) {
  return vi.fn<typeof fetch>(async () => respond())
}

/** 回 200 與指定的 JSON */
const json = (body: unknown) => () => new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } })

/** 取出某次呼叫送出的標頭 */
const sentHeaders = (mock: ReturnType<typeof fakeFetch>) => mock.mock.calls[0]![1]!.headers as Record<string, string>

describe('建置時讀 GitHub 星星數：讀得到', () => {
  it('回傳 stargazers_count，打的是公開 API 的 repo 網址', async () => {
    const mock = fakeFetch(json({ full_name: REPO_SLUG, stargazers_count: 105, watchers_count: 7 }))
    expect(await fetchGithubStars({ repo: REPO_SLUG, fetch: mock })).toEqual({ ok: true, stars: 105 })
    expect(mock).toHaveBeenCalledTimes(1)
    expect(mock.mock.calls[0]![0]).toBe(`https://api.github.com/repos/${REPO_SLUG}`)
    expect(sentHeaders(mock)['X-GitHub-Api-Version']).toBe(GITHUB_API_VERSION)
  })

  it('0 顆星也是正確的數字', async () => {
    expect(await fetchGithubStars({ repo: REPO_SLUG, fetch: fakeFetch(json({ stargazers_count: 0 })) })).toEqual({ ok: true, stars: 0 })
  })

  it('本機沒有權杖時不送 Authorization；CI 有權杖時才送', async () => {
    const withoutToken = fakeFetch(json({ stargazers_count: 1 }))
    await fetchGithubStars({ repo: REPO_SLUG, fetch: withoutToken })
    expect(sentHeaders(withoutToken)).not.toHaveProperty('Authorization')

    const withToken = fakeFetch(json({ stargazers_count: 1 }))
    await fetchGithubStars({ repo: REPO_SLUG, token: TOKEN, fetch: withToken })
    expect(sentHeaders(withToken).Authorization).toBe(`Bearer ${TOKEN}`)
  })
})

describe('建置時讀 GitHub 星星數：讀不到', () => {
  const cases: [string, () => Response | Promise<Response>][] = [
    ['repo 還沒改名（404）', () => new Response('{"message":"Not Found"}', { status: 404 })],
    ['超過次數限制（403）', () => new Response('{"message":"API rate limit exceeded"}', { status: 403 })],
    ['超過次數限制（429）', () => new Response('', { status: 429 })],
    ['權杖失效（401）', () => new Response('{"message":"Bad credentials"}', { status: 401 })],
    ['GitHub 出錯（502）', () => new Response('', { status: 502 })],
    ['離線', () => Promise.reject(new TypeError('fetch failed'))],
    ['逾時', () => Promise.reject(new DOMException('The operation was aborted due to timeout', 'TimeoutError'))],
  ]

  for (const [name, respond] of cases) {
    it(`${name}：不丟錯，回傳失敗原因，原因裡沒有權杖`, async () => {
      const result = await fetchGithubStars({ repo: REPO_SLUG, token: TOKEN, fetch: fakeFetch(respond) })
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.reason).not.toBe('')
        expect(result.reason).not.toContain(TOKEN)
      }
    })
  }
})

describe('建置時讀 GitHub 星星數：回來的格式不對', () => {
  const cases: [string, () => Response][] = [
    ['不是 JSON', () => new Response('<html>Unicorn!</html>', { status: 200 })],
    ['空的內容', () => new Response('', { status: 200 })],
    ['JSON 是 null', json(null)],
    ['JSON 是陣列', json([105])],
    ['沒有 stargazers_count', json({ full_name: REPO_SLUG })],
    ['星星數是字串', json({ stargazers_count: '105' })],
    ['星星數是小數', json({ stargazers_count: 10.5 })],
    ['星星數是負數', json({ stargazers_count: -1 })],
    ['星星數是 null', json({ stargazers_count: null })],
  ]

  for (const [name, respond] of cases) {
    it(`${name}：當作讀不到，不顯示假的數字`, async () => {
      const result = await fetchGithubStars({ repo: REPO_SLUG, fetch: fakeFetch(respond) })
      expect(result.ok).toBe(false)
    })
  }
})

describe('網站設定裡的星星數', () => {
  it('只接受 0 以上的整數，其他一律當作沒有', () => {
    expect(parseStarCount(105)).toBe(105)
    expect(parseStarCount(0)).toBe(0)
    for (const value of [null, undefined, '105', -3, 1.5, Number.NaN, Number.POSITIVE_INFINITY, {}]) {
      expect(parseStarCount(value), String(value)).toBeNull()
    }
  })
})
