import React, { useEffect, useRef } from 'react';
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
} from 'lucide-react';
import { useAppContext, DEMO_LESSON_DATA } from './reducer/appReducer.js';
import AuthForm, { GoogleIcon } from './components/AuthForm.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import AllLessonsLibrary from './components/AllLessonsLibrary.jsx';
import Footer from './components/Footer.jsx';

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

// Helper: Select the most natural human-sounding English voice on the user's device
let cachedNaturalVoice = null;

function getBestHumanEnglishVoice() {
  if (!('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  const preferredOrder = [
    'Microsoft Aria Online (Natural)',
    'Microsoft Jenny Online (Natural)',
    'Microsoft Guy Online (Natural)',
    'Google US English',
    'Google UK English Female',
    'Google UK English Male',
    'Samantha',
    'Ava',
    'Allison',
    'Daniel',
    'Alex',
  ];

  for (const name of preferredOrder) {
    const match = voices.find((v) => v.name.includes(name));
    if (match) return match;
  }

  // Fallback to any Neural / Natural / Online English voice
  const naturalVoice = voices.find(
    (v) =>
      v.lang.startsWith('en') &&
      (v.name.includes('Natural') || v.name.includes('Neural') || v.name.includes('Google'))
  );
  if (naturalVoice) return naturalVoice;

  return voices.find((v) => v.lang === 'en-US') || voices.find((v) => v.lang.startsWith('en')) || null;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedNaturalVoice = getBestHumanEnglishVoice();
  };
}

// Helper: Speak English text or word with natural human-like pacing & voice
function speakEnglish(text, rate = 0.95) {
  if (!('speechSynthesis' in window) || !text) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const voice = cachedNaturalVoice || getBestHumanEnglishVoice();
  if (voice) {
    cachedNaturalVoice = voice;
    utterance.voice = voice;
    utterance.lang = voice.lang;
  } else {
    utterance.lang = 'en-US';
  }
  utterance.rate = rate;
  utterance.pitch = 1.02;
  utterance.volume = 1.0;
  window.speechSynthesis.speak(utterance);
}

// Helper: Format seconds into M:SS
function formatTime(sec) {
  const s = Math.max(0, Math.floor(sec || 0));
  const mins = Math.floor(s / 60);
  const rem = s % 60;
  return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
}

