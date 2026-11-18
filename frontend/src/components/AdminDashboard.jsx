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

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}" and their lessons?`)) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      if (res.ok) {
        dispatch({ type: 'ADMIN_USER_DELETED', payload: userId });
      } else {
        const data = await parseJsonSafe(res);
        dispatch({
          type: 'SET_NOTIFICATION',
          payload: { type: 'error', message: data.error || 'Failed to delete user.' },
        });
      }
    } catch (err) {
      dispatch({
        type: 'SET_NOTIFICATION',
        payload: { type: 'error', message: 'Network error while deleting user.' },
      });
    }
  };

  const handleDeleteLesson = async (lessonId, title) => {
    if (!window.confirm(`Delete lesson "${title}" permanently?`)) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/admin/lessons/${lessonId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      if (res.ok) {
        dispatch({ type: 'ADMIN_LESSON_DELETED', payload: lessonId });
      } else {
        const data = await parseJsonSafe(res);
        dispatch({
          type: 'SET_NOTIFICATION',
          payload: { type: 'error', message: data.error || 'Failed to delete lesson.' },
        });
      }
    } catch (err) {
      dispatch({
        type: 'SET_NOTIFICATION',
        payload: { type: 'error', message: 'Network error while deleting lesson.' },
      });
    }
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
    <div className="space-y-6">
      {/* Admin Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-[#2563EB] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Admin Dashboard
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-[#2563EB]">
                Admin Role Only
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Manage Admin & Student accounts, Google OAuth connections, video shadowing lessons,
              and bilingual content.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={fetchAdminOverview}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => dispatch({ type: 'SET_ACTIVE_SCREEN', payload: 'workspace' })}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-xs font-semibold text-white shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Shadowing</span>
          </button>
        </div>
      </div>

      {/* 6 KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center mb-2.5">
            <Users className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{stats.totalUsers}</div>
          <div className="text-xs font-medium text-slate-500">Total Users</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2.5">
            <GoogleIcon className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {stats.googleConnectedUsers}
          </div>
          <div className="text-xs font-medium text-slate-500">Google Connected</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2.5">
            <Video className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{stats.totalLessons}</div>
          <div className="text-xs font-medium text-slate-500">Total Lessons</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2.5">
            <MessageSquareText className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{stats.totalSentences}</div>
          <div className="text-xs font-medium text-slate-500">Total Sentences</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2.5">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{stats.totalVocabulary}</div>
          <div className="text-xs font-medium text-slate-500">Saved Vocabulary</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-2.5">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{stats.totalGrammarPoints}</div>
          <div className="text-xs font-medium text-slate-500">Grammar Rules</div>
        </div>
      </div>

      {/* Student YouTube URL Limit Settings Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:px-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
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

        <form onSubmit={handleSaveGlobalLimit} className="flex flex-wrap items-center gap-2.5">
          <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <span>Max Videos:</span>
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
              className="w-16 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 text-center focus:bg-white focus:outline-none focus:border-[#2563EB]"
            />
          </label>

          <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <span>Every (Days):</span>
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
              className="w-16 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 text-center focus:bg-white focus:outline-none focus:border-[#2563EB]"
            />
          </label>

          <button
            type="submit"
            disabled={savingLimit}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 disabled:opacity-60 text-xs font-bold text-white shadow-sm cursor-pointer"
          >
            {savingLimit && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Save Limit</span>
          </button>
        </form>
      </div>

      {/* Management Card: Tabs + Search + Tables */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Top Bar */}
        <div className="p-4 sm:px-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl w-fit">
            <button
              type="button"
              onClick={() => dispatch({ type: 'ADMIN_SET_TAB', payload: 'users' })}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Admins & Students ({users.length})
            </button>
            <button
              type="button"
              onClick={() => dispatch({ type: 'ADMIN_SET_TAB', payload: 'lessons' })}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'lessons'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Video Lessons ({lessons.length})
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
          /* USERS MANAGEMENT TABLE */
          <div className="overflow-x-auto">
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
                      ) : editingUserLimitId === u.id ? (
                        <div className="flex flex-wrap items-center gap-1.5">
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
                            className="w-12 px-1.5 py-1 rounded-lg border border-slate-300 text-xs text-center"
                            title="Videos allowed (0 = block)"
                          />
                          <span className="text-[11px] text-slate-400">/</span>
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
                            className="w-12 px-1.5 py-1 rounded-lg border border-slate-300 text-xs text-center"
                            title="Days window"
                          />
                          <span className="text-[11px] text-slate-400">d</span>
                          <button
                            type="button"
                            onClick={() => handleSaveUserCustomLimit(u.id, false)}
                            className="px-2 py-1 rounded-lg bg-[#2563EB] text-white text-[11px] font-bold cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveUserCustomLimit(u.id, true)}
                            className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-semibold cursor-pointer"
                            title="Revert to global student default"
                          >
                            Default
                          </button>
                        </div>
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
                            Set
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
        ) : (
          /* LESSONS MANAGEMENT TABLE */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-6">Lesson Title</th>
                  <th className="py-3.5 px-4">Creator</th>
                  <th className="py-3.5 px-4">Content Extracted</th>
                  <th className="py-3.5 px-4">Created</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredLessons.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="font-bold text-slate-900">{l.title}</div>
                      <div className="text-xs text-slate-400">YouTube ID: {l.video_id}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-xs font-semibold text-slate-800">
                        {l.creator_name || 'Unknown'}
                      </div>
                      <div className="text-[11px] text-slate-500">{l.creator_email || ''}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1.5 text-xs">
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#2563EB] font-semibold">
                          {l.sentence_count} sentences
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-semibold">
                          {l.vocab_count} vocab
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-semibold">
                          {l.grammar_count} grammar
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {l.created_at ? new Date(l.created_at).toLocaleDateString() : '—'}
                    </td>

                    <td className="py-3.5 px-6 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onOpenLesson(l.id)}
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
        )}
      </div>
    </div>
  );
}
