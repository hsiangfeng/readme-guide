/**
 * 主視覺：交給 AI 寫。繁中照設計稿；只有 AI 要讀的檔案改成規劃定案的 skills/readme-guide/SKILL.md（PLAN.md 第 11 節）。
 * `prompt.hint.*` 是選了專案類型時加進指令的那一句，設計稿沒有，先暫定，之後由文案取代。
 */
export default {
  hero: {
    eyebrow: '交給 AI 寫 README',
    title: '貼上這一段，\nAI 就照著指南\n幫你寫 README',
    lead: '它會先讀完這份撰寫指南，再看你的專案。線上網址、測試帳號這類查不到的事，會先問你再寫。',
    autoType: '讓 AI 判斷',
    pickerLabel: '你的專案是哪一種？不選也可以，AI 會自己判斷。',
    prompt: {
      label: '貼給你的 AI 助手',
      copy: '複製指令',
      read1: '讀完裡面的 skills/readme-guide/SKILL.md，',
      read2: '照著它檢查我現在這個專案，',
      read3: '幫我寫一份 README.md。',
      hint: {
        webApp: '這是一個網頁專案，請照 {path} 這份範本寫。',
        courseExample: '這是一個課程範例，請照 {path} 這份範本寫。',
        portfolio: '這是一個作品集，請照 {path} 這份範本寫。',
        backendApi: '這是一個後端 API 專案，請照 {path} 這份範本寫。',
      },
    },
    note: '只要是讀得了檔案、跑得了指令的 AI 工具都能用。',
    terminal: {
      title: 'breakfast-order — AI 助手',
      label: 'AI 助手寫 README 的過程示意',
      downloaded: '已下載撰寫指南',
      readGuide: '讀取 skills/readme-guide/SKILL.md',
      scan: '檢查專案：package.json、src/、.env.example',
      detect: '判斷類型：{value}',
      askUrl: '這個專案有線上網址嗎？',
      answerUrl: 'https://example.com',
      askAccount: '要附測試帳號嗎？',
      answerAccount: '給一組只能看、不能改資料的',
      you: '你',
      applyTemplate: '套用範本 templates/zh-TW/web-app.md，八塊照順序寫',
      runCheck: '跑檢查工具：{value}',
      checkResult: '0 個問題',
      written: '已寫好 README.md',
    },
    terminalNote: '示意畫面。實際的樣子會跟著你用的 AI 工具不同，流程是一樣的。',
  },
}
