import React from 'react';
import {
  Play,
  Flame,
  ListVideo,
  Search,
  History,
  BookOpenCheck,
  Loader2,
  Clock,
  CheckCircle2,
  X,
  PlusCircle,
  Pencil,
  Trash2,
  Youtube,
  Crown,
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

export default function AllLessonsLibrary({ onOpenLesson }) {
  const { state, dispatch } = useAppContext();
  const { auth, library, adminDashboard } = state;
  const { loading, lessons, history, activeTab, selectedLevel, searchQuery } = library;
  const { createLibraryForm, editingLessonId, lessonEditForm } = adminDashboard;

  const isGuest = !auth.user || !auth.token;
  const isAdmin = !isGuest && auth.user?.role === 'admin';

  // Admin-only: Create & publish a new video lesson directly on the All Lessons page
  const handleAdminCreateLesson = async (e) => {
    e.preventDefault();
    if (!isAdmin || !createLibraryForm.videoUrl.trim() || createLibraryForm.creating) return;

    dispatch({ type: 'ADMIN_CREATE_LIBRARY_START' });
    try {
      const res = await fetch(`${API_BASE}/api/lessons/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          videoUrl: createLibraryForm.videoUrl.trim(),
          isPublic: true,
          cefrLevel: createLibraryForm.cefrLevel,
          tags: createLibraryForm.tags.trim() || 'Daily Conversation',
        }),
      });
      const data = await parseJsonSafe(res);
      if (res.ok && data.lesson) {
        dispatch({ type: 'ADMIN_CREATE_LIBRARY_DONE', payload: data });
        dispatch({
          type: 'SET_NOTIFICATION',
          payload: {
            type: 'success',
            message: `Published "${data.lesson.title}" to All Lessons for all students!`,
          },
        });
      } else {
        dispatch({ type: 'ADMIN_CREATE_LIBRARY_DONE' });
        dispatch({
          type: 'SET_NOTIFICATION',
          payload: { type: 'error', message: data.error || 'Failed to create video lesson.' },
        });
      }
    } catch {
      dispatch({ type: 'ADMIN_CREATE_LIBRARY_DONE' });
      dispatch({
        type: 'SET_NOTIFICATION',
        payload: { type: 'error', message: 'Network error while creating video lesson.' },
      });
    }
  };

  // Admin-only: Save edited title / level / tags directly on a card
  const handleAdminSaveEdit = async (e, lessonId) => {
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

  // Admin-only: Delete a lesson directly from the All Lessons page
  const handleAdminDeleteLesson = async (e, lesson) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${lesson.title}" from All Lessons permanently?`)) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/admin/lessons/${lesson.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (res.ok) {
        dispatch({ type: 'ADMIN_LESSON_DELETED', payload: lesson.id });
        dispatch({
          type: 'SET_NOTIFICATION',
          payload: { type: 'success', message: `Deleted "${lesson.title}" from All Lessons.` },
        });
      } else {
        const data = await parseJsonSafe(res);
        dispatch({
          type: 'SET_NOTIFICATION',
          payload: { type: 'error', message: data.error || 'Failed to delete lesson.' },
        });
      }
    } catch {
      dispatch({
        type: 'SET_NOTIFICATION',
        payload: { type: 'error', message: 'Network error deleting lesson.' },
      });
    }
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
    <div className="space-y-6">
      {/* Top Hero / Filter Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[#2563EB] border border-blue-100">
                <BookOpenCheck className="w-3.5 h-3.5" />
                <span>Curated Video Stories</span>
              </span>
              <span className="text-xs text-slate-400">
                Click any story to practice Shadowing & Khmer translation
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1.5 tracking-tight">
              {activeTab === 'history' ? 'My Study History' : 'All Video Lessons'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 khmer-text">
              {activeTab === 'history'
                ? 'មេរៀន និងរឿងនិទានទាំងអស់ដែលអ្នកបានបើករៀនរួច — ចុចដើម្បីបន្តរៀនឡើងវិញ។'
                : 'ជ្រើសរើសវីដេអូមេរៀនអង់គ្លេសដែលអ្នកចូលចិត្ត ដើម្បីហ្វឹកហាត់ស្តាប់ និងនិយាយតាម (Shadowing) ជាមួយការបកប្រែភាសាខ្មែរ។'}
            </p>
          </div>
        </div>

        {/* ADMIN-ONLY VIDEO LESSON CREATOR CONTROLLER (Right on All Lessons Page) */}
        {isAdmin && (
          <form
            onSubmit={handleAdminCreateLesson}
            className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-white border border-blue-200/80 space-y-3"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#2563EB]">
                <Crown className="w-3.5 h-3.5" />
                <span>Admin All Lessons Controller — Create Video Lesson for Students</span>
              </span>
              <span className="text-[11px] font-medium text-slate-500">
                Only visible to Admin • Publishes directly to students&apos; first page
              </span>
            </div>

            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5">
              <div className="relative flex-1">
                <Youtube className="w-4 h-4 text-rose-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Paste YouTube video link (e.g. https://youtu.be/...)"
                  value={createLibraryForm.videoUrl}
                  onChange={(e) =>
                    dispatch({
                      type: 'ADMIN_UPDATE_CREATE_LIBRARY_FORM',
                      payload: { field: 'videoUrl', value: e.target.value },
                    })
                  }
                  disabled={createLibraryForm.creating}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <select
                value={createLibraryForm.cefrLevel}
                onChange={(e) =>
                  dispatch({
                    type: 'ADMIN_UPDATE_CREATE_LIBRARY_FORM',
                    payload: { field: 'cefrLevel', value: e.target.value },
                  })
                }
                disabled={createLibraryForm.creating}
                className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-[#2563EB]"
                title="CEFR Level"
              >
                {['A1', 'A2', 'B1', 'B2', 'C1'].map((lvl) => (
                  <option key={lvl} value={lvl}>
                    Level {lvl}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Tags: Travel English, Daily Conversation"
                value={createLibraryForm.tags}
                onChange={(e) =>
                  dispatch({
                    type: 'ADMIN_UPDATE_CREATE_LIBRARY_FORM',
                    payload: { field: 'tags', value: e.target.value },
                  })
                }
                disabled={createLibraryForm.creating}
                className="lg:w-60 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#2563EB]"
              />

              <button
                type="submit"
                disabled={createLibraryForm.creating || !createLibraryForm.videoUrl.trim()}
                className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer whitespace-nowrap"
              >
                {createLibraryForm.creating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Lesson...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>Create Video Lesson</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Switcher Tabs + Level Filter + Search */}
        <div className="pt-3 border-t border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Left: All Lessons vs My Study History */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => dispatch({ type: 'LIBRARY_SET_TAB', payload: 'all' })}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ListVideo className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>All Lessons ({lessons.length})</span>
              </button>
              <button
                type="button"
                onClick={() => dispatch({ type: 'LIBRARY_SET_TAB', payload: 'history' })}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'history'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <History className="w-3.5 h-3.5 text-emerald-600" />
                <span>My Study History ({history.length})</span>
              </button>
            </div>

            {/* CEFR Level Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto">
              {LEVELS.map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => dispatch({ type: 'LIBRARY_SET_LEVEL', payload: lvl })}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
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

          {/* Right: Search */}
          <div className="relative w-full lg:w-72">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-3">
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
              ? 'Paste any YouTube link in the Admin box above to create your first video lesson for students.'
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
            const isEditingThis = isAdmin && editingLessonId === lesson.id;

            return (
              <div
                key={`${activeTab}-${lesson.id}`}
                onClick={() => {
                  if (!isEditingThis) onOpenLesson(lesson);
                }}
                className="group bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-lg hover:border-blue-200 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden cursor-pointer flex flex-col"
              >
                {/* Thumbnail Header with Overlays */}
                <div className="relative aspect-video bg-slate-900 overflow-hidden">
                  <img
                    src={`https://i.ytimg.com/vi/${lesson.video_id}/hqdefault.jpg`}
                    alt={lesson.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/25" />

                  {/* Top-Left: CEFR Level Pill */}
                  <span
                    className={`absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border shadow-sm ${levelClass}`}
                  >
                    {level}
                  </span>

                  {/* Top-Right: Study View Flame Pill */}
                  <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-black/65 backdrop-blur-sm text-amber-300">
                    <Flame className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{lesson.view_count || 0}</span>
                  </span>

                  {/* Center Hover Play Icon */}
                  {!isEditingThis && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-[#2563EB]/95 text-white flex items-center justify-center shadow-xl">
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      </div>
                    </div>
                  )}

                  {/* Bottom-Left: Sentence Count Badge */}
                  <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-black/70 backdrop-blur-sm text-white">
                    <ListVideo className="w-3 h-3 text-blue-300" />
                    <span>{sentenceCount} sentences</span>
                  </span>

                  {/* Bottom-Right: Studied Check Badge */}
                  {studiedInfo && (
                    <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-600/90 backdrop-blur-sm text-white">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Studied</span>
                    </span>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-3.5 flex-1 flex flex-col justify-between gap-2.5">
                  {isEditingThis ? (
                    <div
                      className="space-y-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="text"
                        value={lessonEditForm.title}
                        onChange={(e) =>
                          dispatch({
                            type: 'ADMIN_UPDATE_LESSON_EDIT_FIELD',
                            payload: { field: 'title', value: e.target.value },
                          })
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg border border-blue-300 text-xs font-bold text-slate-900"
                        placeholder="Lesson title"
                      />
                      <div className="flex items-center gap-1.5">
                        <select
                          value={lessonEditForm.cefrLevel}
                          onChange={(e) =>
                            dispatch({
                              type: 'ADMIN_UPDATE_LESSON_EDIT_FIELD',
                              payload: { field: 'cefrLevel', value: e.target.value },
                            })
                          }
                          className="px-2 py-1 rounded-lg border border-slate-300 text-xs font-bold"
                        >
                          {['A1', 'A2', 'B1', 'B2', 'C1'].map((lvl) => (
                            <option key={lvl} value={lvl}>
                              {lvl}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={lessonEditForm.tags}
                          onChange={(e) =>
                            dispatch({
                              type: 'ADMIN_UPDATE_LESSON_EDIT_FIELD',
                              payload: { field: 'tags', value: e.target.value },
                            })
                          }
                          className="flex-1 min-w-0 px-2 py-1 rounded-lg border border-slate-300 text-xs"
                          placeholder="Tags..."
                        />
                      </div>
                      <div className="flex items-center justify-end gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch({ type: 'ADMIN_OPEN_LESSON_EDIT', payload: null });
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-semibold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleAdminSaveEdit(e, lesson.id)}
                          className="px-3 py-1 rounded-lg bg-[#2563EB] text-white text-[11px] font-bold cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-[13.5px] font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-[#2563EB] transition-colors">
                        {lesson.title}
                      </h3>

                      <div className="space-y-2">
                        {/* Category / Tag Chips + Admin Controls */}
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
                                className="p-1 rounded-lg text-slate-400 hover:text-[#2563EB] hover:bg-blue-50 cursor-pointer"
                                title="Edit lesson level, tags, or title"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleAdminDeleteLesson(e, lesson)}
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                                title="Delete lesson"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Studied History Footer Bar */}
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
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
