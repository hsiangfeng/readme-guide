/**
 * 檢查工具區。繁中照設計稿一字不改。
 * `prompt.*`（「複製給 AI 的指令」複製出去的內容）設計稿沒有，先暫定，之後由文案取代。
 */
export default {
  lint: {
    title: '寫完，再讓工具對一次',
    lead1: '指南附了一支檢查工具，照上面那八塊一條一條對。',
    lead2: 'AI 寫完會自己跑一次，你也可以拿來檢查現在的 README。',
    reportLabel: '檢查結果範例',
    noPosition: '沒有對應的行號',
    summary: '{problems}（{errors}、{warnings}）',
    problems: '{n} 個問題',
    errors: '{n} 個錯誤',
    warnings: '{n} 個警告',
    copyPrompt: '複製給 AI 的指令',
    rulesLink: '看檢查工具會對哪些項目',
    prompt: {
      run: '請先執行這行指令：',
      body1: '照結果一條一條修，修到沒有錯誤為止。',
    },
  },
}
