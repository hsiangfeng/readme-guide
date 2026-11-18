/**
 * 主視覺：交給 AI 寫。
 * `prompt.*` 是指令卡上的文字（畫面與複製出去的一樣）；中間那行指令不在這裡，在 shared/utils/site.ts。
 * `prompt.hint.*` 是選了專案類型時加進指令的那一句，`{id}` 是類型代號（例如 web-app），從 rules/ 來。
 * 2026-11-18 改成從網站抓指南的版本（不再叫人下載整份專案），文案已審過。
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
      run: '請先執行這行指令，把印出來的撰寫指南完整讀完：',
      body1: '照著它檢查我現在這個專案，',
      body2: '幫我寫一份 README.md。',
      hint: {
        webApp: '這是一個網頁專案，請用 {id} 這份範本。',
        courseExample: '這是一個課程範例，請用 {id} 這份範本。',
        portfolio: '這是一個作品集，請用 {id} 這份範本。',
        backendApi: '這是一個後端 API 專案，請用 {id} 這份範本。',
      },
    },
    note: '只要是讀得了檔案、跑得了指令的 AI 工具都能用。',
    terminal: {
      title: 'breakfast-order — AI 助手',
      label: 'AI 助手寫 README 的過程示意',
      readGuide: '讀完撰寫指南',
      scan: '檢查專案：package.json、src/、.env.example',
      detect: '判斷類型：{value}',
      askUrl: '這個專案有線上網址嗎？',
      answerUrl: 'https://example.com',
      askAccount: '要附測試帳號嗎？',
      answerAccount: '給一組只能看、不能改資料的',
      you: '你',
      fetchTemplate: '取得 {value} 範本，八塊照順序寫',
      checkResult: '檢查結果：{value}',
      noProblems: '0 個問題',
      written: '已寫好 README.md',
    },
    terminalNote: '示意畫面。實際的樣子會跟著你用的 AI 工具不同，流程是一樣的。',
  },
}
