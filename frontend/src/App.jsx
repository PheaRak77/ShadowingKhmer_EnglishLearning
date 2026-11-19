import React, { useEffect, useRef, lazy, Suspense } from 'react';
import YouTube from 'react-youtube';
import {
  Headphones,
  Mic,
  BookOpen,
  GraduationCap,
  Volume2,
  Check,
  CheckCircle2,
  Loader2,
  LogOut,
  FolderOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Search,
  Sparkles,
  Play,
  Languages,
  BookmarkPlus,
  X,
  Youtube,
  Layers,
  LayoutDashboard,
  Crown,
  Repeat,
  Gauge,
  SkipBack,
  SkipForward,
  Menu,
  Trash2,
  Keyboard,
  Eye,
  EyeOff,
  Award,
  Lock,
  ArrowLeft,
  SlidersHorizontal,
  Timer,
  Plus,
} from 'lucide-react';
import { useAppContext, DEMO_LESSON_DATA } from './reducer/appReducer.js';
import AllLessonsLibrary from './components/AllLessonsLibrary.jsx';
import ShadowingControls from './components/ShadowingControls.jsx';
import ShadowingSpotlightCard from './components/ShadowingSpotlightCard.jsx';
import ShadowingRightPanel from './components/ShadowingRightPanel.jsx';
import ConfirmModal from './components/ConfirmModal.jsx';
import Footer from './components/Footer.jsx';

// Code-split heavy secondary views so first-page load is blazingly fast
const AuthForm = lazy(() => import('./components/AuthForm.jsx'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard.jsx'));
const GrammarCourse = lazy(() => import('./components/GrammarCourse.jsx'));

function GoogleIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.44a5.5 5.5 0 0 1-2.39 3.61v3h3.87c2.26-2.08 3.57-5.15 3.57-8.64Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.07 7.93-2.91l-3.87-3c-1.07.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.29v3.1A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.29 14.29A7.2 7.2 0 0 1 4.91 12c0-.79.14-1.56.38-2.29v-3.1H1.29A12 12 0 0 0 0 12c0 1.94.46 3.77 1.29 5.39l4-3.1Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.76c1.76 0 3.34.61 4.59 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.29 6.61l4 3.1c.94-2.84 3.59-4.95 6.71-4.95Z"
      />
    </svg>
  );
}

const API_BASE = import.meta.env.VITE_API_URL || '';

async function parseJsonSafe(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return {
      error: response.ok
        ? 'Unexpected response from server.'
        : 'Server is waking up or restarting. Please try again in a few seconds.',
    };
  }
}

function extractYouTubeVideoId(url) {
  if (!url) return null;
  const match = url
    .trim()
    .match(
      /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i
    );
  if (match?.[1]) return match[1];
  return /^[a-zA-Z0-9_-]{11}$/.test(url.trim()) ? url.trim() : null;
}

// Helper: Select the most natural human-sounding English voice on the user's device (US or UK)
const cachedVoicesByAccent = { US: null, UK: null };

