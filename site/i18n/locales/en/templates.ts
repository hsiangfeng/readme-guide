/**
 * 範本頁（/templates/<類型>/）的介面文字。
 */
export default {
  templatePage: {
    /** The title shows the type name (from rules/project-types.json). */
    meta: {
      title: '{type} README template (Markdown)',
      description: '{description} Copy this Markdown README template, fill in the blanks, and run the checker.',
    },
    title: '{type}\nREADME template',
    lead: 'Copy the template and replace each {placeholder} blank with your own details.',
    tabsLabel: 'Project type',
    copy: 'Copy this template',
    download: 'Download {file}',
    copyPrompt: 'Copy AI prompt for this template',
    stats: '{lines} lines · {placeholders} blanks to fill',
    otherLanguage: '繁體中文版範本',
    windowTitle: '{path} — unfilled template',
    fullGuide: 'Full guide',
    check: {
      title: 'Done filling it in? Run the checker',
      lead1: 'Unfilled {placeholder} blanks, commands that do not match your project,',
      lead2: 'and images missing alt text all get caught automatically.',
    },
    others: {
      title: 'Not sure which template fits?',
      current: 'Current template',
    },
  },
}
