/**
 * 範本頁（/templates/<類型>/）的介面文字，照設計稿 design/template.reference.html。
 * 類型名稱、說明、每一塊的名稱與說明都讀 rules/，不在這裡。
 */
export default {
  templatePage: {
    /** 標題帶出類型名稱（讀 rules/project-types.json） */
    meta: {
      title: '{type}的 README 範本（Markdown）',
      description: '{description}複製這份 Markdown README 範本，把要填的地方換成你的內容，寫完再用檢查工具對一次。',
    },
    title: '{type}的\nREADME 範本',
    lead: '複製下來，把 {placeholder} 換成你的內容就好。',
    tabsLabel: '範本類型',
    copy: '複製這份範本',
    download: '下載 {file}',
    copyPrompt: '複製「請 AI 照這份寫」的指令',
    stats: '{lines} 行 · {placeholders} 個要填的地方',
    otherLanguage: 'English 版範本',
    windowTitle: '{path} — 還沒填的樣子',
    fullGuide: '完整寫法',
    check: {
      title: '填完，讓工具對一次',
      lead1: '還有沒換掉的 {placeholder}、指令跟專案對不起來、',
      lead2: '圖片沒有說明文字，都會被抓出來。',
    },
    others: {
      title: '不確定用哪一份？',
      current: '現在這一份',
    },
  },
}
