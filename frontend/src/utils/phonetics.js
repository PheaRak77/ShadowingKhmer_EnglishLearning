// Built-in English -> IPA phonetic dictionary (US & UK variants) + fallback rule engine
// and sentence stress / intonation contour analyzer for Shadowing practice.

const COMMON_IPA = {
  // Pronouns & Determiners
  i: { US: 'aɪ', UK: 'aɪ' },
  me: { US: 'miː', UK: 'miː' },
  my: { US: 'maɪ', UK: 'maɪ' },
  mine: { US: 'maɪn', UK: 'maɪn' },
  you: { US: 'juː', UK: 'juː' },
  your: { US: 'jʊr', UK: 'jɔː' },
  yours: { US: 'jʊrz', UK: 'jɔːz' },
  he: { US: 'hiː', UK: 'hiː' },
  him: { US: 'hɪm', UK: 'hɪm' },
  his: { US: 'hɪz', UK: 'hɪz' },
  she: { US: 'ʃiː', UK: 'ʃiː' },
  her: { US: 'hɜːr', UK: 'hɜː' },
  hers: { US: 'hɜːrz', UK: 'hɜːz' },
  it: { US: 'ɪt', UK: 'ɪt' },
  its: { US: 'ɪts', UK: 'ɪts' },
  "it's": { US: 'ɪts', UK: 'ɪts' },
  we: { US: 'wiː', UK: 'wiː' },
  us: { US: 'ʌs', UK: 'ʌs' },
  our: { US: 'aʊər', UK: 'aʊə' },
  they: { US: 'ðeɪ', UK: 'ðeɪ' },
  them: { US: 'ðem', UK: 'ðem' },
  their: { US: 'ðer', UK: 'ðeə' },
  this: { US: 'ðɪs', UK: 'ðɪs' },
  that: { US: 'ðæt', UK: 'ðæt' },
  these: { US: 'ðiːz', UK: 'ðiːz' },
  those: { US: 'ðoʊz', UK: 'ðəʊz' },
  a: { US: 'ə', UK: 'ə' },
  an: { US: 'æn', UK: 'æn' },
  the: { US: 'ðə', UK: 'ðə' },
  some: { US: 'sʌm', UK: 'sʌm' },
  any: { US: 'ˈeni', UK: 'ˈeni' },
  all: { US: 'ɔːl', UK: 'ɔːl' },
  every: { US: 'ˈevri', UK: 'ˈevri' },
  each: { US: 'iːtʃ', UK: 'iːtʃ' },
  one: { US: 'wʌn', UK: 'wʌn' },
  two: { US: 'tuː', UK: 'tuː' },
  three: { US: 'θriː', UK: 'θriː' },
  four: { US: 'fɔːr', UK: 'fɔː' },
  five: { US: 'faɪv', UK: 'faɪv' },
  six: { US: 'sɪks', UK: 'sɪks' },
  seven: { US: 'ˈsevən', UK: 'ˈsevən' },
  eight: { US: 'eɪt', UK: 'eɪt' },
  nine: { US: 'naɪn', UK: 'naɪn' },
  ten: { US: 'ten', UK: 'ten' },
  twenty: { US: 'ˈtwenti', UK: 'ˈtwenti' },
  thirty: { US: 'ˈθɜːrti', UK: 'ˈθɜːti' },
  forty: { US: 'ˈfɔːrti', UK: 'ˈfɔːti' },
  fifty: { US: 'ˈfɪfti', UK: 'ˈfɪfti' },

  // Contractions & Auxiliaries
  "i'm": { US: 'aɪm', UK: 'aɪm' },
  "i've": { US: 'aɪv', UK: 'aɪv' },
  "i'll": { US: 'aɪl', UK: 'aɪl' },
  "i'd": { US: 'aɪd', UK: 'aɪd' },
  "you're": { US: 'jʊr', UK: 'jɔː' },
  "you've": { US: 'juːv', UK: 'juːv' },
  "you'll": { US: 'juːl', UK: 'juːl' },
  "he's": { US: 'hiːz', UK: 'hiːz' },
  "she's": { US: 'ʃiːz', UK: 'ʃiːz' },
  "we're": { US: 'wɪr', UK: 'wɪə' },
  "they're": { US: 'ðer', UK: 'ðeə' },
  "don't": { US: 'doʊnt', UK: 'dəʊnt' },
  "doesn't": { US: 'ˈdʌzənt', UK: 'ˈdʌzənt' },
  "didn't": { US: 'ˈdɪdənt', UK: 'ˈdɪdənt' },
  "can't": { US: 'kænt', UK: 'kɑːnt' },
  "won't": { US: 'woʊnt', UK: 'wəʊnt' },
  "isn't": { US: 'ˈɪzənt', UK: 'ˈɪzənt' },
  "aren't": { US: 'ɑːrnt', UK: 'ɑːnt' },
  "wasn't": { US: 'ˈwɑːzənt', UK: 'ˈwɒzənt' },
  "weren't": { US: 'wɜːrnt', UK: 'wɜːnt' },
  "that's": { US: 'ðæts', UK: 'ðæts' },
  "there's": { US: 'ðerz', UK: 'ðeəz' },
  "what's": { US: 'wʌts', UK: 'wɒts' },
  "let's": { US: 'lets', UK: 'lets' },
  am: { US: 'æm', UK: 'æm' },
  is: { US: 'ɪz', UK: 'ɪz' },
  are: { US: 'ɑːr', UK: 'ɑː' },
  was: { US: 'wʌz', UK: 'wɒz' },
  were: { US: 'wɜːr', UK: 'wɜː' },
  be: { US: 'biː', UK: 'biː' },
  been: { US: 'bɪn', UK: 'biːn' },
  being: { US: 'ˈbiːɪŋ', UK: 'ˈbiːɪŋ' },
  have: { US: 'hæv', UK: 'hæv' },
  has: { US: 'hæz', UK: 'hæz' },
  had: { US: 'hæd', UK: 'hæd' },
  do: { US: 'duː', UK: 'duː' },
  does: { US: 'dʌz', UK: 'dʌz' },
  did: { US: 'dɪd', UK: 'dɪd' },
  will: { US: 'wɪl', UK: 'wɪl' },
  would: { US: 'wʊd', UK: 'wʊd' },
  can: { US: 'kæn', UK: 'kæn' },
  could: { US: 'kʊd', UK: 'kʊd' },
  should: { US: 'ʃʊd', UK: 'ʃʊd' },
  must: { US: 'mʌst', UK: 'mʌst' },
  may: { US: 'meɪ', UK: 'meɪ' },
  might: { US: 'maɪt', UK: 'maɪt' },

  // Prepositions & Conjunctions & Wh-words
  in: { US: 'ɪn', UK: 'ɪn' },
  on: { US: 'ɑːn', UK: 'ɒn' },
  at: { US: 'æt', UK: 'æt' },
  to: { US: 'tuː', UK: 'tuː' },
  for: { US: 'fɔːr', UK: 'fɔː' },
  of: { US: 'ʌv', UK: 'ɒv' },
  with: { US: 'wɪð', UK: 'wɪð' },
  from: { US: 'frʌm', UK: 'frɒm' },
  by: { US: 'baɪ', UK: 'baɪ' },
  about: { US: 'əˈbaʊt', UK: 'əˈbaʊt' },
  into: { US: 'ˈɪntuː', UK: 'ˈɪntuː' },
  out: { US: 'aʊt', UK: 'aʊt' },
  up: { US: 'ʌp', UK: 'ʌp' },
  down: { US: 'daʊn', UK: 'daʊn' },
  off: { US: 'ɔːf', UK: 'ɒf' },
  over: { US: 'ˈoʊvər', UK: 'ˈəʊvə' },
  under: { US: 'ˈʌndər', UK: 'ˈʌndə' },
  after: { US: 'ˈæftər', UK: 'ˈɑːftə' },
  before: { US: 'bɪˈfɔːr', UK: 'bɪˈfɔː' },
  between: { US: 'bɪˈtwiːn', UK: 'bɪˈtwiːn' },
  through: { US: 'θruː', UK: 'θruː' },
  and: { US: 'ænd', UK: 'ænd' },
  or: { US: 'ɔːr', UK: 'ɔː' },
  but: { US: 'bʌt', UK: 'bʌt' },
  so: { US: 'soʊ', UK: 'səʊ' },
  if: { US: 'ɪf', UK: 'ɪf' },
  because: { US: 'bɪˈkɔːz', UK: 'bɪˈkɒz' },
  as: { US: 'æz', UK: 'æz' },
  than: { US: 'ðæn', UK: 'ðæn' },
  then: { US: 'ðen', UK: 'ðen' },
  when: { US: 'wen', UK: 'wen' },
  where: { US: 'wer', UK: 'weə' },
  what: { US: 'wʌt', UK: 'wɒt' },
  which: { US: 'wɪtʃ', UK: 'wɪtʃ' },
  who: { US: 'huː', UK: 'huː' },
  why: { US: 'waɪ', UK: 'waɪ' },
  how: { US: 'haʊ', UK: 'haʊ' },
  not: { US: 'nɑːt', UK: 'nɒt' },
  no: { US: 'noʊ', UK: 'nəʊ' },
  yes: { US: 'jes', UK: 'jes' },

  // Common Daily Words & Verbs
  hi: { US: 'haɪ', UK: 'haɪ' },
  hello: { US: 'həˈloʊ', UK: 'həˈləʊ' },
  good: { US: 'ɡʊd', UK: 'ɡʊd' },
  morning: { US: 'ˈmɔːrnɪŋ', UK: 'ˈmɔːnɪŋ' },
  afternoon: { US: 'ˌæftərˈnuːn', UK: 'ˌɑːftəˈnuːn' },
  evening: { US: 'ˈiːvnɪŋ', UK: 'ˈiːvnɪŋ' },
  night: { US: 'naɪt', UK: 'naɪt' },
  day: { US: 'deɪ', UK: 'deɪ' },
  today: { US: 'təˈdeɪ', UK: 'təˈdeɪ' },
  tomorrow: { US: 'təˈmɑːroʊ', UK: 'təˈmɒrəʊ' },
  yesterday: { US: 'ˈjestərdeɪ', UK: 'ˈjestədeɪ' },
  time: { US: 'taɪm', UK: 'taɪm' },
  year: { US: 'jɪr', UK: 'jɪə' },
  week: { US: 'wiːk', UK: 'wiːk' },
  hour: { US: 'aʊər', UK: 'aʊə' },
  minute: { US: 'ˈmɪnɪt', UK: 'ˈmɪnɪt' },
  alarm: { US: 'əˈlɑːrm', UK: 'əˈlɑːm' },
  clock: { US: 'klɑːk', UK: 'klɒk' },
  ring: { US: 'rɪŋ', UK: 'rɪŋ' },
  rings: { US: 'rɪŋz', UK: 'rɪŋz' },
  loud: { US: 'laʊd', UK: 'laʊd' },
  quiet: { US: 'ˈkwaɪət', UK: 'ˈkwaɪət' },
  turn: { US: 'tɜːrn', UK: 'tɜːn' },
  open: { US: 'ˈoʊpən', UK: 'ˈəʊpən' },
  close: { US: 'kloʊz', UK: 'kləʊz' },
  eye: { US: 'aɪ', UK: 'aɪ' },
  eyes: { US: 'aɪz', UK: 'aɪz' },
  yawn: { US: 'jɔːn', UK: 'jɔːn' },
  stretch: { US: 'stretʃ', UK: 'stretʃ' },
  arm: { US: 'ɑːrm', UK: 'ɑːm' },
  arms: { US: 'ɑːrmz', UK: 'ɑːmz' },
  hand: { US: 'hænd', UK: 'hænd' },
  hands: { US: 'hændz', UK: 'hændz' },
  bed: { US: 'bed', UK: 'bed' },
  bedroom: { US: 'ˈbedruːm', UK: 'ˈbedruːm' },
  window: { US: 'ˈwɪndoʊ', UK: 'ˈwɪndəʊ' },
  street: { US: 'striːt', UK: 'striːt' },
  house: { US: 'haʊs', UK: 'haʊs' },
  home: { US: 'hoʊm', UK: 'həʊm' },
  room: { US: 'ruːm', UK: 'ruːm' },
  door: { US: 'dɔːr', UK: 'dɔː' },
  school: { US: 'skuːl', UK: 'skuːl' },
  work: { US: 'wɜːrk', UK: 'wɜːk' },
  girl: { US: 'ɡɜːrl', UK: 'ɡɜːl' },
  boy: { US: 'bɔɪ', UK: 'bɔɪ' },
  man: { US: 'mæn', UK: 'mæn' },
  woman: { US: 'ˈwʊmən', UK: 'ˈwʊmən' },
  people: { US: 'ˈpiːpəl', UK: 'ˈpiːpəl' },
  friend: { US: 'frend', UK: 'frend' },
  friends: { US: 'frendz', UK: 'frendz' },
  family: { US: 'ˈfæməli', UK: 'ˈfæməli' },
  mother: { US: 'ˈmʌðər', UK: 'ˈmʌðə' },
  father: { US: 'ˈfɑːðər', UK: 'ˈfɑːðə' },
  ice: { US: 'aɪs', UK: 'aɪs' },
  cream: { US: 'kriːm', UK: 'kriːm' },
  truck: { US: 'trʌk', UK: 'trʌk' },
  car: { US: 'kɑːr', UK: 'kɑː' },
  summer: { US: 'ˈsʌmər', UK: 'ˈsʌmə' },
  winter: { US: 'ˈwɪntər', UK: 'ˈwɪntə' },
  water: { US: 'ˈwɔːtər', UK: 'ˈwɔːtə' },
  food: { US: 'fuːd', UK: 'fuːd' },
  coffee: { US: 'ˈkɔːfi', UK: 'ˈkɒfi' },
  story: { US: 'ˈstɔːri', UK: 'ˈstɔːri' },
  tale: { US: 'teɪl', UK: 'teɪl' },
  original: { US: 'əˈrɪdʒənəl', UK: 'əˈrɪdʒɪnəl' },
  english: { US: 'ˈɪŋɡlɪʃ', UK: 'ˈɪŋɡlɪʃ' },
  word: { US: 'wɜːrd', UK: 'wɜːd' },
  words: { US: 'wɜːrdz', UK: 'wɜːdz' },
  world: { US: 'wɜːrld', UK: 'wɜːld' },
  life: { US: 'laɪf', UK: 'laɪf' },
  love: { US: 'lʌv', UK: 'lʌv' },
  like: { US: 'laɪk', UK: 'laɪk' },
  want: { US: 'wɑːnt', UK: 'wɒnt' },
  wants: { US: 'wɑːnts', UK: 'wɒnts' },
  need: { US: 'niːd', UK: 'niːd' },
  know: { US: 'noʊ', UK: 'nəʊ' },
  think: { US: 'θɪŋk', UK: 'θɪŋk' },
  feel: { US: 'fiːl', UK: 'fiːl' },
  make: { US: 'meɪk', UK: 'meɪk' },
  take: { US: 'teɪk', UK: 'teɪk' },
  get: { US: 'ɡet', UK: 'ɡet' },
  getting: { US: 'ˈɡetɪŋ', UK: 'ˈɡetɪŋ' },
  got: { US: 'ɡɑːt', UK: 'ɡɒt' },
  go: { US: 'ɡoʊ', UK: 'ɡəʊ' },
  going: { US: 'ˈɡoʊɪŋ', UK: 'ˈɡəʊɪŋ' },
  went: { US: 'went', UK: 'went' },
  come: { US: 'kʌm', UK: 'kʌm' },
  comes: { US: 'kʌmz', UK: 'kʌmz' },
  came: { US: 'keɪm', UK: 'keɪm' },
  see: { US: 'siː', UK: 'siː' },
  saw: { US: 'sɔː', UK: 'sɔː' },
  look: { US: 'lʊk', UK: 'lʊk' },
  looking: { US: 'ˈlʊkɪŋ', UK: 'ˈlʊkɪŋ' },
  watch: { US: 'wɑːtʃ', UK: 'wɒtʃ' },
  hear: { US: 'hɪr', UK: 'hɪə' },
  listen: { US: 'ˈlɪsən', UK: 'ˈlɪsən' },
  say: { US: 'seɪ', UK: 'seɪ' },
  says: { US: 'sez', UK: 'sez' },
  said: { US: 'sed', UK: 'sed' },
  tell: { US: 'tel', UK: 'tel' },
  talk: { US: 'tɔːk', UK: 'tɔːk' },
  speak: { US: 'spiːk', UK: 'spiːk' },
  ask: { US: 'æsk', UK: 'ɑːsk' },
  sit: { US: 'sɪt', UK: 'sɪt' },
  sits: { US: 'sɪts', UK: 'sɪts' },
  stand: { US: 'stænd', UK: 'stænd' },
  walk: { US: 'wɔːk', UK: 'wɔːk' },
  run: { US: 'rʌn', UK: 'rʌn' },
  eat: { US: 'iːt', UK: 'iːt' },
  drink: { US: 'drɪŋk', UK: 'drɪŋk' },
  sleep: { US: 'sliːp', UK: 'sliːp' },
  sleepy: { US: 'ˈsliːpi', UK: 'ˈsliːpi' },
  wake: { US: 'weɪk', UK: 'weɪk' },
  wait: { US: 'weɪt', UK: 'weɪt' },
  waiting: { US: 'ˈweɪtɪŋ', UK: 'ˈweɪtɪŋ' },
  swim: { US: 'swɪm', UK: 'swɪm' },
  swimming: { US: 'ˈswɪmɪŋ', UK: 'ˈswɪmɪŋ' },
  play: { US: 'pleɪ', UK: 'pleɪ' },
  read: { US: 'riːd', UK: 'riːd' },
  write: { US: 'raɪt', UK: 'raɪt' },
  learn: { US: 'lɜːrn', UK: 'lɜːn' },
  study: { US: 'ˈstʌdi', UK: 'ˈstʌdi' },
  help: { US: 'help', UK: 'help' },
  give: { US: 'ɡɪv', UK: 'ɡɪv' },
  find: { US: 'faɪnd', UK: 'faɪnd' },
  keep: { US: 'kiːp', UK: 'kiːp' },
  put: { US: 'pʊt', UK: 'pʊt' },
  try: { US: 'traɪ', UK: 'traɪ' },
  call: { US: 'kɔːl', UK: 'kɔːl' },
  use: { US: 'juːz', UK: 'juːz' },
  very: { US: 'ˈveri', UK: 'ˈveri' },
  really: { US: 'ˈriːəli', UK: 'ˈrɪəli' },
  still: { US: 'stɪl', UK: 'stɪl' },
  just: { US: 'dʒʌst', UK: 'dʒʌst' },
  now: { US: 'naʊ', UK: 'naʊ' },
  here: { US: 'hɪr', UK: 'hɪə' },
  there: { US: 'ðer', UK: 'ðeə' },
  always: { US: 'ˈɔːlweɪz', UK: 'ˈɔːlweɪz' },
  never: { US: 'ˈnevər', UK: 'ˈnevə' },
  sometimes: { US: 'ˈsʌmtaɪmz', UK: 'ˈsʌmtaɪmz' },
  slowly: { US: 'ˈsloʊli', UK: 'ˈsləʊli' },
  quickly: { US: 'ˈkwɪkli', UK: 'ˈkwɪkli' },
  big: { US: 'bɪɡ', UK: 'bɪɡ' },
  small: { US: 'smɔːl', UK: 'smɔːl' },
  little: { US: 'ˈlɪtəl', UK: 'ˈlɪtəl' },
  long: { US: 'lɔːŋ', UK: 'lɒŋ' },
  short: { US: 'ʃɔːrt', UK: 'ʃɔːt' },
  new: { US: 'nuː', UK: 'njuː' },
  old: { US: 'oʊld', UK: 'əʊld' },
  hot: { US: 'hɑːt', UK: 'hɒt' },
  cold: { US: 'koʊld', UK: 'kəʊld' },
  happy: { US: 'ˈhæpi', UK: 'ˈhæpi' },
  sad: { US: 'sæd', UK: 'sæd' },
  nice: { US: 'naɪs', UK: 'naɪs' },
  great: { US: 'ɡreɪt', UK: 'ɡreɪt' },
  right: { US: 'raɪt', UK: 'raɪt' },
  left: { US: 'left', UK: 'left' },
  first: { US: 'fɜːrst', UK: 'fɜːst' },
  last: { US: 'læst', UK: 'lɑːst' },
  next: { US: 'nekst', UK: 'nekst' },
  more: { US: 'mɔːr', UK: 'mɔː' },
  much: { US: 'mʌtʃ', UK: 'mʌtʃ' },
  many: { US: 'ˈmeni', UK: 'ˈmeni' },
  too: { US: 'tuː', UK: 'tuː' },
  also: { US: 'ˈɔːlsoʊ', UK: 'ˈɔːlsəʊ' },
  again: { US: 'əˈɡen', UK: 'əˈɡen' },
  ugh: { US: 'ʌɡ', UK: 'ʌɡ' },
  hmm: { US: 'hm', UK: 'hm' },
  oh: { US: 'oʊ', UK: 'əʊ' },
  well: { US: 'wel', UK: 'wel' },
  please: { US: 'pliːz', UK: 'pliːz' },
  thank: { US: 'θæŋk', UK: 'θæŋk' },
  thanks: { US: 'θæŋks', UK: 'θæŋks' },
  sorry: { US: 'ˈsɑːri', UK: 'ˈsɒri' },
};

