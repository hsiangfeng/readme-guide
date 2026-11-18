/**
 * 共用文案：頂端列、頁尾、複製按鈕、規則列、找不到頁面。八塊名稱、專案類型、規則文字直接讀 rules/，不在這裡。
 * 繁中照設計稿 design/home.reference.html 一字不改。
 * 注意：vue-i18n 會把 `@`、`|`、`{`、`}` 當成語法，要顯示這些字元得寫成 `{'@'}` 這種形式。
 */
export default {
  common: {
    brand: 'README Guide',
    byline: '是 Ray 不是 Array',
    skipToContent: '跳到主要內容',
    /**
     * 搜尋結果與分享卡片。每一頁的標題不含站名，放得下（約 60 個半形字寬）才在後面加 titleSuffix。
     * 關鍵字依據：繁中市場搜「README 怎麼寫」最多，「README 範本」「README.md 寫法」次之。
     */
    meta: {
      title: 'README 怎麼寫？範本、範例與檢查工具',
      titleSuffix: '｜README Guide',
      description: '貼上一段指令，AI 就照著指南幫你寫 README.md。也可以看四種專案的完整範例、拆解八塊寫法、挑範本填空，寫完再用檢查工具對一次。',
      home: '首頁',
      ogImageAlt: 'README Guide：貼上一段指令，AI 就照著指南幫你寫 README',
      checkerName: 'README Guide 檢查工具',
    },
    nav: {
      label: '主要導覽',
      ai: '交給 AI 寫',
      anatomy: '八塊結構',
      templates: '四種範本',
      lint: '檢查工具',
      openMenu: '打開選單',
      closeMenu: '關閉選單',
    },
    language: {
      label: '切換語言',
    },
    github: {
      label: 'GitHub',
      stars: '{count} 顆星',
    },
    footer: {
      label: '頁尾連結',
      github: 'GitHub',
      blog: '部落格',
      sitemap: '網站導覽',
      guide: '八塊的完整寫法',
      templates: '範本',
      rules: '檢查項目',
      allRules: '檢查工具會對的項目',
    },
    copy: {
      copied: '已複製',
      failed: '請手動複製',
      announceCopied: '已複製到剪貼簿',
      announceFailed: '無法複製到剪貼簿，請手動選取文字複製',
    },
    prompt: {
      caution: '不確定的地方先問我，不要自己編。',
    },
    /** 必填／選填的小標籤 */
    need: {
      required: '必填',
      optional: '選填',
      conditional: '有條件',
    },
    /** 八塊的索引（寫法頁、檢查項目頁的左邊） */
    blockIndex: {
      label: '八塊結構',
    },
    /** 檢查規則的一列（寫法頁與檢查項目頁共用） */
    rule: {
      why: '為什麼要檢查',
      fix: '怎麼修',
      before: '改之前',
      after: '改成',
      needsProject: '對照專案檔案',
      onlyTypes: '只有{types}',
      typeSeparator: '、',
      count: '{n} 條',
    },
    /** 「在你的專案資料夾裡執行」那個指令框（範本頁與檢查項目頁共用） */
    checkCommand: {
      title: '在你的專案資料夾裡執行',
      copy: '複製',
      note: '不用安裝任何東西，電腦有 Node.js 22 以上就能跑。',
    },
    notFound: {
      title: '找不到這一頁',
      body: '網址可能打錯了，或是這一頁已經搬家。',
      home: '回首頁',
    },
  },
}