export default function App() {
  const { state, dispatch } = useAppContext();
  const playerRef = useRef(null);
  const syncTimerRef = useRef(null);
  const activeSentenceRef = useRef(null);

  const {
    auth,
    googleClientId,
    isAuthModalOpen,
    activeScreen,
    isMobileMenuOpen,
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
  } = state;

  // Pre-warm Render backend, fetch GOOGLE_CLIENT_ID & public "All Lessons" library on initial page load
  useEffect(() => {
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

  // Sync activeSentenceIndex with YouTube playback time & support Sentence Loop mode
  useEffect(() => {
    syncTimerRef.current = setInterval(() => {
      if (
        playerRef.current &&
        typeof playerRef.current.getCurrentTime === 'function' &&
        typeof playerRef.current.getPlayerState === 'function'
      ) {
        const playerState = playerRef.current.getPlayerState();
        if (playerState === 1) {
          const currentTime = playerRef.current.getCurrentTime();
          const currentActiveObj = sentences.find(
            (s) => s.sentence_index === activeSentenceIndex
          );

          // If Sentence Loop Mode is enabled, loop current sentence when reaching end_time
          if (isLoopingSentence && currentActiveObj) {
            if (currentTime >= currentActiveObj.end_time) {
              playerRef.current.seekTo(currentActiveObj.start_time, true);
              playerRef.current.playVideo();
              return;
            }
          }

          const matchedSentence = sentences.find(
            (s) => currentTime >= s.start_time && currentTime <= s.end_time
          );
          if (
            matchedSentence &&
            matchedSentence.sentence_index !== activeSentenceIndex
          ) {
            dispatch({
              type: 'SET_ACTIVE_SENTENCE',
              payload: matchedSentence.sentence_index,
            });
          }
        }
      }
    }, 250);

    return () => {
      if (syncTimerRef.current) clearInterval(syncTimerRef.current);
    };
  }, [sentences, activeSentenceIndex, isLoopingSentence, dispatch]);

  const loadLessonById = async (lessonId, tokenOverride) => {
    playerRef.current = null;
    if (lessonId === 0) {
      dispatch({
        type: 'LOAD_LESSON_SUCCESS',
        payload: DEMO_LESSON_DATA,
      });
      return;
    }

    // Instant 0ms switch if this lesson is already cached in memory
    if (lessonCache && lessonCache[lessonId]) {
      dispatch({
        type: 'LOAD_LESSON_SUCCESS',
        payload: lessonCache[lessonId],
      });
      dispatch({ type: 'TOGGLE_LESSONS_DRAWER', payload: false });
      return;
    }

    dispatch({ type: 'LOAD_LESSON_START' });
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

  const handleOpenLibraryLesson = (lessonItem) => {
    if (!lessonItem?.id) return;
    loadLessonById(lessonItem.id);
  };

  // Delete user's own lesson directly from "My Lessons"
  const handleDeleteOwnLesson = async (e, lessonItem) => {
    e.stopPropagation();
    if (!window.confirm(`Remove "${lessonItem.title}" from My Lessons?`)) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/lessons/${lessonItem.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      if (res.ok) {
        const remaining = lessonsList.filter((l) => l.id !== lessonItem.id);
        dispatch({
          type: 'USER_LESSON_DELETED',
          payload: { deletedId: lessonItem.id, title: lessonItem.title },
        });

        // If the deleted lesson was currently active, switch to the next lesson or starter demo
        if (currentLesson?.id === lessonItem.id) {
          if (remaining.length > 0) {
            loadLessonById(remaining[0].id);
          } else {
            loadLessonById(0);
          }
        }
      } else {
        const data = await parseJsonSafe(res);
        dispatch({
          type: 'SET_NOTIFICATION',
          payload: {
            type: 'error',
            message: data.error || 'Could not remove lesson.',
          },
        });
      }
    } catch (err) {
      dispatch({
        type: 'SET_NOTIFICATION',
        payload: {
          type: 'error',
          message: 'Network error while removing lesson.',
        },
      });
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
    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
      playerRef.current.seekTo(sentence.start_time, true);
      playerRef.current.playVideo();
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

    speakEnglish(cleanWord, playbackRate);

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
          APPLE-STYLE ULTRA-CLEAN NAVIGATION BAR
      ========================================================= */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl backdrop-saturate-150 border-b border-slate-200/70">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          {/* Left: Minimalist Brand + Mobile All Lessons / My Lessons Triggers */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => dispatch({ type: 'SET_ACTIVE_SCREEN', payload: 'library' })}
              className="flex items-center gap-2 cursor-pointer group whitespace-nowrap"
            >
              <div className="w-7 h-7 rounded-lg bg-[#2563EB] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                <Headphones className="w-4 h-4" />
              </div>
              <span className="font-bold text-[15px] tracking-tight text-slate-900">
                Shadowing<span className="text-[#2563EB]">Khmer</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => dispatch({ type: 'SET_ACTIVE_SCREEN', payload: 'library' })}
              className={`lg:hidden inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
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
              className="lg:hidden inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200/70 text-slate-700 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
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
              { id: 'grammar', label: 'Grammar' },
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
          <div className="relative">
            {isLessonsDrawerOpen && (
              <div className="fixed sm:absolute left-3 right-3 sm:left-auto sm:right-0 top-16 sm:top-7 sm:w-96 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-2xl p-3.5 z-50">
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
                        onClick={() => loadLessonById(item.id)}
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
            </div>

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

          {/* Mobile Hamburger Menu Button (< md) */}
          <div className="flex md:hidden items-center gap-2">
            {isAdmin && (
              <button
                type="button"
                onClick={() =>
                  dispatch({
                    type: 'SET_ACTIVE_SCREEN',
                    payload: activeScreen === 'admin' ? 'workspace' : 'admin',
                  })
                }
                className={`p-2 rounded-xl border text-xs font-semibold ${
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
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer (< md) */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-3 shadow-lg">
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

        {activeScreen === 'admin' && isAdmin ? (
          <AdminDashboard onOpenLesson={(lessonId) => loadLessonById(lessonId)} />
        ) : activeScreen === 'library' ? (
          <AllLessonsLibrary onOpenLesson={handleOpenLibraryLesson} />
        ) : (
          <>
            {/* Quick Back to All Lessons Breadcrumb */}
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => dispatch({ type: 'SET_ACTIVE_SCREEN', payload: 'library' })}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#2563EB] transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back to All Lessons & Study History</span>
              </button>
            </div>

            {/* Top YouTube Lesson Creator Bar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-4 shadow-sm">
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

                  {/* Animated Shimmer Progress Bar */}
                  <div className="relative w-full h-3 bg-slate-200/70 rounded-full overflow-hidden">
                    <div
                      className="relative h-full bg-gradient-to-r from-[#2563EB] via-indigo-500 to-purple-500 rounded-full transition-all duration-500 ease-out overflow-hidden"
                      style={{ width: `${createProgress}%` }}
                    >
                      <div className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                    </div>
                  </div>

                  {/* 3 Clean Animated Steps: 1. Video | 2. Processing | 3. Prepare Lesson */}
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

              {notification && (
                <div
                  className={`mt-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between gap-3 ${
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
                    className="text-current opacity-70 hover:opacity-100 shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Lesson Title & Mastery Progress Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
                  Shadowing Practice: {currentLesson?.title || 'English Video Lesson'}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Click any sentence to jump video • Click any word to pronounce & save
                </p>
              </div>

              {/* Mastery Progress Pill */}
              <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm shrink-0">
                <div className="text-xs font-bold text-slate-700">
                  Practiced: <span className="text-[#2563EB]">{completedCount}</span> /{' '}
                  {sentences.length}
                </div>
                <div className="w-24 sm:w-28 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#2563EB] transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-xs font-extrabold text-[#2563EB]">{progressPercent}%</span>
              </div>
            </div>

            {/* =========================================================
                RESPONSIVE SPLIT-SCREEN WORKSPACE
            ========================================================= */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
              {/* LEFT COLUMN: Video Player + Smart Shadowing Controls + Mode Cards */}
              <div className="lg:col-span-7 space-y-4 sm:space-y-5">
                {/* Video Player Container */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="relative bg-black">
                    <button
                      type="button"
                      onClick={() => dispatch({ type: 'TOGGLE_PLAYER_SIZE' })}
                      className="hidden sm:inline-flex absolute top-3 right-3 z-10 items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 hover:bg-white text-slate-800 text-xs font-semibold shadow-sm transition-all cursor-pointer"
                    >
                      <span>{playerSize === 'large' ? 'Large' : 'Compact'}</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>

                    <div
                      className={`w-full ${
                        playerSize === 'large' ? 'aspect-video' : 'aspect-video sm:h-72'
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
                        }}
                      />
                    </div>
                  </div>

                  {/* NEW FEATURE: Smart Shadowing Control Bar (Prev / Loop / Next / Speed) */}
                  <div className="p-3 sm:px-4 bg-white border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    {/* Sentence Step Controls */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleJumpRelativeSentence(-1)}
                        disabled={activeSentenceIndex <= 1}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 text-xs font-semibold text-slate-700 cursor-pointer"
                        title="Previous sentence"
                      >
                        <SkipBack className="w-3.5 h-3.5" />
                        <span className="hidden xs:inline">Prev</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleSentenceClick(
                            sentences.find((s) => s.sentence_index === activeSentenceIndex)
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#2563EB] text-xs font-bold cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Replay #{activeSentenceIndex}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleJumpRelativeSentence(1)}
                        disabled={activeSentenceIndex >= sentences.length}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 text-xs font-semibold text-slate-700 cursor-pointer"
                        title="Next sentence"
                      >
                        <span className="hidden xs:inline">Next</span>
                        <SkipForward className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Loop Toggle & Playback Speed */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => dispatch({ type: 'TOGGLE_LOOP_SENTENCE' })}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          isLoopingSentence
                            ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                        title="Automatically repeat current sentence in a loop"
                      >
                        <Repeat className="w-3.5 h-3.5" />
                        <span>{isLoopingSentence ? 'Looping ON' : 'Loop'}</span>
                      </button>

                      {/* Speed Buttons: 0.75x, 1x, 1.25x */}
                      <div className="inline-flex items-center rounded-xl bg-slate-100 p-0.5 border border-slate-200/80">
                        {[0.75, 1, 1.25].map((rate) => (
                          <button
                            key={rate}
                            type="button"
                            onClick={() => handleChangePlaybackRate(rate)}
                            className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                              playbackRate === rate
                                ? 'bg-white text-[#2563EB] shadow-sm'
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            {rate}x
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile Compact Mode Tabs (< sm) */}
                <div className="grid grid-cols-4 gap-1.5 p-1.5 bg-white rounded-2xl border border-slate-200 shadow-sm sm:hidden">
                  <button
                    type="button"
                    onClick={() => handleSelectPracticeMode('lesson')}
                    className={`py-2 px-1 rounded-xl text-[11px] font-bold flex flex-col items-center gap-1 transition-all ${
                      practiceMode === 'lesson'
                        ? 'bg-[#2563EB] text-white shadow-sm'
                        : 'text-slate-600'
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                    <span>Shadow</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectPracticeMode('dictation')}
                    className={`relative py-2 px-1 rounded-xl text-[11px] font-bold flex flex-col items-center gap-1 transition-all ${
                      practiceMode === 'dictation'
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'text-slate-600'
                    }`}
                  >
                    {isGuest && <Lock className="w-2.5 h-2.5 absolute top-1.5 right-1.5 text-slate-400" />}
                    <Keyboard className="w-4 h-4" />
                    <span>Dictation</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectPracticeMode('vocabulary')}
                    className={`relative py-2 px-1 rounded-xl text-[11px] font-bold flex flex-col items-center gap-1 transition-all ${
                      practiceMode === 'vocabulary'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-slate-600'
                    }`}
                  >
                    {isGuest && <Lock className="w-2.5 h-2.5 absolute top-1.5 right-1.5 text-slate-400" />}
                    <BookOpen className="w-4 h-4" />
                    <span>Vocab</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectPracticeMode('grammar')}
                    className={`relative py-2 px-1 rounded-xl text-[11px] font-bold flex flex-col items-center gap-1 transition-all ${
                      practiceMode === 'grammar'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-slate-600'
                    }`}
                  >
                    {isGuest && <Lock className="w-2.5 h-2.5 absolute top-1.5 right-1.5 text-slate-400" />}
                    <GraduationCap className="w-4 h-4" />
                    <span>Grammar</span>
                  </button>
                </div>

                {/* Tablet & Desktop Animated "Choose a practice mode" Card (>= sm) */}
                <div className="hidden sm:block bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                        <span>Choose a practice mode</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-[#2563EB] border border-blue-100">
                          {isGuest ? 'Preview Mode' : '4 Modes'}
                        </span>
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {isGuest
                          ? 'Previewing Shadowing mode. Sign in free to unlock Dictation, Vocabulary & Grammar.'
                          : 'Switch between Shadowing, Dictation Quiz, Vocabulary Flashcards, and Grammar.'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {/* Mode 1: Lesson (Shadowing) */}
                    <button
                      type="button"
                      onClick={() => handleSelectPracticeMode('lesson')}
                      className={`group relative overflow-hidden text-center p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col items-center justify-between hover:-translate-y-1 hover:shadow-md ${
                        practiceMode === 'lesson'
                          ? 'border-[#2563EB] bg-gradient-to-b from-blue-50/80 to-white ring-2 ring-blue-600/20 shadow-md -translate-y-0.5'
                          : 'border-slate-200 bg-white hover:border-blue-300'
                      }`}
                    >
                      {practiceMode === 'lesson' && (
                        <span className="absolute top-2.5 right-2.5 flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2563EB]"></span>
                        </span>
                      )}
                      <div className="w-11 h-11 rounded-2xl bg-blue-100 text-[#2563EB] flex items-center justify-center mb-2.5 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300 shadow-sm">
                        <Mic className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-slate-900">
                          1. Shadowing
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 khmer-text">
                          Repeat & ខ្មែរ
                        </p>
                      </div>
                      <span className="mt-3 inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-[#2563EB]">
                        {activeSentenceIndex}/{sentences.length}
                      </span>
                    </button>

                    {/* Mode 2: Dictation (Listen & Type) */}
                    <button
                      type="button"
                      onClick={() => handleSelectPracticeMode('dictation')}
                      className={`group relative overflow-hidden text-center p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col items-center justify-between hover:-translate-y-1 hover:shadow-md ${
                        practiceMode === 'dictation'
                          ? 'border-amber-500 bg-gradient-to-b from-amber-50/80 to-white ring-2 ring-amber-500/20 shadow-md -translate-y-0.5'
                          : 'border-slate-200 bg-white hover:border-amber-300'
                      }`}
                    >
                      {isGuest ? (
                        <span className="absolute top-2 right-2 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-500">
                          <Lock className="w-2.5 h-2.5" />
                        </span>
                      ) : practiceMode === 'dictation' ? (
                        <span className="absolute top-2.5 right-2.5 flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                        </span>
                      ) : (
                        <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-amber-100 text-amber-700">
                          New
                        </span>
                      )}
                      <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-2.5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-sm">
                        <Keyboard className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-slate-900">
                          2. Dictation
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Listen & type quiz
                        </p>
                      </div>
                      <span className="mt-3 inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700">
                        {isGuest ? 'Sign in' : `#${activeSentenceIndex} active`}
                      </span>
                    </button>

                    {/* Mode 3: Vocabulary */}
                    <button
                      type="button"
                      onClick={() => handleSelectPracticeMode('vocabulary')}
                      className={`group relative overflow-hidden text-center p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col items-center justify-between hover:-translate-y-1 hover:shadow-md ${
                        practiceMode === 'vocabulary'
                          ? 'border-purple-600 bg-gradient-to-b from-purple-50/80 to-white ring-2 ring-purple-600/20 shadow-md -translate-y-0.5'
                          : 'border-slate-200 bg-white hover:border-purple-300'
                      }`}
                    >
                      {isGuest ? (
                        <span className="absolute top-2 right-2 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-500">
                          <Lock className="w-2.5 h-2.5" />
                        </span>
                      ) : practiceMode === 'vocabulary' ? (
                        <span className="absolute top-2.5 right-2.5 flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-500 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-600"></span>
                        </span>
                      ) : null}
                      <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mb-2.5 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300 shadow-sm">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-slate-900">
                          3. Vocabulary
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Words & flashcards
                        </p>
                      </div>
                      <span className="mt-3 inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700">
                        {isGuest ? 'Sign in' : `${vocabulary.length} words`}
                      </span>
                    </button>

                    {/* Mode 4: Grammar */}
                    <button
                      type="button"
                      onClick={() => handleSelectPracticeMode('grammar')}
                      className={`group relative overflow-hidden text-center p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col items-center justify-between hover:-translate-y-1 hover:shadow-md ${
                        practiceMode === 'grammar'
                          ? 'border-rose-600 bg-gradient-to-b from-rose-50/80 to-white ring-2 ring-rose-600/20 shadow-md -translate-y-0.5'
                          : 'border-slate-200 bg-white hover:border-rose-300'
                      }`}
                    >
                      {isGuest ? (
                        <span className="absolute top-2 right-2 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-500">
                          <Lock className="w-2.5 h-2.5" />
                        </span>
                      ) : practiceMode === 'grammar' ? (
                        <span className="absolute top-2.5 right-2.5 flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
                        </span>
                      ) : null}
                      <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-2.5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-sm">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-slate-900">
                          4. Grammar
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Bilingual rules
                        </p>
                      </div>
                      <span className="mt-3 inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700">
                        {isGuest ? 'Sign in' : `${grammarPoints.length} rules`}
                      </span>
                    </button>
                  </div>
                </div>
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
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* Top Header */}
                    <div className="p-3.5 sm:px-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-xs sm:text-sm text-slate-800">
                        {sentences.length} sentences
                      </span>
                      <button
                        type="button"
                        onClick={() => dispatch({ type: 'TOGGLE_ALL_KHMER' })}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer khmer-text ${
                          showAllKhmer
                            ? 'bg-[#2563EB] text-white border-[#2563EB]'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <Languages className="w-3.5 h-3.5" />
                        <span>
                          {showAllKhmer ? 'លាក់ភាសាខ្មែរ (Hide All)' : 'បង្ហាញខ្មែរទាំងអស់ (ខ្មែរ All)'}
                        </span>
                      </button>
                    </div>

                    {/* Sentence Filter Input */}
                    <div className="px-3.5 sm:px-4 pt-3">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Search English or Khmer sentence..."
                          value={sentenceSearchQuery}
                          onChange={(e) =>
                            dispatch({ type: 'SET_SENTENCE_SEARCH', payload: e.target.value })
                          }
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50/70 text-xs focus:bg-white focus:outline-none focus:border-[#2563EB]"
                        />
                      </div>
                    </div>

                    {/* Clicked Word Popup Bar */}
                    {selectedWordPopup && (
                      <div className="mx-3.5 sm:mx-4 mt-3 p-3 rounded-xl bg-blue-50/90 border border-blue-200 flex flex-wrap items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => speakEnglish(selectedWordPopup.cleanWord, playbackRate)}
                            className="w-8 h-8 rounded-lg bg-[#2563EB] text-white flex items-center justify-center shadow-sm hover:bg-blue-700 cursor-pointer shrink-0"
                            title="Pronounce word"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-slate-900">
                                {selectedWordPopup.cleanWord}
                              </span>
                              {selectedWordPopup.existingMatch?.ipa && (
                                <span className="text-xs text-slate-500 font-mono">
                                  {selectedWordPopup.existingMatch.ipa}
                                </span>
                              )}
                            </div>
                            {selectedWordPopup.existingMatch?.khmer_meaning && (
                              <div className="text-xs font-medium text-blue-800 khmer-text">
                                {selectedWordPopup.existingMatch.khmer_meaning}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={selectedWordPopup.saving || selectedWordPopup.saved}
                            onClick={handleSaveWordToVocabulary}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                              selectedWordPopup.saved
                                ? 'bg-emerald-600 text-white'
                                : 'bg-[#2563EB] hover:bg-blue-700 text-white'
                            }`}
                          >
                            {selectedWordPopup.saving ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Saving...</span>
                              </>
                            ) : selectedWordPopup.saved ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Saved!</span>
                              </>
                            ) : (
                              <>
                                <BookmarkPlus className="w-3.5 h-3.5" />
                                <span>Save to Vocab</span>
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => dispatch({ type: 'CLOSE_WORD_POPUP' })}
                            className="p-1 text-slate-400 hover:text-slate-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Sentence Rows List */}
                    <div className="divide-y divide-slate-100 max-h-[500px] lg:max-h-[560px] overflow-y-auto smooth-scroll mt-2">
                      {filteredSentences.map((s) => {
                        const isActive = activeSentenceIndex === s.sentence_index;
                        const isKhmerShown = !!visibleKhmerMap[s.sentence_index];
                        const isCompleted = !!completedSentencesMap[s.sentence_index];
                        const words = s.english_text.split(' ');

                        return (
                          <div
                            key={s.id || s.sentence_index}
                            ref={isActive ? activeSentenceRef : null}
                            onClick={() => handleSentenceClick(s)}
                            className={`p-3.5 sm:px-5 transition-all duration-200 cursor-pointer flex items-start gap-2.5 sm:gap-3.5 active:bg-blue-100/50 ${
                              isActive
                                ? 'bg-blue-50/75 border-l-4 border-[#2563EB]'
                                : 'hover:bg-slate-50/90'
                            }`}
                          >
                            {/* Sentence Index Badge */}
                            <div
                              className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                                isActive
                                  ? 'bg-[#2563EB] text-white shadow-sm'
                                  : isCompleted
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {s.sentence_index}
                            </div>

                            {/* English Text + Khmer Box */}
                            <div className="flex-1 min-w-0">
                              <div className="text-xs sm:text-[15px] font-medium text-slate-900 leading-relaxed flex flex-wrap gap-x-1">
                                {words.map((word, wIdx) => (
                                  <span
                                    key={wIdx}
                                    onClick={(e) => handleWordClick(e, word, s)}
                                    className="hover:bg-blue-100/80 hover:text-[#2563EB] rounded px-0.5 transition-colors cursor-pointer"
                                    title="Click to pronounce or save word"
                                  >
                                    {word}
                                  </span>
                                ))}
                              </div>

                              <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-400">
                                <span>
                                  {formatTime(s.start_time)} - {formatTime(s.end_time)}
                                </span>
                              </div>

                              {isKhmerShown && (
                                <div className="mt-2.5 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/70 text-slate-800 text-xs sm:text-sm khmer-text">
                                  {s.khmer_text}
                                </div>
                              )}
                            </div>

                            {/* Right Action Buttons: Mark Complete, Speak, Khmer Toggle */}
                            <div
                              className="flex items-center gap-1 shrink-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  dispatch({
                                    type: 'TOGGLE_COMPLETE_SENTENCE',
                                    payload: s.sentence_index,
                                  })
                                }
                                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                  isCompleted
                                    ? 'text-emerald-600 bg-emerald-50'
                                    : 'text-slate-300 hover:text-emerald-600'
                                }`}
                                title="Mark sentence as practiced"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => speakEnglish(s.english_text, playbackRate)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-[#2563EB] hover:bg-blue-50 transition-colors cursor-pointer"
                                title="Listen to sentence"
                              >
                                <Volume2 className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  dispatch({
                                    type: 'TOGGLE_SENTENCE_KHMER',
                                    payload: s.sentence_index,
                                  })
                                }
                                className={`px-2 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer khmer-text ${
                                  isKhmerShown
                                    ? 'bg-[#2563EB] text-white border-[#2563EB]'
                                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                ខ្មែរ
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
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
          </>
        )}
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
          <AuthForm
            isModal
            onClose={() => dispatch({ type: 'CLOSE_AUTH_MODAL' })}
          />
        </div>
      )}
    </div>
  );
}
