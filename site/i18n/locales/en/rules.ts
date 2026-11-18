/**
 * 檢查項目頁（/rules/）的介面文字。
 */
export default {
  rulesPage: {
    meta: {
      title: 'README checker: rules and how to fix issues',
      description: 'See every rule our README checker runs across all eight blocks, including checks against package.json and .env.example, plus how to fix each issue.',
    },
    title: 'What the checker\nchecks',
    lead1: 'Every rule maps back to one of the eight blocks.',
    lead2: 'Some inspect the README alone; others compare your README against the files in your repository.',
    stats: {
      implemented: '{n} rules',
      implementedLabel: 'Active now',
      plannedNote: '{n} more planned',
      severity: '{errors} {errorLabel} · {warnings} {warningLabel}',
      severityLabel: 'Errors must be fixed',
      severityNote: 'Warnings may be false positives. Use your judgment',
      project: '{n} rules',
      projectLabel: 'Check project files',
      projectNote: 'Verifies commands, versions, environment variables, and license against your project',
    },
    run: {
      title: 'How to run it',
      body: 'Nothing to install, just Node.js 22 or later. If AI writes your README, it runs the checker automatically when done.',
      hint: 'The checker detects your project type automatically, or pass --type portfolio',
    },
    filters: {
      label: 'Filter rules',
      type: 'Project type',
      all: 'All',
      only: 'Show only',
      needsProject: 'Checks project files',
      showPlanned: 'Show {n} planned rules',
      result: '{n} matching rule | {n} matching rules',
    },
    wholeDocument: 'Whole document',
    wholeDocumentGroup: 'Document-wide',
    wholeDocumentNote: 'Applies to the entire README rather than a single block.',
    guideLink: 'Full guide for this block',
    noImplemented: 'No automated rules for this block yet. Use the full guide to review it yourself.',
    filteredEmpty: 'No rules in this block match your filters.',
    feedback: 'Spot a false positive or a missing rule?',
    feedbackLink: 'Open an issue on GitHub',
  },
}
