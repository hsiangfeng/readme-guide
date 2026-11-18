/**
 * 每一塊的完整寫法（/guide/<塊>/）的介面文字。
 */
export default {
  guide: {
    /** The title shows the block name (from rules/blocks.json). One description per block; add one when rules/ gains a block (the tests check). */
    meta: {
      title: '{name}: how to write a README',
      descriptions: {
        title: 'Readers decide in three seconds whether to stay. Start your README with one H1 title, a plain one-line summary, and the project status.',
        demo: "Most visitors won't install your code first. Add a live demo link and screenshots with alt text so readers see what your project does in ten seconds.",
        features: 'Show what your project can do today without making people read the code. Write a scannable README features list and mark unfinished items clearly.',
        tech: 'Skip dumping package.json into your README. List only the core frameworks and major versions in your tech stack so anyone sees how the project is built.',
        install: 'One missing step in Getting Started makes people give up. Write copy-pasteable README install commands with exact versions and the local URL to open.',
        env: 'Environment variables are where setups fail most. Use a README table to show what each variable does, if it is required, and where to get it.',
        structure: 'Help new contributors find the right file fast. Map out the top one or two folder levels in your README project structure and what lives in each.',
        license: 'Tell readers whether they can reuse your code and who to contact when something breaks. How to write the Author and License sections of a README.',
      },
    },
    indexToggle: 'Eight blocks',
    indexCurrent: 'Current: {number} {name}',
    templatesLink: 'Templates',
    rulesLink: 'Checker rules',
    facts: {
      headings: 'Use this exact heading',
      otherLang: 'In Traditional Chinese',
      who: 'Who needs this',
      question: 'What readers ask',
    },
    beforeAfter: {
      title: 'Before and after',
      lead: 'Every numbered highlight above marks a spot where readers get stuck.',
      before: 'Following this gets you stuck',
      after: 'Paste this and it runs',
      notesLabel: 'Issues in the "Before" version',
      noteNumber: 'Issue {n}',
    },
    noteRule: {
      implemented: 'Caught by the checker',
      planned: 'Planned for the checker',
      none: 'Needs manual review',
    },
    typesTitle: 'How this block differs across the four project types',
    rules: {
      title: 'What the checker checks here',
      lead: 'Rules marked "Checks project files" compare your README against the actual files in your repository.',
      planned: '{n} more rule planned. | {n} more rules planned.',
      none: 'No automated rules for this block yet. Use the guide above to review it yourself.',
      all: 'See all checker rules',
    },
    previous: 'Previous block',
    next: 'Next block',
    pager: 'Previous and next block',
    missing: {
      title: 'This page is on the way',
      body: 'Check the summary above for what belongs in this block. The full guide and before-and-after examples are coming soon.',
    },
  },
}
