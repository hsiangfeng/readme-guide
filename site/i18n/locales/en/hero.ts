/**
 * 主視覺：交給 AI 寫。
 * `prompt.*` 是指令卡上的文字（畫面與複製出去的一樣）；中間那行指令不在這裡，在 shared/utils/site.ts。
 * `prompt.hint.*` 是選了專案類型時加進指令的那一句，`{id}` 是類型代號（例如 web-app），從 rules/ 來。
 * 2026-11-18 改成從網站抓指南的版本（不再叫人下載整份專案），文案已審過。
 */
export default {
  hero: {
    eyebrow: 'Write your README with AI',
    title: 'Paste this prompt,\nand AI writes\nyour README',
    lead: "It reads this guide first, then inspects your project. For anything it can't find in the files, like a live URL or test account, it asks you before writing.",
    autoType: 'Let AI decide',
    pickerLabel: 'What type of project is this? Optional, AI can tell on its own.',
    prompt: {
      label: 'Paste into your AI tool',
      copy: 'Copy prompt',
      run: 'First, run this command and read the whole guide it prints:',
      body1: 'Then inspect my current project against the guide,',
      body2: 'and write a README.md for me.',
      hint: {
        webApp: 'This is a web app. Use the {id} template.',
        courseExample: 'This is a course example. Use the {id} template.',
        portfolio: 'This is a portfolio project. Use the {id} template.',
        backendApi: 'This is a backend API. Use the {id} template.',
      },
    },
    note: 'Works with any AI tool that can read files and run commands.',
    terminal: {
      title: 'breakfast-order — AI tool',
      label: 'Example of an AI tool writing a README',
      readGuide: 'Read the whole guide',
      scan: 'Checking project: package.json, src/, .env.example',
      detect: 'Detected project type: {value}',
      askUrl: 'Does this project have a live URL?',
      answerUrl: 'https://example.com',
      askAccount: 'Should I include a test account?',
      answerAccount: 'Yes, one that can view but not edit data',
      you: 'You',
      fetchTemplate: 'Got {value} template, writing 8 blocks',
      checkResult: 'Checker result: {value}',
      noProblems: '0 problems',
      written: 'Wrote README.md',
    },
    terminalNote: 'Example only. The exact output depends on your AI tool, but the workflow is the same.',
  },
}
