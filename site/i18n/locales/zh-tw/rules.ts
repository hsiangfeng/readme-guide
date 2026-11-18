/**
 * 檢查項目頁（/rules/）的介面文字，照設計稿 design/rules.reference.html。
 * 每一條規則的名稱、說明、怎麼修，嚴重度與狀態的名稱都讀 rules/rules.json，不在這裡。
 */
export default {
  rulesPage: {
    meta: {
      title: 'README 檢查工具：會對哪些項目、錯了怎麼修',
      description: 'README 檢查工具照八塊結構一條一條對，還會拿 README 比對專案檔案，抓出指令、版本或環境變數不一致的地方，並教你怎麼修。',
    },
    title: '檢查工具\n會對這些項目',
    lead1: '每一條都對得回八塊裡的某一塊。',
    lead2: '其中一種只看 README 就知道，另一種會拿 README 去對你專案裡的檔案。',
    stats: {
      implemented: '{n} 條',
      implementedLabel: '現在就會檢查',
      plannedNote: '另外 {n} 條規劃中',
      severity: '{errors} {errorLabel}・{warnings} {warningLabel}',
      severityLabel: '錯誤一定要修',
      severityNote: '警告有可能是誤判，自己判斷',
      project: '{n} 條',
      projectLabel: '會對照專案檔案',
      projectNote: '指令、版本、環境變數、授權寫的跟專案一不一樣',
    },
    run: {
      title: '怎麼跑',
      body: '不用安裝任何東西，電腦有 Node.js 22 以上就能跑。交給 AI 寫的話，它寫完會自己跑一次。',
      hint: '沒指定專案類型的話，工具會自己判斷，也可以加 --type portfolio',
    },
    filters: {
      label: '篩選檢查項目',
      type: '專案類型',
      all: '全部',
      only: '只看',
      needsProject: '對照專案檔案',
      showPlanned: '顯示規劃中的 {n} 條',
      result: '符合的有 {n} 條',
    },
    wholeDocument: '整份文件',
    wholeDocumentGroup: '不分塊',
    wholeDocumentNote: '不屬於哪一塊，整份 README 都適用。',
    guideLink: '這一塊的完整寫法',
    noImplemented: '這一塊目前沒有工具能自動檢查的項目，照完整寫法自己看一次。',
    filteredEmpty: '這一塊沒有符合篩選條件的項目。',
    feedback: '覺得哪一條抓錯了，或是少了哪一條？',
    feedbackLink: '到 GitHub 開一個 Issue',
  },
}
