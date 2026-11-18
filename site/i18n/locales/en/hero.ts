/**
 * 主視覺：交給 AI 寫。
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
      read1: 'Read skills/readme-guide/SKILL.md inside it,',
      read2: 'inspect my current project against the guide,',
      read3: 'and write a README.md for me.',
      hint: {
        webApp: 'This is a web app. Follow the {path} template.',
        courseExample: 'This is a course example. Follow the {path} template.',
        portfolio: 'This is a portfolio project. Follow the {path} template.',
        backendApi: 'This is a backend API. Follow the {path} template.',
      },
    },
    note: 'Works with any AI tool that can read files and run commands.',
    terminal: {
      title: 'breakfast-order — AI tool',
      label: 'Example of an AI tool writing a README',
      downloaded: 'Guide downloaded',
      readGuide: 'Reading skills/readme-guide/SKILL.md',
      scan: 'Checking project: package.json, src/, .env.example',
      detect: 'Detected project type: {value}',
      askUrl: 'Does this project have a live URL?',
      answerUrl: 'https://example.com',
      askAccount: 'Should I include a test account?',
      answerAccount: 'Yes, one that can view but not edit data',
      you: 'You',
      applyTemplate: 'Applying templates/en/web-app.md across all eight blocks',
      runCheck: 'Running checker: {value}',
      checkResult: '0 problems',
      written: 'Wrote README.md',
    },
    terminalNote: 'Example only. The exact output depends on your AI tool, but the workflow is the same.',
  },
}
