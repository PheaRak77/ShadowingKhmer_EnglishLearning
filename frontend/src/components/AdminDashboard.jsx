import React, { useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  Video,
  MessageSquareText,
  BookOpen,
  GraduationCap,
  Search,
  Trash2,
  RefreshCw,
  ArrowLeft,
  ExternalLink,
  Crown,
  Loader2,
  SlidersHorizontal,
  RotateCcw,
  Globe,
  EyeOff,
  Pencil,
  Flame,
  PlusCircle,
  Youtube,
  X,
} from 'lucide-react';
import { useAppContext } from '../reducer/appReducer.js';
import { GoogleIcon } from './AuthForm.jsx';

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

export default function AdminDashboard({ onOpenLesson }) {
  const { state, dispatch } = useAppContext();
  const { auth, adminDashboard } = state;
  const {
    loading,
    stats,
    users,
    lessons,
    activeTab,
    searchQuery,
    studentLimit,
    limitForm,
    savingLimit,
    editingUserLimitId,
    userLimitForm,
    createLibraryForm,
    editingLessonId,
    lessonEditForm,
  } = adminDashboard;

  const fetchAdminOverview = async () => {
    dispatch({ type: 'ADMIN_LOAD_START' });
    try {
      const res = await fetch(`${API_BASE}/api/admin/overview`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      const data = await parseJsonSafe(res);
      if (res.ok) {
        dispatch({ type: 'ADMIN_LOAD_SUCCESS', payload: data });
      } else {
        dispatch({
          type: 'ADMIN_LOAD_FAILURE',
          payload: data.error || 'Failed to load admin overview.',
        });
      }
    } catch (err) {
      dispatch({
        type: 'ADMIN_LOAD_FAILURE',
        payload: 'Network error while fetching Admin Dashboard.',
      });
    }
  };

  useEffect(() => {
    fetchAdminOverview();
  }, []);

  useEffect(() => {
    if (!editingLessonId && !editingUserLimitId) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (editingLessonId) dispatch({ type: 'ADMIN_OPEN_LESSON_EDIT', payload: null });
        if (editingUserLimitId) dispatch({ type: 'ADMIN_OPEN_USER_LIMIT_EDIT', payload: null });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [editingLessonId, editingUserLimitId, dispatch]);

  const handleToggleUserRole = async (targetUser) => {
    const newRole = targetUser.role === 'admin' ? 'student' : 'admin';
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${targetUser.id}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await parseJsonSafe(res);
      if (res.ok && data.user) {
        dispatch({ type: 'ADMIN_USER_ROLE_UPDATED', payload: data.user });
      } else {
        dispatch({
          type: 'SET_NOTIFICATION',
          payload: { type: 'error', message: data.error || 'Failed to update user role.' },
        });
      }
    } catch (err) {
      dispatch({
        type: 'SET_NOTIFICATION',
        payload: { type: 'error', message: 'Network error while updating user role.' },
      });
    }
  };

  const handleDeleteUser = (userId, username) => {
    dispatch({
      type: 'OPEN_CONFIRM_DIALOG',
      payload: {
        variant: 'danger',
        title: 'Delete User Account?',
        message: 'This will permanently delete this account and all personal lessons created by this user.',
        khmerMessage: 'គណនីអ្នកប្រើប្រាស់នេះ និងមេរៀនផ្ទាល់ខ្លួនរបស់គាត់នឹងត្រូវបានលុបជាអចិន្ត្រៃយ៍។',
        targetLabel: username,
        confirmText: 'Delete User',
        cancelText: 'Cancel',
        actionType: 'delete_admin_user',
        payload: { id: userId, username },
      },
    });
  };

  const handleDeleteLesson = (lessonId, title) => {
    dispatch({
      type: 'OPEN_CONFIRM_DIALOG',
      payload: {
        variant: 'danger',
        title: 'Delete Lesson Permanently?',
        message: 'This lesson, its sentences, vocabulary, and grammar notes will be removed permanently.',
        khmerMessage: 'មេរៀន ប្រយោគ ពាក្យសព្ទ និងវេយ្យាករណ៍ទាំងអស់នៃវីដេអូនេះនឹងត្រូវបានលុបជាអចិន្ត្រៃយ៍។',
        targetLabel: title,
        confirmText: 'Delete Lesson',
        cancelText: 'Cancel',
        actionType: 'delete_admin_lesson',
        payload: { id: lessonId, title },
      },
    });
  };

  const handleSaveGlobalLimit = async (e) => {
    e.preventDefault();
    dispatch({ type: 'ADMIN_LIMIT_SAVE_START' });
    try {
      const res = await fetch(`${API_BASE}/api/admin/settings/student-limit`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          maxLessons: Number(limitForm.maxLessons),
          windowDays: Number(limitForm.windowDays),
        }),
      });
      const data = await parseJsonSafe(res);
      if (res.ok && data.studentLimit) {
        dispatch({ type: 'ADMIN_LIMIT_SAVE_DONE', payload: data });
        dispatch({
          type: 'SET_NOTIFICATION',
          payload: {
            type: 'success',
            message: `Student limit updated: ${data.studentLimit.maxLessons} video(s) per ${data.studentLimit.windowDays} day(s).`,
          },
        });
      } else {
        dispatch({ type: 'ADMIN_LIMIT_SAVE_DONE' });
        dispatch({
          type: 'SET_NOTIFICATION',
          payload: { type: 'error', message: data.error || 'Failed to update student limit.' },
        });
      }
    } catch {
      dispatch({ type: 'ADMIN_LIMIT_SAVE_DONE' });
      dispatch({
        type: 'SET_NOTIFICATION',
        payload: { type: 'error', message: 'Network error while saving student limit.' },
      });
    }
  };

  const handleSaveUserCustomLimit = async (userId, resetToDefault = false) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${userId}/limit`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          customLimitMax: resetToDefault ? null : userLimitForm.maxLessons,
          customLimitDays: resetToDefault ? null : userLimitForm.windowDays,
        }),
      });
      const data = await parseJsonSafe(res);
      if (res.ok && data.user) {
        dispatch({ type: 'ADMIN_USER_LIMIT_UPDATED', payload: data.user });
        dispatch({
          type: 'SET_NOTIFICATION',
          payload: {
            type: 'success',
            message: resetToDefault
              ? `Reset ${data.user.username} to default student limit.`
              : `Updated custom YouTube limit for ${data.user.username}.`,
          },
        });
      } else {
        dispatch({
          type: 'SET_NOTIFICATION',
          payload: { type: 'error', message: data.error || 'Failed to update custom limit.' },
        });
      }
    } catch {
      dispatch({
        type: 'SET_NOTIFICATION',
        payload: { type: 'error', message: 'Network error updating student limit.' },
      });
    }
  };

  const handleResetUserQuota = async (targetUser) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${targetUser.id}/limit`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ resetQuota: true }),
      });
      const data = await parseJsonSafe(res);
      if (res.ok && data.user) {
        dispatch({ type: 'ADMIN_USER_LIMIT_UPDATED', payload: data.user });
        dispatch({
          type: 'SET_NOTIFICATION',
          payload: {
            type: 'success',
            message: `Reset YouTube link cooldown for ${targetUser.username}.`,
          },
        });
      }
    } catch {
      dispatch({
        type: 'SET_NOTIFICATION',
        payload: { type: 'error', message: 'Network error resetting quota.' },
      });
    }
  };

  const handleAdminCreateLesson = async (e) => {
    e.preventDefault();
    if (!createLibraryForm.videoUrl.trim() || createLibraryForm.creating) return;

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

  const handleToggleLessonPublic = async (lesson) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/lessons/${lesson.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ isPublic: !lesson.is_public }),
      });
      const data = await parseJsonSafe(res);
      if (res.ok && data.lesson) {
        dispatch({ type: 'ADMIN_LESSON_UPDATED', payload: data.lesson });
        dispatch({
          type: 'SET_NOTIFICATION',
          payload: {
            type: 'success',
            message: data.lesson.is_public
              ? `"${data.lesson.title}" is now visible on All Lessons first page!`
              : `"${data.lesson.title}" hidden from All Lessons first page.`,
          },
        });
      } else {
        dispatch({
          type: 'SET_NOTIFICATION',
          payload: { type: 'error', message: data.error || 'Failed to update lesson visibility.' },
        });
      }
    } catch {
      dispatch({
        type: 'SET_NOTIFICATION',
        payload: { type: 'error', message: 'Network error updating lesson visibility.' },
      });
    }
  };

  const handleSaveLessonEdit = async (lessonId) => {
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
          isPublic: lessonEditForm.isPublic,
        }),
      });
      const data = await parseJsonSafe(res);
      if (res.ok && data.lesson) {
        dispatch({ type: 'ADMIN_LESSON_UPDATED', payload: data.lesson });
        dispatch({
          type: 'SET_NOTIFICATION',
          payload: {
            type: 'success',
            message: `Updated lesson "${data.lesson.title}" settings.`,
          },
        });
      } else {
        dispatch({
          type: 'SET_NOTIFICATION',
          payload: { type: 'error', message: data.error || 'Failed to save lesson changes.' },
        });
      }
    } catch {
      dispatch({
        type: 'SET_NOTIFICATION',
        payload: { type: 'error', message: 'Network error saving lesson changes.' },
      });
    }
  };

  const q = searchQuery.trim().toLowerCase();
  const filteredUsers = users.filter(
    (u) =>
      !q ||
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.role && u.role.toLowerCase().includes(q))
  );

  const filteredLessons = lessons.filter(
    (l) =>
      !q ||
      l.title.toLowerCase().includes(q) ||
      l.video_id.toLowerCase().includes(q) ||
      (l.creator_name && l.creator_name.toLowerCase().includes(q)) ||
      (l.creator_email && l.creator_email.toLowerCase().includes(q))
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Admin Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-50 border border-blue-200 text-[#2563EB] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-2xl font-extrabold text-slate-900">
                Admin Dashboard
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-[#2563EB] whitespace-nowrap">
                Admin Role Only
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Create curated video lessons for students, manage accounts, limits, and content.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:flex items-center gap-2 shrink-0 w-full sm:w-auto">
          <button
            type="button"
            onClick={fetchAdminOverview}
            disabled={loading}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer whitespace-nowrap"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => dispatch({ type: 'SET_ACTIVE_SCREEN', payload: 'library' })}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-xs font-semibold text-white shadow-sm cursor-pointer whitespace-nowrap"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Lessons</span>
          </button>
        </div>
      </div>

      {/* 6 KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-4 shadow-sm">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center mb-2">
            <Users className="w-4 h-4" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900">{stats.totalUsers}</div>
          <div className="text-[11px] sm:text-xs font-medium text-slate-500">Total Users</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-4 shadow-sm">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
            <GoogleIcon className="w-4 h-4" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900">
            {stats.googleConnectedUsers}
          </div>
          <div className="text-[11px] sm:text-xs font-medium text-slate-500">Google Connected</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-4 shadow-sm">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
            <Video className="w-4 h-4" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900">{stats.totalLessons}</div>
          <div className="text-[11px] sm:text-xs font-medium text-slate-500">Total Lessons</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-4 shadow-sm">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
            <MessageSquareText className="w-4 h-4" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900">{stats.totalSentences}</div>
          <div className="text-[11px] sm:text-xs font-medium text-slate-500">Total Sentences</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-4 shadow-sm">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900">{stats.totalVocabulary}</div>
          <div className="text-[11px] sm:text-xs font-medium text-slate-500">Saved Vocabulary</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-4 shadow-sm">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-2">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900">{stats.totalGrammarPoints}</div>
          <div className="text-[11px] sm:text-xs font-medium text-slate-500">Grammar Rules</div>
        </div>
      </div>

      {/* Admin Create Video Lesson for Students Card (Responsive Grid) */}
      <form
        onSubmit={handleAdminCreateLesson}
        className="bg-white rounded-2xl border border-blue-200/90 p-4 sm:p-6 shadow-sm space-y-3.5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-[#2563EB] flex items-center justify-center shrink-0">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Create Video Lesson for Students
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Publishes directly to the <span className="font-semibold text-slate-700">All Lessons</span> first page for all students &amp; new users.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5">
          <div className="relative sm:col-span-2 lg:col-span-5">
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
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          <div className="lg:col-span-2">
            <select
              value={createLibraryForm.cefrLevel}
              onChange={(e) =>
                dispatch({
                  type: 'ADMIN_UPDATE_CREATE_LIBRARY_FORM',
                  payload: { field: 'cefrLevel', value: e.target.value },
                })
              }
              disabled={createLibraryForm.creating}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:border-[#2563EB]"
              title="CEFR Level"
            >
              {['A1', 'A2', 'B1', 'B2', 'C1'].map((lvl) => (
                <option key={lvl} value={lvl}>
                  Level {lvl}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-3">
            <input
              type="text"
              placeholder="Tags: Daily Conversation, Story"
              value={createLibraryForm.tags}
              onChange={(e) =>
                dispatch({
                  type: 'ADMIN_UPDATE_CREATE_LIBRARY_FORM',
                  payload: { field: 'tags', value: e.target.value },
                })
              }
              disabled={createLibraryForm.creating}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-2">
            <button
              type="submit"
              disabled={createLibraryForm.creating || !createLibraryForm.videoUrl.trim()}
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer whitespace-nowrap"
            >
              {createLibraryForm.creating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>Create Lesson</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Student YouTube URL Limit Settings Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 sm:px-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              Student YouTube Link Limit
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Default quota is{' '}
              <span className="font-semibold text-slate-700">
                {studentLimit.maxLessons} video{studentLimit.maxLessons === 1 ? '' : 's'}
              </span>{' '}
              every{' '}
              <span className="font-semibold text-slate-700">
                {studentLimit.windowDays} day{studentLimit.windowDays === 1 ? '' : 's'}
              </span>
              . Admins always have unlimited access.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSaveGlobalLimit}
          className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5 w-full lg:w-auto"
        >
          <label className="flex items-center justify-between sm:justify-start gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600">
            <span>Max Videos</span>
            <input
              type="number"
              min={1}
              max={100}
              value={limitForm.maxLessons}
              onChange={(e) =>
                dispatch({
                  type: 'ADMIN_UPDATE_LIMIT_FIELD',
                  payload: { field: 'maxLessons', value: e.target.value },
                })
              }
              className="w-14 px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-900 text-center focus:outline-none focus:border-[#2563EB]"
            />
          </label>

          <label className="flex items-center justify-between sm:justify-start gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600">
            <span>Every Days</span>
            <input
              type="number"
              min={1}
              max={365}
              value={limitForm.windowDays}
              onChange={(e) =>
                dispatch({
                  type: 'ADMIN_UPDATE_LIMIT_FIELD',
                  payload: { field: 'windowDays', value: e.target.value },
                })
              }
              className="w-14 px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-900 text-center focus:outline-none focus:border-[#2563EB]"
            />
          </label>

          <button
            type="submit"
            disabled={savingLimit}
            className="col-span-2 sm:col-span-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 disabled:opacity-60 text-xs font-bold text-white shadow-sm cursor-pointer whitespace-nowrap"
          >
            {savingLimit && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Save Limit</span>
          </button>
        </form>
      </div>

      {/* Management Card: Tabs + Search + Tables */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Top Bar */}
        <div className="p-3.5 sm:p-4 sm:px-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="grid grid-cols-2 sm:flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-full sm:w-fit">
            <button
              type="button"
              onClick={() => dispatch({ type: 'ADMIN_SET_TAB', payload: 'users' })}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'users'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Users ({users.length})
            </button>
            <button
              type="button"
              onClick={() => dispatch({ type: 'ADMIN_SET_TAB', payload: 'lessons' })}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'lessons'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lessons ({lessons.length})
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={
                activeTab === 'users'
                  ? 'Search name, email, admin/student...'
                  : 'Search lesson title, creator...'
              }
              value={searchQuery}
              onChange={(e) => dispatch({ type: 'ADMIN_SET_SEARCH', payload: e.target.value })}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50/70 text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-[#2563EB]"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#2563EB]" />
            <span className="text-xs font-semibold">Loading platform data...</span>
          </div>
        ) : activeTab === 'users' ? (
          /* USERS MANAGEMENT (MOBILE CARDS + DESKTOP TABLE) */
          <>
            {/* Mobile User Cards (< md) */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredUsers.map((u) => (
                <div key={u.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {u.avatar_url ? (
                        <img
                          src={u.avatar_url}
                          alt={u.username}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-[#2563EB] font-bold text-xs flex items-center justify-center shrink-0">
                          {u.username?.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-slate-900 truncate">{u.username}</div>
                        <div className="text-xs text-slate-500 truncate">{u.email}</div>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold shrink-0 ${
                        u.role === 'admin'
                          ? 'bg-blue-100 text-[#2563EB]'
                          : 'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}
                    >
                      {u.role === 'admin' ? <Crown className="w-3 h-3" /> : <GraduationCap className="w-3 h-3" />}
                      <span>{u.role === 'admin' ? 'Admin' : 'Student'}</span>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                    {u.google_id ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <GoogleIcon className="w-3 h-3" />
                        <span>Verified Gmail</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">
                        Password Login
                      </span>
                    )}

                    {u.role === 'admin' ? (
                      <span className="px-2 py-0.5 rounded-full font-bold bg-blue-50 text-[#2563EB]">
                        Unlimited Quota
                      </span>
                    ) : (
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold border ${
                          (u.quota?.remaining ?? 1) > 0
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {u.quota?.usedCount ?? 0}/{u.quota?.maxLessons ?? studentLimit.maxLessons} per{' '}
                        {u.quota?.windowDays ?? studentLimit.windowDays}d
                      </span>
                    )}

                    <span className="text-slate-500 ml-auto">
                      {u.lesson_count} lessons · {u.vocab_count} words
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {u.role !== 'admin' && (
                      <button
                        type="button"
                        onClick={() => dispatch({ type: 'ADMIN_OPEN_USER_LIMIT_EDIT', payload: u })}
                        className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
                      >
                        Edit Quota
                      </button>
                    )}
                    {u.role !== 'admin' && (u.quota?.usedCount ?? 0) > 0 && (
                      <button
                        type="button"
                        onClick={() => handleResetUserQuota(u)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-blue-200 bg-blue-50 text-[#2563EB] text-xs font-semibold cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleToggleUserRole(u)}
                      className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
                    >
                      Set {u.role === 'admin' ? 'Student' : 'Admin'}
                    </button>
                    {u.id !== auth.user.id && (
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(u.id, u.username)}
                        className="ml-auto p-1.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 cursor-pointer"
                        title="Delete user"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {filteredUsers.length === 0 && (
                <div className="py-10 text-center text-xs text-slate-400">
                  No matching users found.
                </div>
              )}
            </div>

            {/* Desktop User Table (>= md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-6">User</th>
                    <th className="py-3.5 px-4">Google OAuth</th>
                    <th className="py-3.5 px-4">Role (Admin / Student)</th>
                    <th className="py-3.5 px-4">YouTube Quota</th>
                    <th className="py-3.5 px-4">Activity</th>
                    <th className="py-3.5 px-4">Joined</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          {u.avatar_url ? (
                            <img
                              src={u.avatar_url}
                              alt={u.username}
                              className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-blue-100 text-[#2563EB] font-bold text-xs flex items-center justify-center shrink-0">
                              {u.username?.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-slate-900">{u.username}</div>
                            <div className="text-xs text-slate-500">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {u.google_id ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <GoogleIcon className="w-3.5 h-3.5" />
                            <span>Verified Gmail</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                            Password Login
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                            u.role === 'admin'
                              ? 'bg-blue-100 text-[#2563EB]'
                              : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}
                        >
                          {u.role === 'admin' ? (
                            <>
                              <Crown className="w-3 h-3" />
                              <span>Admin</span>
                            </>
                          ) : (
                            <>
                              <GraduationCap className="w-3.5 h-3.5" />
                              <span>Student</span>
                            </>
                          )}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {u.role === 'admin' ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-[#2563EB]">
                            Unlimited
                          </span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                                (u.quota?.remaining ?? 1) > 0
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}
                            >
                              {u.quota?.usedCount ?? 0}/{u.quota?.maxLessons ?? studentLimit.maxLessons} per{' '}
                              {u.quota?.windowDays ?? studentLimit.windowDays}d
                              {u.quota?.isCustom && ' (Custom)'}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                dispatch({ type: 'ADMIN_OPEN_USER_LIMIT_EDIT', payload: u })
                              }
                              className="px-2 py-0.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-[11px] font-semibold text-slate-600 cursor-pointer"
                              title="Set custom YouTube limit for this student"
                            >
                              Edit
                            </button>
                            {(u.quota?.usedCount ?? 0) > 0 && (
                              <button
                                type="button"
                                onClick={() => handleResetUserQuota(u)}
                                className="p-1 rounded-lg text-slate-400 hover:text-[#2563EB] hover:bg-blue-50 cursor-pointer"
                                title="Reset student cooldown now"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        <span className="font-semibold text-slate-800">{u.lesson_count}</span>{' '}
                        lessons •{' '}
                        <span className="font-semibold text-slate-800">{u.vocab_count}</span> words
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                      </td>

                      <td className="py-3.5 px-6 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleUserRole(u)}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer"
                            title="Switch role between Admin and Student"
                          >
                            Set as {u.role === 'admin' ? 'Student' : 'Admin'}
                          </button>

                          {u.id !== auth.user.id && (
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(u.id, u.username)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                              title="Delete user"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-xs text-slate-400">
                        No matching users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          /* LESSONS MANAGEMENT (MOBILE CARDS + DESKTOP TABLE) */
          <>
            {/* Mobile Lesson Cards (< md) */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredLessons.map((l) => (
                <div key={l.id} className="p-4 space-y-2.5">
                  <div className="flex items-start gap-3">
                    <img
                      src={`https://i.ytimg.com/vi/${l.video_id}/hqdefault.jpg`}
                      alt={l.title}
                      loading="lazy"
                      className="w-20 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-sm text-slate-900 line-clamp-2 leading-snug">
                        {l.title}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        By {l.creator_name || 'Unknown'} · {l.sentence_count} sents · {l.view_count || 0} views
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold">
                      {l.cefr_level || 'A2'}
                    </span>
                    {l.creator_role === 'admin' ? (
                      <button
                        type="button"
                        onClick={() => handleToggleLessonPublic(l)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border cursor-pointer ${
                          l.is_public
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                      >
                        {l.is_public ? <Globe className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        <span>{l.is_public ? 'Published' : 'Hidden'}</span>
                      </button>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[11px] bg-slate-100 text-slate-500">
                        Student Personal
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => onOpenLesson(l.id, l.title)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-blue-50 text-[#2563EB] text-xs font-bold cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => dispatch({ type: 'ADMIN_OPEN_LESSON_EDIT', payload: l })}
                      className="inline-flex items-center gap-1 py-1.5 px-3 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteLesson(l.id, l.title)}
                      className="p-1.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 cursor-pointer"
                      title="Delete lesson"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {filteredLessons.length === 0 && (
                <div className="py-10 text-center text-xs text-slate-400">
                  No lessons found.
                </div>
              )}
            </div>

            {/* Desktop Lessons Table (>= md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-6">Lesson Video</th>
                    <th className="py-3.5 px-4">Level & Tags</th>
                    <th className="py-3.5 px-4">All Lessons Visibility</th>
                    <th className="py-3.5 px-4">Content & Views</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredLessons.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={`https://i.ytimg.com/vi/${l.video_id}/hqdefault.jpg`}
                            alt={l.title}
                            loading="lazy"
                            className="w-16 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 line-clamp-1">{l.title}</div>
                            <div className="text-[11px] text-slate-400">
                              By {l.creator_name || 'Unknown'} • ID: {l.video_id}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap items-center gap-1">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold">
                            {l.cefr_level || 'A2'}
                          </span>
                          {String(l.tags || 'Daily Conversation')
                            .split(',')
                            .map((t) => t.trim())
                            .filter(Boolean)
                            .slice(0, 2)
                            .map((tag, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px]"
                              >
                                {tag}
                              </span>
                            ))}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {l.creator_role === 'admin' ? (
                          <button
                            type="button"
                            onClick={() => handleToggleLessonPublic(l)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                              l.is_public
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                            }`}
                            title="Click to show or hide this Admin video on the All Lessons first page"
                          >
                            {l.is_public ? (
                              <>
                                <Globe className="w-3.5 h-3.5" />
                                <span>Published</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3.5 h-3.5" />
                                <span>Hidden</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
                            Student Personal
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap items-center gap-1.5 text-xs">
                          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#2563EB] font-semibold">
                            {l.sentence_count} sents
                          </span>
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold">
                            <Flame className="w-3 h-3" />
                            <span>{l.view_count || 0}</span>
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-6 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              dispatch({ type: 'ADMIN_OPEN_LESSON_EDIT', payload: l })
                            }
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#2563EB] hover:bg-blue-50 cursor-pointer"
                            title="Edit level, tags, or title"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onOpenLesson(l.id, l.title)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#2563EB] text-xs font-semibold cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Open</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteLesson(l.id, l.title)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                            title="Delete lesson"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredLessons.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                        No lessons found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Custom Branded Edit Lesson Modal (Admin Dashboard) */}
      {editingLessonId && (
        <div
          className="fixed inset-0 z-[75] bg-slate-900/45 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => dispatch({ type: 'ADMIN_OPEN_LESSON_EDIT', payload: null })}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveLessonEdit(editingLessonId);
            }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-white/98 backdrop-blur-xl rounded-3xl border border-slate-200/90 shadow-2xl p-6 space-y-4 animate-fade-in-up"
          >
            <button
              type="button"
              onClick={() => dispatch({ type: 'ADMIN_OPEN_LESSON_EDIT', payload: null })}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
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
                    Tags
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
                className="py-2.5 px-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-2.5 px-4 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-sm shadow-blue-600/20 cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Custom Branded Edit Student Quota Modal */}
      {editingUserLimitId && (() => {
        const targetStudent = users.find((u) => u.id === editingUserLimitId);
        return (
          <div
            className="fixed inset-0 z-[75] bg-slate-900/45 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
            onClick={() => dispatch({ type: 'ADMIN_OPEN_USER_LIMIT_EDIT', payload: null })}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveUserCustomLimit(editingUserLimitId, false);
              }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md bg-white/98 backdrop-blur-xl rounded-3xl border border-slate-200/90 shadow-2xl p-6 space-y-4 animate-fade-in-up"
            >
              <button
                type="button"
                onClick={() => dispatch({ type: 'ADMIN_OPEN_USER_LIMIT_EDIT', payload: null })}
                className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                aria-label="Close quota modal"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-extrabold text-slate-900">
                    Student YouTube Link Limit
                  </h3>
                  <p className="text-xs text-slate-500 truncate">
                    {targetStudent ? `${targetStudent.username} (${targetStudent.email})` : 'Custom quota'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Max Videos (0 = block)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    placeholder={String(studentLimit.maxLessons)}
                    value={userLimitForm.maxLessons}
                    onChange={(e) =>
                      dispatch({
                        type: 'ADMIN_UPDATE_USER_LIMIT_FIELD',
                        payload: { field: 'maxLessons', value: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-[#2563EB] focus:outline-none text-sm font-bold text-slate-900 text-center"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Every X Days
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={365}
                    placeholder={String(studentLimit.windowDays)}
                    value={userLimitForm.windowDays}
                    onChange={(e) =>
                      dispatch({
                        type: 'ADMIN_UPDATE_USER_LIMIT_FIELD',
                        payload: { field: 'windowDays', value: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-[#2563EB] focus:outline-none text-sm font-bold text-slate-900 text-center"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleSaveUserCustomLimit(editingUserLimitId, true)}
                  className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold cursor-pointer"
                >
                  Use Global Default
                </button>
                <div className="flex-1 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => dispatch({ type: 'ADMIN_OPEN_USER_LIMIT_EDIT', payload: null })}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold shadow-sm cursor-pointer"
                  >
                    Save Limit
                  </button>
                </div>
              </div>
            </form>
          </div>
        );
      })()}
    </div>
  );
}
