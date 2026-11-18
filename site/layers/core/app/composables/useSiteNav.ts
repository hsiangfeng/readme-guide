import { DEFAULT_PROJECT_TYPE } from '#shared/utils/projectTypes'

/** 頂端列的一個導覽連結 */
export interface SiteNavItem {
  id: string
  /** 文字的訊息 key */
  label: string
  to: string
}

/** 首頁上有錨點的區塊（頂端列跟著捲動位置標出目前在哪） */
const HOME_SECTIONS = ['ai', 'anatomy'] as const

/** 內頁屬於導覽的哪一項（路由名稱 → 導覽代號） */
const PAGE_OWNER: Record<string, string> = {
  'guide-slug': 'anatomy',
  'templates-type': 'templates',
  'rules': 'lint',
}

/**
 * 頂端列的導覽：交給 AI 寫、八塊結構連到首頁的區塊；四種範本、檢查工具連到內頁。
 * 首頁標出目前捲到的區塊；內頁標出它屬於哪一項（例如寫法頁屬於「八塊結構」）。
 */
export function useSiteNav() {
  const paths = useSitePaths()
  const route = useRoute()
  const routeBaseName = useRouteBaseName()

  const items = computed<SiteNavItem[]>(() => [
    { id: 'ai', label: 'common.nav.ai', to: paths.home('ai') },
    { id: 'anatomy', label: 'common.nav.anatomy', to: paths.home('anatomy') },
    { id: 'templates', label: 'common.nav.templates', to: paths.template(DEFAULT_PROJECT_TYPE) },
    { id: 'lint', label: 'common.nav.lint', to: paths.rules() },
  ])

  const baseName = computed(() => String(routeBaseName(route) ?? ''))
  const isHome = computed(() => baseName.value === 'index')
  const scrolled = useActiveSection(() => (isHome.value ? HOME_SECTIONS : []))

  /** 目前該標出來的導覽代號；沒有就是空字串 */
  const active = computed(() => (isHome.value ? scrolled.value : PAGE_OWNER[baseName.value] ?? ''))

  /** 首頁標的是捲動位置，內頁標的是所在的頁面 */
  const currentType = computed<'true' | 'page'>(() => (isHome.value ? 'true' : 'page'))

  return { items, active, currentType }
}
