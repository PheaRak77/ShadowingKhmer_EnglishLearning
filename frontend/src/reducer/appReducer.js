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
    forgotPassword: {
      isForgotMode: false,
      step: 'request', // 'request' | 'reset'
      email: '',
      code: '',
      newPassword: '',
      issuedCode: '',
      successMessage: null,
    },
  },
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  appInitializing: true,
  isAuthModalOpen: false,
  activeScreen: 'library', // 'library' (first page) | 'workspace' | 'admin'
  isMobileMenuOpen: false,
  library: {
    loading: false,
    lessons: [],
    history: [],
    activeTab: 'all', // 'all' | 'history'
    selectedLevel: 'ALL',
    searchQuery: '',
  },
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
    studentLimit: { maxLessons: 1, windowDays: 2 },
    limitForm: { maxLessons: '1', windowDays: '2' },
    savingLimit: false,
    editingUserLimitId: null,
    userLimitForm: { maxLessons: '', windowDays: '' },
    createLibraryForm: {
      videoUrl: '',
      cefrLevel: 'A2',
      tags: 'Daily Conversation, Story',
      isPublic: true,
      creating: false,
    },
    editingLessonId: null,
    lessonEditForm: {
      title: '',
      cefrLevel: 'A2',
      tags: '',
      isPublic: true,
    },
  },
  lessonsList: [],
  studentQuota: null,
  lessonCache: { 0: DEMO_LESSON_DATA },
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
  loadingLessonTitle: '',
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
  grammarCourse: {
    activeLessonId: null,
    selectedStageId: 'ALL',
    searchQuery: '',
    langMode: 'bilingual', // 'bilingual' | 'en' | 'km'
    answers: {}, // { [exerciseIdx]: selectedOptionIdx }
    completedLessonIds: (() => {
      try {
        const saved = JSON.parse(localStorage.getItem('sk_grammar_completed') || '[]');
        return Array.isArray(saved) ? saved : [];
      } catch {
        return [];
      }
    })(),
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

    case 'APP_INIT_DONE':
      return {
        ...state,
        appInitializing: false,
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
          forgotPassword: {
            ...(state.auth.forgotPassword || initialState.auth.forgotPassword),
            isForgotMode: false,
            step: 'request',
          },
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

    case 'FORGOT_OPEN':
      return {
        ...state,
        auth: {
          ...state.auth,
          error: null,
          forgotPassword: {
            isForgotMode: true,
            step: 'request',
            email: state.auth.form.email || '',
            code: '',
            newPassword: '',
            issuedCode: '',
            successMessage: null,
          },
        },
      };

    case 'FORGOT_CLOSE':
      return {
        ...state,
        auth: {
          ...state.auth,
          error: null,
          loading: false,
          forgotPassword: {
            ...state.auth.forgotPassword,
            isForgotMode: false,
            step: 'request',
            issuedCode: '',
          },
        },
      };

    case 'FORGOT_UPDATE_FIELD':
      return {
        ...state,
        auth: {
          ...state.auth,
          error: null,
          forgotPassword: {
            ...state.auth.forgotPassword,
            [action.payload.field]: action.payload.value,
          },
        },
      };

    case 'FORGOT_CODE_SENT':
      return {
        ...state,
        auth: {
          ...state.auth,
          loading: false,
          error: null,
          forgotPassword: {
            ...state.auth.forgotPassword,
            step: 'reset',
            issuedCode: action.payload.resetCode || '',
            successMessage: action.payload.message,
          },
        },
      };

    case 'FORGOT_RESET_SUCCESS':
      return {
        ...state,
        auth: {
          ...state.auth,
          loading: false,
          error: null,
          isLoginMode: true,
          form: {
            ...state.auth.form,
            email: state.auth.forgotPassword.email,
            password: '',
          },
          forgotPassword: {
            isForgotMode: false,
            step: 'request',
            email: '',
            code: '',
            newPassword: '',
            issuedCode: '',
            successMessage: action.payload,
          },
        },
      };

    case 'AUTH_LOGOUT':
      return {
        ...initialState,
        appInitializing: false,
        googleClientId: state.googleClientId,
        library: {
          ...initialState.library,
          lessons: state.library.lessons || [],
        },
        auth: {
          ...initialState.auth,
          user: null,
          token: null,
          isLoginMode: true,
          form: { username: '', email: '', password: '', role: 'student' },
          loading: false,
          error: null,
          forgotPassword: { ...initialState.auth.forgotPassword },
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

    case 'ADMIN_LOAD_SUCCESS': {
      const sl = action.payload.studentLimit || state.adminDashboard.studentLimit;
      return {
        ...state,
        adminDashboard: {
          ...state.adminDashboard,
          loading: false,
          stats: action.payload.stats,
          users: action.payload.users || [],
          lessons: action.payload.lessons || [],
          studentLimit: sl,
          limitForm: {
            maxLessons: String(sl.maxLessons ?? 1),
            windowDays: String(sl.windowDays ?? 2),
          },
        },
      };
    }

    case 'ADMIN_UPDATE_LIMIT_FIELD':
      return {
        ...state,
        adminDashboard: {
          ...state.adminDashboard,
          limitForm: {
            ...state.adminDashboard.limitForm,
            [action.payload.field]: action.payload.value,
          },
        },
      };

    case 'ADMIN_LIMIT_SAVE_START':
      return {
        ...state,
        adminDashboard: {
          ...state.adminDashboard,
          savingLimit: true,
        },
      };

    case 'ADMIN_LIMIT_SAVE_DONE': {
      const sl = action.payload?.studentLimit || state.adminDashboard.studentLimit;
      return {
        ...state,
        adminDashboard: {
          ...state.adminDashboard,
          savingLimit: false,
          studentLimit: sl,
          limitForm: {
            maxLessons: String(sl.maxLessons ?? 1),
            windowDays: String(sl.windowDays ?? 2),
          },
          users: action.payload?.users || state.adminDashboard.users,
        },
      };
    }

    case 'ADMIN_OPEN_USER_LIMIT_EDIT':
      return {
        ...state,
        adminDashboard: {
          ...state.adminDashboard,
          editingUserLimitId: action.payload ? action.payload.id : null,
          userLimitForm: action.payload
            ? {
                maxLessons:
                  action.payload.custom_limit_max !== null &&
                  action.payload.custom_limit_max !== undefined
                    ? String(action.payload.custom_limit_max)
                    : '',
                windowDays:
                  action.payload.custom_limit_days !== null &&
                  action.payload.custom_limit_days !== undefined
                    ? String(action.payload.custom_limit_days)
                    : '',
              }
            : { maxLessons: '', windowDays: '' },
        },
      };

    case 'ADMIN_UPDATE_USER_LIMIT_FIELD':
      return {
        ...state,
        adminDashboard: {
          ...state.adminDashboard,
          userLimitForm: {
            ...state.adminDashboard.userLimitForm,
            [action.payload.field]: action.payload.value,
          },
        },
      };

    case 'ADMIN_USER_LIMIT_UPDATED': {
      const updatedUser = action.payload;
      return {
        ...state,
        adminDashboard: {
          ...state.adminDashboard,
          editingUserLimitId: null,
          users: state.adminDashboard.users.map((u) =>
            u.id === updatedUser.id
              ? {
                  ...u,
                  custom_limit_max: updatedUser.custom_limit_max,
                  custom_limit_days: updatedUser.custom_limit_days,
                  quota: updatedUser.quota,
                }
              : u
          ),
        },
      };
    }

    case 'ADMIN_LOAD_FAILURE':
      return {
        ...state,
        adminDashboard: {
          ...state.adminDashboard,
          loading: false,
        },
        notification: {
          type: 'error',
          message: action.payload || 'Failed to load admin overview.',
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
        library: {
          ...state.library,
          lessons: state.library.lessons.filter((l) => l.id !== deletedLessonId),
          history: state.library.history.filter((l) => l.id !== deletedLessonId),
        },
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

    case 'ADMIN_UPDATE_CREATE_LIBRARY_FORM':
      return {
        ...state,
        adminDashboard: {
          ...state.adminDashboard,
          createLibraryForm: {
            ...state.adminDashboard.createLibraryForm,
            [action.payload.field]: action.payload.value,
          },
        },
      };

    case 'ADMIN_CREATE_LIBRARY_START':
      return {
        ...state,
        adminDashboard: {
          ...state.adminDashboard,
          createLibraryForm: {
            ...state.adminDashboard.createLibraryForm,
            creating: true,
          },
        },
      };

    case 'ADMIN_CREATE_LIBRARY_DONE': {
      const createdLesson = action.payload?.lesson;
      const sentenceCount = action.payload?.sentences?.length || 0;
      const enriched = createdLesson
        ? {
            ...createdLesson,
            sentence_count: sentenceCount,
            vocab_count: action.payload?.vocabulary?.length || 0,
            grammar_count: action.payload?.grammar_points?.length || 0,
            creator_name: state.auth.user?.username || 'Admin',
            creator_email: state.auth.user?.email || '',
          }
        : null;

      return {
        ...state,
        library: {
          ...state.library,
          lessons:
            enriched && enriched.is_public
              ? [enriched, ...state.library.lessons.filter((l) => l.id !== enriched.id)]
              : state.library.lessons,
        },
        adminDashboard: {
          ...state.adminDashboard,
          createLibraryForm: enriched
            ? {
                ...state.adminDashboard.createLibraryForm,
                videoUrl: '',
                creating: false,
              }
            : {
                ...state.adminDashboard.createLibraryForm,
                creating: false,
              },
          lessons: enriched
            ? [enriched, ...state.adminDashboard.lessons.filter((l) => l.id !== enriched.id)]
            : state.adminDashboard.lessons,
        },
      };
    }

    case 'ADMIN_OPEN_LESSON_EDIT':
      return {
        ...state,
        adminDashboard: {
          ...state.adminDashboard,
          editingLessonId: action.payload ? action.payload.id : null,
          lessonEditForm: action.payload
            ? {
                title: action.payload.title || '',
                cefrLevel: action.payload.cefr_level || 'A2',
                tags: action.payload.tags || 'Daily Conversation',
                isPublic: Boolean(action.payload.is_public),
              }
            : { title: '', cefrLevel: 'A2', tags: '', isPublic: true },
        },
      };

    case 'ADMIN_UPDATE_LESSON_EDIT_FIELD':
      return {
        ...state,
        adminDashboard: {
          ...state.adminDashboard,
          lessonEditForm: {
            ...state.adminDashboard.lessonEditForm,
            [action.payload.field]: action.payload.value,
          },
        },
      };

    case 'ADMIN_LESSON_UPDATED': {
      const updated = action.payload;
      const existingAdminLesson = state.adminDashboard.lessons.find((l) => l.id === updated.id);
      const mergedLesson = { ...(existingAdminLesson || {}), ...updated };
      const nextLibraryLessons = updated.is_public
        ? [
            mergedLesson,
            ...state.library.lessons.filter((l) => l.id !== updated.id),
          ]
        : state.library.lessons.filter((l) => l.id !== updated.id);

      return {
        ...state,
        library: {
          ...state.library,
          lessons: nextLibraryLessons,
        },
        adminDashboard: {
          ...state.adminDashboard,
          editingLessonId: null,
          lessons: state.adminDashboard.lessons.map((l) =>
            l.id === updated.id ? { ...l, ...updated } : l
          ),
        },
      };
    }

    // --- ALL LESSONS LIBRARY & STUDY HISTORY ---
    case 'LIBRARY_LOAD_START':
      return {
        ...state,
        library: {
          ...state.library,
          loading: true,
        },
      };

    case 'LIBRARY_LOAD_SUCCESS':
      return {
        ...state,
        library: {
          ...state.library,
          loading: false,
          lessons: action.payload || [],
        },
      };

    case 'LIBRARY_LOAD_FAILURE':
      return {
        ...state,
        library: {
          ...state.library,
          loading: false,
        },
      };

    case 'LIBRARY_SET_HISTORY':
      return {
        ...state,
        library: {
          ...state.library,
          history: action.payload || [],
        },
      };

    case 'LIBRARY_SET_TAB':
      return {
        ...state,
        library: {
          ...state.library,
          activeTab: action.payload,
        },
      };

    case 'LIBRARY_SET_LEVEL':
      return {
        ...state,
        library: {
          ...state.library,
          selectedLevel: action.payload,
        },
      };

    case 'LIBRARY_SET_SEARCH':
      return {
        ...state,
        library: {
          ...state.library,
          searchQuery: action.payload,
        },
      };

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
        lessonsList: Array.isArray(action.payload)
          ? action.payload
          : action.payload.lessons || [],
        studentQuota:
          !Array.isArray(action.payload) && action.payload.quota
            ? action.payload.quota
            : state.studentQuota,
      };

    case 'SET_STUDENT_QUOTA':
      return {
        ...state,
        studentQuota: action.payload,
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
      const { lesson, sentences, vocabulary, grammar_points, quota } = action.payload;
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
        studentQuota: quota || state.studentQuota,
        lessonCache: {
          ...state.lessonCache,
          [lesson.id]: { lesson, sentences, vocabulary, grammar_points },
        },
        practiceMode: 'lesson',
        activeSentenceIndex: 1,
        visibleKhmerMap: autoKhmerMap,
        showAllKhmer: true,
        completedSentencesMap: {},
        sentenceSearchQuery: '',
        selectedWordPopup: null,
        vocabView: { ...state.vocabView, currentCardIndex: 0, isFlipped: false },
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
        loadingLessonTitle: typeof action.payload === 'string' ? action.payload : '',
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
        loadingLessonTitle: '',
        activeScreen: 'workspace',
        currentLesson: lesson,
        sentences: sentences || [],
        vocabulary: vocabulary || [],
        grammarPoints: grammar_points || [],
        lessonCache: {
          ...state.lessonCache,
          ...(lesson?.id !== undefined
            ? { [lesson.id]: { lesson, sentences, vocabulary, grammar_points } }
            : {}),
        },
        activeSentenceIndex: 1,
        visibleKhmerMap: autoKhmerMap,
        showAllKhmer: true,
        completedSentencesMap: {},
        sentenceSearchQuery: '',
        selectedWordPopup: null,
        vocabView: { ...state.vocabView, currentCardIndex: 0, isFlipped: false },
      };
    }

    case 'LOAD_LESSON_FAILURE':
      return {
        ...state,
        loadingLesson: false,
        loadingLessonTitle: '',
        notification: {
          type: 'error',
          message: action.payload || 'Could not load lesson.',
        },
      };

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

    // --- STEP-BY-STEP GRAMMAR COURSE ---
    case 'GRAMMAR_COURSE_OPEN_LESSON':
      return {
        ...state,
        grammarCourse: {
          ...state.grammarCourse,
          activeLessonId: action.payload,
          answers: {},
        },
      };

    case 'GRAMMAR_COURSE_BACK_TO_LIST':
      return {
        ...state,
        grammarCourse: {
          ...state.grammarCourse,
          activeLessonId: null,
          answers: {},
        },
      };

    case 'GRAMMAR_COURSE_SET_SEARCH':
      return {
        ...state,
        grammarCourse: {
          ...state.grammarCourse,
          searchQuery: action.payload,
        },
      };

    case 'GRAMMAR_COURSE_SET_STAGE':
      return {
        ...state,
        grammarCourse: {
          ...state.grammarCourse,
          selectedStageId: action.payload,
        },
      };

    case 'GRAMMAR_COURSE_SET_LANG':
      return {
        ...state,
        grammarCourse: {
          ...state.grammarCourse,
          langMode: action.payload,
        },
      };

    case 'GRAMMAR_COURSE_ANSWER_EXERCISE':
      return {
        ...state,
        grammarCourse: {
          ...state.grammarCourse,
          answers: {
            ...state.grammarCourse.answers,
            [action.payload.exerciseIndex]: action.payload.optionIndex,
          },
        },
      };

    case 'GRAMMAR_COURSE_RESET_EXERCISES':
      return {
        ...state,
        grammarCourse: {
          ...state.grammarCourse,
          answers: {},
        },
      };

    case 'GRAMMAR_COURSE_MARK_COMPLETE': {
      const lessonId = action.payload;
      const existing = state.grammarCourse.completedLessonIds || [];
      const updated = existing.includes(lessonId) ? existing : [...existing, lessonId];
      try {
        localStorage.setItem('sk_grammar_completed', JSON.stringify(updated));
      } catch {}
      return {
        ...state,
        grammarCourse: {
          ...state.grammarCourse,
          completedLessonIds: updated,
        },
      };
    }

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