function getBestHumanEnglishVoice(accent = 'US') {
  if (!('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  const preferredOrder =
    accent === 'UK'
      ? [
          'Microsoft Libby Online (Natural)',
          'Microsoft Sonia Online (Natural)',
          'Microsoft Ryan Online (Natural)',
          'Google UK English Female',
          'Google UK English Male',
          'Daniel',
          'Serena',
          'Martha',
        ]
      : [
          'Microsoft Aria Online (Natural)',
          'Microsoft Jenny Online (Natural)',
          'Microsoft Guy Online (Natural)',
          'Google US English',
          'Samantha',
          'Ava',
          'Allison',
          'Alex',
        ];

  for (const name of preferredOrder) {
    const match = voices.find((v) => v.name.includes(name));
    if (match) return match;
  }

  const targetLang = accent === 'UK' ? 'en-GB' : 'en-US';
  const naturalVoice = voices.find(
    (v) =>
      v.lang === targetLang &&
      (v.name.includes('Natural') || v.name.includes('Neural') || v.name.includes('Google'))
  );
  if (naturalVoice) return naturalVoice;

  return (
    voices.find((v) => v.lang === targetLang) ||
    voices.find((v) => v.lang.startsWith('en')) ||
    null
  );
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoicesByAccent.US = getBestHumanEnglishVoice('US');
    cachedVoicesByAccent.UK = getBestHumanEnglishVoice('UK');
  };
}

// Helper: Speak English text or word with natural human-like pacing & voice
function speakEnglish(text, rate = 0.95, accent = 'US') {
  if (!('speechSynthesis' in window) || !text) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const voice = cachedVoicesByAccent[accent] || getBestHumanEnglishVoice(accent);
  if (voice) {
    cachedVoicesByAccent[accent] = voice;
    utterance.voice = voice;
    utterance.lang = voice.lang;
  } else {
    utterance.lang = accent === 'UK' ? 'en-GB' : 'en-US';
  }
  utterance.rate = rate;
  utterance.pitch = 1.02;
  utterance.volume = 1.0;
  window.speechSynthesis.speak(utterance);
}

// Helper: Format seconds into MM:SS
function formatSessionClock(sec) {
  const s = Math.max(0, Math.floor(sec || 0));
  const mins = Math.floor(s / 60);
  const rem = s % 60;
  return `${mins < 10 ? '0' : ''}${mins}:${rem < 10 ? '0' : ''}${rem}`;
}

export default function App() {
  const { state, dispatch } = useAppContext();
  const playerRef = useRef(null);
  const syncTimerRef = useRef(null);
  const activeSentenceRef = useRef(null);
  const shadowingRef = useRef(null);

  const {
    auth,
    googleClientId,
    appInitializing,
    isAuthModalOpen,
    activeScreen,
    isMobileMenuOpen,
    library,
    lessonsList,
    studentQuota,
    lessonCache,
    myLessonsSearchQuery,
    isLessonsDrawerOpen,
    currentLesson,
    sentences,
    vocabulary,
    allSavedVocabulary,
    grammarPoints,
    videoUrlInput,
    creatingLesson,
    createProgress,
    loadingLesson,
    loadingLessonTitle,
    notification,
    practiceMode,
    activeSentenceIndex,
    visibleKhmerMap,
    showAllKhmer,
    completedSentencesMap,
    sentenceSearchQuery,
    playbackRate,
    isLoopingSentence,
    selectedWordPopup,
    dictation,
    vocabView,
    grammarFilter,
    playerSize,
    shadowing,
  } = state;

  shadowingRef.current = {
    sentences,
    activeSentenceIndex,
    shadowing,
    practiceMode,
    activeScreen,
    isAuthModalOpen,
  };

  // Pre-warm Render backend, fetch GOOGLE_CLIENT_ID & public "All Lessons" library on initial page load
  useEffect(() => {
    const bootStart = Date.now();
    let bootSettled = false;
    const finishBoot = () => {
      if (bootSettled) return;
      bootSettled = true;
      const elapsed = Date.now() - bootStart;
      const delay = Math.max(0, 480 - elapsed);
      setTimeout(() => dispatch({ type: 'APP_INIT_DONE' }), delay);
    };
    const maxSplashTimer = setTimeout(finishBoot, 1800);

    fetch(`${API_BASE}/api/health`).catch(() => {});
    fetch(`${API_BASE}/api/auth/google-client-id`)
      .then((res) => parseJsonSafe(res))
      .then((data) => {
        if (data.clientId) {
          dispatch({ type: 'SET_GOOGLE_CLIENT_ID', payload: data.clientId });
        }
      })
      .catch(() => {});

    dispatch({ type: 'LIBRARY_LOAD_START' });
    fetch(`${API_BASE}/api/lessons/library`)
      .then((res) => parseJsonSafe(res))
      .then((data) => {
        dispatch({ type: 'LIBRARY_LOAD_SUCCESS', payload: data.lessons || [] });
      })
      .catch(() => {
        dispatch({ type: 'LIBRARY_LOAD_FAILURE' });
      })
      .finally(() => {
        finishBoot();
      });

    // Restore guest study history if not logged in
    if (!auth.token) {
      try {
        const guestHist = JSON.parse(localStorage.getItem('sk_guest_history') || '[]');
        if (Array.isArray(guestHist)) {
          dispatch({ type: 'LIBRARY_SET_HISTORY', payload: guestHist });
        }
      } catch {}
    }

    return () => clearTimeout(maxSplashTimer);
  }, [dispatch, auth.token]);

  // Fetch user's profile, lessons, study history, and saved vocabulary when authenticated
  useEffect(() => {
    if (!auth.token) return;

    const authHeaders = {
      Authorization: `Bearer ${auth.token}`,
      'Content-Type': 'application/json',
    };

    async function fetchInitialData() {
      try {
        const [meRes, lessonsRes, vocabRes, historyRes] = await Promise.all([
          fetch(`${API_BASE}/api/auth/me`, { headers: authHeaders }),
          fetch(`${API_BASE}/api/lessons`, { headers: authHeaders }),
          fetch(`${API_BASE}/api/vocabulary`, { headers: authHeaders }),
          fetch(`${API_BASE}/api/lessons/history`, { headers: authHeaders }),
        ]);

        if (lessonsRes.status === 401 || lessonsRes.status === 403) {
          localStorage.removeItem('sk_user');
          localStorage.removeItem('sk_token');
          dispatch({ type: 'AUTH_LOGOUT' });
          return;
        }

        if (meRes.ok) {
          const meData = await parseJsonSafe(meRes);
          if (meData.user) {
            localStorage.setItem('sk_user', JSON.stringify(meData.user));
            dispatch({
              type: 'AUTH_UPDATE_USER',
              payload: { user: meData.user },
            });
          }
        }

        if (lessonsRes.ok) {
          const lessonsData = await parseJsonSafe(lessonsRes);
          const list = lessonsData.lessons || [];
          dispatch({
            type: 'SET_LESSONS_LIST',
            payload: { lessons: list, quota: lessonsData.quota || null },
          });
        }

        if (vocabRes.ok) {
          const vocabData = await parseJsonSafe(vocabRes);
          dispatch({
            type: 'SET_ALL_SAVED_VOCABULARY',
            payload: vocabData.vocabulary || [],
          });
        }

        if (historyRes.ok) {
          const historyData = await parseJsonSafe(historyRes);
          dispatch({
            type: 'LIBRARY_SET_HISTORY',
            payload: historyData.history || [],
          });
        }
      } catch (err) {
        console.warn('Could not load initial lessons from backend:', err.message);
      }
    }

    fetchInitialData();
  }, [auth.token]);

  // Smoothly auto-scroll the active sentence into view when playing or stepping
  useEffect(() => {
    if (practiceMode === 'lesson' && activeSentenceRef.current) {
      activeSentenceRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [activeSentenceIndex, practiceMode]);

  // Animate loading percentage smoothly while extracting & translating a YouTube lesson
  useEffect(() => {
    if (!creatingLesson) return;

    const timer = setInterval(() => {
      const next =
        createProgress < 35
          ? createProgress + 7
          : createProgress < 68
          ? createProgress + 4
          : createProgress < 88
          ? createProgress + 2
          : createProgress < 95
          ? createProgress + 1
          : 95;
      if (next !== createProgress) {
        dispatch({ type: 'CREATE_LESSON_PROGRESS', payload: next });
      }
    }, 550);

    return () => clearInterval(timer);
  }, [creatingLesson, createProgress, dispatch]);

  // Sync YouTube playback with Shadowing Engine (Repeat x1/x2/x3/∞, Pause-to-Speak, Simultaneous Play)
  useEffect(() => {
    syncTimerRef.current = setInterval(() => {
      if (
        !playerRef.current ||
        typeof playerRef.current.getCurrentTime !== 'function' ||
        typeof playerRef.current.getPlayerState !== 'function'
      ) {
        return;
      }

      const snap = shadowingRef.current;
      if (!snap || snap.activeScreen !== 'workspace') return;

      const playerState = playerRef.current.getPlayerState();
      const isPlayingNow = playerState === 1;
      const currentTime = playerRef.current.getCurrentTime() || 0;
      const duration =
        typeof playerRef.current.getDuration === 'function'
          ? playerRef.current.getDuration() || 0
          : 0;

      dispatch({
        type: 'SHADOWING_SET_PLAYBACK_STATUS',
        payload: { isPlaying: isPlayingNow, currentTime, duration },
      });

      if (!isPlayingNow || snap.shadowing.isWaitingToSpeak) return;

      const {
        sentences: curSentences,
        activeSentenceIndex: curIdx,
        shadowing: sh,
        practiceMode: curMode,
      } = snap;
      const currentActiveObj = curSentences.find((s) => s.sentence_index === curIdx);

      // Simultaneous shadowing or non-shadowing modes: smoothly follow video time
      if (
        curMode !== 'lesson' ||
        sh.playWhileSpeaking ||
        (sh.pauseMode === 'auto_continue' && sh.repeatCount === 1)
      ) {
        const matchedSentence = curSentences.find(
          (s) => currentTime >= s.start_time && currentTime <= s.end_time
        );
        if (matchedSentence && matchedSentence.sentence_index !== curIdx) {
          if (curIdx > 0) {
            dispatch({ type: 'MARK_SENTENCE_COMPLETED', payload: curIdx });
          }
          dispatch({
            type: 'SET_ACTIVE_SENTENCE',
            payload: matchedSentence.sentence_index,
          });
        }
        return;
      }

      if (!currentActiveObj) return;

      const effectiveEnd = (currentActiveObj.end_time || 0) + (sh.endPaddingSec || 0);
      if (currentTime >= effectiveEnd) {
        // Infinite loop or remaining repeats on this sentence
        if (sh.repeatCount === 0 || sh.currentRepeat < sh.repeatCount) {
          playerRef.current.seekTo(currentActiveObj.start_time, true);
          playerRef.current.playVideo();
          if (sh.repeatCount > 0) {
            dispatch({ type: 'SHADOWING_NEXT_REPEAT' });
          }
          return;
        }

        // Completed all repeats for this sentence
        dispatch({ type: 'MARK_SENTENCE_COMPLETED', payload: currentActiveObj.sentence_index });

        if (sh.pauseMode === 'pause_to_speak') {
          playerRef.current.pauseVideo();
          const sentLen = Math.max(
            1.2,
            (currentActiveObj.end_time || 0) - (currentActiveObj.start_time || 0)
          );
          const pauseSec = Number((sentLen * (1 + (sh.pauseExtraPercent || 0) / 100)).toFixed(1));
          dispatch({
            type: 'SHADOWING_START_SPEAK_PAUSE',
            payload: { total: pauseSec },
          });
        } else if (sh.pauseMode === 'manual_stop') {
          playerRef.current.pauseVideo();
          dispatch({ type: 'SHADOWING_UPDATE', payload: { currentRepeat: 1, isPlaying: false } });
        } else {
          // auto_continue after repeatCount > 1
          const nextSentence = curSentences.find((s) => s.sentence_index === curIdx + 1);
          if (nextSentence) {
            dispatch({ type: 'SET_ACTIVE_SENTENCE', payload: nextSentence.sentence_index });
            playerRef.current.seekTo(nextSentence.start_time, true);
            playerRef.current.playVideo();
          } else {
            playerRef.current.pauseVideo();
          }
        }
      }
    }, 150);

    return () => {
      if (syncTimerRef.current) clearInterval(syncTimerRef.current);
    };
  }, [dispatch]);

  // Countdown engine for "Pause to speak" speaking window
  useEffect(() => {
    if (!shadowing.isWaitingToSpeak) return;

    if (shadowing.speakCountdownRemaining <= 0.05) {
      dispatch({ type: 'SHADOWING_END_SPEAK_PAUSE' });
      const nextIdx = activeSentenceIndex + 1;
      const nextSentence = sentences.find((s) => s.sentence_index === nextIdx);
      if (nextSentence && playerRef.current && typeof playerRef.current.seekTo === 'function') {
        dispatch({ type: 'SET_ACTIVE_SENTENCE', payload: nextSentence.sentence_index });
        playerRef.current.seekTo(nextSentence.start_time, true);
        playerRef.current.playVideo();
      }
      return;
    }

    const countdownId = setTimeout(() => {
      dispatch({ type: 'SHADOWING_TICK_SPEAK_PAUSE' });
    }, 100);

    return () => clearTimeout(countdownId);
  }, [
    shadowing.isWaitingToSpeak,
    shadowing.speakCountdownRemaining,
    activeSentenceIndex,
    sentences,
    dispatch,
  ]);

  // Live Practice Session Timer (top-right MM:SS pill in workspace)
  useEffect(() => {
    if (activeScreen !== 'workspace' || !shadowing.isTimerRunning) return;
    const timerId = setInterval(() => {
      dispatch({ type: 'SHADOWING_TICK_TIMER' });
    }, 1000);
    return () => clearInterval(timerId);
  }, [activeScreen, shadowing.isTimerRunning, dispatch]);

  // Keyboard shortcuts for Shadowing mode (Space = Play/Pause, R = Replay, ←/→ = Prev/Next)
  useEffect(() => {
    const onKeyDown = (e) => {
      const snap = shadowingRef.current;
      if (
        !snap ||
        snap.activeScreen !== 'workspace' ||
        snap.practiceMode !== 'lesson' ||
        snap.isAuthModalOpen
      ) {
        return;
      }

      const tag = document.activeElement?.tagName;
      if (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        document.activeElement?.isContentEditable
      ) {
        return;
      }

      const { sentences: curSentences, activeSentenceIndex: curIdx, shadowing: sh } = snap;
      const activeObj = curSentences.find((s) => s.sentence_index === curIdx);

      if (e.code === 'Space') {
        e.preventDefault();
        if (sh.isWaitingToSpeak) {
          dispatch({ type: 'SHADOWING_END_SPEAK_PAUSE' });
          if (activeObj && playerRef.current?.seekTo) {
            playerRef.current.seekTo(activeObj.start_time, true);
            playerRef.current.playVideo();
          }
          return;
        }
        if (playerRef.current?.getPlayerState) {
          const st = playerRef.current.getPlayerState();
          if (st === 1) {
            playerRef.current.pauseVideo();
          } else {
            if (activeObj) {
              const ct = playerRef.current.getCurrentTime?.() || 0;
              if (ct < activeObj.start_time - 0.5 || ct >= activeObj.end_time) {
                playerRef.current.seekTo(activeObj.start_time, true);
              }
            }
            playerRef.current.playVideo();
          }
        }
      } else if (e.code === 'KeyR' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        if (activeObj && playerRef.current?.seekTo) {
          dispatch({ type: 'SHADOWING_END_SPEAK_PAUSE' });
          dispatch({ type: 'SHADOWING_UPDATE', payload: { currentRepeat: 1 } });
          playerRef.current.seekTo(activeObj.start_time, true);
          playerRef.current.playVideo();
        }
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        const prevObj = curSentences.find((s) => s.sentence_index === Math.max(1, curIdx - 1));
        if (prevObj) {
          dispatch({ type: 'SET_ACTIVE_SENTENCE', payload: prevObj.sentence_index });
          if (playerRef.current?.seekTo) {
            playerRef.current.seekTo(prevObj.start_time, true);
            playerRef.current.playVideo();
          }
        }
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        const nextObj = curSentences.find(
          (s) => s.sentence_index === Math.min(curSentences.length, curIdx + 1)
        );
        if (nextObj) {
          dispatch({ type: 'SET_ACTIVE_SENTENCE', payload: nextObj.sentence_index });
          if (playerRef.current?.seekTo) {
            playerRef.current.seekTo(nextObj.start_time, true);
            playerRef.current.playVideo();
          }
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [dispatch]);

  const loadLessonById = async (lessonId, tokenOverride, lessonTitle = '') => {
    playerRef.current = null;
    if (lessonId === 0) {
      dispatch({ type: 'LOAD_LESSON_START', payload: lessonTitle || DEMO_LESSON_DATA.lesson.title });
      setTimeout(() => {
        dispatch({
          type: 'LOAD_LESSON_SUCCESS',
          payload: DEMO_LESSON_DATA,
        });
      }, 220);
      return;
    }

    // Smooth micro-loading animation even when switching to a cached lesson
    if (lessonCache && lessonCache[lessonId]) {
      const cached = lessonCache[lessonId];
      dispatch({ type: 'LOAD_LESSON_START', payload: lessonTitle || cached.lesson?.title || '' });
      setTimeout(() => {
        dispatch({
          type: 'LOAD_LESSON_SUCCESS',
          payload: cached,
        });
        dispatch({ type: 'TOGGLE_LESSONS_DRAWER', payload: false });
      }, 220);
      return;
    }

    dispatch({ type: 'LOAD_LESSON_START', payload: lessonTitle });
    try {
      const activeToken = tokenOverride || auth.token;
      const endpoint = activeToken
        ? `${API_BASE}/api/lessons/${lessonId}`
        : `${API_BASE}/api/lessons/public/${lessonId}`;
      const res = await fetch(endpoint, {
        headers: activeToken ? { Authorization: `Bearer ${activeToken}` } : {},
      });
      const data = await parseJsonSafe(res);
      if (res.ok) {
        dispatch({ type: 'LOAD_LESSON_SUCCESS', payload: data });
        // Refresh study history silently
        if (activeToken) {
          fetch(`${API_BASE}/api/lessons/history`, {
            headers: { Authorization: `Bearer ${activeToken}` },
          })
            .then((r) => (r.ok ? parseJsonSafe(r) : null))
            .then((hist) => {
              if (hist?.history) {
                dispatch({ type: 'LIBRARY_SET_HISTORY', payload: hist.history });
              }
            })
            .catch(() => {});
        } else if (data.lesson) {
          try {
            const prev = JSON.parse(localStorage.getItem('sk_guest_history') || '[]');
            const entry = {
              ...data.lesson,
              sentence_count: data.sentences?.length || 0,
              practiced_sentences: 0,
              total_sentences: data.sentences?.length || 0,
              last_studied_at: new Date().toISOString(),
            };
            const next = [entry, ...prev.filter((item) => item.id !== entry.id)].slice(0, 50);
            localStorage.setItem('sk_guest_history', JSON.stringify(next));
            dispatch({ type: 'LIBRARY_SET_HISTORY', payload: next });
          } catch {}
        }
      } else {
        dispatch({
          type: 'LOAD_LESSON_FAILURE',
          payload: data.error || 'Could not load lesson.',
        });
      }
    } catch (err) {
      dispatch({
        type: 'LOAD_LESSON_FAILURE',
        payload: 'Network error while loading lesson.',
      });
    }
  };

  const prefetchedIdsRef = useRef(new Set());

  const handlePrefetchLibraryLesson = (lessonItem) => {
    const id = lessonItem?.id;
    if (!id || lessonCache?.[id] || prefetchedIdsRef.current.has(id)) return;
    prefetchedIdsRef.current.add(id);

    const endpoint = auth.token
      ? `${API_BASE}/api/lessons/${id}`
      : `${API_BASE}/api/lessons/public/${id}`;
    fetch(endpoint, {
      headers: auth.token ? { Authorization: `Bearer ${auth.token}` } : {},
    })
      .then((res) => (res.ok ? parseJsonSafe(res) : null))
      .then((data) => {
        if (data?.lesson?.id) {
          dispatch({ type: 'PREFETCH_LESSON_CACHE', payload: data });
        }
      })
      .catch(() => {
        prefetchedIdsRef.current.delete(id);
      });
  };

  const handleOpenLibraryLesson = (lessonItem) => {
    if (!lessonItem?.id) return;
    loadLessonById(lessonItem.id, null, lessonItem.title || '');
  };

  // Open custom branded modal to confirm removing a lesson from "My Lessons"
  const handleDeleteOwnLesson = (e, lessonItem) => {
    e.stopPropagation();
    dispatch({
      type: 'OPEN_CONFIRM_DIALOG',
      payload: {
        variant: 'danger',
        title: 'Remove Lesson from My Lessons?',
        message: 'This personal lesson will be permanently removed from your saved list.',
        khmerMessage: 'មេរៀនផ្ទាល់ខ្លួននេះនឹងត្រូវបានលុបចេញពីបញ្ជី My Lessons របស់អ្នក។',
        targetLabel: lessonItem.title,
        confirmText: 'Remove Lesson',
        cancelText: 'Cancel',
        actionType: 'delete_own_lesson',
        payload: { id: lessonItem.id, title: lessonItem.title },
      },
    });
  };

  // Unified handler for all Custom Confirmation Dialog actions (Admin & Student)
  const handleConfirmDialogAction = async (dialog) => {
    if (!dialog?.actionType) return;
    dispatch({ type: 'CONFIRM_DIALOG_LOADING', payload: true });

    try {
      if (dialog.actionType === 'delete_admin_lesson') {
        const { id, title } = dialog.payload || {};
        const res = await fetch(`${API_BASE}/api/admin/lessons/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        if (res.ok) {
          dispatch({ type: 'ADMIN_LESSON_DELETED', payload: id });
          dispatch({
            type: 'SET_NOTIFICATION',
            payload: { type: 'success', message: `Deleted "${title}" permanently.` },
          });
        } else {
          const data = await parseJsonSafe(res);
          dispatch({
            type: 'SET_NOTIFICATION',
            payload: { type: 'error', message: data.error || 'Failed to delete lesson.' },
          });
        }
      } else if (dialog.actionType === 'delete_admin_user') {
        const { id, username } = dialog.payload || {};
        const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        if (res.ok) {
          dispatch({ type: 'ADMIN_USER_DELETED', payload: id });
          dispatch({
            type: 'SET_NOTIFICATION',
            payload: { type: 'success', message: `Deleted user "${username}".` },
          });
        } else {
          const data = await parseJsonSafe(res);
          dispatch({
            type: 'SET_NOTIFICATION',
            payload: { type: 'error', message: data.error || 'Failed to delete user.' },
          });
        }
      } else if (dialog.actionType === 'delete_own_lesson') {
        const { id, title } = dialog.payload || {};
        const res = await fetch(`${API_BASE}/api/lessons/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        if (res.ok) {
          const remaining = lessonsList.filter((l) => l.id !== id);
          dispatch({
            type: 'USER_LESSON_DELETED',
            payload: { deletedId: id, title },
          });
          if (currentLesson?.id === id) {
            if (remaining.length > 0) {
              loadLessonById(remaining[0].id, null, remaining[0].title);
            } else {
              loadLessonById(0, null, DEMO_LESSON_DATA.lesson.title);
            }
          }
        } else {
          const data = await parseJsonSafe(res);
          dispatch({
            type: 'SET_NOTIFICATION',
            payload: { type: 'error', message: data.error || 'Could not remove lesson.' },
          });
        }
      }
    } catch {
      dispatch({
        type: 'SET_NOTIFICATION',
        payload: { type: 'error', message: 'Network error. Please try again.' },
      });
    } finally {
      dispatch({ type: 'CLOSE_CONFIRM_DIALOG' });
    }
  };

  // Connect Real Google Account via Google OAuth 2.0 Popup
  const handleConnectRealGoogle = () => {
    if (!googleClientId) {
      dispatch({
        type: 'SET_NOTIFICATION',
        payload: {
          type: 'error',
          message:
            'To connect a real Google account, add your GOOGLE_CLIENT_ID to backend/.env (from Google Cloud Console).',
        },
      });
      return;
    }

    if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
      dispatch({
        type: 'SET_NOTIFICATION',
        payload: {
          type: 'error',
          message: 'Google Identity Services SDK is still loading. Please try again.',
        },
      });
      return;
    }

    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: googleClientId,
      scope: 'openid email profile',
      prompt: 'select_account',
      callback: async (tokenResponse) => {
        if (tokenResponse.error || !tokenResponse.access_token) return;

        try {
          const res = await fetch(`${API_BASE}/api/auth/google/connect`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${auth.token}`,
            },
            body: JSON.stringify({
              accessToken: tokenResponse.access_token,
            }),
          });
          const data = await parseJsonSafe(res);
          if (res.ok && data.user) {
            localStorage.setItem('sk_user', JSON.stringify(data.user));
            if (data.token) localStorage.setItem('sk_token', data.token);
            dispatch({
              type: 'AUTH_UPDATE_USER',
              payload: { user: data.user, token: data.token },
            });
            dispatch({
              type: 'SET_NOTIFICATION',
              payload: {
                type: 'success',
                message: 'Your Google account has been verified and connected!',
              },
            });
          } else {
            dispatch({
              type: 'SET_NOTIFICATION',
              payload: {
                type: 'error',
                message: data.error || 'Could not link Google account.',
              },
            });
          }
        } catch (err) {
          dispatch({
            type: 'SET_NOTIFICATION',
            payload: {
              type: 'error',
              message: 'Server error while verifying Google account.',
            },
          });
        }
      },
    });

    tokenClient.requestAccessToken();
  };

  const handleCreateLesson = async (e) => {
    e.preventDefault();
    if (isGuest) {
      dispatch({ type: 'OPEN_AUTH_MODAL', payload: 'register' });
      return;
    }
    if (!videoUrlInput.trim() || creatingLesson) return;

    dispatch({ type: 'CREATE_LESSON_START' });

    try {
      let prefetchedVtt;
      let prefetchedTitle;
      const ytId = extractYouTubeVideoId(videoUrlInput);

      // On deployed Vercel frontend, try fast Edge caption relay (~0.3s) so Render never hits cloud IP blocks
      if (ytId && API_BASE) {
        try {
          const edgeRes = await fetch(`/api/yt-captions?videoId=${encodeURIComponent(ytId)}`, {
            signal:
              typeof AbortSignal !== 'undefined' && AbortSignal.timeout
                ? AbortSignal.timeout(4500)
                : undefined,
          });
          if (edgeRes.ok) {
            const edgeData = await parseJsonSafe(edgeRes);
            if (edgeData?.vtt) {
              prefetchedVtt = edgeData.vtt;
              prefetchedTitle = edgeData.title || undefined;
            }
          }
        } catch {
          // Silently fall back to backend extraction pipeline
        }
      }

      const res = await fetch(`${API_BASE}/api/lessons/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          videoUrl: videoUrlInput.trim(),
          prefetchedVtt,
          prefetchedTitle,
        }),
      });

      const data = await parseJsonSafe(res);

      if (!res.ok) {
        if (data.quota) {
          dispatch({ type: 'SET_STUDENT_QUOTA', payload: data.quota });
        }
        dispatch({
          type: 'CREATE_LESSON_FAILURE',
          payload: data.error || 'Failed to create lesson from this YouTube URL.',
        });
        return;
      }

      dispatch({
        type: 'CREATE_LESSON_SUCCESS',
        payload: data,
      });

      const [vocabRes, histRes] = await Promise.all([
        fetch(`${API_BASE}/api/vocabulary`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        }),
        fetch(`${API_BASE}/api/lessons/history`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        }),
      ]);
      if (vocabRes.ok) {
        const vocabData = await parseJsonSafe(vocabRes);
        dispatch({
          type: 'SET_ALL_SAVED_VOCABULARY',
          payload: vocabData.vocabulary || [],
        });
      }
      if (histRes.ok) {
        const histData = await parseJsonSafe(histRes);
        dispatch({
          type: 'LIBRARY_SET_HISTORY',
          payload: histData.history || [],
        });
      }
    } catch (err) {
      dispatch({
        type: 'CREATE_LESSON_FAILURE',
        payload: 'Server connection error while creating lesson. Make sure backend is running.',
      });
    }
  };

  const handleSentenceClick = (sentence) => {
    if (!sentence) return;
    dispatch({ type: 'SET_ACTIVE_SENTENCE', payload: sentence.sentence_index });
    dispatch({ type: 'SHADOWING_UPDATE', payload: { openMenu: null } });
    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
      playerRef.current.seekTo(sentence.start_time, true);
      playerRef.current.playVideo();
    }
  };

  const handleReplayActiveSentence = () => {
    const activeObj =
      sentences.find((s) => s.sentence_index === activeSentenceIndex) || sentences[0];
    if (!activeObj) return;
    dispatch({ type: 'SHADOWING_END_SPEAK_PAUSE' });
    dispatch({ type: 'SHADOWING_UPDATE', payload: { currentRepeat: 1, openMenu: null } });
    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
      playerRef.current.seekTo(activeObj.start_time, true);
      playerRef.current.playVideo();
    }
  };

  const handleTogglePlayPause = () => {
    const activeObj =
      sentences.find((s) => s.sentence_index === activeSentenceIndex) || sentences[0];
    dispatch({ type: 'SHADOWING_UPDATE', payload: { openMenu: null } });

    if (shadowing.isWaitingToSpeak) {
      handleReplayActiveSentence();
      return;
    }

    if (!playerRef.current || typeof playerRef.current.getPlayerState !== 'function') {
      return;
    }

    const playerState = playerRef.current.getPlayerState();
    if (playerState === 1) {
      playerRef.current.pauseVideo();
      dispatch({ type: 'SHADOWING_UPDATE', payload: { isPlaying: false } });
    } else {
      if (activeObj && typeof playerRef.current.getCurrentTime === 'function') {
        const ct = playerRef.current.getCurrentTime() || 0;
        const effectiveEnd = (activeObj.end_time || 0) + (shadowing.endPaddingSec || 0);
        if (ct < activeObj.start_time - 0.5 || ct >= effectiveEnd) {
          playerRef.current.seekTo(activeObj.start_time, true);
        }
      }
      playerRef.current.playVideo();
      dispatch({ type: 'SHADOWING_UPDATE', payload: { isPlaying: true } });
    }
  };

  const handleSkipSpeakPause = () => {
    dispatch({ type: 'SHADOWING_END_SPEAK_PAUSE' });
    const nextIdx = Math.min(sentences.length, activeSentenceIndex + 1);
    const nextSentence = sentences.find((s) => s.sentence_index === nextIdx);
    if (nextSentence) {
      handleSentenceClick(nextSentence);
    }
  };

  const handleChangePlaybackRate = (rate) => {
    dispatch({ type: 'SET_PLAYBACK_RATE', payload: rate });
    if (playerRef.current && typeof playerRef.current.setPlaybackRate === 'function') {
      playerRef.current.setPlaybackRate(rate);
    }
  };

  const handleJumpRelativeSentence = (delta) => {
    const nextIdx = Math.min(
      sentences.length,
      Math.max(1, activeSentenceIndex + delta)
    );
    const targetSentence = sentences.find((s) => s.sentence_index === nextIdx);
    if (targetSentence) {
      handleSentenceClick(targetSentence);
    }
  };

  const handleWordClick = (e, rawWord, sentence) => {
    e.stopPropagation();
    const cleanWord = rawWord.replace(/[^a-zA-Z0-9'-]/g, '').trim();
    if (!cleanWord) return;

    speakEnglish(cleanWord, playbackRate, shadowing.accent);

    const existingMatch = vocabulary.find(
      (v) => v.word.toLowerCase() === cleanWord.toLowerCase()
    );

    dispatch({
      type: 'OPEN_WORD_POPUP',
      payload: {
        word: rawWord,
        cleanWord,
        sentenceIndex: sentence.sentence_index,
        contextSentence: sentence.english_text,
        existingMatch: existingMatch || null,
      },
    });
  };

  const handleSaveWordToVocabulary = async () => {
    if (isGuest) {
      dispatch({ type: 'OPEN_AUTH_MODAL', payload: 'register' });
      return;
    }
    if (!selectedWordPopup || selectedWordPopup.saving) return;
    dispatch({ type: 'SAVE_WORD_START' });

    const { cleanWord, contextSentence, existingMatch } = selectedWordPopup;

    try {
      const res = await fetch(`${API_BASE}/api/vocabulary/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          lesson_id: currentLesson?.id && currentLesson.id !== 0 ? currentLesson.id : null,
          word: cleanWord,
          ipa: existingMatch?.ipa || '',
          part_of_speech: existingMatch?.part_of_speech || '',
          khmer_meaning: existingMatch?.khmer_meaning || '',
          example_sentence: contextSentence,
          context_sentence: contextSentence,
        }),
      });

      const data = await parseJsonSafe(res);
      if (res.ok && data.word) {
        dispatch({ type: 'SAVE_WORD_SUCCESS', payload: data.word });
      } else {
        dispatch({
          type: 'SET_NOTIFICATION',
          payload: {
            type: 'error',
            message: data.error || 'Could not save word to vocabulary.',
          },
        });
      }
    } catch (err) {
      dispatch({
        type: 'SET_NOTIFICATION',
        payload: {
          type: 'error',
          message: 'Network error while saving vocabulary word.',
        },
      });
    }
  };

  const handleCheckDictation = (e) => {
    e.preventDefault();
    const targetSentence = sentences.find((s) => s.sentence_index === activeSentenceIndex);
    if (!targetSentence) return;

    const normalize = (str) =>
      str
        .toLowerCase()
        .replace(/[^a-z0-9'\s]/g, '')
        .split(/\s+/)
        .filter(Boolean);

    const expectedWords = normalize(targetSentence.english_text);
    const userWords = normalize(dictation.userInput);

    if (expectedWords.length === 0) return;

    let matches = 0;
    expectedWords.forEach((w, idx) => {
      if (userWords[idx] === w) matches++;
    });

    const accuracy = Math.round((matches / expectedWords.length) * 100);
    dispatch({ type: 'DICTATION_CHECK', payload: accuracy });
    if (accuracy >= 80) {
      dispatch({ type: 'TOGGLE_COMPLETE_SENTENCE', payload: targetSentence.sentence_index });
    }
  };

  const handleSelectPracticeMode = (mode) => {
    if (isGuest && mode !== 'lesson') {
      dispatch({ type: 'OPEN_AUTH_MODAL', payload: 'login' });
      return;
    }
    dispatch({ type: 'SET_ACTIVE_SCREEN', payload: 'workspace' });
    dispatch({ type: 'SET_PRACTICE_MODE', payload: mode });
  };

  const handleLogout = () => {
    localStorage.removeItem('sk_user');
    localStorage.removeItem('sk_token');
    dispatch({ type: 'AUTH_LOGOUT' });
  };

  const isGuest = !auth.user || !auth.token;

  const displayedVocabList =
    vocabView.tab === 'saved' && allSavedVocabulary.length > 0
      ? allSavedVocabulary
      : vocabulary;

  const safeCardIndex =
    displayedVocabList.length > 0
      ? Math.min(Math.max(0, vocabView.currentCardIndex), displayedVocabList.length - 1)
      : 0;
  const activeFlashcard = displayedVocabList[safeCardIndex] || null;

  const grammarStages = [
    'ALL',
    ...Array.from(new Set(grammarPoints.map((g) => g.stage || 'Stage 1: The basics'))),
  ];

  const filteredGrammarPoints = grammarPoints.filter((g) => {
    const matchesStage =
      grammarFilter.selectedStage === 'ALL' || g.stage === grammarFilter.selectedStage;
    const q = grammarFilter.searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      g.title.toLowerCase().includes(q) ||
      g.explanation_en.toLowerCase().includes(q) ||
      g.explanation_km.toLowerCase().includes(q) ||
      g.example_en.toLowerCase().includes(q);
    return matchesStage && matchesSearch;
  });

  const sq = sentenceSearchQuery.trim().toLowerCase();
  const filteredSentences = sentences.filter(
    (s) =>
      !sq ||
      s.english_text.toLowerCase().includes(sq) ||
      (s.khmer_text && s.khmer_text.toLowerCase().includes(sq))
  );

  const lq = (myLessonsSearchQuery || '').trim().toLowerCase();
  const filteredMyLessons = lessonsList.filter(
    (item) =>
      !lq ||
      item.title.toLowerCase().includes(lq) ||
      (item.video_id && item.video_id.toLowerCase().includes(lq))
  );

  const completedCount = Object.values(completedSentencesMap).filter(Boolean).length;
  const progressPercent =
    sentences.length > 0 ? Math.round((completedCount / sentences.length) * 100) : 0;

  // Sync student's studied sentence count to PostgreSQL / localStorage history
  useEffect(() => {
    if (!currentLesson?.id || currentLesson.id === 0 || completedCount === 0) return;

    if (auth.token) {
      fetch(`${API_BASE}/api/lessons/${currentLesson.id}/study`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          practicedSentences: completedCount,
          totalSentences: sentences.length,
        }),
      })
        .then(() =>
          fetch(`${API_BASE}/api/lessons/history`, {
            headers: { Authorization: `Bearer ${auth.token}` },
          })
        )
        .then((r) => (r.ok ? parseJsonSafe(r) : null))
        .then((hist) => {
          if (hist?.history) {
            dispatch({ type: 'LIBRARY_SET_HISTORY', payload: hist.history });
          }
        })
        .catch(() => {});
    } else {
      try {
        const prev = JSON.parse(localStorage.getItem('sk_guest_history') || '[]');
        const next = prev.map((item) =>
          item.id === currentLesson.id
            ? {
                ...item,
                practiced_sentences: Math.max(item.practiced_sentences || 0, completedCount),
                total_sentences: sentences.length,
                last_studied_at: new Date().toISOString(),
              }
            : item
        );
        localStorage.setItem('sk_guest_history', JSON.stringify(next));
        dispatch({ type: 'LIBRARY_SET_HISTORY', payload: next });
      } catch {}
    }
  }, [completedCount, currentLesson?.id, sentences.length, auth.token, dispatch]);

  const isAdmin = !isGuest && auth.user?.role === 'admin';

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 flex flex-col">
      {/* =========================================================
          INITIAL APP ENTRY SPLASH (SHADOWINGKHMER FROSTED CARD)
      ========================================================= */}
      {appInitializing && (
        <div className="fixed inset-0 z-[70] bg-[#FAF9F6]/95 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/90 shadow-2xl p-7 text-center space-y-4 animate-fade-in-up">
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
              <span className="absolute inset-0 rounded-2xl bg-blue-500/20 animate-ping" />
              <div className="relative w-14 h-14 rounded-2xl bg-[#2563EB] flex items-center justify-center text-white shadow-lg shadow-blue-600/25">
                <Headphones className="w-7 h-7" />
              </div>
            </div>

            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                Shadowing<span className="text-[#2563EB]">Khmer</span>
              </h1>
              <p className="text-xs font-medium text-slate-500">
                English Speaking &amp; Khmer Translation
              </p>
              <p className="text-xs text-slate-500 khmer-text pt-0.5">
                កំពុងរៀបចំមេរៀនភាសាអង់គ្លេស-ខ្មែរសម្រាប់អ្នក...
              </p>
            </div>

            {/* Animated 5-Bar Audio Wave */}
            <div className="flex items-center justify-center gap-1.5 h-6">
              {[0, 0.12, 0.24, 0.36, 0.48].map((delay, i) => (
                <span
                  key={i}
                  style={{ animationDelay: `${delay}s` }}
                  className="w-1.5 h-5 rounded-full bg-[#2563EB] animate-wave-bar"
                />
              ))}
            </div>

            <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-blue-400 via-[#2563EB] to-indigo-500 animate-indeterminate" />
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          LESSON SWITCH FROSTED-GLASS LOADING OVERLAY
      ========================================================= */}
      {loadingLesson && !appInitializing && (
        <div className="fixed inset-0 z-[60] bg-slate-900/20 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/90 shadow-2xl p-6 text-center space-y-4 animate-fade-in-up">
            <div className="relative w-14 h-14 mx-auto flex items-center justify-center">
              <span className="absolute inset-0 rounded-2xl bg-blue-500/20 animate-ping" />
              <div className="relative w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-[#2563EB] flex items-center justify-center">
                <Headphones className="w-6 h-6" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-extrabold text-slate-900">Opening Lesson...</div>
              {loadingLessonTitle && (
                <div className="text-xs font-semibold text-[#2563EB] line-clamp-2 px-2">
                  {loadingLessonTitle}
                </div>
              )}
              <p className="text-xs text-slate-500 khmer-text">
                កំពុងផ្ទុកវីដេអូ និងការបកប្រែភាសាខ្មែរ...
              </p>
            </div>

            {/* Animated 5-Bar Soundwave + Indeterminate Bar */}
            <div className="flex items-center justify-center gap-1.5 h-6">
              {[0, 0.12, 0.24, 0.36, 0.48].map((delay, i) => (
                <span
                  key={i}
                  style={{ animationDelay: `${delay}s` }}
                  className="w-1.5 h-5 rounded-full bg-[#2563EB] animate-wave-bar"
                />
              ))}
            </div>

            <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-blue-400 via-[#2563EB] to-indigo-500 animate-indeterminate" />
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          APPLE-STYLE ULTRA-CLEAN NAVIGATION BAR
      ========================================================= */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl backdrop-saturate-150 border-b border-slate-200/70">
        {(loadingLesson || library?.loading) && (
          <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-blue-100 overflow-hidden">
            <div className="h-full w-1/2 bg-gradient-to-r from-blue-400 via-[#2563EB] to-indigo-500 animate-indeterminate" />
          </div>
        )}
        <div className="max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Minimalist Brand + Tablet Triggers (Hidden on tiny phones so header never clips) */}
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => dispatch({ type: 'SET_ACTIVE_SCREEN', payload: 'library' })}
              className="flex items-center gap-2 cursor-pointer group whitespace-nowrap shrink-0"
            >
              <div className="w-7 h-7 rounded-lg bg-[#2563EB] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                <Headphones className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm sm:text-[15px] tracking-tight text-slate-900">
                Shadowing<span className="text-[#2563EB]">Khmer</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => dispatch({ type: 'SET_ACTIVE_SCREEN', payload: 'library' })}
              className={`hidden sm:inline-flex lg:hidden items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                activeScreen === 'library'
                  ? 'bg-[#2563EB] text-white'
                  : 'bg-slate-100 hover:bg-slate-200/70 text-slate-700'
              }`}
            >
              <span>All Lessons</span>
            </button>

            <button
              type="button"
              onClick={() =>
                isGuest
                  ? dispatch({ type: 'OPEN_AUTH_MODAL', payload: 'login' })
                  : dispatch({ type: 'TOGGLE_LESSONS_DRAWER' })
              }
              className="hidden sm:inline-flex lg:hidden items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200/70 text-slate-700 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
            >
              <FolderOpen className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>My ({lessonsList.length})</span>
              {isGuest ? (
                <Lock className="w-3 h-3 text-slate-400" />
              ) : (
                <ChevronDown className="w-3 h-3 text-slate-400" />
              )}
            </button>
          </div>

          {/* Center: Clean Airy Apple.com-Style Navigation Links (Desktop >= lg) */}
          <nav className="hidden lg:flex items-center gap-6">
            <button
              type="button"
              onClick={() => dispatch({ type: 'SET_ACTIVE_SCREEN', payload: 'library' })}
              className={`relative py-4 text-[13px] transition-colors cursor-pointer whitespace-nowrap ${
                activeScreen === 'library'
                  ? 'font-semibold text-slate-900'
                  : 'font-medium text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>All Lessons</span>
              {activeScreen === 'library' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[#2563EB]" />
              )}
            </button>

            {[
              { id: 'lesson', label: 'Shadowing' },
              { id: 'dictation', label: 'Dictation' },
              { id: 'vocabulary', label: 'Vocabulary' },
            ].map((navItem) => {
              const isActive =
                activeScreen === 'workspace' && practiceMode === navItem.id;
              const isLocked = isGuest && navItem.id !== 'lesson';
              return (
                <button
                  key={navItem.id}
                  type="button"
                  onClick={() => handleSelectPracticeMode(navItem.id)}
                  className={`relative py-4 inline-flex items-center gap-1 text-[13px] transition-colors cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'font-semibold text-slate-900'
                      : 'font-medium text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <span>{navItem.label}</span>
                  {isLocked && <Lock className="w-3 h-3 text-slate-400" />}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[#2563EB]" />
                  )}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => dispatch({ type: 'SET_ACTIVE_SCREEN', payload: 'grammarCourse' })}
              className={`relative py-4 text-[13px] transition-colors cursor-pointer whitespace-nowrap ${
                activeScreen === 'grammarCourse'
                  ? 'font-semibold text-slate-900'
                  : 'font-medium text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>Grammar</span>
              {activeScreen === 'grammarCourse' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[#2563EB]" />
              )}
            </button>

            <button
              type="button"
              onClick={() =>
                isGuest
                  ? dispatch({ type: 'OPEN_AUTH_MODAL', payload: 'login' })
                  : dispatch({ type: 'TOGGLE_LESSONS_DRAWER' })
              }
              className={`relative py-4 inline-flex items-center gap-1.5 text-[13px] transition-colors cursor-pointer whitespace-nowrap ${
                isLessonsDrawerOpen
                  ? 'font-semibold text-[#2563EB]'
                  : 'font-medium text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>My Lessons ({lessonsList.length})</span>
              {isGuest ? (
                <Lock className="w-3 h-3 text-slate-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            {isAdmin && (
              <button
                type="button"
                onClick={() =>
                  dispatch({
                    type: 'SET_ACTIVE_SCREEN',
                    payload: activeScreen === 'admin' ? 'workspace' : 'admin',
                  })
                }
                className={`relative py-4 inline-flex items-center gap-1.5 text-[13px] transition-colors cursor-pointer whitespace-nowrap ${
                  activeScreen === 'admin'
                    ? 'font-semibold text-[#2563EB]'
                    : 'font-medium text-slate-500 hover:text-slate-900'
                }`}
              >
                <span>Admin</span>
                {activeScreen === 'admin' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[#2563EB]" />
                )}
              </button>
            )}
          </nav>

          {/* My Lessons Floating Glass Dropdown (Shared for Mobile & Desktop) */}
          {isLessonsDrawerOpen && (
            <div className="fixed sm:absolute left-3 right-3 sm:left-auto sm:right-6 top-16 sm:top-14 sm:w-96 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-2xl p-3.5 z-50">
                  <div className="flex items-center justify-between px-1 pb-2.5 border-b border-slate-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      My Saved Lessons ({lessonsList.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => dispatch({ type: 'TOGGLE_LESSONS_DRAWER', payload: false })}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Search Input inside My Lessons */}
                  <div className="relative my-2.5">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search your saved lessons..."
                      value={myLessonsSearchQuery}
                      onChange={(e) =>
                        dispatch({ type: 'SET_MY_LESSONS_SEARCH', payload: e.target.value })
                      }
                      className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#2563EB]"
                    />
                    {myLessonsSearchQuery && (
                      <button
                        type="button"
                        onClick={() =>
                          dispatch({ type: 'SET_MY_LESSONS_SEARCH', payload: '' })
                        }
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto smooth-scroll space-y-1.5 pr-0.5">
                    {filteredMyLessons.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => loadLessonById(item.id, null, item.title)}
                        className={`group w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between gap-2 transition-all cursor-pointer ${
                          currentLesson?.id === item.id
                            ? 'bg-blue-50 text-[#2563EB] font-semibold border border-blue-200'
                            : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                        }`}
                      >
                        <div className="truncate flex-1 min-w-0">
                          <div className="text-xs sm:text-sm truncate">{item.title}</div>
                          <div className="text-[11px] text-slate-400">
                            Video ID: {item.video_id}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {item.sentence_count !== undefined && (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                              {item.sentence_count} sents
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={(e) => handleDeleteOwnLesson(e, item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Remove this lesson"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {filteredMyLessons.length === 0 && (
                      <div className="py-6 text-center text-xs text-slate-400">
                        {lessonsList.length === 0
                          ? 'No saved lessons yet. Paste a YouTube link above to create one!'
                          : 'No lessons match your search.'}
                      </div>
                    )}
                  </div>
                </div>
              )}

          {/* Right: Clean Single-Line Account Controls (Desktop & Tablet) */}
          <div className="hidden md:flex items-center gap-2.5 shrink-0">
            {isGuest ? (
              <>
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'OPEN_AUTH_MODAL', payload: 'login' })}
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'OPEN_AUTH_MODAL', payload: 'register' })}
                  className="px-4 py-1.5 rounded-full bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer whitespace-nowrap"
                >
                  Create Free Account
                </button>
              </>
            ) : (
              <>
                {auth.user.google_id ? (
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50/80 border border-emerald-200/80 text-emerald-700 text-xs font-medium whitespace-nowrap"
                    title={`Verified Google Account: ${auth.user.email}`}
                  >
                    <GoogleIcon className="w-3.5 h-3.5" />
                    <span className="hidden xl:inline">Google</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleConnectRealGoogle}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors cursor-pointer whitespace-nowrap"
                    title="Connect your Google account"
                  >
                    <GoogleIcon className="w-3.5 h-3.5" />
                    <span>Connect Google</span>
                  </button>
                )}

                <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100/90 border border-slate-200/70 text-xs font-medium text-slate-700 whitespace-nowrap">
                  {auth.user.avatar_url ? (
                    <img
                      src={auth.user.avatar_url}
                      alt={auth.user.username}
                      className="w-4 h-4 rounded-full object-cover"
                    />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  )}
                  <span className="max-w-[110px] truncate">{auth.user.username}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      isAdmin ? 'bg-[#2563EB] text-white' : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {isAdmin ? 'Admin' : 'Student'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-1.5 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {/* Mobile Compact Actions + Hamburger Menu (< md) */}
          <div className="flex md:hidden items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() =>
                isGuest
                  ? dispatch({ type: 'OPEN_AUTH_MODAL', payload: 'login' })
                  : dispatch({ type: 'TOGGLE_LESSONS_DRAWER' })
              }
              className="sm:hidden inline-flex items-center gap-1 px-2 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/70 text-slate-700 text-xs font-semibold cursor-pointer"
              title="My Saved Lessons"
            >
              <FolderOpen className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>{lessonsList.length}</span>
            </button>

            {isAdmin && (
              <button
                type="button"
                onClick={() =>
                  dispatch({
                    type: 'SET_ACTIVE_SCREEN',
                    payload: activeScreen === 'admin' ? 'library' : 'admin',
                  })
                }
                className={`p-2 rounded-xl border text-xs font-semibold cursor-pointer ${
                  activeScreen === 'admin'
                    ? 'bg-[#2563EB] text-white border-[#2563EB]'
                    : 'bg-blue-50 text-[#2563EB] border-blue-200'
                }`}
                title="Admin Dashboard"
              >
                <LayoutDashboard className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => dispatch({ type: 'TOGGLE_MOBILE_MENU' })}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 cursor-pointer"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer (< md) */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-3.5 shadow-lg">
            {/* Mobile Page & Practice Navigation Grid */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => dispatch({ type: 'SET_ACTIVE_SCREEN', payload: 'library' })}
                className={`py-2 px-3 rounded-xl text-xs font-bold text-left transition-colors cursor-pointer ${
                  activeScreen === 'library'
                    ? 'bg-[#2563EB] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Lessons
              </button>
              {[
                { id: 'lesson', label: 'Shadowing' },
                { id: 'dictation', label: 'Dictation' },
                { id: 'vocabulary', label: 'Vocabulary' },
              ].map((navItem) => {
                const isActive = activeScreen === 'workspace' && practiceMode === navItem.id;
                const isLocked = isGuest && navItem.id !== 'lesson';
                return (
                  <button
                    key={navItem.id}
                    type="button"
                    onClick={() => {
                      dispatch({ type: 'TOGGLE_MOBILE_MENU', payload: false });
                      handleSelectPracticeMode(navItem.id);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#2563EB] text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>{navItem.label}</span>
                    {isLocked && <Lock className="w-3 h-3 opacity-60" />}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => dispatch({ type: 'SET_ACTIVE_SCREEN', payload: 'grammarCourse' })}
                className={`py-2 px-3 rounded-xl text-xs font-bold text-left transition-colors cursor-pointer ${
                  activeScreen === 'grammarCourse'
                    ? 'bg-[#2563EB] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Grammar
              </button>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'SET_ACTIVE_SCREEN', payload: 'admin' })}
                  className={`py-2 px-3 rounded-xl text-xs font-bold text-left transition-colors cursor-pointer ${
                    activeScreen === 'admin'
                      ? 'bg-[#2563EB] text-white shadow-sm'
                      : 'bg-blue-50 text-[#2563EB] border border-blue-200'
                  }`}
                >
                  Admin Dashboard
                </button>
              )}
            </div>

            <div className="border-t border-slate-100 pt-3">
            {isGuest ? (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    dispatch({ type: 'TOGGLE_MOBILE_MENU', payload: false });
                    dispatch({ type: 'OPEN_AUTH_MODAL', payload: 'login' });
                  }}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    dispatch({ type: 'TOGGLE_MOBILE_MENU', payload: false });
                    dispatch({ type: 'OPEN_AUTH_MODAL', payload: 'register' });
                  }}
                  className="py-2.5 px-3 rounded-xl bg-[#2563EB] text-white text-xs font-semibold"
                >
                  Create Account
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {auth.user.avatar_url ? (
                      <img
                        src={auth.user.avatar_url}
                        alt={auth.user.username}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-[#2563EB] font-bold text-xs flex items-center justify-center">
                        {auth.user.username?.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-bold text-slate-900">{auth.user.username}</div>
                      <div className="text-xs text-slate-500">{auth.user.email}</div>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                      isAdmin ? 'bg-[#2563EB] text-white' : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {isAdmin ? 'Admin' : 'Student'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  {auth.user.google_id ? (
                    <div className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                      <GoogleIcon className="w-3.5 h-3.5" />
                      <span>Google Verified</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleConnectRealGoogle}
                      className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700"
                    >
                      <GoogleIcon className="w-3.5 h-3.5" />
                      <span>Connect Google</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-semibold"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            )}
            </div>
          </div>
        )}
      </header>

      {/* =========================================================
          MAIN CONTENT AREA (RESPONSIVE CONTAINER)
      ========================================================= */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-5 sm:space-y-6">
        {notification && activeScreen !== 'workspace' && (
          <div
            className={`px-4 py-3 rounded-2xl text-xs sm:text-sm font-medium flex items-center justify-between gap-3 shadow-sm ${
              notification.type === 'error'
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : notification.type === 'info'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            <span>{notification.message}</span>
            <button
              type="button"
              onClick={() => dispatch({ type: 'SET_NOTIFICATION', payload: null })}
              className="text-current opacity-70 hover:opacity-100 shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div
          key={`${activeScreen}-${currentLesson?.id || 0}`}
          className="animate-fade-in-up space-y-5 sm:space-y-6"
        >
          {activeScreen === 'admin' && isAdmin ? (
            <Suspense
              fallback={
                <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500">
                  <Loader2 className="w-7 h-7 animate-spin text-[#2563EB]" />
                  <span className="text-xs font-semibold">Loading Admin Dashboard...</span>
                </div>
              }
            >
              <AdminDashboard
                onOpenLesson={(lessonId, title) => loadLessonById(lessonId, null, title || '')}
              />
            </Suspense>
          ) : activeScreen === 'library' ? (
            <AllLessonsLibrary
              onOpenLesson={handleOpenLibraryLesson}
              onPrefetchLesson={handlePrefetchLibraryLesson}
            />
          ) : activeScreen === 'grammarCourse' ? (
            <Suspense
              fallback={
                <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500">
                  <Loader2 className="w-7 h-7 animate-spin text-[#2563EB]" />
                  <span className="text-xs font-semibold">Loading Grammar Course...</span>
                </div>
              }
            >
              <GrammarCourse onSpeak={(text) => speakEnglish(text, playbackRate, shadowing.accent)} />
            </Suspense>
          ) : (
            <>
            {/* =========================================================
                IMAGE-1 STYLE WORKSPACE SUB-HEADER BAR
                (Back + Lesson Title | Mode Segmented Pill | Live Timer)
            ========================================================= */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
              {/* Left: Back Arrow + Paste YouTube Link Toggle + Lesson Title */}
              <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial sm:max-w-[36%]">
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'SET_ACTIVE_SCREEN', payload: 'library' })}
                  className="w-8 h-8 rounded-full bg-white border border-slate-200/90 hover:border-blue-300 hover:bg-blue-50 text-slate-600 hover:text-[#2563EB] flex items-center justify-center shadow-2xs transition-all cursor-pointer shrink-0"
                  title="Back to All Lessons"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    dispatch({
                      type: 'SHADOWING_UPDATE',
                      payload: { showYoutubeCreator: !shadowing.showYoutubeCreator },
                    })
                  }
                  className={`h-8 px-2.5 rounded-full border text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer shrink-0 ${
                    shadowing.showYoutubeCreator || creatingLesson
                      ? 'bg-rose-50 border-rose-200 text-rose-600'
                      : 'bg-white border-slate-200/90 hover:border-blue-300 text-slate-600 hover:text-[#2563EB]'
                  }`}
                  title="Create a lesson from a YouTube URL"
                >
                  <Youtube className="w-3.5 h-3.5 text-rose-500" />
                  <Plus className="w-3 h-3 -ml-0.5" />
                </button>

                <h1
                  className="text-xs sm:text-sm font-bold text-slate-800 truncate"
                  title={currentLesson?.title || 'English Video Lesson'}
                >
                  {currentLesson?.title || 'English Video Lesson'}
                </h1>
              </div>

              {/* Center: Segmented Practice Mode Pill Bar (Matches Image 1) */}
              <div className="order-3 sm:order-2 w-full sm:w-auto flex justify-center">
                <div className="inline-flex items-center gap-0.5 p-1 rounded-full bg-white border border-slate-200/90 shadow-xs overflow-x-auto max-w-full">
                  {[
                    { id: 'lesson', label: 'Shadowing' },
                    { id: 'dictation', label: 'Dictation' },
                    { id: 'vocabulary', label: 'Vocabulary' },
                    { id: 'grammar', label: 'Grammar' },
                  ].map((tab) => {
                    const isActive = practiceMode === tab.id;
                    const isLocked = isGuest && tab.id !== 'lesson';
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => handleSelectPracticeMode(tab.id)}
                        className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1 transition-all whitespace-nowrap cursor-pointer ${
                          isActive
                            ? 'bg-[#2563EB] text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                        }`}
                      >
                        <span>{tab.label}</span>
                        {isLocked && <Lock className="w-2.5 h-2.5 opacity-60" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right: Live Session Timer Pill (Matches Image 1 "⏱ 02:55") */}
              <div className="order-2 sm:order-3 flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'SHADOWING_TOGGLE_TIMER' })}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border text-xs font-bold tabular-nums shadow-2xs transition-all cursor-pointer ${
                    shadowing.isTimerRunning
                      ? 'border-slate-200/90 text-slate-800 hover:border-blue-300'
                      : 'border-amber-200 bg-amber-50/70 text-amber-800'
                  }`}
                  title={
                    shadowing.isTimerRunning
                      ? 'Practice timer running (click to pause)'
                      : 'Practice timer paused (click to resume)'
                  }
                >
                  <Timer
                    className={`w-3.5 h-3.5 ${
                      shadowing.isTimerRunning ? 'text-[#2563EB]' : 'text-amber-600'
                    }`}
                  />
                  <span>{formatSessionClock(shadowing.sessionSeconds)}</span>
                </button>
              </div>
            </div>

            {/* Collapsible YouTube Link Creator Bar (Opens on "+ YouTube" click or while creating) */}
            {(shadowing.showYoutubeCreator || creatingLesson) && (
              <div className="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-4 shadow-sm animate-fade-in-up">
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Youtube className="w-4 h-4 text-rose-500" />
                    <span>Create Custom Lesson from YouTube Link (up to 4 min)</span>
                  </span>
                  {!creatingLesson && (
                    <button
                      type="button"
                      onClick={() =>
                        dispatch({
                          type: 'SHADOWING_UPDATE',
                          payload: { showYoutubeCreator: false },
                        })
                      }
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <form
                  onSubmit={handleCreateLesson}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3"
                >
                  <div className="relative flex-1">
                    <Youtube className="w-5 h-5 text-rose-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Paste any YouTube video or Short URL (supports up to 4-minute videos)..."
                      value={videoUrlInput}
                      onChange={(e) =>
                        dispatch({ type: 'SET_VIDEO_URL_INPUT', payload: e.target.value })
                      }
                      disabled={creatingLesson}
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-[#2563EB] transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!isGuest && (creatingLesson || !videoUrlInput.trim())}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 disabled:opacity-70 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all cursor-pointer shrink-0"
                  >
                    {creatingLesson ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processing {createProgress}%</span>
                      </>
                    ) : isGuest ? (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Sign in to Create</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Create Lesson</span>
                      </>
                    )}
                  </button>
                </form>

                {!isGuest && auth.user?.role === 'student' && studentQuota && !studentQuota.isUnlimited && (
                  <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-xs px-1">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold border ${
                        studentQuota.remaining > 0
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      YouTube Link Quota: {studentQuota.remaining} / {studentQuota.maxLessons} remaining
                      <span className="font-normal text-slate-500">
                        ({studentQuota.maxLessons} video{studentQuota.maxLessons === 1 ? '' : 's'} per{' '}
                        {studentQuota.windowDays} day{studentQuota.windowDays === 1 ? '' : 's'})
                      </span>
                    </span>
                    {studentQuota.remaining === 0 && studentQuota.nextResetAt && (
                      <span className="text-[11px] font-medium text-amber-700">
                        Next link available:{' '}
                        {new Date(studentQuota.nextResetAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                )}

                {/* Animated 3-Step Loading Percentage Card */}
                {creatingLesson && (
                  <div className="mt-4 p-4 sm:p-5 rounded-2xl border border-blue-200/80 bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/70 shadow-sm space-y-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#2563EB]"></span>
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-slate-800">
                          {createProgress < 35
                            ? 'Step 1/3: Connecting to YouTube video...'
                            : createProgress < 75
                            ? 'Step 2/3: Processing captions & Khmer translation...'
                            : 'Step 3/3: Preparing your interactive lesson...'}
                        </span>
                      </div>
                      <span className="text-base sm:text-lg font-extrabold text-[#2563EB] tabular-nums">
                        {createProgress}%
                      </span>
                    </div>

                    <div className="relative w-full h-3 bg-slate-200/70 rounded-full overflow-hidden">
                      <div
                        className="relative h-full bg-gradient-to-r from-[#2563EB] via-indigo-500 to-purple-500 rounded-full transition-all duration-500 ease-out overflow-hidden"
                        style={{ width: `${createProgress}%` }}
                      >
                        <div className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-0.5">
                      {[
                        { label: '1. Video', min: 0, doneAt: 35 },
                        { label: '2. Processing', min: 35, doneAt: 75 },
                        { label: '3. Prepare Lesson', min: 75, doneAt: 100 },
                      ].map((step) => {
                        const done = createProgress >= step.doneAt;
                        const active = createProgress >= step.min && !done;
                        return (
                          <div
                            key={step.label}
                            className={`px-2.5 sm:px-3 py-2 rounded-xl text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all duration-300 ${
                              done
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm'
                                : active
                                ? 'bg-blue-50 text-[#2563EB] border-blue-300 shadow-sm scale-[1.02]'
                                : 'bg-white/80 text-slate-400 border-slate-200/70'
                            }`}
                          >
                            {done ? (
                              <Check className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                            ) : active ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0 text-[#2563EB]" />
                            ) : (
                              <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0" />
                            )}
                            <span className="truncate">{step.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Slim Dismissible Notification Toast */}
            {notification && (
              <div
                className={`px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-medium flex items-center justify-between gap-3 shadow-2xs ${
                  notification.type === 'error'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : notification.type === 'info'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                <span>{notification.message}</span>
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'SET_NOTIFICATION', payload: null })}
                  className="text-current opacity-70 hover:opacity-100 shrink-0 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* =========================================================
                RESPONSIVE SPLIT-SCREEN WORKSPACE (IMAGE 1 DESIGN)
            ========================================================= */}
            {(() => {
              const activeSentenceObj =
                sentences.find((s) => s.sentence_index === activeSentenceIndex) || sentences[0];
              const playerSizeLabel =
                playerSize === 'compact'
                  ? 'Compact'
                  : playerSize === 'large'
                  ? 'Large'
                  : 'Medium';

              return (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-start">
                  {/* LEFT COLUMN: Black Rounded Video Player + Transport Controls + Active Spotlight Card */}
                  <div className="lg:col-span-7 space-y-3.5">
                    {/* Video Player Container (Matches Image 1 black rounded frame + Medium dropdown) */}
                    <div className="relative bg-black rounded-2xl overflow-hidden shadow-md border border-slate-900/10">
                      {/* Top-Right Size Dropdown Pill ("⚙ Medium ⌄") */}
                      <div className="hidden sm:block absolute top-3 right-3 z-20">
                        <button
                          type="button"
                          onClick={() =>
                            dispatch({
                              type: 'SHADOWING_UPDATE',
                              payload: {
                                openMenu: shadowing.openMenu === 'size' ? null : 'size',
                              },
                            })
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/92 hover:bg-white text-slate-800 text-xs font-semibold shadow-sm transition-all cursor-pointer"
                        >
                          <SlidersHorizontal className="w-3 h-3 text-slate-500" />
                          <span>{playerSizeLabel}</span>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                        </button>

                        {shadowing.openMenu === 'size' && (
                          <div className="absolute right-0 top-9 w-32 rounded-xl bg-white border border-slate-200 shadow-xl p-1.5 space-y-0.5">
                            {[
                              { id: 'compact', label: 'Compact' },
                              { id: 'medium', label: 'Medium' },
                              { id: 'large', label: 'Large' },
                            ].map((sz) => (
                              <button
                                key={sz.id}
                                type="button"
                                onClick={() =>
                                  dispatch({ type: 'SET_PLAYER_SIZE', payload: sz.id })
                                }
                                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                                  playerSize === sz.id
                                    ? 'bg-blue-50 text-[#2563EB]'
                                    : 'text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                {sz.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div
                        className={`w-full transition-all duration-300 ${
                          playerSize === 'compact'
                            ? 'aspect-video sm:h-[235px]'
                            : playerSize === 'large'
                            ? 'aspect-video'
                            : 'aspect-video sm:h-[305px] lg:h-[325px]'
                        }`}
                      >
                        <YouTube
                          key={`${currentLesson?.id || 0}-${currentLesson?.video_id || 'eIho2S0ZahI'}`}
                          videoId={currentLesson?.video_id || 'eIho2S0ZahI'}
                          className="w-full h-full"
                          iframeClassName="w-full h-full"
                          opts={{
                            width: '100%',
                            height: '100%',
                            playerVars: {
                              autoplay: 0,
                              modestbranding: 1,
                              rel: 0,
                              playsinline: 1,
                            },
                          }}
                          onReady={(event) => {
                            playerRef.current = event.target;
                            if (playbackRate !== 1 && typeof event.target.setPlaybackRate === 'function') {
                              event.target.setPlaybackRate(playbackRate);
                            }
                          }}
                        />
                      </div>
                    </div>

                    {/* Floating Shadowing Transport & Pacing Control Card (Exact Image 1 design) */}
                    <ShadowingControls
                      activeSentence={activeSentenceObj}
                      onPrev={() => handleJumpRelativeSentence(-1)}
                      onReplay={handleReplayActiveSentence}
                      onTogglePlay={handleTogglePlayPause}
                      onNext={() => handleJumpRelativeSentence(1)}
                      onSkipPause={handleSkipSpeakPause}
                      onChangePlaybackRate={handleChangePlaybackRate}
                    />

                    {/* Active Sentence Hero Spotlight Card (IPA, Intonation, Stress, Khmer, Play-while-speaking) */}
                    {practiceMode === 'lesson' && activeSentenceObj && (
                      <ShadowingSpotlightCard
                        activeSentence={activeSentenceObj}
                        onWordClick={handleWordClick}
                        onSpeakSentence={(text) =>
                          speakEnglish(text, playbackRate, shadowing.accent)
                        }
                      />
                    )}

                    {/* Compact Lesson Progress Footer Pill on Non-Shadowing Modes */}
                    {practiceMode !== 'lesson' && (
                      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="text-xs font-bold text-slate-700">
                            Practiced:{' '}
                            <span className="text-[#2563EB]">{completedCount}</span> /{' '}
                            {sentences.length}
                          </div>
                          <div className="w-28 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#2563EB] transition-all duration-300"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                          <span className="text-xs font-extrabold text-[#2563EB]">
                            {progressPercent}%
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSelectPracticeMode('lesson')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#2563EB] text-xs font-semibold cursor-pointer"
                        >
                          <Mic className="w-3.5 h-3.5" />
                          <span>Back to Shadowing Spotlight</span>
                        </button>
                      </div>
                    )}
                  </div>

              {/* RIGHT COLUMN: Dynamic Practice Workspace */}
              <div className="lg:col-span-5">
                {practiceMode === 'dictation' && (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-4">
                    {(() => {
                      const activeSentence =
                        sentences.find((s) => s.sentence_index === activeSentenceIndex) ||
                        sentences[0];
                      if (!activeSentence) return null;

                      const normalize = (str) =>
                        str
                          .toLowerCase()
                          .replace(/[^a-z0-9'\s]/g, '')
                          .split(/\s+/)
                          .filter(Boolean);

                      const expectedWords = activeSentence.english_text.split(/\s+/);
                      const userWordsClean = normalize(dictation.userInput);

                      return (
                        <>
                          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                            <div>
                              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                                <Keyboard className="w-5 h-5 text-amber-500" />
                                <span>Dictation Practice</span>
                              </h2>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Listen to Sentence #{activeSentence.sentence_index} and type what
                                you hear.
                              </p>
                            </div>
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              {activeSentence.sentence_index} / {sentences.length}
                            </span>
                          </div>

                          {/* Audio Listen Controls */}
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleSentenceClick(activeSentence)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold shadow-sm cursor-pointer"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>Play Video Clip</span>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                speakEnglish(activeSentence.english_text, playbackRate)
                              }
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold cursor-pointer"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>Slow Voice ({playbackRate}x)</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => dispatch({ type: 'DICTATION_TOGGLE_HINT' })}
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-600 cursor-pointer ml-auto"
                            >
                              {dictation.showHint ? (
                                <>
                                  <EyeOff className="w-3.5 h-3.5" />
                                  <span>Hide Khmer</span>
                                </>
                              ) : (
                                <>
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Khmer Hint</span>
                                </>
                              )}
                            </button>
                          </div>

                          {dictation.showHint && (
                            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs sm:text-sm text-slate-800 khmer-text">
                              <span className="font-bold text-amber-800 mr-1.5">ខ្មែរ:</span>
                              {activeSentence.khmer_text}
                            </div>
                          )}

                          {/* Typing Form */}
                          <form onSubmit={handleCheckDictation} className="space-y-3">
                            <textarea
                              rows={3}
                              placeholder="Type the English sentence you hear..."
                              value={dictation.userInput}
                              onChange={(e) =>
                                dispatch({
                                  type: 'DICTATION_UPDATE_INPUT',
                                  payload: e.target.value,
                                })
                              }
                              className="w-full p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                            />

                            <div className="flex items-center justify-between gap-2">
                              <button
                                type="button"
                                onClick={() => dispatch({ type: 'DICTATION_RESET' })}
                                className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                              >
                                Clear
                              </button>

                              <button
                                type="submit"
                                disabled={!dictation.userInput.trim()}
                                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-sm cursor-pointer"
                              >
                                <Check className="w-4 h-4" />
                                <span>Check Answer</span>
                              </button>
                            </div>
                          </form>

                          {/* Instant Word-by-Word Accuracy Feedback */}
                          {dictation.isChecked && (
                            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/80 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700">
                                  <Award className="w-4 h-4 text-amber-500" />
                                  <span>Accuracy Score:</span>
                                </span>
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                                    dictation.accuracy >= 80
                                      ? 'bg-emerald-100 text-emerald-700'
                                      : 'bg-amber-100 text-amber-700'
                                  }`}
                                >
                                  {dictation.accuracy}%
                                </span>
                              </div>

                              <div className="flex flex-wrap gap-1.5 text-sm leading-relaxed">
                                {expectedWords.map((rawWord, idx) => {
                                  const cleanExpected = rawWord
                                    .toLowerCase()
                                    .replace(/[^a-z0-9']/g, '');
                                  const isCorrect = userWordsClean[idx] === cleanExpected;
                                  return (
                                    <span
                                      key={idx}
                                      className={`px-1.5 py-0.5 rounded-md font-semibold ${
                                        isCorrect
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : 'bg-rose-100 text-rose-700'
                                      }`}
                                    >
                                      {rawWord}
                                    </span>
                                  );
                                })}
                              </div>

                              <div className="pt-2 border-t border-slate-200/70 text-xs text-slate-600 khmer-text">
                                {activeSentence.khmer_text}
                              </div>
                            </div>
                          )}

                          {/* Next / Prev Sentence Navigation */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                            <button
                              type="button"
                              disabled={activeSentenceIndex <= 1}
                              onClick={() => handleJumpRelativeSentence(-1)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                            >
                              <ChevronLeft className="w-4 h-4" /> Prev Sentence
                            </button>
                            <button
                              type="button"
                              disabled={activeSentenceIndex >= sentences.length}
                              onClick={() => handleJumpRelativeSentence(1)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#2563EB] text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-40 cursor-pointer"
                            >
                              Next Sentence <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}

                {practiceMode === 'lesson' && (
                  <ShadowingRightPanel
                    filteredSentences={filteredSentences}
                    activeSentenceRef={activeSentenceRef}
                    isGuest={isGuest}
                    onSentenceClick={handleSentenceClick}
                    onWordClick={handleWordClick}
                    onSpeakText={(text) => speakEnglish(text, playbackRate, shadowing.accent)}
                    onSaveWord={handleSaveWordToVocabulary}
                    onSelectPracticeMode={handleSelectPracticeMode}
                    onOpenLibraryLesson={handleOpenLibraryLesson}
                  />
                )}

                {practiceMode === 'vocabulary' && (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-4 sm:space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                          <span>📚 My Vocabulary</span>
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Save words while you practice, then review them daily with flashcards.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => dispatch({ type: 'TOGGLE_FLASHCARD_MODE' })}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          vocabView.isFlashcardMode
                            ? 'bg-[#2563EB] text-white shadow-sm'
                            : 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100'
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>
                          {vocabView.isFlashcardMode ? 'Exit Flashcards' : 'Flashcard Practice'}
                        </span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                      <button
                        type="button"
                        onClick={() => dispatch({ type: 'SET_VOCAB_TAB', payload: 'lesson' })}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          vocabView.tab === 'lesson'
                            ? 'border-[#2563EB] bg-blue-50/40'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="text-xs font-bold text-slate-800">Lesson Vocabulary</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Key words from this video
                        </div>
                        <span className="mt-2 inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-[#2563EB]">
                          {vocabulary.length} words
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => dispatch({ type: 'SET_VOCAB_TAB', payload: 'saved' })}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          vocabView.tab === 'saved'
                            ? 'border-[#2563EB] bg-blue-50/40'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="text-xs font-bold text-slate-800">My Saved Deck</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          All words saved across lessons
                        </div>
                        <span className="mt-2 inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-700">
                          {allSavedVocabulary.length} saved
                        </span>
                      </button>
                    </div>

                    {vocabView.isFlashcardMode && activeFlashcard ? (
                      <div className="space-y-4">
                        <div
                          onClick={() => dispatch({ type: 'FLIP_FLASHCARD' })}
                          className="min-h-[230px] sm:min-h-[250px] p-5 sm:p-6 rounded-2xl border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/40 flex flex-col items-center justify-center text-center cursor-pointer select-none transition-all hover:border-[#2563EB]"
                        >
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                            Card {safeCardIndex + 1} of {displayedVocabList.length} •{' '}
                            {vocabView.isFlipped ? 'Khmer Meaning (Back)' : 'English Word (Front)'}
                          </span>

                          {!vocabView.isFlipped ? (
                            <>
                              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                                {activeFlashcard.word}
                              </h3>
                              <div className="flex items-center gap-2 mt-2">
                                {activeFlashcard.ipa && (
                                  <span className="text-xs font-mono text-slate-500">
                                    {activeFlashcard.ipa}
                                  </span>
                                )}
                                {activeFlashcard.part_of_speech && (
                                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                                    {activeFlashcard.part_of_speech}
                                  </span>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  speakEnglish(activeFlashcard.word, playbackRate);
                                }}
                                className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#2563EB] text-white text-xs font-semibold shadow-sm hover:bg-blue-700"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                                <span>Listen (en-US)</span>
                              </button>
                            </>
                          ) : (
                            <>
                              <div className="text-xl sm:text-2xl font-bold text-[#2563EB] khmer-text">
                                {activeFlashcard.khmer_meaning}
                              </div>
                              {activeFlashcard.example_sentence && (
                                <p className="mt-3 text-xs sm:text-sm text-slate-600 italic max-w-md">
                                  "{activeFlashcard.example_sentence}"
                                </p>
                              )}
                            </>
                          )}

                          <span className="mt-5 inline-flex items-center gap-1 text-xs text-slate-400">
                            <RotateCw className="w-3.5 h-3.5" /> Tap card to flip
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <button
                            type="button"
                            disabled={safeCardIndex === 0}
                            onClick={() =>
                              dispatch({
                                type: 'CHANGE_FLASHCARD_INDEX',
                                payload: Math.max(0, safeCardIndex - 1),
                              })
                            }
                            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                          >
                            <ChevronLeft className="w-4 h-4" /> Prev
                          </button>

                          <button
                            type="button"
                            onClick={() => dispatch({ type: 'FLIP_FLASHCARD' })}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 cursor-pointer"
                          >
                            <RotateCw className="w-3.5 h-3.5" /> Flip
                          </button>

                          <button
                            type="button"
                            disabled={safeCardIndex >= displayedVocabList.length - 1}
                            onClick={() =>
                              dispatch({
                                type: 'CHANGE_FLASHCARD_INDEX',
                                payload: Math.min(
                                  displayedVocabList.length - 1,
                                  safeCardIndex + 1
                                ),
                              })
                            }
                            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                          >
                            Next <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[460px] overflow-y-auto smooth-scroll pr-1">
                        {displayedVocabList.map((item, idx) => (
                          <div
                            key={item.id || idx}
                            className="p-3.5 sm:p-4 rounded-2xl border border-slate-200 bg-slate-50/40 hover:bg-white hover:shadow-sm transition-all"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-bold text-sm sm:text-base text-slate-900">
                                    {item.word}
                                  </span>
                                  {item.ipa && (
                                    <span className="text-xs font-mono text-slate-500">
                                      {item.ipa}
                                    </span>
                                  )}
                                  {item.part_of_speech && (
                                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-700">
                                      {item.part_of_speech}
                                    </span>
                                  )}
                                </div>
                                <div className="mt-1.5 text-sm font-semibold text-[#2563EB] khmer-text">
                                  {item.khmer_meaning}
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => speakEnglish(item.word, playbackRate)}
                                className="w-9 h-9 rounded-xl bg-blue-50 hover:bg-[#2563EB] text-[#2563EB] hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                                title="Pronounce word (en-US)"
                              >
                                <Volume2 className="w-4 h-4" />
                              </button>
                            </div>

                            {item.example_sentence && (
                              <div className="mt-2.5 pt-2.5 border-t border-slate-200/60 flex items-center justify-between gap-2 text-xs text-slate-600">
                                <span className="italic">"{item.example_sentence}"</span>
                                <button
                                  type="button"
                                  onClick={() => speakEnglish(item.example_sentence, playbackRate)}
                                  className="text-slate-400 hover:text-[#2563EB] shrink-0"
                                  title="Listen to example"
                                >
                                  <Play className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {practiceMode === 'grammar' && (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-4 sm:space-y-5">
                    <div>
                      <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                        <span>📘 English grammar</span>
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Every structure you'll hear in this lesson — with English form, Khmer
                        explanation (ការពន្យល់ជាភាសាខ្មែរ), and bilingual examples.
                      </p>
                    </div>

                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search a structure: present simple, be, phrasal verbs..."
                        value={grammarFilter.searchQuery}
                        onChange={(e) =>
                          dispatch({ type: 'SET_GRAMMAR_SEARCH', payload: e.target.value })
                        }
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50/60 text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-[#2563EB]"
                      />
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {grammarStages.map((stage) => (
                        <button
                          key={stage}
                          type="button"
                          onClick={() => dispatch({ type: 'SET_GRAMMAR_STAGE', payload: stage })}
                          className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                            grammarFilter.selectedStage === stage
                              ? 'bg-[#2563EB] text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {stage === 'ALL' ? 'All Stages' : stage}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-4 max-h-[460px] overflow-y-auto smooth-scroll pr-1">
                      {filteredGrammarPoints.map((g, idx) => (
                        <div
                          key={g.id || idx}
                          className="p-4 sm:p-5 rounded-2xl border border-blue-200/80 bg-white shadow-sm space-y-3"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-7 h-7 rounded-full bg-[#2563EB] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </div>
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                                  {g.title}
                                </h3>
                                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  {g.stage || 'Stage 1: The basics'}
                                </span>
                              </div>

                              <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                                {g.explanation_en}
                              </p>
                            </div>
                          </div>

                          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80">
                            <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-1 khmer-text">
                              ការពន្យល់ជាភាសាខ្មែរ (Khmer Explanation)
                            </div>
                            <p className="text-xs sm:text-sm text-slate-800 khmer-text">
                              {g.explanation_km}
                            </p>
                          </div>

                          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <div className="text-xs sm:text-sm font-semibold text-slate-900">
                                "{g.example_en}"
                              </div>
                              <div className="text-xs sm:text-sm text-[#2563EB] khmer-text">
                                {g.example_km}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => speakEnglish(g.example_en, playbackRate)}
                              className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-[#2563EB] hover:bg-blue-50 flex items-center justify-center shrink-0 cursor-pointer"
                              title="Listen to example sentence"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
              );
            })()}
          </>
        )}
        </div>
      </main>

      {/* =========================================================
          AUTHOR & CONTACT INFORMATION FOOTER
      ========================================================= */}
      <Footer />

      {/* =========================================================
          AUTH MODAL FOR GUEST PREVIEW MODE
      ========================================================= */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <Suspense
            fallback={
              <div className="bg-white rounded-3xl p-8 shadow-2xl flex items-center gap-3 text-slate-600">
                <Loader2 className="w-5 h-5 animate-spin text-[#2563EB]" />
                <span className="text-xs font-semibold">Loading Sign In...</span>
              </div>
            }
          >
            <AuthForm
              isModal
              onClose={() => dispatch({ type: 'CLOSE_AUTH_MODAL' })}
            />
          </Suspense>
        </div>
      )}

      {/* =========================================================
          CUSTOM SHADOWINGKHMER CONFIRMATION MODAL (DELETE / ACTION)
      ========================================================= */}
      <ConfirmModal onConfirm={handleConfirmDialogAction} />
    </div>
  );
}
