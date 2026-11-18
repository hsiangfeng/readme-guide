/**
 * 每一塊的完整寫法（/guide/<塊>/）的介面文字，照設計稿 design/guide-block.reference.html。
 * 這一頁的內容（為什麼、改之前改之後…）在 site/content/guide/<語言>/<塊>.json；
 * 編號、名稱、規則都讀 rules/，不在這裡。
 */
export default {
  guide: {
    /** 標題帶出塊的名稱（讀 rules/blocks.json）；描述每一塊各寫一句，rules/ 多一塊時這裡要補（測試會抓） */
    meta: {
      title: '{name}：README 怎麼寫',
      descriptions: {
        title: '點進儲存庫的前三秒就決定去留。README 開頭用唯一的一級標題寫專案名稱，配一句話說明做什麼、給誰用，最後標上專案狀態。',
        demo: '多數人不會先下載程式碼來跑。在 README 放上點得開的線上展示網址與附替代文字的畫面截圖，讓人十秒內看懂你做了什麼。',
        features: '讓人不用翻程式碼，一眼看懂專案做得到什麼。用核取方塊列出已完成與開發中的 README 功能清單，也看看課堂範例與作品集怎麼改寫。',
        tech: '別把整份 package.json 貼進 README。使用技術只要列主要框架與主版號，想改程式的人或面試官不用翻設定檔就能看懂技術底子。',
        install: '少寫一步指令，想試用的人就會卡住放棄。教你把環境需求版本、安裝與啟動步驟照順序放進 README 程式碼區塊，讓人照著貼就能跑起來。',
        env: '漏設環境變數是最常見的卡關原因。用表格在 README 寫清楚每個變數的用途、是否必填、去哪裡拿，同時避免把真的金鑰貼上網。',
        structure: '接手或看作品的人想找檔案，不該自己翻遍整個儲存庫。README 資料夾結構只列重要的一兩層並註明用途，讓人馬上知道去哪個資料夾改。',
        license: 'README 結尾要回答兩件事：這份程式碼能不能拿去用、出問題要找誰。看懂作者與聯絡、貢獻方式與授權條款的寫法及內部專案怎麼寫。',
      },
    },
    indexToggle: '八塊目錄',
    indexCurrent: '目前：{number} {name}',
    templatesLink: '四種範本',
    rulesLink: '檢查項目',
    facts: {
      headings: '標題固定這樣寫',
      otherLang: '英文版寫',
      who: '誰要寫',
      question: '讀的人在問',
    },
    beforeAfter: {
      title: '改之前、改之後',
      lead: '上面那份每個編號，都是別人會卡住的地方。',
      before: '照著做會卡住',
      after: '照著貼就能跑',
      notesLabel: '改之前那份的問題',
      noteNumber: '第 {n} 個問題',
    },
    noteRule: {
      implemented: '檢查工具會抓',
      planned: '之後會加進檢查工具',
      none: '工具看不出來，要自己確認',
    },
    typesTitle: '四種專案，這一塊差在哪',
    rules: {
      title: '檢查工具會對這幾項',
      lead: '標了「對照專案檔案」的，是拿 README 去跟你專案裡的檔案比。',
      planned: '另外還有 {n} 條規劃中，之後會加。',
      none: '這一塊目前沒有工具能自動檢查的項目，照完整寫法自己看一次。',
      all: '看全部檢查項目',
    },
    previous: '上一塊',
    next: '下一塊',
    pager: '上一塊與下一塊',
    missing: {
      title: '這一頁的內容還在準備',
      body: '先看這一塊要寫什麼，完整的寫法、改之前改之後的例子之後補上。',
    },
  },
}
