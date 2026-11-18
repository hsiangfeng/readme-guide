/**
 * 八塊結構解剖圖。章節標題不在這裡（直接用 rules/headings.json 的正式標題）。
 * 中間那份 README 不在這裡：直接讀 lint/fixtures/ 裡「範本填完的樣子」（見 layers/anatomy/app/data/samples.ts）。
 */
export default {
  anatomy: {
    title: 'A good README,\nbroken down into {highlight}',
    highlight: 'eight blocks',
    lead1: 'Ordered the way people actually read, with the reason each block belongs there.',
    lead2: 'Fixed headings in a fixed order: faster for people to scan, easier for AI to parse.',
    questions: {
      what: { title: 'First: "What is it?"', body: 'Visitors decide within 30 seconds whether to keep reading.' },
      run: { title: 'Next: "How do I run it?"', body: 'Anyone who wants to try it should be able to follow along and get it running.' },
      change: { title: 'Finally: "How do I change it, and may I use it?"', body: 'Only people maintaining or reusing the project read this far.' },
    },
    tabsLabel: 'Project type',
    windowTitle: 'README.md — how it looks to readers',
    copyTemplate: 'Copy this template',
    viewTemplate: 'View this template',
    fullGuide: 'Full guide for each block',
    comingSoon: 'Coming soon: CLI tools, packages, mobile apps',
    templates: {
      webApp: {
        why: {
          title: 'Visitors read this line first and decide in three seconds whether to keep reading.',
          demo: "Most visitors won't install the project; a live link and screenshot tell them if it's what they need.",
          features: 'Readers see what works today and what is still in progress without digging through the code.',
          tech: 'Even six months later, you and your team can tell at a glance which major versions the project uses.',
          install: 'Anyone who wants to try it can paste the commands and run; miss one step and they give up.',
          env: 'Where setups fail most. Readers see where to get each value, and you avoid leaking real keys.',
          structure: 'Anyone taking over the project knows which folder to open when making changes.',
          license: 'Readers know whether they may reuse the code and who to contact when something breaks.',
        },
      },
      courseExample: {
        why: {
          title: 'Students read this first and immediately know what the exercise is about.',
          demo: 'Students see the finished screen first, so they know what they are building toward.',
          features: 'Students see which lesson this belongs to, what they need first, and what they will learn.',
          tech: 'Students taking the course months later still know which framework versions were used.',
          install: 'Students can switch to the starter branch, open the right file to practice, and check the solution if stuck.',
          env: 'Most course examples need none; saying so keeps students from hunting for a config file.',
          structure: 'Students know right away which folder holds the exercise files without digging around.',
          license: 'Students know whether they can adapt the code for their own work and who to ask when stuck.',
        },
      },
      portfolio: {
        why: {
          title: 'Interviewers read this line first and know in three seconds what problem your project solves.',
          demo: 'Interviewers rarely have time to run your code; the live link and screenshot make the first impression.',
          features: 'Interviewers can tell right away what features work and which parts you built yourself.',
          tech: 'Interviewers see not just which tools you used, but how you weighed trade-offs when writing the code.',
          install: 'An interviewer who wants a closer look can paste the commands and run it on their own computer.',
          env: 'Anyone running it locally knows where each variable comes from, and sees you never commit real keys.',
          structure: 'Interviewers looking for your core logic know right away which folder to open.',
          license: 'Interested interviewers know how to reach you right away and see that you understand open-source licensing.',
        },
      },
      backendApi: {
        why: {
          title: 'Anyone integrating with the service reads this first and knows what data this API handles.',
          demo: 'A backend has no screens; opening the API docs tells developers right away what endpoints they can call.',
          features: 'Developers see which features are ready and which are still in progress without digging through route files.',
          tech: 'Anyone maintaining or deploying the service can check the framework and database major versions at a glance.',
          install: 'Developers can install dependencies, set up the database, send a test request, and verify the JSON response.',
          env: 'Anyone setting it up knows how to format the database URL and what default port it uses.',
          structure: 'Anyone changing a route or database table knows right away which folder to open.',
          license: 'People using the API know the license terms and who to reach when something goes wrong.',
        },
      },
    },
  },
}
