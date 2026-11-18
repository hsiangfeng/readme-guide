/**
 * 共用文案：頂端列、頁尾、複製按鈕、規則列、找不到頁面。八塊名稱、專案類型、規則文字直接讀 rules/，不在這裡。
 * 注意：vue-i18n 會把 `@`、`|`、`{`、`}` 當成語法，要顯示這些字元得寫成 `{'@'}` 這種形式。
 * 署名「是 Ray 不是 Array」是品牌名，英文頁也不翻。
 */
export default {
  common: {
    brand: 'README Guide',
    byline: '是 Ray 不是 Array',
    skipToContent: 'Skip to main content',
    /**
     * Search results and share cards. Page titles leave out the site name; titleSuffix is added only when it fits (about 60 characters).
     * Keywords: "how to write a README" (lowest difficulty), "README example" (highest volume), "README template".
     */
    meta: {
      title: 'How to write a README: examples and templates',
      titleSuffix: " {'|'} README Guide",
      description: 'Learn how to write a README with real README examples, copy-ready Markdown templates, and a checker, or paste one prompt so AI writes your README.md.',
      home: 'Home',
      ogImageAlt: 'README Guide: paste one prompt and AI writes your README',
      checkerName: 'README Guide checker',
    },
    nav: {
      label: 'Main navigation',
      ai: 'Write with AI',
      anatomy: 'Eight blocks',
      templates: 'Templates',
      lint: 'Checker',
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
    },
    language: {
      label: 'Switch language',
    },
    github: {
      label: 'GitHub',
      stars: '{count} stars',
    },
    footer: {
      label: 'Footer links',
      github: 'GitHub',
      blog: 'Blog',
      sitemap: 'Sitemap',
      guide: 'Full guide for each block',
      templates: 'Templates',
      rules: 'Checker rules',
      allRules: 'All checker rules',
    },
    copy: {
      copied: 'Copied',
      failed: 'Copy manually',
      announceCopied: 'Copied to clipboard',
      announceFailed: 'Could not copy to clipboard. Please select and copy the text manually.',
    },
    prompt: {
      run: 'First, run this command:',
      caution: "If anything is unclear, ask me first. Don't make it up.",
    },
    /** 必填／選填的小標籤 */
    need: {
      required: 'Required',
      optional: 'Optional',
      conditional: 'Conditional',
    },
    /** 八塊的索引（寫法頁、檢查項目頁的左邊） */
    blockIndex: {
      label: 'Eight blocks',
    },
    /** 檢查規則的一列（寫法頁與檢查項目頁共用） */
    rule: {
      why: 'Why it matters',
      fix: 'How to fix',
      before: 'Before',
      after: 'After',
      needsProject: 'Checks project files',
      onlyTypes: '{types} only',
      typeSeparator: ', ',
      count: '{n} rule | {n} rules',
    },
    /** 「在你的專案資料夾裡執行」那個指令框（範本頁與檢查項目頁共用） */
    checkCommand: {
      title: 'Run in your project folder',
      copy: 'Copy',
      note: 'Nothing to install. Just Node.js 22 or later.',
    },
    notFound: {
      title: 'Page not found',
      body: 'Check the URL, or this page may have moved.',
      home: 'Back to home',
    },
  },
}
