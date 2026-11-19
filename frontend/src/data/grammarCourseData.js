// Complete Step-by-Step English-Khmer Grammar Curriculum (5 Stages, 18 Lessons + Mixed Review)

export const GRAMMAR_STAGES = [
  {
    id: 1,
    code: 'STAGE 1',
    title: 'The basics',
    subtitleEn:
      'Be, there is, have got, present simple, present continuous and past simple — the core sentences you need first.',
    subtitleKm:
      'កិរិយាសព្ទ Be, There is/are, Have got, បច្ចុប្បន្នកាល និងអតីតកាល — ប្រយោគមូលដ្ឋានដែលអ្នកត្រូវប្រើមុនគេ។',
  },
  {
    id: 2,
    code: 'STAGE 2',
    title: 'Everyday words: pronouns, articles, prepositions',
    subtitleEn:
      'I/me/my, a/an/the, and in/on/at — small words that appear in almost every spoken sentence.',
    subtitleKm:
      'សព្វនាម (I/me/my), ធ្នាក់ (in/on/at) និង a/an/the — ពាក្យតូចៗតែសំខាន់បំផុតក្នុងការនិយាយប្រចាំថ្ងៃ។',
  },
  {
    id: 3,
    code: 'STAGE 3',
    title: 'Plans, requests & comparing',
    subtitleEn:
      'Talk about future plans (going to vs will), compare people and things, and ask politely with can/could/would.',
    subtitleKm:
      'និយាយពីផែនការអនាគត (going to និង will) ការប្រៀបធៀប និងការស្នើសុំដោយគួរសម។',
  },
  {
    id: 4,
    code: 'STAGE 4',
    title: 'Tenses & modal verbs',
    subtitleEn:
      'Present perfect for life experiences, past continuous for stories, and must/have to/should for rules and advice.',
    subtitleKm:
      'កាល Present Perfect, Past Continuous និងកិរិយាសព្ទជំនួយ must/have to/should សម្រាប់ដំបូន្មាន និងកាតព្វកិច្ច។',
  },
  {
    id: 5,
    code: 'STAGE 5',
    title: 'Passive, conditionals & linking ideas',
    subtitleEn:
      'Sound natural in work and real conversations with passive voice, if-clauses, and smooth connectors.',
    subtitleKm:
      'ប្រយោគកម្ម (Passive), ប្រយោគលក្ខខណ្ឌ (If-clauses) និងពាក្យភ្ជាប់ប្រយោគឱ្យស្តាប់ទៅដូចជនជាតិដើម។',
  },
];