// Unstressed function words for natural English sentence rhythm / stress highlighting
const FUNCTION_WORDS = new Set([
  'a', 'an', 'the',
  'i', 'me', 'my', 'you', 'your', 'he', 'him', 'his', 'she', 'her', 'it', 'its',
  'we', 'us', 'our', 'they', 'them', 'their',
  'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did',
  'will', 'would', 'shall', 'should', 'can', 'could', 'may', 'might', 'must',
  'in', 'on', 'at', 'to', 'for', 'of', 'with', 'from', 'by', 'about', 'as', 'into', 'than',
  'and', 'or', 'but', 'so', 'if', 'that', 'this', 'these', 'those', 'there',
  'up', 'out', 'off', 'just', 'then',
]);

const WH_WORDS = new Set(['what', 'where', 'when', 'who', 'whom', 'whose', 'which', 'why', 'how']);

function approximateIPA(rawLower, accent = 'US') {
  let w = rawLower.replace(/[^a-z']/g, '');
  if (!w) return '';

  // Handle contractions smoothly
  if (w.endsWith("'s")) {
    const base = w.slice(0, -2);
    const baseIpa = COMMON_IPA[base]?.[accent] || approximateIPA(base, accent);
    return `${baseIpa}z`;
  }
  if (w.endsWith("'re")) {
    const base = w.slice(0, -3);
    const baseIpa = COMMON_IPA[base]?.[accent] || approximateIPA(base, accent);
    return `${baseIpa}r`;
  }

  // Handle common inflections if stem is known
  if (w.endsWith('ing') && w.length > 5) {
    const stem = w.slice(0, -3);
    if (COMMON_IPA[stem]) return `${COMMON_IPA[stem][accent]}ɪŋ`;
    if (COMMON_IPA[`${stem}e`]) return `${COMMON_IPA[`${stem}e`][accent]}ɪŋ`;
  }
  if (w.endsWith('s') && !w.endsWith('ss') && w.length > 3) {
    const stem = w.slice(0, -1);
    if (COMMON_IPA[stem]) return `${COMMON_IPA[stem][accent]}z`;
  }
  if (w.endsWith('ed') && w.length > 4) {
    const stem = w.slice(0, -2);
    if (COMMON_IPA[stem]) return `${COMMON_IPA[stem][accent]}d`;
  }

  // Phonetic grapheme-to-IPA approximation
  let s = w;
  const rSuffix = accent === 'UK' ? 'ə' : 'ər';

  s = s
    .replace(/tion\b/g, 'ʃən')
    .replace(/sion\b/g, 'ʒən')
    .replace(/igh/g, 'aɪ')
    .replace(/ough/g, 'oʊ')
    .replace(/eigh/g, 'eɪ')
    .replace(/tch/g, 'tʃ')
    .replace(/ch/g, 'tʃ')
    .replace(/sh/g, 'ʃ')
    .replace(/ph/g, 'f')
    .replace(/th/g, 'θ')
    .replace(/ng\b/g, 'ŋ')
    .replace(/ck/g, 'k')
    .replace(/qu/g, 'kw')
    .replace(/wh/g, 'w')
    .replace(/kn/g, 'n')
    .replace(/wr/g, 'r')
    .replace(/ee/g, 'iː')
    .replace(/ea/g, 'iː')
    .replace(/oo/g, 'uː')
    .replace(/ai|ay/g, 'eɪ')
    .replace(/oi|oy/g, 'ɔɪ')
    .replace(/ou|ow/g, 'aʊ')
    .replace(/au|aw/g, 'ɔː')
    .replace(/er\b/g, rSuffix)
    .replace(/or\b/g, accent === 'UK' ? 'ɔː' : 'ɔːr')
    .replace(/ar/g, accent === 'UK' ? 'ɑː' : 'ɑːr')
    .replace(/ly\b/g, 'li')
    .replace(/y\b/g, 'i')
    .replace(/c(?=[eiy])/g, 's')
    .replace(/c/g, 'k')
    .replace(/x/g, 'ks')
    .replace(/j/g, 'dʒ')
    .replace(/([a-z])e\b/g, '$1');

  // Add primary stress mark for multi-syllable words
  if (s.length >= 6 && !s.includes('ˈ')) {
    s = `ˈ${s}`;
  }
  return s;
}

export function getWordIPA(rawWord, accent = 'US', vocabList = []) {
  if (!rawWord) return '';
  const clean = rawWord.toLowerCase().replace(/^[^a-z0-9']+|[^a-z0-9']+$/g, '');
  if (!clean) return '';

  // 1. Check lesson vocabulary for exact IPA
  if (Array.isArray(vocabList) && vocabList.length > 0) {
    const match = vocabList.find((v) => v.word && v.word.toLowerCase() === clean && v.ipa);
    if (match?.ipa) {
      const stripped = match.ipa.trim().replace(/^\/|\/$/g, '');
      return `/${stripped}/`;
    }
  }

  // 2. Check built-in US/UK dictionary
  if (COMMON_IPA[clean]) {
    return `/${COMMON_IPA[clean][accent] || COMMON_IPA[clean].US}/`;
  }

  // 3. Phonetic fallback engine
  const approx = approximateIPA(clean, accent);
  return approx ? `/${approx}/` : '';
}

export function analyzeSentenceTokens(sentenceText, accent = 'US', vocabList = []) {
  const text = (sentenceText || '').trim();
  if (!text) return { tokens: [], endingArrow: null };

  const rawWords = text.split(/\s+/).filter(Boolean);
  const firstClean = (rawWords[0] || '').toLowerCase().replace(/[^a-z']/g, '');

  // Determine natural sentence-ending intonation arrow
  let endingArrow = null;
  if (text.endsWith('?')) {
    // Wh-questions typically fall; Yes/No questions rise
    endingArrow = WH_WORDS.has(firstClean) ? '↘' : '↗';
  } else if (text.endsWith('!')) {
    endingArrow = '↘';
  } else if (text.endsWith('...')) {
    endingArrow = '→';
  } else {
    endingArrow = '↗';
  }

  const tokens = rawWords.map((rawWord, idx) => {
    const clean = rawWord.toLowerCase().replace(/[^a-z0-9']/g, '');
    const isContentWord =
      clean.length > 0 &&
      !FUNCTION_WORDS.has(clean) &&
      (clean.length >= 3 || clean.includes("n't") || clean === 'no' || clean === 'up');

    // Keep natural English stress balance (emphasize key content words, avoid bolding every single word)
    const isStressed = isContentWord && (rawWords.length <= 5 || idx % 2 === 1 || clean.length >= 5);
    const hasMidRise = rawWord.endsWith(',') && idx < rawWords.length - 1;
    const ipa = getWordIPA(rawWord, accent, vocabList);

    return {
      rawWord,
      clean,
      ipa,
      isStressed,
      hasMidRise,
      isLast: idx === rawWords.length - 1,
    };
  });

  // Ensure at least 1 word is stressed in any multi-word sentence
  if (tokens.length > 0 && !tokens.some((t) => t.isStressed)) {
    const longestIdx = tokens.reduce(
      (best, cur, i) => (cur.clean.length > tokens[best].clean.length ? i : best),
      0
    );
    tokens[longestIdx].isStressed = true;
  }

  return { tokens, endingArrow };
}
