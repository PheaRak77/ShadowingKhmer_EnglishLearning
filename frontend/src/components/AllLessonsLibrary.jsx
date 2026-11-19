import React, { memo, useEffect } from 'react';
import {
  Play,
  Flame,
  ListVideo,
  Search,
  History,
  BookOpenCheck,
  Clock,
  CheckCircle2,
  X,
  PlusCircle,
  Pencil,
  Trash2,
} from 'lucide-react';
import { useAppContext } from '../reducer/appReducer.js';

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

const LEVEL_BADGE_STYLES = {
  A1: 'bg-emerald-100 text-emerald-800 border-emerald-200/80',
  A2: 'bg-lime-100 text-lime-800 border-lime-200/80',
  B1: 'bg-amber-100 text-amber-800 border-amber-200/80',
  B2: 'bg-orange-100 text-orange-800 border-orange-200/80',
  C1: 'bg-rose-100 text-rose-800 border-rose-200/80',
};

const LEVELS = ['ALL', 'A1', 'A2', 'B1', 'B2', 'C1'];

function formatRelativeTime(isoString) {
  if (!isoString) return 'Recently studied';
  const diffMs = Math.max(0, Date.now() - new Date(isoString).getTime());
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function AllLessonsLibrary({ onOpenLesson, onPrefetchLesson }) {
  const { state, dispatch } = useAppContext();
  const { auth, library, adminDashboard } = state;
  const { loading, lessons, history, activeTab, selectedLevel, searchQuery } = library;
  const { editingLessonId, lessonEditForm } = adminDashboard;

  const isGuest = !auth.user || !auth.token;
  const isAdmin = !isGuest && auth.user?.role === 'admin';

  useEffect(() => {
    if (!editingLessonId) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        dispatch({ type: 'ADMIN_OPEN_LESSON_EDIT', payload: null });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [editingLessonId, dispatch]);

  // Admin-only: Save edited title / level / tags from the Edit Lesson modal
  const handleAdminSaveEdit = async (e, lessonId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch(`${API_BASE}/api/admin/lessons/${lessonId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          title: lessonEditForm.title.trim(),
          cefrLevel: lessonEditForm.cefrLevel,
          tags: lessonEditForm.tags.trim() || 'Daily Conversation',
          isPublic: true,
        }),
      });
      const data = await parseJsonSafe(res);
      if (res.ok && data.lesson) {
        dispatch({ type: 'ADMIN_LESSON_UPDATED', payload: data.lesson });
        dispatch({
          type: 'SET_NOTIFICATION',
          payload: { type: 'success', message: `Updated "${data.lesson.title}".` },
        });
      } else {
        dispatch({
          type: 'SET_NOTIFICATION',
          payload: { type: 'error', message: data.error || 'Failed to update lesson.' },
        });
      }
    } catch {
      dispatch({
        type: 'SET_NOTIFICATION',
        payload: { type: 'error', message: 'Network error updating lesson.' },
      });
    }
  };

  // Admin-only: Open custom Delete Lesson confirmation modal
  const handleAdminDeleteLesson = (e, lesson) => {
    e.stopPropagation();
    dispatch({
      type: 'OPEN_CONFIRM_DIALOG',
      payload: {
        variant: 'danger',
        title: 'Delete Video Lesson?',
        message: 'This video lesson will be permanently removed from All Lessons for all students.',
        khmerMessage: 'វីដេអូមេរៀននេះនឹងត្រូវបានលុបចេញជាអចិន្ត្រៃយ៍ពី All Lessons។',
        targetLabel: lesson.title,
        confirmText: 'Delete Lesson',
        cancelText: 'Cancel',
        actionType: 'delete_admin_lesson',
        payload: { id: lesson.id, title: lesson.title },
      },
    });
  };

  // Map studied lesson IDs for quick lookup on "All Lessons" cards
  const historyById = {};
  (history || []).forEach((h) => {
    historyById[h.id] = h;
  });

  const sourceList = activeTab === 'history' ? history || [] : lessons || [];
  const q = (searchQuery || '').trim().toLowerCase();

  const filteredCards = sourceList.filter((item) => {
    const level = (item.cefr_level || 'A2').toUpperCase();
    const matchesLevel = selectedLevel === 'ALL' || level === selectedLevel;
    const matchesQuery =
      !q ||
      (item.title || '').toLowerCase().includes(q) ||
      (item.tags || '').toLowerCase().includes(q) ||
      level.toLowerCase().includes(q);
    return matchesLevel && matchesQuery;
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Hero / Filter Header (Clean & Mobile-First) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-6 shadow-sm space-y-3.5 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[#2563EB] border border-blue-100 w-fit whitespace-nowrap">
                <BookOpenCheck className="w-3.5 h-3.5 shrink-0" />
                <span>Curated Video Stories</span>
              </span>
              <span className="text-[11px] sm:text-xs text-slate-400">
                Click any story to practice Shadowing & Khmer translation
              </span>
            </div>
            <h1 className="text-lg sm:text-2xl font-extrabold text-slate-900 mt-1.5 tracking-tight">
              {activeTab === 'history' ? 'My Study History' : 'All Video Lessons'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 khmer-text">
              {activeTab === 'history'
                ? 'មេរៀន និងរឿងនិទានទាំងអស់ដែលអ្នកបានបើករៀនរួច — ចុចដើម្បីបន្តរៀនឡើងវិញ។'
                : 'ជ្រើសរើសវីដេអូមេរៀនអង់គ្លេសដែលអ្នកចូលចិត្ត ដើម្បីហ្វឹកហាត់ស្តាប់ និងនិយាយតាម (Shadowing) ជាមួយការបកប្រែភាសាខ្មែរ។'}
            </p>
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={() => dispatch({ type: 'SET_ACTIVE_SCREEN', payload: 'admin' })}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer shrink-0 whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Video in Admin</span>
            </button>
          )}
        </div>

        {/* Switcher Tabs + Level Filter + Search */}
        <div className="pt-3 border-t border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2.5 w-full lg:w-auto">
            {/* Full-width 2-col switcher on phones, inline pill on sm+ */}
            <div className="grid grid-cols-2 sm:inline-flex items-center bg-slate-100 p-1 rounded-xl w-full sm:w-auto gap-1">
              <button
                type="button"
                onClick={() => dispatch({ type: 'LIBRARY_SET_TAB', payload: 'all' })}
                className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'all'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ListVideo className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                <span>All Lessons ({lessons.length})</span>
              </button>
              <button
                type="button"
                onClick={() => dispatch({ type: 'LIBRARY_SET_TAB', payload: 'history' })}
                className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'history'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <History className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Study History ({history.length})</span>
              </button>
            </div>

            {/* CEFR Level Filter Pills (Scrollable cleanly on small devices) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 sm:pb-0">
              {LEVELS.map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => dispatch({ type: 'LIBRARY_SET_LEVEL', payload: lvl })}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                    selectedLevel === lvl
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {lvl === 'ALL' ? 'All Levels' : lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="relative w-full lg:w-72 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search stories, songs, tags..."
              value={searchQuery}
              onChange={(e) => dispatch({ type: 'LIBRARY_SET_SEARCH', payload: e.target.value })}
              className="w-full pl-10 pr-8 py-2 rounded-xl border border-slate-200 bg-slate-50/70 text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-[#2563EB]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => dispatch({ type: 'LIBRARY_SET_SEARCH', payload: '' })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Video Cards Grid */}
      {loading && sourceList.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-5">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm animate-pulse"
            >
              <div className="relative aspect-video bg-slate-200/80 overflow-hidden">
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
              </div>
              <div className="p-3.5 space-y-2.5">
                <div className="h-4 bg-slate-200/90 rounded-lg w-5/6" />
                <div className="h-3.5 bg-slate-100 rounded-lg w-3/5" />
                <div className="flex gap-1.5 pt-1">
                  <div className="h-5 w-16 bg-slate-100 rounded-full" />
                  <div className="h-5 w-20 bg-slate-100 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredCards.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 sm:p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            {activeTab === 'history' ? (
              <History className="w-6 h-6" />
            ) : (
              <ListVideo className="w-6 h-6" />
            )}
          </div>
          <h3 className="text-base font-bold text-slate-800">
            {activeTab === 'history'
              ? 'No studied lessons yet'
              : 'No matching lesson videos found'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            {activeTab === 'history'
              ? 'Open any story from All Lessons to start practicing — every lesson you study will appear here automatically.'
              : isAdmin
              ? 'Open Admin Dashboard to add your first curated video lesson for students.'
              : 'No lessons available yet. Ask an Admin to add video lessons.'}
          </p>
          {activeTab === 'history' && (
            <button
              type="button"
              onClick={() => dispatch({ type: 'LIBRARY_SET_TAB', payload: 'all' })}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer"
            >
              Browse All Lessons
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-5">
          {filteredCards.map((lesson) => {
            const level = (lesson.cefr_level || 'A2').toUpperCase();
            const levelClass = LEVEL_BADGE_STYLES[level] || LEVEL_BADGE_STYLES.A2;
            const tagsList = String(lesson.tags || 'Daily Conversation')
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
              .slice(0, 3);
            const studiedInfo =
              activeTab === 'history' ? lesson : historyById[lesson.id] || null;
            const sentenceCount = lesson.sentence_count || lesson.total_sentences || 0;
            const practicedCount = studiedInfo?.practiced_sentences || 0;
            const studiedPct =
              sentenceCount > 0 ? Math.min(100, Math.round((practicedCount / sentenceCount) * 100)) : 0;

            return (
              <div
                key={`${activeTab}-${lesson.id}`}
                onClick={() => onOpenLesson(lesson)}
                onMouseEnter={() => onPrefetchLesson?.(lesson)}
                className="group bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-lg hover:border-blue-200 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden cursor-pointer flex flex-col"
              >
                {/* Thumbnail Header with Overlays */}
                <div className="relative aspect-video bg-slate-900 overflow-hidden">
                  <img
                    src={`https://i.ytimg.com/vi/${lesson.video_id}/hqdefault.jpg`}
                    alt={lesson.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/25" />

                  <span
                    className={`absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border shadow-sm ${levelClass}`}
                  >
                    {level}
                  </span>

                  <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-black/65 backdrop-blur-sm text-amber-300">
                    <Flame className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{lesson.view_count || 0}</span>
                  </span>

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-[#2563EB]/95 text-white flex items-center justify-center shadow-xl">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                  </div>

                  <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-black/70 backdrop-blur-sm text-white">
                    <ListVideo className="w-3 h-3 text-blue-300" />
                    <span>{sentenceCount} sentences</span>
                  </span>

                  {studiedInfo && (
                    <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-600/90 backdrop-blur-sm text-white">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Studied</span>
                    </span>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-3.5 flex-1 flex flex-col justify-between gap-2.5">
                  <h3 className="text-[13.5px] font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-[#2563EB] transition-colors">
                    {lesson.title}
                  </h3>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {tagsList.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium border border-slate-200/70"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {isAdmin && (
                        <div
                          className="inline-flex items-center gap-1 shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              dispatch({ type: 'ADMIN_OPEN_LESSON_EDIT', payload: lesson });
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#2563EB] hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Edit lesson title, level, or tags"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleAdminDeleteLesson(e, lesson)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete lesson"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {studiedInfo && (
                      <div className="pt-2 border-t border-slate-100 space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
                            <Clock className="w-3 h-3" />
                            <span>{formatRelativeTime(studiedInfo.last_studied_at)}</span>
                          </span>
                          <span className="font-semibold text-slate-700">
                            {practicedCount}/{sentenceCount} practiced
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-emerald-500 transition-all"
                            style={{ width: `${Math.max(studiedPct, 8)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Custom Branded Edit Lesson Modal (Admin) */}
      {isAdmin && editingLessonId && (
        <div
          className="fixed inset-0 z-[75] bg-slate-900/45 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => dispatch({ type: 'ADMIN_OPEN_LESSON_EDIT', payload: null })}
        >
          <form
            onSubmit={(e) => handleAdminSaveEdit(e, editingLessonId)}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4 animate-fade-in-up"
          >
            <button
              type="button"
              onClick={() => dispatch({ type: 'ADMIN_OPEN_LESSON_EDIT', payload: null })}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close edit modal"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-200 text-[#2563EB] flex items-center justify-center shrink-0">
                <Pencil className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Edit Video Lesson</h3>
                <p className="text-xs text-slate-500 khmer-text">
                  កែសម្រួលចំណងជើង កម្រិត (CEFR) និងស្លាកមេរៀន
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Lesson Title
                </label>
                <input
                  type="text"
                  required
                  value={lessonEditForm.title}
                  onChange={(e) =>
                    dispatch({
                      type: 'ADMIN_UPDATE_LESSON_EDIT_FIELD',
                      payload: { field: 'title', value: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-blue-600/15 focus:outline-none text-xs sm:text-sm font-semibold text-slate-900"
                  placeholder="Enter lesson title..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    CEFR Level
                  </label>
                  <select
                    value={lessonEditForm.cefrLevel}
                    onChange={(e) =>
                      dispatch({
                        type: 'ADMIN_UPDATE_LESSON_EDIT_FIELD',
                        payload: { field: 'cefrLevel', value: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-[#2563EB] focus:outline-none text-xs sm:text-sm font-bold text-slate-800"
                  >
                    {['A1', 'A2', 'B1', 'B2', 'C1'].map((lvl) => (
                      <option key={lvl} value={lvl}>
                        Level {lvl}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={lessonEditForm.tags}
                    onChange={(e) =>
                      dispatch({
                        type: 'ADMIN_UPDATE_LESSON_EDIT_FIELD',
                        payload: { field: 'tags', value: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-[#2563EB] focus:outline-none text-xs sm:text-sm text-slate-800"
                    placeholder="Daily Conversation, Story"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => dispatch({ type: 'ADMIN_OPEN_LESSON_EDIT', payload: null })}
                className="py-2.5 px-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-2.5 px-4 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-sm shadow-blue-600/20 transition-all cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default memo(AllLessonsLibrary);
