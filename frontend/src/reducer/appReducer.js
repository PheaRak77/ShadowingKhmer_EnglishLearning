import React, { createContext, useContext, useReducer } from 'react';

const storedUser = (() => {
  try {
    const raw = localStorage.getItem('sk_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
})();

const storedToken = localStorage.getItem('sk_token') || null;

// Default starter lesson ("A Day in My Life 1: Getting Up")
export const DEMO_LESSON_DATA = {
  lesson: {
    id: 0,
    video_url: 'https://www.youtube.com/watch?v=eIho2S0ZahI',
    video_id: 'eIho2S0ZahI',
    title: 'A Day in My Life 1: Getting Up',
    is_demo: true,
  },
  sentences: [
    {
      id: 101,
      sentence_index: 1,
      english_text: "Hi, I'm Ben. This is my morning.",
      khmer_text: 'សួស្តី ខ្ញុំឈ្មោះ បេន។ នេះគឺជាពេលព្រឹករបស់ខ្ញុំ។',
      start_time: 0.0,
      end_time: 4.2,
    },
    {
      id: 102,
      sentence_index: 2,
      english_text: 'My alarm clock rings at six thirty.',
      khmer_text: 'នាឡិការោទិ៍របស់ខ្ញុំរោទិ៍នៅម៉ោងប្រាំមួយកន្លះ។',
      start_time: 4.2,
      end_time: 8.5,
    },
    {
      id: 103,
      sentence_index: 3,
      english_text: "Ugh, it's so loud!",
      khmer_text: 'អូយ វាឮខ្លាំងណាស់!',
      start_time: 8.5,
      end_time: 11.8,
    },
    {
      id: 104,
      sentence_index: 4,
      english_text: 'I turn it off. Quiet!',
      khmer_text: 'ខ្ញុំបិទវា។ ស្ងាត់ហើយ!',
      start_time: 11.8,
      end_time: 15.4,
    },
    {
      id: 105,
      sentence_index: 5,
      english_text: 'I open my eyes and yawn.',
      khmer_text: 'ខ្ញុំបើកភ្នែករបស់ខ្ញុំ ហើយស្ងាប។',
      start_time: 15.4,
      end_time: 19.5,
    },
    {
      id: 106,
      sentence_index: 6,
      english_text: 'I stretch my arms and get out of bed slowly.',
      khmer_text: 'ខ្ញុំពត់ដៃរបស់ខ្ញុំ ហើយក្រោកចេញពីគ្រែយឺតៗ។',
      start_time: 19.5,
      end_time: 24.8,
    },
  ],
  vocabulary: [
    {
      id: 201,
      word: 'alarm clock',
      ipa: '/əˈlɑːrm klɑːk/',
      part_of_speech: 'noun',
      khmer_meaning: 'នាឡិការោទិ៍',
      example_sentence: 'My alarm clock rings at six thirty every morning.',
    },
    {
      id: 202,
      word: 'turn off',
      ipa: '/tɜːrn ɔːf/',
      part_of_speech: 'phrasal verb',
      khmer_meaning: 'បិទ (ឧបករណ៍អគ្គិសនី)',
      example_sentence: 'I turn it off so the room becomes quiet.',
    },
    {
      id: 203,
      word: 'yawn',
      ipa: '/jɔːn/',
      part_of_speech: 'verb',
      khmer_meaning: 'ស្ងាប',
      example_sentence: 'I open my eyes and yawn when I wake up.',
    },
    {
      id: 204,
      word: 'stretch',
      ipa: '/stretʃ/',
      part_of_speech: 'verb',
      khmer_meaning: 'ពត់ខ្លួន / លាតសន្ធឹង',
      example_sentence: 'I stretch my arms before getting out of bed.',
    },
  ],
  grammar_points: [
    {
      id: 301,
      stage: 'Stage 1: The basics',
      title: 'Be: am / is / are, was / were',
      explanation_en:
        'am/is/are now, was/were in the past + a noun, adjective or place — saying who, what or where something is.',
      explanation_km:
        'យើងប្រើ am/is/are សម្រាប់បច្ចុប្បន្នកាល និង was/were សម្រាប់អតីតកាល បូកនឹងនាម គុណនាម ឬទីកន្លែង ដើម្បីប្រាប់ថានរណា អ្វី ឬនៅទីណា។',
      example_en: "Hi, I'm Ben. This is my morning.",
      example_km: 'សួស្តី ខ្ញុំឈ្មោះ បេន។ នេះគឺជាពេលព្រឹករបស់ខ្ញុំ។',
    },
    {
      id: 302,
      stage: 'Stage 2: Everyday words & Present Simple',
      title: 'Present Simple for Daily Routines',
      explanation_en:
        'Use the base verb (add -s/-es for he/she/it) to describe habits, daily schedules, and regular morning routines.',
      explanation_km:
        'ប្រើកិរិយាសព្ទដើម (ថែម -s/-es សម្រាប់ប្រធានឯកវចនៈ he/she/it) ដើម្បីពិពណ៌នាអំពីទម្លាប់ប្រចាំថ្ងៃ និងសកម្មភាពដែលកើតឡើងជាប្រចាំ។',
      example_en: 'My alarm clock rings at six thirty.',
      example_km: 'នាឡិការោទិ៍របស់ខ្ញុំរោទិ៍នៅម៉ោងប្រាំមួយកន្លះ។',
    },
    {
      id: 303,
      stage: 'Stage 3: Verb patterns & Phrasal Verbs',
      title: 'Separable Phrasal Verbs (turn it off)',
      explanation_en:
        'With separable phrasal verbs like "turn off", object pronouns (it, them) must go between the verb and the particle.',
      explanation_km:
        'ចំពោះកិរិយាសព្ទឃ្លាដែលអាចបំបែកបានដូចជា "turn off" សព្វនាមកម្មបទ (it, them) ត្រូវដាក់នៅចន្លោះកិរិយាសព្ទ និងធ្នាក់។',
      example_en: 'I turn it off. Quiet!',
      example_km: 'ខ្ញុំបិទវា។ ស្ងាត់ហើយ!',
    },
  ],
};

export const initialState = {
  auth: {
    user: storedUser,
    token: storedToken,
    isLoginMode: true,
    form: {
      username: '',
      email: '',
      password: '',
      role: 'student',
    },
    loading: false,
    error: null,
  },
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  isAuthModalOpen: false,
  activeScreen: 'workspace', // 'workspace' | 'admin'
  isMobileMenuOpen: false,
  adminDashboard: {
    loading: false,
    stats: {
      totalUsers: 0,
      googleConnectedUsers: 0,
      totalLessons: 0,
      totalSentences: 0,
      totalVocabulary: 0,
      totalGrammarPoints: 0,
    },
    users: [],
    lessons: [],
    activeTab: 'users',
    searchQuery: '',
  },
  lessonsList: [],
  myLessonsSearchQuery: '',
  isLessonsDrawerOpen: false,
  currentLesson: DEMO_LESSON_DATA.lesson,
  sentences: DEMO_LESSON_DATA.sentences,
  vocabulary: DEMO_LESSON_DATA.vocabulary,
  allSavedVocabulary: [],
  grammarPoints: DEMO_LESSON_DATA.grammar_points,
  videoUrlInput: '',
  creatingLesson: false,
  createProgress: 0,
  loadingLesson: false,
  notification: null,
  practiceMode: 'lesson', // 'lesson' | 'dictation' | 'vocabulary' | 'grammar'
  activeSentenceIndex: 1,
  visibleKhmerMap: { 1: true, 2: true, 3: true, 4: true, 5: true, 6: true },
  showAllKhmer: true,
  completedSentencesMap: {},
  sentenceSearchQuery: '',
  playbackRate: 1,
  isLoopingSentence: false,
  selectedWordPopup: null,
  dictation: {
    userInput: '',
    isChecked: false,
    accuracy: 0,
    showHint: false,
  },
  vocabView: {
    tab: 'lesson',
    isFlashcardMode: false,
    currentCardIndex: 0,
    isFlipped: false,
  },
  grammarFilter: {
    searchQuery: '',
    selectedStage: 'ALL',
  },
  playerSize: 'large',
};

export function appReducer(state, action) {
  switch (action.type) {
    case 'SET_GOOGLE_CLIENT_ID':
      return {
        ...state,
        googleClientId: action.payload,
      };

    case 'TOGGLE_MOBILE_MENU':
      return {
        ...state,
        isMobileMenuOpen:
          typeof action.payload === 'boolean' ? action.payload : !state.isMobileMenuOpen,
      };

    // --- AUTH ACTIONS ---
    case 'AUTH_TOGGLE_MODE':
      return {
        ...state,
        auth: {
          ...state.auth,
          isLoginMode: !state.auth.isLoginMode,
          error: null,
        },
      };

    case 'AUTH_UPDATE_FIELD':
      return {
        ...state,
        auth: {
          ...state.auth,
          form: {
            ...state.auth.form,
            [action.payload.field]: action.payload.value,
          },
          error: null,
        },
      };

    case 'AUTH_START':
      return {
        ...state,
        auth: {
          ...state.auth,
          loading: true,
          error: null,
        },
      };

    case 'AUTH_SUCCESS':
      return {
        ...state,
        isAuthModalOpen: false,
        auth: {
          ...state.auth,
          user: action.payload.user,
          token: action.payload.token,
          loading: false,
          error: null,
          form: { username: '', email: '', password: '', role: 'student' },
        },
      };

    case 'OPEN_AUTH_MODAL':
      return {
        ...state,
        isAuthModalOpen: true,
        auth: {
          ...state.auth,
          isLoginMode: action.payload === 'register' ? false : true,
          error: null,
        },
      };

    case 'CLOSE_AUTH_MODAL':
      return {
        ...state,
        isAuthModalOpen: false,
        auth: {
          ...state.auth,
          error: null,
        },
      };

    case 'AUTH_UPDATE_USER':
      return {
        ...state,
        auth: {
          ...state.auth,
          user: action.payload.user,
          token: action.payload.token || state.auth.token,
        },
      };

    case 'AUTH_FAILURE':
      return {
        ...state,
        auth: {
          ...state.auth,
          loading: false,
          error: action.payload,
        },
      };

    case 'AUTH_LOGOUT':
      return {
        ...initialState,
        googleClientId: state.googleClientId,
        auth: {
          user: null,
          token: null,
          isLoginMode: true,
          form: { username: '', email: '', password: '', role: 'student' },
          loading: false,
          error: null,
        },
      };

    // --- SCREEN & ADMIN DASHBOARD ACTIONS ---
    case 'SET_ACTIVE_SCREEN':
      return {
        ...state,
        activeScreen: action.payload,
        isLessonsDrawerOpen: false,
        isMobileMenuOpen: false,
      };

    case 'ADMIN_LOAD_START':
      return {
        ...state,
        adminDashboard: {
          ...state.adminDashboard,
          loading: true,
        },
      };

    case 'ADMIN_LOAD_SUCCESS':
      return {
        ...state,
        adminDashboard: {
          ...state.adminDashboard,
          loading: false,
          stats: action.payload.stats,
          users: action.payload.users || [],
          lessons: action.payload.lessons || [],
        },
      };

    case 'ADMIN_SET_TAB':
      return {
        ...state,
        adminDashboard: {
          ...state.adminDashboard,
          activeTab: action.payload,
        },
      };

    case 'ADMIN_SET_SEARCH':
      return {
        ...state,
        adminDashboard: {
          ...state.adminDashboard,
          searchQuery: action.payload,
        },
      };

    case 'ADMIN_USER_ROLE_UPDATED': {
      const updatedUser = action.payload;
      return {
        ...state,
        adminDashboard: {
          ...state.adminDashboard,
          users: state.adminDashboard.users.map((u) =>
            u.id === updatedUser.id ? { ...u, role: updatedUser.role } : u
          ),
        },
      };
    }

    case 'ADMIN_USER_DELETED': {
      const deletedId = action.payload;
      return {
        ...state,
        adminDashboard: {
          ...state.adminDashboard,
          users: state.adminDashboard.users.filter((u) => u.id !== deletedId),
          stats: {
            ...state.adminDashboard.stats,
            totalUsers: Math.max(0, state.adminDashboard.stats.totalUsers - 1),
          },
        },
      };
    }

    case 'ADMIN_LESSON_DELETED': {
      const deletedLessonId = action.payload;
      return {
        ...state,
        lessonsList: state.lessonsList.filter((l) => l.id !== deletedLessonId),
        adminDashboard: {
          ...state.adminDashboard,
          lessons: state.adminDashboard.lessons.filter((l) => l.id !== deletedLessonId),
          stats: {
            ...state.adminDashboard.stats,
            totalLessons: Math.max(0, state.adminDashboard.stats.totalLessons - 1),
          },
        },
      };
    }

    // --- NAVIGATION & LESSONS LIST ---
    case 'TOGGLE_LESSONS_DRAWER':
      return {
        ...state,
        isLessonsDrawerOpen:
          typeof action.payload === 'boolean' ? action.payload : !state.isLessonsDrawerOpen,
      };

    case 'SET_LESSONS_LIST':
      return {
        ...state,
        lessonsList: action.payload,
      };

    case 'SET_MY_LESSONS_SEARCH':
      return {
        ...state,
        myLessonsSearchQuery: action.payload,
      };

    case 'USER_LESSON_DELETED': {
      const deletedId = action.payload.deletedId;
      const updatedLessons = state.lessonsList.filter((l) => l.id !== deletedId);
      return {
        ...state,
        lessonsList: updatedLessons,
        notification: {
          type: 'success',
          message: `Removed lesson "${action.payload.title}" from My Lessons.`,
        },
      };
    }

    case 'SET_VIDEO_URL_INPUT':
      return {
        ...state,
        videoUrlInput: action.payload,
      };

    case 'CREATE_LESSON_START':
      return {
        ...state,
        creatingLesson: true,
        createProgress: 6,
        notification: null,
      };

    case 'CREATE_LESSON_PROGRESS':
      return {
        ...state,
        createProgress: action.payload,
      };

    case 'CREATE_LESSON_SUCCESS': {
      const { lesson, sentences, vocabulary, grammar_points } = action.payload;
      const updatedList = [
        { ...lesson, sentence_count: sentences.length },
        ...state.lessonsList.filter((l) => l.id !== lesson.id),
      ];
      const autoKhmerMap = {};
      (sentences || []).forEach((s) => {
        autoKhmerMap[s.sentence_index] = true;
      });
      return {
        ...state,
        creatingLesson: false,
        createProgress: 100,
        videoUrlInput: '',
        currentLesson: lesson,
        sentences,
        vocabulary,
        grammarPoints: grammar_points,
        lessonsList: updatedList,
        practiceMode: 'lesson',
        activeSentenceIndex: 1,
        visibleKhmerMap: autoKhmerMap,
        showAllKhmer: true,
        completedSentencesMap: {},
        sentenceSearchQuery: '',
        selectedWordPopup: null,
        dictation: { userInput: '', isChecked: false, accuracy: 0, showHint: false },
        notification: {
          type: 'success',
          message: `Lesson "${lesson.title}" ready with ${sentences.length} sentences!`,
        },
      };
    }

    case 'CREATE_LESSON_FAILURE':
      return {
        ...state,
        creatingLesson: false,
        createProgress: 0,
        notification: {
          type: 'error',
          message: action.payload,
        },
      };

    case 'LOAD_LESSON_START':
      return {
        ...state,
        loadingLesson: true,
        isLessonsDrawerOpen: false,
        isMobileMenuOpen: false,
      };

    case 'LOAD_LESSON_SUCCESS': {
      const { lesson, sentences, vocabulary, grammar_points } = action.payload;
      const autoKhmerMap = {};
      (sentences || []).forEach((s) => {
        autoKhmerMap[s.sentence_index] = true;
      });
      return {
        ...state,
        loadingLesson: false,
        activeScreen: 'workspace',
        currentLesson: lesson,
        sentences: sentences || [],
        vocabulary: vocabulary || [],
        grammarPoints: grammar_points || [],
        activeSentenceIndex: 1,
        visibleKhmerMap: autoKhmerMap,
        showAllKhmer: true,
        completedSentencesMap: {},
        sentenceSearchQuery: '',
        selectedWordPopup: null,
      };
    }

    case 'SET_NOTIFICATION':
      return {
        ...state,
        notification: action.payload,
      };

    // --- PRACTICE MODE, PLAYBACK CONTROLS & SENTENCE SHADOWING ---
    case 'SET_PRACTICE_MODE':
      return {
        ...state,
        practiceMode: action.payload,
        selectedWordPopup: null,
      };

    case 'SET_ACTIVE_SENTENCE':
      return {
        ...state,
        activeSentenceIndex: action.payload,
        dictation: {
          userInput: '',
          isChecked: false,
          accuracy: 0,
          showHint: false,
        },
      };

    case 'DICTATION_UPDATE_INPUT':
      return {
        ...state,
        dictation: {
          ...state.dictation,
          userInput: action.payload,
          isChecked: false,
        },
      };

    case 'DICTATION_CHECK':
      return {
        ...state,
        dictation: {
          ...state.dictation,
          isChecked: true,
          accuracy: action.payload,
        },
      };

    case 'DICTATION_TOGGLE_HINT':
      return {
        ...state,
        dictation: {
          ...state.dictation,
          showHint: !state.dictation.showHint,
        },
      };

    case 'DICTATION_RESET':
      return {
        ...state,
        dictation: {
          userInput: '',
          isChecked: false,
          accuracy: 0,
          showHint: false,
        },
      };

    case 'SET_PLAYBACK_RATE':
      return {
        ...state,
        playbackRate: action.payload,
      };

    case 'TOGGLE_LOOP_SENTENCE':
      return {
        ...state,
        isLoopingSentence: !state.isLoopingSentence,
      };

    case 'TOGGLE_COMPLETE_SENTENCE': {
      const idx = action.payload;
      return {
        ...state,
        completedSentencesMap: {
          ...state.completedSentencesMap,
          [idx]: !state.completedSentencesMap[idx],
        },
      };
    }

    case 'SET_SENTENCE_SEARCH':
      return {
        ...state,
        sentenceSearchQuery: action.payload,
      };

    case 'TOGGLE_SENTENCE_KHMER': {
      const idx = action.payload;
      return {
        ...state,
        visibleKhmerMap: {
          ...state.visibleKhmerMap,
          [idx]: !state.visibleKhmerMap[idx],
        },
      };
    }

    case 'TOGGLE_ALL_KHMER': {
      const nextShowAll = !state.showAllKhmer;
      const newMap = {};
      if (nextShowAll) {
        state.sentences.forEach((s) => {
          newMap[s.sentence_index] = true;
        });
      }
      return {
        ...state,
        showAllKhmer: nextShowAll,
        visibleKhmerMap: newMap,
      };
    }

    case 'OPEN_WORD_POPUP':
      return {
        ...state,
        selectedWordPopup: {
          ...action.payload,
          saving: false,
          saved: false,
        },
      };

    case 'CLOSE_WORD_POPUP':
      return {
        ...state,
        selectedWordPopup: null,
      };

    case 'SAVE_WORD_START':
      return {
        ...state,
        selectedWordPopup: state.selectedWordPopup
          ? { ...state.selectedWordPopup, saving: true }
          : null,
      };

    case 'SAVE_WORD_SUCCESS': {
      const newWord = action.payload;
      return {
        ...state,
        vocabulary: [newWord, ...state.vocabulary.filter((w) => w.id !== newWord.id)],
        allSavedVocabulary: [
          newWord,
          ...state.allSavedVocabulary.filter((w) => w.id !== newWord.id),
        ],
        selectedWordPopup: state.selectedWordPopup
          ? {
              ...state.selectedWordPopup,
              saving: false,
              saved: true,
              savedWordData: newWord,
            }
          : null,
        notification: {
          type: 'success',
          message: `Saved "${newWord.word}" (${newWord.khmer_meaning}) to your Vocabulary!`,
        },
      };
    }

    case 'SET_ALL_SAVED_VOCABULARY':
      return {
        ...state,
        allSavedVocabulary: action.payload,
      };

    // --- VOCABULARY & FLASHCARDS ---
    case 'SET_VOCAB_TAB':
      return {
        ...state,
        vocabView: {
          ...state.vocabView,
          tab: action.payload,
          currentCardIndex: 0,
          isFlipped: false,
        },
      };

    case 'TOGGLE_FLASHCARD_MODE':
      return {
        ...state,
        vocabView: {
          ...state.vocabView,
          isFlashcardMode:
            typeof action.payload === 'boolean'
              ? action.payload
              : !state.vocabView.isFlashcardMode,
          currentCardIndex: 0,
          isFlipped: false,
        },
      };

    case 'FLIP_FLASHCARD':
      return {
        ...state,
        vocabView: {
          ...state.vocabView,
          isFlipped: !state.vocabView.isFlipped,
        },
      };

    case 'CHANGE_FLASHCARD_INDEX':
      return {
        ...state,
        vocabView: {
          ...state.vocabView,
          currentCardIndex: action.payload,
          isFlipped: false,
        },
      };

    // --- GRAMMAR FILTERS ---
    case 'SET_GRAMMAR_SEARCH':
      return {
        ...state,
        grammarFilter: {
          ...state.grammarFilter,
          searchQuery: action.payload,
        },
      };

    case 'SET_GRAMMAR_STAGE':
      return {
        ...state,
        grammarFilter: {
          ...state.grammarFilter,
          selectedStage: action.payload,
        },
      };

    case 'TOGGLE_PLAYER_SIZE':
      return {
        ...state,
        playerSize: state.playerSize === 'large' ? 'normal' : 'large',
      };

    default:
      return state;
  }
}

export const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return React.createElement(AppContext.Provider, { value: { state, dispatch } }, children);
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used inside an AppProvider');
  }
  return context;
}
