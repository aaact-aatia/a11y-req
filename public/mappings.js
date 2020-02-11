// Rules for selecting clauses based on answers to wizard questions
var positiveMappings = [
  // Select clauses when all questions are checked
  {
    questions: ['hardware'],
    clauses: ['5.5', '5.6', '5.7', '5.8', '5.9', '8.1', '8.4']
  },
  {
    questions: ['shared'],
    clauses: ['8.5']
  },
  {
    questions: ['speech-output'],
    clauses: ['8.2.1']
  },
  {
    questions: ['web'],
    clauses: ['9']
  },
  {
    questions: ['non-web-docs'],
    clauses: ['10']
  },
  {
    questions: ['documentation'],
    clauses: ['12.1.2']
  },
  {
    questions: ['support'],
    clauses: ['12.2']
  },
  {
    questions: ['voice-comm'],
    clauses: ['6']
  },
  {
    questions: ['comm'],
    clauses: ['13.2', '13.3']
  },
  {
    questions: ['video-sync'],
    clauses: ['7.1', '7.2']
  },
  {
    questions: ['video-player'],
    clauses: ['7.3']
  },
  {
    questions: ['relay'],
    clauses: ['13.1']
  },
  {
    questions: ['ui'],
    clauses: ['11.1', '11.2', '11.3', '11.4', '11.5', '11.6.2', '11.7']
  },
  {
    questions: ['platform'],
    clauses: ['11.5.2.1', '11.5.2.2']
  },
  {
    questions: ['a11y'],
    clauses: ['5.2']
  },
  {
    questions: ['a11y', 'documentation'],
    clauses: ['12.1.1']
  },
  {
    questions: ['at'],
    clauses: ['11.5.2.4']
  },
  {
    questions: ['authoring'],
    clauses: ['11.8']
  },
  {
    questions: ['a11y', 'platform'],
    clauses: ['11.6.1']
  },
  {
    questions: ['integrated'],
    clauses: ['8.3']
  },
  {
    questions: ['t-coil'],
    clauses: ['8.2.2.1']
  },
  {
    questions: ['mobile-phone'],
    clauses: ['8.2.2.2']
  },
  {
    questions: ['closed'],
    clauses: ['5.1']
  },
  {
    questions: ['bio'],
    clauses: ['5.3']
  },
  {
    questions: ['conversion'],
    clauses: ['5.4']
  }
];

var negativeMappings = [
  // Deselect clauses unless all questions are checked
  // Combination of positive and negative mappings allows coarse granularity for positive mappings
  // and finer granularity for negative mappings.
  // eg. Select all of clause 6 from positive mapping when "Two-way voice communication" is checked
  //     then deselect 6.5 and 6.6 unless "Two-way video communication" is checked
  {
    questions: ['video-comm'],
    clauses: ['6.5', '6.6']
  },
  {
    questions: ['keys'],
    clauses: ['8.4.3']
  },
  {
    questions: ['closed'],
    clauses: ['11.5.1', '11.1.1.1.2', '11.1.2.1.2', '11.1.2.3.2', '11.1.3.1.2', '11.1.3.2.2', '11.1.4.4.2', '11.1.4.5.2', '11.1.4.10.2', '11.2.1.1.2', '11.2.1.4.2', '11.3.1.1.2', '11.3.3.1.2', '11.4.1.1.2', '11.4.1.2.2']
  },
  {
    questions: ['platform'],
    clauses: ['11.5.2.1', '11.5.2.2']
  },
  {
    questions: ['at'],
    clauses: ['11.5.2.4']
  },
];