export const GRAMMAR_LESSONS = [
  // ================= STAGE 1: THE BASICS =================
  {
    id: 'be-present-past',
    number: 1,
    stageId: 1,
    level: 'Beginner',
    title: 'Be: am / is / are, was / were',
    shortEn: 'am/is/are now, was/were in the past + a noun, adjective or place — saying who, what or where something is',
    shortKm: 'ប្រើ am/is/are សម្រាប់បច្ចុប្បន្ន និង was/were សម្រាប់អតីតកាល ដើម្បីប្រាប់ថានរណា អ្វី ឬនៅទីណា។',
    steps: [
      {
        number: 1,
        title: 'The forms of be in the present',
        explanationEn:
          'Be has three present forms: am, is and are. The subject decides which one you use. In real spoken English, native speakers almost always use the short forms.',
        explanationKm:
          'កិរិយាសព្ទ Be ក្នុងបច្ចុប្បន្នកាលមាន ៣ ទម្រង់គឺ am, is និង are។ ប្រធានជាអ្នកកំណត់ថាត្រូវប្រើមួយណា។ ក្នុងការនិយាយប្រចាំថ្ងៃ ជនជាតិដើមចូលចិត្តប្រើទម្រង់ខ្លី (Short form)។',
        table: {
          headers: ['SUBJECT', 'AFFIRMATIVE', 'SHORT FORM', 'NEGATIVE'],
          rows: [
            ['I', 'am', "I'm", "I'm not"],
            ['he / she / it', 'is', "he's / she's / it's", "isn't (= he's not)"],
            ['we / you / they', 'are', "we're / you're / they're", "aren't (= we're not)"],
          ],
        },
        noteEn:
          'A singular noun takes "is" (My phone is...), a plural noun takes "are" (These shoes are...). There is NO "amn\'t" — the negative of "I am" is always "I\'m not".',
        noteKm:
          'នាមឯកវចនៈប្រើ "is" (My phone is...) ហើយនាមពហុវចនៈប្រើ "are" (These shoes are...)។ មិនមានពាក្យ "amn\'t" ទេ — ទម្រង់បដិសេធរបស់ I am គឺ "I\'m not" ជានិច្ច។',
        examples: [
          { en: "I'm from Phnom Penh, and my sister is a nurse.", km: 'ខ្ញុំមកពីភ្នំពេញ ហើយបងស្រីខ្ញុំជាគិលានុបដ្ឋាយិកា។' },
          { en: "They aren't at home right now.", km: 'ពួកគេមិននៅផ្ទះទេនៅពេលនេះ។' },
        ],
      },
      {
        number: 2,
        title: 'What comes after be',
        explanationEn:
          'Be links the subject to information about it: what it is (noun), what it is like (adjective), where it is (place), or how old someone is.',
        explanationKm:
          'Be ភ្ជាប់ប្រធានទៅនឹងព័ត៌មានបន្ថែមដូចជា៖ ជាអ្វី (នាម), មានលក្ខណៈបែបណា (គុណនាម), នៅទីណា (ទីកន្លែង) ឬអាយុប៉ុន្មាន។',
        examples: [
          { en: 'She is an English teacher. (noun)', km: 'នាងជាគ្រូបង្រៀនភាសាអង់គ្លេស។ (នាម)' },
          { en: 'The coffee is really hot today. (adjective)', km: 'កាហ្វេថ្ងៃនេះក្តៅខ្លាំងណាស់។ (គុណនាម)' },
          { en: 'My keys are on the kitchen table. (place)', km: 'កូនសោរបស់ខ្ញុំនៅលើតុផ្ទះបាយ។ (ទីកន្លែង)' },
          { en: "I'm twenty-two years old. (age — use be, not have)", km: 'ខ្ញុំមានអាយុ ២២ ឆ្នាំ។ (អាយុត្រូវប្រើ be មិនប្រើ have ទេ)' },
        ],
      },
      {
        number: 3,
        title: 'Past forms: was / were & Questions',
        explanationEn:
          'In the past, am/is become "was", and are becomes "were". To make a question, simply move am/is/are/was/were BEFORE the subject.',
        explanationKm:
          'ក្នុងអតីតកាល am/is ប្តូរទៅជា "was" ហើយ are ប្តូរទៅជា "were"។ ដើម្បីបង្កើតសំណួរ គ្រាន់តែលើក am/is/are/was/were មកដាក់ខាងមុខប្រធាន។',
        table: {
          headers: ['SUBJECT', 'PAST (+)', 'PAST (-)', 'QUESTION (?)'],
          rows: [
            ['I / he / she / it', 'was', "wasn't", 'Was she tired?'],
            ['we / you / they', 'were', "weren't", 'Were you at work?'],
          ],
        },
        examples: [
          { en: 'Were you at the meeting yesterday?', km: 'តើអ្នកបាននៅក្នុងកិច្ចប្រជុំកាលពីម្សិលមិញទេ?' },
          { en: "No, I wasn't. I was sick.", km: 'ទេ ខ្ញុំមិនបាននៅទេ។ ខ្ញុំឈឺ។' },
        ],
      },
    ],
    exercises: [
      {
        question: 'My parents ___ at the market right now.',
        options: ['am', 'is', 'are', 'was'],
        correctIndex: 2,
        explanationEn: '"My parents" is plural (they), and "right now" is present -> use "are".',
        explanationKm: '"My parents" ជាពហុវចនៈ (they) ហើយ "right now" ជាបច្ចុប្បន្ន -> ត្រូវប្រើ "are"។',
      },
      {
        question: '___ your brother a student?',
        options: ['Are', 'Is', 'Am', 'Were'],
        correctIndex: 1,
        explanationEn: '"Your brother" is singular (he) -> move "Is" before the subject to ask a question.',
        explanationKm: '"Your brother" ជាឯកវចនៈ (he) -> លើក "Is" មកដាក់ខាងមុខប្រធានសម្រាប់សំណួរ។',
      },
      {
        question: 'Yesterday the weather ___ very cold.',
        options: ['is', 'are', 'was', 'were'],
        correctIndex: 2,
        explanationEn: '"Yesterday" is past and "the weather" is singular (it) -> use "was".',
        explanationKm: '"Yesterday" ជាអតីតកាល ហើយ "the weather" ជាឯកវចនៈ (it) -> ត្រូវប្រើ "was"។',
      },
      {
        question: 'Choose the correct negative sentence:',
        options: ["I amn't ready.", "I'm not ready.", "I isn't ready.", "I not ready."],
        correctIndex: 1,
        explanationEn: 'Never say "amn\'t" — the negative of "I am" is always "I\'m not".',
        explanationKm: 'ហាមប្រើ "amn\'t" — ទម្រង់បដិសេធរបស់ I am គឺ "I\'m not" ជានិច្ច។',
      },
      {
        question: 'Where ___ you last night?',
        options: ['was', 'are', 'is', 'were'],
        correctIndex: 3,
        explanationEn: '"You" always takes "were" in the past.',
        explanationKm: 'ប្រធាន "you" ក្នុងអតីតកាលត្រូវប្រើ "were" ជានិច្ច។',
      },
    ],
  },

  {
    id: 'there-is-are',
    number: 2,
    stageId: 1,
    level: 'Beginner',
    title: 'There is / there are',
    shortEn: 'there is/are + noun — saying that something exists or is somewhere',
    shortKm: 'ប្រើ there is / there are + នាម ដើម្បីប្រាប់ថាមានអ្វីមួយនៅទីណាមួយ។',
    steps: [
      {
        number: 1,
        title: 'Singular vs Plural with There is / There are',
        explanationEn:
          'Use "There is" (There\'s) before a singular countable noun or uncountable noun. Use "There are" before a plural noun.',
        explanationKm:
          'ប្រើ "There is" (There\'s) នៅមុខនាមឯកវចនៈ ឬនាមរាប់មិនបាន។ ប្រើ "There are" នៅមុខនាមពហុវចនៈ។',
        table: {
          headers: ['TYPE', 'POSITIVE', 'NEGATIVE', 'QUESTION'],
          rows: [
            ['Singular / Uncountable', "There is (There's) a café.", "There isn't any milk.", 'Is there a bank near here?'],
            ['Plural', 'There are two parks.', "There aren't any chairs.", 'Are there any buses?'],
          ],
        },
        examples: [
          { en: "There's a nice coffee shop next to my office.", km: 'មានហាងកាហ្វេស្អាតមួយនៅជាប់ការិយាល័យរបស់ខ្ញុំ។' },
          { en: 'There are three bedrooms in this apartment.', km: 'មានបន្ទប់គេងបីនៅក្នុងអាផាតមិននេះ។' },
        ],
      },
      {
        number: 2,
        title: 'Common mistake: "There is" vs "It has"',
        explanationEn:
          'In Khmer, people say "មាន..." so learners often translate it as "Have a shop here". In English, always start with "There is / There are" — NEVER start with bare "Have"!',
        explanationKm:
          'ជាភាសាខ្មែរយើងនិយាយថា «មានហាងមួយនៅទីនេះ» ធ្វើឱ្យសិស្សច្រើនច្រឡំប្រើ "Have a shop here"។ ជាភាសាអង់គ្លេស ត្រូវប្រើ "There is / There are" ជានិច្ច មិនប្រើ "Have" ផ្តើមប្រយោគទេ!',
        noteEn: '✗ Have many people in the room.  →  ✓ There are many people in the room.',
        noteKm: '✗ Have many people in the room.  →  ✓ There are many people in the room.',
        examples: [
          { en: 'Is there any water in the fridge?', km: 'តើមានទឹកនៅក្នុងទូទឹកកកទេ?' },
          { en: 'There was a big storm last night.', km: 'មានព្យុះធំមួយកាលពីយប់មិញ។' },
        ],
      },
    ],
    exercises: [
      {
        question: '___ a big supermarket across the street.',
        options: ['There are', 'There is', 'Have', 'It have'],
        correctIndex: 1,
        explanationEn: '"a big supermarket" is singular -> use "There is".',
        explanationKm: '"a big supermarket" ជានាមឯកវចនៈ -> ត្រូវប្រើ "There is"។',
      },
      {
        question: '___ any messages for me today?',
        options: ['Is there', 'There are', 'Are there', 'Have there'],
        correctIndex: 2,
        explanationEn: '"messages" is plural and this is a question -> "Are there".',
        explanationKm: '"messages" ជាពហុវចនៈ ហើយជាប្រយោគសំណួរ -> ប្រើ "Are there"។',
      },
      {
        question: '___ some cold water in the bottle.',
        options: ['There is', 'There are', 'Are there', 'Have'],
        correctIndex: 0,
        explanationEn: '"Water" is uncountable -> always takes singular "There is".',
        explanationKm: '"Water" ជានាមរាប់មិនបាន -> ត្រូវប្រើ "There is" ជានិច្ច។',
      },
      {
        question: 'Choose the natural English sentence:',
        options: ['Have two cats in the garden.', 'There are two cats in the garden.', 'There is two cats in the garden.', 'It has two cats in the garden.'],
        correctIndex: 1,
        explanationEn: 'Use "There are" + plural noun ("two cats").',
        explanationKm: 'ប្រើ "There are" បូកនឹងនាមពហុវចនៈ ("two cats")។',
      },
    ],
  },

  {
    id: 'have-got',
    number: 3,
    stageId: 1,
    level: 'Beginner',
    title: '"Have got" & "Have"',
    shortEn: 'have/has got + noun — having or owning something, family, or appearance',
    shortKm: 'ប្រើ have/has got ឬ have/has + នាម ដើម្បីប្រាប់ពីកម្មសិទ្ធិ គ្រួសារ ឬរូបរាង។',
    steps: [
      {
        number: 1,
        title: 'Using have got / has got',
        explanationEn:
          'We use "have got" (very common in British & everyday spoken English) or "have" (common in US English) to talk about possessions, family, and illnesses.',
        explanationKm:
          'យើងប្រើ "have got" (ពេញនិយមក្នុងការនិយាយប្រចាំថ្ងៃ) ឬ "have" ដើម្បីនិយាយពីរបស់ដែលយើងមាន គ្រួសារ ឬអាការៈឈឺ។',
        table: {
          headers: ['SUBJECT', 'POSITIVE', 'NEGATIVE', 'QUESTION'],
          rows: [
            ['I / we / you / they', "have got ('ve got)", "haven't got", 'Have you got a pen?'],
            ['he / she / it', "has got ('s got)", "hasn't got", 'Has she got a car?'],
          ],
        },
        examples: [
          { en: "I've got two brothers and one sister.", km: 'ខ្ញុំមានបងប្រុសពីរនាក់ និងប្អូនស្រីម្នាក់។' },
          { en: "She hasn't got enough time today.", km: 'នាងមិនមានពេលគ្រប់គ្រាន់ទេថ្ងៃនេះ។' },
        ],
      },
      {
        number: 2,
        title: 'Have got vs Have (important difference)',
        explanationEn:
          'With "have got", do NOT use do/does in questions ("Have you got...?"). With simple "have", you MUST use do/does ("Do you have...?").',
        explanationKm:
          'ជាមួយ "have got" មិនត្រូវប្រើ do/does ទេ ("Have you got...?")។ តែជាមួយ "have" ធម្មតា ត្រូវប្រើ do/does ("Do you have...?")។',
        examples: [
          { en: 'Have you got a charger? = Do you have a charger?', km: 'តើអ្នកមានឆ្នាំងសាកទេ?' },
          { en: "He's got a headache. = He has a headache.", km: 'គាត់ឈឺក្បាល។' },
        ],
      },
    ],
    exercises: [
      {
        question: 'My sister ___ got a new laptop.',
        options: ['have', 'has', 'is', 'do'],
        correctIndex: 1,
        explanationEn: '"My sister" = she -> use "has got".',
        explanationKm: '"My sister" ស្មើនឹង she -> ត្រូវប្រើ "has got"។',
      },
      {
        question: '___ you got any questions?',
        options: ['Do', 'Are', 'Have', 'Has'],
        correctIndex: 2,
        explanationEn: 'With "got", move "Have" to the front (never "Do you got").',
        explanationKm: 'ជាមួយ "got" ត្រូវលើក "Have" មកខាងមុខ (មិននិយាយ Do you got ទេ)។',
      },
      {
        question: 'They ___ got a car, so they ride motorbikes.',
        options: ["hasn't", "don't", "haven't", "aren't"],
        correctIndex: 2,
        explanationEn: '"They" + negative of "have got" = "haven\'t got".',
        explanationKm: 'ប្រធាន "They" បដិសេធរបស់ have got គឺ "haven\'t got"។',
      },
      {
        question: 'Which sentence is grammatically correct?',
        options: ['Does he got a dog?', 'Has he got a dog?', 'Is he got a dog?', 'Have he got a dog?'],
        correctIndex: 1,
        explanationEn: 'For he/she/it with "got", ask "Has he got...?" (or "Does he have...?").',
        explanationKm: 'សម្រាប់ he/she/it ជាមួយ "got" ត្រូវសួរថា "Has he got...?"។',
      },
    ],
  },

  {
    id: 'mixed-there-vs-have',
    number: 3.5,
    stageId: 1,
    isMixedReview: true,
    level: 'Beginner',
    title: 'There is or have (got)?',
    reviewPair: 'There is / there are  •  "Have got"',
    tipEn: 'Something exists somewhere → there is/are. Someone owns something → have (got).',
    tipKm: 'អ្វីមួយមាននៅកន្លែងណាមួយ → there is/are។ មនុស្សណាម្នាក់ជាម្ចាស់ → have (got)។',
    shortEn: 'Compare saying something exists somewhere vs someone owning something.',
    shortKm: 'ប្រៀបធៀបការប្រើ There is/are និង Have (got) កុំឱ្យច្រឡំគ្នា។',
    steps: [
      {
        number: 1,
        title: 'Quick rule to never mix them up',
        explanationEn:
          'Ask yourself: WHO owns it? If a person/company owns it, use Subject + have/has (got). If you are describing a place or what exists there, use There is / There are.',
        explanationKm:
          'សួរខ្លួនឯងថា៖ តើមានម្ចាស់ទេ? បើមនុស្សឬក្រុមហ៊ុនជាម្ចាស់ ប្រើ Subject + have/has (got)។ បើរៀបរាប់ពីកន្លែង ឬអ្វីដែលមាននៅទីនោះ ប្រើ There is / There are។',
        examples: [
          { en: 'There is a great gym near my house. (location/existence)', km: 'មានក្លឹបហាត់ប្រាណល្អមួយនៅជិតផ្ទះខ្ញុំ។ (ទីតាំង)' },
          { en: 'My house has got a small garden. (the house owns/contains it)', km: 'ផ្ទះរបស់ខ្ញុំមានសួនច្បារតូចមួយ។' },
        ],
      },
    ],
    exercises: [
      {
        question: '___ a lot of traffic on Monivong Boulevard at 5 PM.',
        options: ['It has', 'There is', 'There are', 'Have'],
        correctIndex: 1,
        explanationEn: 'Describing a place/situation with uncountable "traffic" -> "There is".',
        explanationKm: 'រៀបរាប់ស្ថានភាពនៅកន្លែងមួយជាមួយនាមរាប់មិនបាន "traffic" -> "There is"។',
      },
      {
        question: 'Dara ___ a really fast computer.',
        options: ['there is', 'has got', 'there are', 'have got'],
        correctIndex: 1,
        explanationEn: 'Dara (he) owns the computer -> "has got".',
        explanationKm: 'Dara (he) ជាម្ចាស់កុំព្យូទ័រ -> ត្រូវប្រើ "has got"។',
      },
      {
        question: '___ any seats left in the cinema?',
        options: ['Have', 'Are there', 'Do they have', 'Is there'],
        correctIndex: 1,
        explanationEn: 'Asking if plural "seats" exist in a place -> "Are there".',
        explanationKm: 'សួរថាតើមានកៅអីនៅសល់ក្នុងរោងកុនទេ -> "Are there"។',
      },
      {
        question: 'We ___ enough money for the tickets.',
        options: ['there are', "haven't got", "there aren't", "hasn't got"],
        correctIndex: 1,
        explanationEn: '"We" is the owner -> "haven\'t got".',
        explanationKm: '"We" ជាអ្នកកាន់/ម្ចាស់ -> ប្រើ "haven\'t got"។',
      },
    ],
  },

  {
    id: 'present-simple',
    number: 4,
    stageId: 1,
    level: 'Beginner',
    title: 'Present simple',
    shortEn: 'I work, she works, do you work?, he doesn\'t — habits, routines and things that are always true',
    shortKm: 'ប្រើសម្រាប់ទម្លាប់ប្រចាំថ្ងៃ កាលវិភាគ និងការពិតទូទៅ (ថែម -s/-es ជាមួយ he/she/it)។',
    steps: [
      {
        number: 1,
        title: 'Positive form: remember -s / -es for he, she, it',
        explanationEn:
          'Use the base verb for I / you / we / they. Add -s or -es for he / she / it (watch -> watches, study -> studies, go -> goes, have -> has).',
        explanationKm:
          'ប្រើកិរិយាសព្ទដើមសម្រាប់ I / you / we / they។ ត្រូវថែម -s ឬ -es សម្រាប់ he / she / it (watch -> watches, study -> studies, go -> goes, have -> has)។',
        table: {
          headers: ['SUBJECT', 'POSITIVE', 'NEGATIVE', 'QUESTION'],
          rows: [
            ['I / you / we / they', 'work / study', "don't work", 'Do you work?'],
            ['he / she / it', 'works / studies', "doesn't work", 'Does she work?'],
          ],
        },
        noteEn: 'After "does" or "doesn\'t", ALWAYS go back to the base verb! (✗ Does she works? → ✓ Does she work?)',
        noteKm: 'បន្ទាប់ពី "does" ឬ "doesn\'t" កិរិយាសព្ទត្រូវត្រឡប់ទៅដើមវិញជានិច្ច មិនថែម -s ទេ! (✓ Does she work?)',
        examples: [
          { en: 'I wake up at 6:30 every morning.', km: 'ខ្ញុំក្រោកពីដំណេកម៉ោង ៦:៣០ រៀងរាល់ព្រឹក។' },
          { en: "He doesn't drink coffee at night.", km: 'គាត់មិនផឹកកាហ្វេនៅពេលយប់ទេ។' },
        ],
      },
      {
        number: 2,
        title: 'Adverbs of frequency (always, usually, sometimes, never)',
        explanationEn:
          'Frequency adverbs go BEFORE main verbs ("I always study"), but AFTER the verb be ("She is always happy").',
        explanationKm:
          'ពាក្យបង្ហាញភាពញឹកញាប់ (always, usually, sometimes, never) ដាក់នៅមុខកិរិយាសព្ទធម្មតា ("I always study") តែដាក់នៅក្រោយ be ("She is always happy")។',
        examples: [
          { en: 'We usually practice English after dinner.', km: 'ពួកយើងជាធម្មតាហ្វឹកហាត់ភាសាអង់គ្លេសក្រោយអាហារពេលល្ងាច។' },
          { en: 'She is never late for class.', km: 'នាងមិនដែលមកថ្នាក់យឺតទេ។' },
        ],
      },
    ],
    exercises: [
      {
        question: 'My friend Sokha ___ English every day.',
        options: ['study', 'studies', 'studying', 'is study'],
        correctIndex: 1,
        explanationEn: 'Sokha = he/she, daily habit -> study changes -y to -ies -> "studies".',
        explanationKm: 'Sokha ជាប្រធានឯកវចនៈ ហើយជាទម្លាប់ប្រចាំថ្ងៃ -> study ប្តូរទៅជា "studies"។',
      },
      {
        question: '___ your brother like spicy food?',
        options: ['Do', 'Is', 'Does', 'Are'],
        correctIndex: 2,
        explanationEn: '"Your brother" = he, main verb "like" -> use "Does".',
        explanationKm: '"Your brother" ជាឯកវចនៈ មានកិរិយាសព្ទ "like" -> ប្រើ "Does"។',
      },
      {
        question: 'She ___ to work on Sundays.',
        options: ["don't go", "doesn't goes", "doesn't go", "isn't go"],
        correctIndex: 2,
        explanationEn: 'Use "doesn\'t" + base verb "go" (no -es after doesn\'t).',
        explanationKm: 'ប្រើ "doesn\'t" បូកនឹងកិរិយាសព្ទដើម "go" (មិនថែម -es ទេ)។',
      },
      {
        question: 'Where do you put "always" in this sentence?',
        options: ['He always is friendly.', 'He is always friendly.', 'Always he is friendly.', 'He is friendly always.'],
        correctIndex: 1,
        explanationEn: 'Frequency adverbs go AFTER "be" (is/am/are).',
        explanationKm: 'ពាក្យ always ត្រូវដាក់នៅក្រោយកិរិយាសព្ទ be ("is always")។',
      },
    ],
  },

  {
    id: 'present-continuous',
    number: 5,
    stageId: 1,
    level: 'Beginner',
    title: 'Present continuous',
    shortEn: 'am/is/are + verb-ing — actions happening right now or around this time',
    shortKm: 'ប្រើ am/is/are + V-ing សម្រាប់សកម្មភាពដែលកំពុងកើតឡើងនៅពេលនេះ។',
    steps: [
      {
        number: 1,
        title: 'How to form Present Continuous',
        explanationEn:
          'Combine am / is / are + verb-ing. Common time markers: right now, at the moment, today, Look!, Listen!',
        explanationKm:
          'ផ្សំ am / is / are + កិរិយាសព្ទថែម -ing។ ពាក្យសម្គាល់៖ right now, at the moment, today, Look!, Listen!',
        table: {
          headers: ['SUBJECT', 'POSITIVE', 'NEGATIVE', 'QUESTION'],
          rows: [
            ['I', "I'm watching", "I'm not watching", 'Am I speaking clearly?'],
            ['he / she / it', "She's cooking", "She isn't cooking", 'Is it raining?'],
            ['we / you / they', "They're studying", "They aren't studying", 'Are you working now?'],
          ],
        },
        examples: [
          { en: "Listen! Someone is knocking on the door.", km: 'ស្តាប់មើល! មាននរណាម្នាក់កំពុងគោះទ្វារ។' },
          { en: "I'm learning English shadowing this month.", km: 'ខ្ញុំកំពុងរៀននិយាយអង់គ្លេស Shadowing នៅខែនេះ។' },
        ],
      },
      {
        number: 2,
        title: 'Present simple vs Present continuous',
        explanationEn:
          'Use Present Simple for routines ("I drink tea every morning"). Use Present Continuous for right now ("I\'m drinking coffee right now"). Do NOT use -ing with state verbs like know, want, love, like, need.',
        explanationKm:
          'Present Simple សម្រាប់ទម្លាប់ជាប្រចាំ ឯ Present Continuous សម្រាប់ពេលកំពុងធ្វើឥឡូវនេះ។ មិនត្រូវថែម -ing លើកិរិយាសព្ទអារម្មណ៍ដូចជា know, want, love, like, need ទេ។',
        noteEn: '✗ I am knowing the answer.  →  ✓ I know the answer.',
        noteKm: '✗ I am knowing the answer.  →  ✓ I know the answer.',
      },
    ],
    exercises: [
      {
        question: 'Please be quiet — the baby ___ right now.',
        options: ['sleeps', 'is sleeping', 'sleeping', 'are sleeping'],
        correctIndex: 1,
        explanationEn: '"right now" + singular "the baby" -> "is sleeping".',
        explanationKm: '"right now" ជាពេលកំពុងកើតឡើង ហើយ "the baby" ជាឯកវចនៈ -> "is sleeping"។',
      },
      {
        question: 'What ___ you doing at the moment?',
        options: ['do', 'is', 'are', 'am'],
        correctIndex: 2,
        explanationEn: 'Present continuous question with "you" -> "Are you doing".',
        explanationKm: 'សំណួរ Present continuous ជាមួយ "you" ត្រូវប្រើ "are"។',
      },
      {
        question: 'Choose the correct sentence:',
        options: ['I am wanting a new phone.', 'I want a new phone.', 'I wanting a new phone.', 'I am want a new phone.'],
        correctIndex: 1,
        explanationEn: '"want" is a state verb, so we use Present Simple ("I want"), not "am wanting".',
        explanationKm: '"want" ជាកិរិយាសព្ទបង្ហាញបំណង ដូច្នេះប្រើ "I want" មិនប្រើ "am wanting" ទេ។',
      },
      {
        question: 'She usually drives to work, but today she ___ the bus.',
        options: ['takes', 'is taking', 'take', 'taking'],
        correctIndex: 1,
        explanationEn: '"today" is a temporary action around now -> "is taking".',
        explanationKm: '"today" ជាសកម្មភាពបណ្តោះអាសន្នថ្ងៃនេះ -> ប្រើ "is taking"។',
      },
    ],
  },

  {
    id: 'past-simple',
    number: 6,
    stageId: 1,
    level: 'Beginner',
    title: 'Past simple',
    shortEn: 'worked, went, did you go?, didn\'t go — finished actions in the past',
    shortKm: 'ប្រើសម្រាប់សកម្មភាពដែលបានកើតឡើង និងបញ្ចប់ហើយក្នុងអតីតកាល (V2 ឬ did/didn\'t + V1)។',
    steps: [
      {
        number: 1,
        title: 'Regular (-ed) vs Irregular Verbs (V2)',
        explanationEn:
          'For regular verbs, add -ed (work -> worked, play -> played, stop -> stopped). Irregular verbs have special V2 forms you memorize (go -> went, buy -> bought, eat -> ate, see -> saw).',
        explanationKm:
          'កិរិយាសព្ទទៀងទាត់ថែម -ed (work -> worked, play -> played)។ កិរិយាសព្ទមិនទៀងទាត់ត្រូវចាំទម្រង់ V2 (go -> went, buy -> bought, eat -> ate, see -> saw)។',
        table: {
          headers: ['FORM', 'EXAMPLE (REGULAR)', 'EXAMPLE (IRREGULAR)'],
          rows: [
            ['Positive (+)', 'I watched a movie.', 'She went to Siem Reap.'],
            ['Negative (-)', "I didn't watch TV.", "She didn't go to Kampot."],
            ['Question (?)', 'Did you watch it?', 'Did she go alone?'],
          ],
        },
        noteEn: 'After "did" or "didn\'t", ALWAYS use the base verb V1! (✗ I didn\'t went → ✓ I didn\'t go)',
        noteKm: 'ក្រោយ "did" ឬ "didn\'t" កិរិយាសព្ទត្រូវត្រឡប់ទៅ V1 ដើមវិញជានិច្ច! (✗ didn\'t went → ✓ didn\'t go)',
        examples: [
          { en: 'We visited Angkor Wat two years ago.', km: 'ពួកយើងបានទៅលេងអង្គរវត្តកាលពីពីរឆ្នាំមុន។' },
          { en: "Did you enjoy the story yesterday?", km: 'តើអ្នកចូលចិត្តរឿងនិទានកាលពីម្សិលមិញទេ?' },
        ],
      },
    ],
    exercises: [
      {
        question: 'I ___ these headphones here last week.',
        options: ['buy', 'buyed', 'bought', 'buying'],
        correctIndex: 2,
        explanationEn: '"buy" is irregular -> past simple V2 is "bought".',
        explanationKm: '"buy" ជាកិរិយាសព្ទមិនទៀងទាត់ -> អតីតកាល V2 គឺ "bought"។',
      },
      {
        question: 'She ___ to the party last night.',
        options: ["didn't went", "didn't go", "wasn't go", "don't go"],
        correctIndex: 1,
        explanationEn: 'Use "didn\'t" + base verb V1 ("go").',
        explanationKm: 'ប្រើ "didn\'t" + កិរិយាសព្ទដើម V1 ("go")។',
      },
      {
        question: '___ you see my email this morning?',
        options: ['Do', 'Were', 'Did', 'Are'],
        correctIndex: 2,
        explanationEn: 'Past simple question with main verb "see" -> use "Did".',
        explanationKm: 'សំណួរអតីតកាលជាមួយកិរិយាសព្ទធម្មតា "see" -> ប្រើ "Did"។',
      },
      {
        question: 'The left side of my headphones ___ working yesterday.',
        options: ['stop', 'stopped', 'stopping', 'stops'],
        correctIndex: 1,
        explanationEn: 'Regular verb "stop" doubles the p before -ed -> "stopped".',
        explanationKm: 'កិរិយាសព្ទ "stop" បន្ថែម p មួយទៀតមុនថែម -ed -> "stopped"។',
      },
    ],
  },

  // ================= STAGE 2: EVERYDAY WORDS =================
  {
    id: 'pronouns-possessives',
    number: 7,
    stageId: 2,
    level: 'Beginner',
    title: 'Pronouns & possessives: I / me / my / mine',
    shortEn: 'Subject pronouns, object pronouns, possessive adjectives and possessive pronouns',
    shortKm: 'ការប្រើប្រាស់សព្វនាមប្រធាន កម្មបទ និងកម្មសិទ្ធិ (I / me / my / mine) ឱ្យត្រឹមត្រូវ។',
    steps: [
      {
        number: 1,
        title: 'The 4 forms at a glance',
        explanationEn:
          'Subject pronouns go BEFORE the verb ("She called"). Object pronouns go AFTER a verb or preposition ("Call her / with her"). Possessive adjectives go BEFORE a noun ("my bag"). Possessive pronouns stand ALONE ("It\'s mine").',
        explanationKm:
          'ប្រធាន (I/she) ដាក់មុខកិរិយាសព្ទ។ កម្មបទ (me/her) ដាក់ក្រោយកិរិយាសព្ទ ឬធ្នាក់។ គុណនាមកម្មសិទ្ធិ (my/her) ដាក់មុខនាម។ សព្វនាមកម្មសិទ្ធិ (mine/hers) ឈរតែម្នាក់ឯង។',
        table: {
          headers: ['SUBJECT', 'OBJECT', 'BEFORE NOUN', 'STANDALONE'],
          rows: [
            ['I', 'me', 'my (book)', 'mine'],
            ['you', 'you', 'your (book)', 'yours'],
            ['he / she', 'him / her', 'his / her (book)', 'his / hers'],
            ['we / they', 'us / them', 'our / their (book)', 'ours / theirs'],
          ],
        },
        examples: [
          { en: 'Can you help me with my homework?', km: 'តើអ្នកអាចជួយខ្ញុំធ្វើកិច្ចការផ្ទះរបស់ខ្ញុំបានទេ?' },
          { en: "That blue umbrella isn't yours — it's mine.", km: 'ឆ័ត្រពណ៌ខៀវនោះមិនមែនជារបស់អ្នកទេ — វាជារបស់ខ្ញុំ។' },
        ],
      },
    ],
    exercises: [
      {
        question: 'Please give this receipt to ___.',
        options: ['he', 'him', 'his', 'himself'],
        correctIndex: 1,
        explanationEn: 'After the preposition "to", use the object pronoun "him".',
        explanationKm: 'បន្ទាប់ពីធ្នាក់ "to" ត្រូវប្រើកម្មបទ "him"។',
      },
      {
        question: 'Is this bag ___?',
        options: ['your', 'you', 'yours', 'my'],
        correctIndex: 2,
        explanationEn: 'No noun follows at the end -> use standalone possessive pronoun "yours".',
        explanationKm: 'គ្មាននាមនៅខាងក្រោយទេ -> ប្រើ "yours"។',
      },
      {
        question: '___ live in Battambang, and I visit ___ every Khmer New Year.',
        options: ['Them / they', 'They / them', 'Their / them', 'They / their'],
        correctIndex: 1,
        explanationEn: 'Subject before verb = "They"; object after "visit" = "them".',
        explanationKm: 'ប្រធានមុខកិរិយាសព្ទប្រើ "They" ហើយកម្មបទក្រោយ "visit" ប្រើ "them"។',
      },
    ],
  },

  {
    id: 'articles-a-an-the',
    number: 8,
    stageId: 2,
    level: 'Beginner',
    title: 'Articles: a / an / the / no article',
    shortEn: 'When to use a, an, the, or nothing before a noun',
    shortKm: 'វិធីប្រើ a, an, the ឬមិនបាច់ដាក់អ្វីសោះនៅមុខនាម។',
    steps: [
      {
        number: 1,
        title: 'a vs an (based on SOUND, not spelling)',
        explanationEn:
          'Use "a" before a consonant sound (a university, a book). Use "an" before a vowel sound a/e/i/o/u (an apple, an hour — "h" is silent!).',
        explanationKm:
          'ប្រើ "a" នៅមុខសំឡេងព្យញ្ជនៈ (a book, a university)។ ប្រើ "an" នៅមុខសំឡេងស្រៈ (an apple, an hour ព្រោះអក្សរ h មិនបញ្ចេញសំឡេង)។',
        examples: [
          { en: "Wait for an hour, then take a taxi.", km: 'ចាំមួយម៉ោងសិន រួចជិះតាក់ស៊ីទៅ។' },
        ],
      },
      {
        number: 2,
        title: 'a/an (first time) vs the (specific / already known)',
        explanationEn:
          'Use "a/an" when mentioning one thing for the first time. Use "the" when both speaker and listener know WHICH one, or when there is only one (the sun, the internet). Use NO article for general plural/uncountable ideas ("I love music").',
        explanationKm:
          'ប្រើ "a/an" ពេលនិយាយដល់លើកដំបូង។ ប្រើ "the" ពេលអ្នកនិយាយ និងអ្នកស្តាប់ដឹងច្បាស់ថាមួយណា ឬមានតែមួយគត់ (the sun)។ មិនប្រើ a/an/the ពេលនិយាយទូទៅ ("I love music")។',
        examples: [
          { en: 'I bought a shirt yesterday. The shirt was too small.', km: 'ខ្ញុំបានទិញអាវមួយម្សិលមិញ។ អាវនោះតូចពេក។' },
          { en: 'Coffee is very popular in Cambodia. (no article for general coffee)', km: 'កាហ្វេពេញនិយមណាស់នៅកម្ពុជា។' },
        ],
      },
    ],
    exercises: [
      {
        question: 'He waited for ___ hour outside the station.',
        options: ['a', 'an', 'the', 'no article'],
        correctIndex: 1,
        explanationEn: '"hour" starts with a vowel sound (/aʊər/) -> use "an".',
        explanationKm: '"hour" បញ្ចេញសំឡេងស្រៈ -> ប្រើ "an"។',
      },
      {
        question: 'Could you close ___ door, please?',
        options: ['a', 'an', 'the', 'no article'],
        correctIndex: 2,
        explanationEn: 'Both people know which specific door -> "the door".',
        explanationKm: 'ទាំងពីរនាក់ដឹងច្បាស់ថាទ្វារមួយណា -> ប្រើ "the door"។',
      },
      {
        question: 'I love listening to ___ music while studying.',
        options: ['a', 'an', 'the', 'no article'],
        correctIndex: 3,
        explanationEn: 'General uncountable noun "music" takes no article.',
        explanationKm: 'និយាយពីតន្ត្រីទូទៅមិនបាច់ប្រើ a/an/the ទេ។',
      },
    ],
  },

  {
    id: 'prepositions-in-on-at',
    number: 9,
    stageId: 2,
    level: 'Elementary',
    title: 'Prepositions: in / on / at (time & place)',
    shortEn: 'Big -> Medium -> Exact: a visual triangle to master in, on, and at forever',
    shortKm: 'រូបមន្តងាយចាំសម្រាប់ប្រើ in, on, at ទាំងពេលវេលា និងទីកន្លែង (ធំ -> មធ្យម -> ជាក់លាក់)។',
    steps: [
      {
        number: 1,
        title: 'The In / On / At Triangle',
        explanationEn:
          'Think from BIGGEST to MOST EXACT: IN (months, years, countries, inside spaces) → ON (days, dates, surfaces) → AT (exact clock times, specific points/addresses).',
        explanationKm:
          'គិតពីធំបំផុតទៅជាក់លាក់បំផុត៖ IN (ខែ ឆ្នាំ ប្រទេស ក្នុងបន្ទប់) → ON (ថ្ងៃ កាលបរិច្ឆេទ លើផ្ទៃ) → AT (ម៉ោងជាក់លាក់ ចំណុចជាក់លាក់)។',
        table: {
          headers: ['PREPOSITION', 'TIME', 'PLACE'],
          rows: [
            ['IN (Big / Inside)', 'in May, in 2026, in the morning', 'in Cambodia, in a room, in a car'],
            ['ON (Day / Surface)', 'on Monday, on July 4th, on my birthday', 'on the table, on the bus, on the 2nd floor'],
            ['AT (Exact Point)', 'at 7:30, at noon, at night, at the weekend', 'at home, at school, at the train station'],
          ],
        },
        examples: [
          { en: 'The class starts at 8 AM on Monday in Phnom Penh.', km: 'ថ្នាក់រៀនចាប់ផ្តើមម៉ោង ៨ ព្រឹក ថ្ងៃចន្ទ នៅភ្នំពេញ។' },
          { en: 'Your phone is on the desk in the bedroom.', km: 'ទូរស័ព្ទអ្នកនៅលើតុក្នុងបន្ទប់គេង។' },
        ],
      },
    ],
    exercises: [
      {
        question: 'My birthday is ___ October.',
        options: ['at', 'on', 'in', 'to'],
        correctIndex: 2,
        explanationEn: 'Months always take "in" (in October).',
        explanationKm: 'ខែត្រូវប្រើ "in" ជានិច្ច (in October)។',
      },
      {
        question: 'Let\'s meet ___ the train station ___ 6:30 PM.',
        options: ['in / on', 'at / at', 'on / at', 'at / in'],
        correctIndex: 1,
        explanationEn: 'Exact meeting point ("at the train station") + exact time ("at 6:30 PM").',
        explanationKm: 'ទីតាំងជាក់លាក់ និងម៉ោងជាក់លាក់ត្រូវប្រើ "at / at"។',
      },
      {
        question: 'We have an English test ___ Friday morning.',
        options: ['in', 'at', 'on', 'by'],
        correctIndex: 2,
        explanationEn: 'Whenever a specific day (Friday) is mentioned, use "on".',
        explanationKm: 'ពេលមានឈ្មោះថ្ងៃជាក់លាក់ (Friday) ត្រូវប្រើ "on"។',
      },
    ],
  },

  // ================= STAGE 3: PLANS, REQUESTS & COMPARING =================
  {
    id: 'future-going-to-will',
    number: 10,
    stageId: 3,
    level: 'Elementary',
    title: 'Future: be going to vs will',
    shortEn: 'Planned decisions (going to) vs instant decisions, promises & offers (will)',
    shortKm: 'ភាពខុសគ្នារវាង be going to (ផែនការទុកជាមុន) និង will (សម្រេចចិត្តភ្លាមៗ ឬសន្យា)។',
    steps: [
      {
        number: 1,
        title: 'When to use "be going to" vs "will"',
        explanationEn:
          'Use "am/is/are going to + V1" when you ALREADY decided before speaking, or when you see clear evidence now. Use "will (\'ll) + V1" for decisions made RIGHT NOW, promises, or offers to help.',
        explanationKm:
          'ប្រើ "be going to + V1" ពេលអ្នកមានផែនការទុកជាមុន ឬឃើញសញ្ញាច្បាស់លាស់។ ប្រើ "will + V1" ពេលសម្រេចចិត្តភ្លាមៗ ពេលជួយអ្នកដទៃ ឬពេលសន្យា។',
        table: {
          headers: ['USE', 'STRUCTURE', 'EXAMPLE'],
          rows: [
            ['Plan made earlier', 'be going to + V1', "I'm going to visit Siem Reap next month."],
            ['Clear visual evidence', 'be going to + V1', "Look at those dark clouds! It's going to rain."],
            ['Decision made right now', 'will + V1', "Oh, you're busy? I'll call you back later."],
            ['Promise / Offer', 'will + V1', "Don't worry, I'll help you carry that bag."],
          ],
        },
        examples: [
          { en: "I'm going to practice English for 30 minutes tonight.", km: 'ខ្ញុំគ្រោងនឹងហ្វឹកហាត់ភាសាអង់គ្លេស ៣០ នាទីយប់នេះ។' },
          { en: "I promise I won't forget your receipt.", km: 'ខ្ញុំសន្យាថាខ្ញុំនឹងមិនភ្លេចវិក្កយបត្ររបស់អ្នកទេ។' },
        ],
      },
    ],
    exercises: [
      {
        question: 'Look at that black sky! It ___ rain soon.',
        options: ['will', 'is going to', 'going to', 'rains'],
        correctIndex: 1,
        explanationEn: 'Clear visual evidence right now ("black sky") -> "is going to".',
        explanationKm: 'ឃើញភស្តុតាងច្បាស់នៅនឹងភ្នែក (មេឃខ្មៅ) -> ប្រើ "is going to"។',
      },
      {
        question: '"Your bag looks heavy!" — "Wait, I ___ carry it for you."',
        options: ['am going to', 'will', 'going to', 'carried'],
        correctIndex: 1,
        explanationEn: 'Instant offer to help made at the moment of speaking -> "will".',
        explanationKm: 'ការផ្តល់ជំនួយភ្លាមៗនៅពេលនិយាយ -> ប្រើ "will"។',
      },
      {
        question: 'I already bought the tickets. We ___ fly to Bangkok tomorrow.',
        options: ['will', 'are going to', 'is going to', 'flew'],
        correctIndex: 1,
        explanationEn: 'Already planned and booked before speaking -> "are going to".',
        explanationKm: 'បានរៀបចំផែនការ និងទិញសំបុត្ររួចហើយ -> ប្រើ "are going to"។',
      },
    ],
  },

  {
    id: 'comparatives-superlatives',
    number: 11,
    stageId: 3,
    level: 'Elementary',
    title: 'Comparatives & superlatives',
    shortEn: 'faster / the fastest, more expensive / the most expensive, better / the best',
    shortKm: 'ការប្រៀបធៀបពីរ (-er / more ... than) និងប្រៀបធៀបខ្ពស់បំផុត (the -est / the most)។',
    steps: [
      {
        number: 1,
        title: 'Short vs Long Adjectives + Irregulars',
        explanationEn:
          'Short adjectives (1 syllable) add -er / the -est. Long adjectives (2+ syllables) use more / the most. Memorize the 3 big irregulars: good, bad, far.',
        explanationKm:
          'គុណនាមខ្លី (១ ព្យាង្គ) ថែម -er / the -est។ គុណនាមវែងប្រើ more / the most។ ចាំពាក្យមិនទៀងទាត់ ៣ សំខាន់៖ good, bad, far។',
        table: {
          headers: ['ADJECTIVE', 'COMPARATIVE (+ than)', 'SUPERLATIVE (the ...)'],
          rows: [
            ['fast / big', 'faster / bigger', 'the fastest / the biggest'],
            ['easy / happy (-y)', 'easier / happier', 'the easiest / the happiest'],
            ['expensive / interesting', 'more expensive', 'the most expensive'],
            ['good / bad / far', 'better / worse / farther', 'the best / the worst / the farthest'],
          ],
        },
        noteEn: 'Never combine "more" and "-er" together! (✗ more faster → ✓ faster)',
        noteKm: 'ហាមប្រើ "more" និង "-er" ជាមួយគ្នា! (✗ more faster → ✓ faster)',
        examples: [
          { en: 'Shadowing is more effective than just reading silently.', km: 'ការនិយាយតាម Shadowing មានប្រសិទ្ធភាពជាងការអានស្ងាត់ៗតែម្នាក់ឯង។' },
          { en: 'This is the best coffee shop in town.', km: 'នេះជាហាងកាហ្វេល្អបំផុតនៅក្នុងទីក្រុង។' },
        ],
      },
    ],
    exercises: [
      {
        question: 'My new phone is ___ than my old one.',
        options: ['more fast', 'faster', 'fastest', 'the faster'],
        correctIndex: 1,
        explanationEn: '"fast" is a short 1-syllable adjective -> "faster than".',
        explanationKm: '"fast" ជាគុណនាមខ្លី -> ប្រើ "faster than"។',
      },
      {
        question: 'She is ___ student in our class.',
        options: ['the most smart', 'smarter', 'the smartest', 'most smartest'],
        correctIndex: 2,
        explanationEn: 'Comparing 1 against the whole group -> superlative "the smartest".',
        explanationKm: 'ប្រៀបធៀបជាមួយថ្នាក់ទាំងមូល -> ប្រើ "the smartest"។',
      },
      {
        question: 'Today\'s traffic is much ___ than yesterday.',
        options: ['badder', 'more bad', 'worse', 'worst'],
        correctIndex: 2,
        explanationEn: 'Irregular comparative of "bad" is "worse".',
        explanationKm: 'ទម្រង់ប្រៀបធៀបមិនទៀងទាត់របស់ "bad" គឺ "worse"។',
      },
    ],
  },

  {
    id: 'polite-requests-can-could-would',
    number: 12,
    stageId: 3,
    level: 'Elementary',
    title: 'Polite requests: can / could / would',
    shortEn: 'Can I..., Could you..., Would you mind... — asking politely in shops, travel & work',
    shortKm: 'ការស្នើសុំដោយគួរសមនៅហាង កន្លែងធ្វើការ ឬពេលធ្វើដំណើរ (Can / Could / Would)។',
    steps: [
      {
        number: 1,
        title: 'From Casual to Very Polite',
        explanationEn:
          '"Can" is friendly and casual. "Could" and "Would you..." are more polite for strangers, staff, or bosses. After "Would you mind...", always use Verb-ing!',
        explanationKm:
          '"Can" សម្រាប់មិត្តភក្តិ ឬស្និទ្ធស្នាល។ "Could" និង "Would" គួរសមជាងសម្រាប់អ្នកមិនស្គាល់ ឬមេការ។ ក្រោយ "Would you mind..." ត្រូវប្រើ Verb-ing ជានិច្ច!',
        table: {
          headers: ['POLITENESS', 'PATTERN', 'REAL EXAMPLE'],
          rows: [
            ['Casual', 'Can you + V1...?', 'Can you pass me the menu?'],
            ['Polite (Shops/Work)', 'Could you / Could I + V1...?', 'Could I exchange this T-shirt, please?'],
            ['Very Polite', 'Would you mind + V-ing...?', 'Would you mind repeating that slowly?'],
          ],
        },
        examples: [
          { en: 'Could you check the receipt for me, please?', km: 'តើអ្នកអាចជួយពិនិត្យវិក្កយបត្រឱ្យខ្ញុំបន្តិចបានទេ?' },
          { en: 'Would you mind speaking a little slower?', km: 'តើអ្នកអាចនិយាយយឺតៗបន្តិចបានទេ?' },
        ],
      },
    ],
    exercises: [
      {
        question: 'Would you mind ___ the window? It\'s cold in here.',
        options: ['close', 'to close', 'closing', 'closed'],
        correctIndex: 2,
        explanationEn: '"Would you mind" is always followed by Verb-ing -> "closing".',
        explanationKm: 'ក្រោយ "Would you mind" ត្រូវប្រើ Verb-ing ជានិច្ច -> "closing"។',
      },
      {
        question: '___ I try on a larger size, please?',
        options: ['Could', 'Would', 'Do', 'Am'],
        correctIndex: 0,
        explanationEn: 'Use "Could I + V1...?" to politely ask permission in a store.',
        explanationKm: 'ប្រើ "Could I + V1...?" ដើម្បីសុំអនុញ្ញាតដោយគួរសមនៅហាង។',
      },
      {
        question: 'Could you ___ me where the train station is?',
        options: ['telling', 'to tell', 'tell', 'told'],
        correctIndex: 2,
        explanationEn: 'Modal verbs (can, could, would) are always followed by base verb V1 ("tell").',
        explanationKm: 'ក្រោយ modal verbs (can, could, would) ត្រូវប្រើកិរិយាសព្ទដើម V1 ("tell")។',
      },
    ],
  },

  // ================= STAGE 4: TENSES & MODAL VERBS =================
  {
    id: 'present-perfect',
    number: 13,
    stageId: 4,
    level: 'Intermediate',
    title: 'Present perfect: have / has + V3',
    shortEn: 'I have been, she has finished — life experiences, recent news, and unfinished time',
    shortKm: 'ប្រើ have / has + V3 សម្រាប់បទពិសោធន៍ជីវិត លទ្ធផលជាប់ដល់បច្ចុប្បន្ន និងសកម្មភាពមិនទាន់ចប់។',
    steps: [
      {
        number: 1,
        title: 'Form & Key Signal Words',
        explanationEn:
          'Use have/has + Past Participle (V3: worked, eaten, been, seen). Use Present Perfect when the exact past time is NOT mentioned (ever, never, already, yet, just, for, since).',
        explanationKm:
          'ប្រើ have/has + V3។ ប្រើ Present Perfect ពេលមិនបញ្ជាក់ពេលវេលាអតីតកាលជាក់លាក់ (ever, never, already, yet, just, for, since)។',
        table: {
          headers: ['SIGNAL WORD', 'MEANING / POSITION', 'EXAMPLE'],
          rows: [
            ['for / since', 'for + duration / since + start point', "I've lived here for 3 years / since 2023."],
            ['already / just', 'before V3 in positive sentences', "She has already finished her lesson."],
            ['yet', 'end of negative & questions', "Have you eaten lunch yet?"],
            ['ever / never', 'life experiences (in your whole life)', "Have you ever been to Japan?"],
          ],
        },
        noteEn: 'If you say "yesterday" or "in 2022", switch to Past Simple! (✗ I have seen him yesterday → ✓ I saw him yesterday)',
        noteKm: 'បើមានពេលវេលាអតីតកាលច្បាស់ដូចជា "yesterday" ឬ "in 2022" ត្រូវប្រើ Past Simple វិញ!',
      },
    ],
    exercises: [
      {
        question: 'I have studied English ___ three years.',
        options: ['since', 'for', 'ago', 'from'],
        correctIndex: 1,
        explanationEn: '"three years" is a length of time (duration) -> use "for".',
        explanationKm: '"three years" ជារយៈពេល -> ប្រើ "for" (since ប្រើជាមួយចំណុចចាប់ផ្តើម)។',
      },
      {
        question: 'Have you ___ visited Angkor Wat?',
        options: ['yet', 'ever', 'since', 'for'],
        correctIndex: 1,
        explanationEn: 'Use "ever" in questions about life experiences.',
        explanationKm: 'ប្រើ "ever" ក្នុងសំណួរអំពីបទពិសោធន៍ជីវិត។',
      },
      {
        question: 'She ___ her keys — she can\'t open the door now!',
        options: ['lose', 'has lost', 'have lost', 'losing'],
        correctIndex: 1,
        explanationEn: 'Past action with a result right now + singular "she" -> "has lost".',
        explanationKm: 'សកម្មភាពអតីតដែលមានលទ្ធផលដល់ឥឡូវ ហើយប្រធាន "she" -> "has lost"។',
      },
    ],
  },

  {
    id: 'past-continuous-vs-simple',
    number: 14,
    stageId: 4,
    level: 'Intermediate',
    title: 'Past continuous vs past simple',
    shortEn: 'was/were + V-ing (background action) interrupted by Past Simple (sudden event)',
    shortKm: 'ប្រើ was/were + V-ing សម្រាប់សកម្មភាពកំពុងកើតក្នុងអតីតកាល ដែលត្រូវកាត់ផ្តាច់ដោយ Past Simple។',
    steps: [
      {
        number: 1,
        title: 'Telling stories smoothly with when & while',
        explanationEn:
          'Use Past Continuous (was/were + V-ing) for the longer background action in progress, and Past Simple (V2) for the shorter action that interrupted it.',
        explanationKm:
          'ប្រើ Past Continuous (was/were + V-ing) សម្រាប់សកម្មភាពវែងដែលកំពុងធ្វើ ហើយប្រើ Past Simple (V2) សម្រាប់ព្រឹត្តិការណ៍ខ្លីដែលមកកាត់ផ្តាច់។',
        examples: [
          { en: 'I was walking home when it started to rain.', km: 'ខ្ញុំកំពុងដើរទៅផ្ទះ ពេលភ្លៀងចាប់ផ្តើមធ្លាក់។' },
          { en: 'While she was cooking dinner, her phone rang.', km: 'ខណៈនាងកំពុងចម្អិនអាហារពេលល្ងាច ទូរស័ព្ទនាងក៏រោទិ៍។' },
        ],
      },
    ],
    exercises: [
      {
        question: 'I ___ a podcast when you called me.',
        options: ['listened to', 'was listening to', 'were listening to', 'am listening to'],
        correctIndex: 1,
        explanationEn: 'Long background action in the past with "I" -> "was listening to".',
        explanationKm: 'សកម្មភាពកំពុងធ្វើក្នុងអតីតកាលជាមួយ "I" -> "was listening to"។',
      },
      {
        question: 'While we were driving to Kampot, we ___ a rainbow.',
        options: ['were seeing', 'see', 'saw', 'seen'],
        correctIndex: 2,
        explanationEn: 'Short sudden event interrupting the drive -> Past Simple "saw".',
        explanationKm: 'ព្រឹត្តិការណ៍ខ្លីដែលកើតឡើងភ្លាមៗ -> Past Simple "saw"។',
      },
      {
        question: 'What ___ you doing at 9 PM last night?',
        options: ['was', 'did', 'were', 'are'],
        correctIndex: 2,
        explanationEn: 'Action in progress at a specific past time with "you" -> "were".',
        explanationKm: 'សកម្មភាពកំពុងធ្វើនៅម៉ោងជាក់លាក់ក្នុងអតីតកាលជាមួយ "you" -> "were"។',
      },
    ],
  },

  {
    id: 'modals-must-have-to-should',
    number: 15,
    stageId: 4,
    level: 'Intermediate',
    title: 'Modals: must / have to / should',
    shortEn: 'Rules, necessity, prohibition (mustn\'t vs don\'t have to), and friendly advice (should)',
    shortKm: 'ការប្រើ must / have to (ច្បាប់ ឬការចាំបាច់) និង should (ដំបូន្មាន) ព្រមទាំងភាពខុសគ្នានៃទម្រង់បដិសេធ។',
    steps: [
      {
        number: 1,
        title: 'Advice vs Obligation vs Prohibition',
        explanationEn:
          'Use "should / shouldn\'t" for friendly advice. Use "must / have to" for strong rules. Watch the HUGE difference in negatives: "mustn\'t" = FORBIDDEN (don\'t do it!), while "don\'t have to" = NOT NECESSARY (you can choose!).',
        explanationKm:
          'ប្រើ "should" សម្រាប់ដំបូន្មាន។ ប្រើ "must / have to" សម្រាប់ច្បាប់ ឬកាតព្វកិច្ច។ ចំណាំទម្រង់បដិសេធខុសគ្នាខ្លាំង៖ "mustn\'t" = ហាមដាច់ខាត ឯ "don\'t have to" = មិនចាំបាច់ទេ (ធ្វើក៏បាន មិនធ្វើក៏បាន)។',
        table: {
          headers: ['MODAL', 'MEANING', 'EXAMPLE'],
          rows: [
            ['should / shouldn\'t', 'Good advice', 'You should practice shadowing 15 minutes a day.'],
            ['must / have to', 'Necessary / Rule', 'You have to wear a helmet on a motorbike.'],
            ["mustn't", 'Forbidden (NOT allowed)', "You mustn't use your phone during the exam."],
            ["don't have to", 'Optional (Not necessary)', "It's Sunday, so I don't have to wake up early."],
          ],
        },
        examples: [
          { en: "You don't have to pay — this lesson is free!", km: 'អ្នកមិនចាំបាច់បង់ប្រាក់ទេ — មេរៀននេះឥតគិតថ្លៃ!' },
        ],
      },
    ],
    exercises: [
      {
        question: 'Tomorrow is a holiday, so we ___ go to work.',
        options: ["mustn't", "don't have to", "shouldn't", "hasn't to"],
        correctIndex: 1,
        explanationEn: 'Not necessary (optional) -> "don\'t have to" (NOT mustn\'t).',
        explanationKm: 'មិនចាំបាច់ទៅធ្វើការ (ថ្ងៃឈប់សម្រាក) -> ប្រើ "don\'t have to"។',
      },
      {
        question: 'You look tired. You ___ get some rest.',
        options: ['mustn\'t', 'should', 'have', 'don\'t have to'],
        correctIndex: 1,
        explanationEn: 'Friendly advice -> "should".',
        explanationKm: 'ការផ្តល់ដំបូន្មានល្អ -> ប្រើ "should"។',
      },
      {
        question: 'Drivers ___ run red lights — it\'s illegal and dangerous.',
        options: ["don't have to", "mustn't", 'should', 'have to'],
        correctIndex: 1,
        explanationEn: 'Strictly forbidden / illegal -> "mustn\'t".',
        explanationKm: 'ហាមដាច់ខាតតាមច្បាប់ -> ប្រើ "mustn\'t"។',
      },
    ],
  },

  // ================= STAGE 5: PASSIVE, CONDITIONALS & LINKING =================
  {
    id: 'passive-voice',
    number: 16,
    stageId: 5,
    level: 'Intermediate',
    title: 'Passive voice: be + V3',
    shortEn: 'English is spoken here, Angkor Wat was built in... — focusing on the action, not the doer',
    shortKm: 'ប្រយោគកម្ម (be + V3) — ផ្តោតលើសកម្មភាព ឬវត្ថុដែលរងអំពើ ជាជាងអ្នកធ្វើ។',
    steps: [
      {
        number: 1,
        title: 'How to form Passive Voice in any tense',
        explanationEn:
          'Keep the formula simple: be (in the right tense) + Past Participle (V3). Add "by + person" ONLY when who did it is important.',
        explanationKm:
          'រូបមន្តសាមញ្ញ៖ កិរិយាសព្ទ be (តាមកាល) + V3។ ដាក់ "by + មនុស្ស" តែពេលចាំបាច់បង្ហាញថាអ្នកណាជាអ្នកធ្វើប៉ុណ្ណោះ។',
        table: {
          headers: ['TENSE', 'ACTIVE', 'PASSIVE (be + V3)'],
          rows: [
            ['Present Simple', 'People speak English worldwide.', 'English is spoken worldwide.'],
            ['Past Simple', 'King Suryavarman II built Angkor Wat.', 'Angkor Wat was built in the 12th century.'],
            ['Future (will)', 'They will send the code.', 'The code will be sent to your email.'],
          ],
        },
        examples: [
          { en: 'These phones are made in Vietnam.', km: 'ទូរស័ព្ទទាំងនេះត្រូវបានផលិតនៅវៀតណាម។' },
          { en: 'My lost bag was found at the train station!', km: 'កាបូបដែលបាត់របស់ខ្ញុំត្រូវបានរកឃើញនៅស្ថានីយ៍រថភ្លើង!' },
        ],
      },
    ],
    exercises: [
      {
        question: 'English ___ in more than 50 countries.',
        options: ['speaks', 'is spoken', 'is speaking', 'was spoke'],
        correctIndex: 1,
        explanationEn: 'Present simple passive -> "is" + V3 "spoken".',
        explanationKm: 'ប្រយោគកម្មបច្ចុប្បន្នកាល -> "is spoken"។',
      },
      {
        question: 'This bridge ___ in 2018.',
        options: ['built', 'is built', 'was built', 'were built'],
        correctIndex: 2,
        explanationEn: 'Past simple passive with singular "This bridge" -> "was built".',
        explanationKm: 'ប្រយោគកម្មអតីតកាលជាមួយឯកវចនៈ -> "was built"។',
      },
      {
        question: 'Your order will ___ tomorrow morning.',
        options: ['deliver', 'be delivered', 'delivered', 'delivering'],
        correctIndex: 1,
        explanationEn: 'Future passive = will + be + V3 ("be delivered").',
        explanationKm: 'ប្រយោគកម្មអនាគតកាល = will + be + V3 ("be delivered")។',
      },
    ],
  },

  {
    id: 'conditionals-0-1-2',
    number: 17,
    stageId: 5,
    level: 'Intermediate',
    title: 'Conditionals: Zero, First & Second (if...)',
    shortEn: 'If it rains, I\'ll stay home (real) vs If I won the lottery, I would travel (imaginary)',
    shortKm: 'ប្រយោគលក្ខខណ្ឌ If៖ ការពិតទូទៅ (Zero), អាចកើតឡើងពិត (First) និងការស្រមៃ (Second)។',
    steps: [
      {
        number: 1,
        title: 'The 3 Everyday Conditionals',
        explanationEn:
          'Zero = always true facts. First = real future possibilities (If + Present Simple, will + V1). Second = imaginary / unlikely situations now (If + Past Simple, would + V1).',
        explanationKm:
          'Zero = ការពិតជានិច្ច។ First = រឿងអាចកើតឡើងពិតនៅអនាគត (If + V1, will + V1)។ Second = ការស្រមៃ ឬមិនងាយកើតឡើងឥឡូវ (If + V2, would + V1)។',
        table: {
          headers: ['TYPE', 'IF-CLAUSE', 'RESULT CLAUSE', 'EXAMPLE'],
          rows: [
            ['Zero (Fact)', 'If + Present Simple', 'Present Simple', 'If you heat ice, it melts.'],
            ['First (Real)', 'If + Present Simple', 'will + V1', "If you practice daily, you'll speak fluently."],
            ['Second (Imaginary)', 'If + Past Simple', 'would + V1', 'If I had more time, I would learn Japanese too.'],
          ],
        },
        noteEn: 'In First Conditional, NEVER put "will" inside the "if" part! (✗ If it will rain → ✓ If it rains)',
        noteKm: 'ក្នុង First Conditional ហាមដាក់ "will" នៅក្នុងផ្នែក "If"! (✗ If it will rain → ✓ If it rains)',
      },
    ],
    exercises: [
      {
        question: 'If you ___ every day, your English will improve fast.',
        options: ['will practice', 'practice', 'practiced', 'practicing'],
        correctIndex: 1,
        explanationEn: 'First Conditional: If + Present Simple ("practice"), will + V1.',
        explanationKm: 'First Conditional៖ ក្រោយ If ប្រើ Present Simple ("practice") មិនប្រើ will ទេ។',
      },
      {
        question: 'If I ___ a million dollars, I would build a free school.',
        options: ['have', 'had', 'will have', 'am having'],
        correctIndex: 1,
        explanationEn: 'Second Conditional (imaginary now): If + Past Simple ("had"), would + V1.',
        explanationKm: 'Second Conditional (ការស្រមៃ)៖ ក្រោយ If ប្រើ Past Simple ("had")។',
      },
      {
        question: 'If I were you, I ___ take that job offer.',
        options: ['will', 'would', 'am', 'did'],
        correctIndex: 1,
        explanationEn: 'Giving advice with Second Conditional ("If I were you") always pairs with "would".',
        explanationKm: 'ផ្តល់ដំបូន្មាន "If I were you" ត្រូវគូជាមួយ "would" ជានិច្ច។',
      },
    ],
  },

  {
    id: 'linking-ideas',
    number: 18,
    stageId: 5,
    level: 'Upper-Intermediate',
    title: 'Linking ideas: because, although, however, so',
    shortEn: 'Connect causes, results, and contrasts smoothly like a fluent English speaker',
    shortKm: 'ពាក្យភ្ជាប់ប្រយោគបង្ហាញហេតុផល លទ្ធផល និងភាពផ្ទុយគ្នា (because, although, however, so)។',
    steps: [
      {
        number: 1,
        title: 'Cause, Result & Contrast Connectors',
        explanationEn:
          'Never use "although" and "but" in the SAME sentence (very common Khmer-to-English mistake!). Pick ONE: either "Although it rained, we went out" OR "It rained, but we went out".',
        explanationKm:
          'ហាមប្រើ "although" និង "but" ក្នុងប្រយោគតែមួយជាដាច់ខាត (កំហុសដែលសិស្សខ្មែរឧស្សាហ៍ច្រឡំព្រោះខ្មែរនិយាយថា «ទោះបី...ប៉ុន្តែ...»)។ ត្រូវជ្រើសរើសប្រើតែមួយប៉ុណ្ណោះ!',
        table: {
          headers: ['CONNECTOR', 'FUNCTION', 'EXAMPLE'],
          rows: [
            ['because / because of', 'Reason (clause vs noun)', 'I stayed home because it rained / because of the rain.'],
            ['so / therefore', 'Result', 'I was tired, so I went to bed early.'],
            ['although / even though', 'Contrast (before S + V)', 'Although it was hard, she never gave up.'],
            ['despite / in spite of', 'Contrast (before Noun / V-ing)', 'Despite the rain, we enjoyed the trip.'],
          ],
        },
        noteEn: '✗ Although he was tired, but he kept studying.  →  ✓ Although he was tired, he kept studying.',
        noteKm: '✗ Although he was tired, but he kept studying.  →  ✓ Although he was tired, he kept studying.',
      },
    ],
    exercises: [
      {
        question: '___ it was raining heavily, we walked to the market.',
        options: ['Despite', 'Because of', 'Although', 'So'],
        correctIndex: 2,
        explanationEn: '"it was raining" is a full clause (Subject + Verb) showing contrast -> "Although".',
        explanationKm: '"it was raining" មានប្រធាន+កិរិយាសព្ទ និងមានន័យផ្ទុយគ្នា -> ប្រើ "Although"។',
      },
      {
        question: 'The flight was delayed ___ the bad weather.',
        options: ['because', 'because of', 'although', 'but'],
        correctIndex: 1,
        explanationEn: '"the bad weather" is a noun phrase (no verb) -> use "because of".',
        explanationKm: '"the bad weather" ជាកន្សោមនាម (គ្មានកិរិយាសព្ទ) -> ប្រើ "because of"។',
      },
      {
        question: 'Choose the grammatically correct sentence:',
        options: [
          'Although English is hard, but I love learning it.',
          'Although English is hard, I love learning it.',
          'Despite English is hard, I love learning it.',
          'Because English is hard, so I love learning it.',
        ],
        correctIndex: 1,
        explanationEn: 'Never pair "Although" with "but" in the same sentence.',
        explanationKm: 'ហាមប្រើ "Although" ជាមួយ "but" ក្នុងប្រយោគតែមួយ។',
      },
    ],
  },
];
