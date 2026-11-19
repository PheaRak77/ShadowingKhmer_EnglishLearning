import React from 'react';
import {
  BookOpen,
  Play,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  Search,
  Flag,
  Shuffle,
  CheckCircle2,
  XCircle,
  Volume2,
  Languages,
  RotateCcw,
  Lightbulb,
  Sparkles,
  X,
  ClipboardCheck,
} from 'lucide-react';
import { useAppContext } from '../reducer/appReducer.js';
import { GRAMMAR_STAGES, GRAMMAR_LESSONS } from '../data/grammarCourseData.js';

const LEVEL_STYLES = {
  Beginner: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Elementary: 'bg-sky-50 text-sky-700 border-sky-200',
  Intermediate: 'bg-amber-50 text-amber-700 border-amber-200',
  'Upper-Intermediate': 'bg-rose-50 text-rose-700 border-rose-200',
};

export default function GrammarCourse({ onSpeak }) {
  const { state, dispatch } = useAppContext();
  const { grammarCourse } = state;
  const { activeLessonId, selectedStageId, searchQuery, langMode, answers, completedLessonIds } =
    grammarCourse;

  const activeLesson = activeLessonId
    ? GRAMMAR_LESSONS.find((l) => l.id === activeLessonId) || null
    : null;

  const openLesson = (lessonId) => {
    dispatch({ type: 'GRAMMAR_COURSE_OPEN_LESSON', payload: lessonId });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // =========================================================================
  // VIEW 2: STEP-BY-STEP GRAMMAR LESSON DETAIL PAGE (Matches Screenshot #2)
  // =========================================================================
  if (activeLesson) {
    const stageInfo = GRAMMAR_STAGES.find((s) => s.id === activeLesson.stageId);
    const currentIndex = GRAMMAR_LESSONS.findIndex((l) => l.id === activeLesson.id);
    const prevLesson = currentIndex > 0 ? GRAMMAR_LESSONS[currentIndex - 1] : null;
    const nextLesson =
      currentIndex >= 0 && currentIndex < GRAMMAR_LESSONS.length - 1
        ? GRAMMAR_LESSONS[currentIndex + 1]
        : null;

    const exercises = activeLesson.exercises || [];
    const answeredCount = Object.keys(answers).length;
    const correctCount = exercises.reduce(
      (acc, ex, idx) => (answers[idx] === ex.correctIndex ? acc + 1 : acc),
      0
    );
    const isCompleted = completedLessonIds.includes(activeLesson.id);
    const showEn = langMode === 'bilingual' || langMode === 'en';
    const showKm = langMode === 'bilingual' || langMode === 'km';

    return (
      <div className="max-w-4xl mx-auto space-y-5 sm:space-y-6 animate-fade-in-up">
        {/* Top Back Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              dispatch({ type: 'GRAMMAR_COURSE_BACK_TO_LIST' });
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-[#2563EB] transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>All grammar lessons</span>
          </button>

          {isCompleted && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Completed</span>
            </span>
          )}
        </div>

        {/* Lesson Title Header */}
        <div className="space-y-2">
          <div className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-[#2563EB]">
            {activeLesson.isMixedReview
              ? `MIXED REVIEW · ${stageInfo?.code || 'STAGE 1'}: ${stageInfo?.title || ''}`
              : `LESSON ${activeLesson.number} · ${stageInfo?.code || 'STAGE 1'}: ${
                  stageInfo?.title || ''
                }`}
          </div>
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {activeLesson.title}
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                LEVEL_STYLES[activeLesson.level] || LEVEL_STYLES.Beginner
              }`}
            >
              {activeLesson.level}
            </span>
          </div>
        </div>

        {/* FORM & USE Card with Language Switcher */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              FORM &amp; USE
            </span>

            {/* Language Mode Selector */}
            <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
              {[
                { id: 'bilingual', label: 'EN + ខ្មែរ' },
                { id: 'en', label: 'English' },
                { id: 'km', label: 'ខ្មែរ' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => dispatch({ type: 'GRAMMAR_COURSE_SET_LANG', payload: opt.id })}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    langMode === opt.id
                      ? 'bg-white text-[#2563EB] shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {opt.id === 'bilingual' && <Languages className="w-3 h-3" />}
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {showEn && (
            <p className="text-sm sm:text-[15px] text-slate-800 leading-relaxed font-medium">
              {activeLesson.shortEn}
            </p>
          )}
          {showKm && (
            <p className="text-xs sm:text-sm text-slate-600 khmer-text bg-amber-50/60 border border-amber-100 rounded-xl px-3.5 py-2.5">
              {activeLesson.shortKm}
            </p>
          )}
        </div>

        {/* STEP-BY-STEP EXPLANATION CARDS */}
        {(activeLesson.steps || []).map((step) => (
          <div
            key={step.number}
            className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-4"
          >
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-baseline gap-2">
              <span className="text-[#2563EB]">{step.number}.</span>
              <span>{step.title}</span>
            </h2>

            <div className="space-y-2.5">
              {showEn && (
                <p className="text-sm text-slate-700 leading-relaxed">{step.explanationEn}</p>
              )}
              {showKm && (
                <p className="text-xs sm:text-sm text-slate-600 khmer-text leading-relaxed">
                  {step.explanationKm}
                </p>
              )}
            </div>

            {/* Clean Responsive Grammar Table */}
            {step.table && (
              <div className="overflow-x-auto smooth-scroll -mx-1 px-1">
                <table className="w-full text-left border-collapse min-w-[460px]">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      {step.table.headers.map((header, hIdx) => (
                        <th key={hIdx} className="py-2.5 pr-4">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                    {step.table.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50/70">
                        {row.map((cell, cIdx) => (
                          <td
                            key={cIdx}
                            className={`py-3 pr-4 ${
                              cIdx === 0 ? 'font-bold text-slate-900' : 'text-slate-700'
                            }`}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Common Mistake / Key Tip Callout */}
            {(step.noteEn || step.noteKm) && (
              <div className="rounded-xl bg-blue-50/70 border border-blue-100 p-3.5 space-y-1">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#2563EB]">
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>Important Tip</span>
                </div>
                {showEn && step.noteEn && (
                  <p className="text-xs sm:text-sm text-slate-700 font-medium">{step.noteEn}</p>
                )}
                {showKm && step.noteKm && (
                  <p className="text-xs sm:text-sm text-slate-600 khmer-text">{step.noteKm}</p>
                )}
              </div>
            )}

            {/* Spoken Example Sentences with Audio */}
            {step.examples && step.examples.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Real Spoken Examples (Click 🔊 to listen)
                </div>
                <div className="space-y-2">
                  {step.examples.map((ex, eIdx) => (
                    <div
                      key={eIdx}
                      className="flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-50/90 border border-slate-100 hover:border-blue-200 transition-colors"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="text-xs sm:text-sm font-semibold text-slate-900">
                          {ex.en}
                        </div>
                        {showKm && ex.km && (
                          <div className="text-xs text-slate-500 khmer-text">{ex.km}</div>
                        )}
                      </div>
                      {onSpeak && (
                        <button
                          type="button"
                          onClick={() => onSpeak(ex.en.replace(/\s*\([^)]*\)\s*/g, ''))}
                          className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-[#2563EB] hover:bg-blue-50 flex items-center justify-center shrink-0 cursor-pointer"
                          title="Listen to pronunciation"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* INTERACTIVE PRACTICE EXERCISES (INSTANT GRADING) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
                <ClipboardCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                  Practice Exercises
                </h2>
                <p className="text-xs text-slate-500">
                  Tap an answer to check instantly with English &amp; Khmer explanations.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                Score: {correctCount} / {exercises.length}
              </span>
              {answeredCount > 0 && (
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'GRAMMAR_COURSE_RESET_EXERCISES' })}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-600 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry</span>
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {exercises.map((ex, exIdx) => {
              const selected = answers[exIdx];
              const hasAnswered = selected !== undefined;
              const isRight = selected === ex.correctIndex;

              return (
                <div
                  key={exIdx}
                  className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/40 space-y-3"
                >
                  <div className="text-xs sm:text-sm font-bold text-slate-900">
                    <span className="text-[#2563EB] mr-1.5">Q{exIdx + 1}.</span>
                    {ex.question}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {ex.options.map((opt, optIdx) => {
                      let btnStyle =
                        'bg-white border-slate-200 text-slate-700 hover:border-[#2563EB] hover:bg-blue-50/40';
                      if (hasAnswered) {
                        if (optIdx === ex.correctIndex) {
                          btnStyle = 'bg-emerald-50 border-emerald-400 text-emerald-800 font-bold';
                        } else if (optIdx === selected && optIdx !== ex.correctIndex) {
                          btnStyle = 'bg-rose-50 border-rose-400 text-rose-800 font-bold';
                        } else {
                          btnStyle = 'bg-white/60 border-slate-200 text-slate-400';
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() =>
                            dispatch({
                              type: 'GRAMMAR_COURSE_ANSWER_EXERCISE',
                              payload: { exerciseIndex: exIdx, optionIndex: optIdx },
                            })
                          }
                          className={`px-3.5 py-2.5 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between gap-2 cursor-pointer ${btnStyle}`}
                        >
                          <span>{opt}</span>
                          {hasAnswered && optIdx === ex.correctIndex && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          )}
                          {hasAnswered &&
                            optIdx === selected &&
                            optIdx !== ex.correctIndex && (
                              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                            )}
                        </button>
                      );
                    })}
                  </div>

                  {hasAnswered && (
                    <div
                      className={`p-3 rounded-xl text-xs space-y-1 border ${
                        isRight
                          ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                          : 'bg-rose-50/80 border-rose-200 text-rose-900'
                      }`}
                    >
                      <div className="font-bold">
                        {isRight ? '✓ Correct!' : '✗ Not quite — here is why:'}
                      </div>
                      {showEn && <div>{ex.explanationEn}</div>}
                      {showKm && <div className="khmer-text opacity-90">{ex.explanationKm}</div>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Complete & Lesson Navigation Footer */}
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              {prevLesson && (
                <button
                  type="button"
                  onClick={() => openLesson(prevLesson.id)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  dispatch({ type: 'GRAMMAR_COURSE_MARK_COMPLETE', payload: activeLesson.id })
                }
                className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  isCompleted
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-900 text-white'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isCompleted ? 'Lesson Completed' : 'Mark as Complete'}</span>
              </button>

              {nextLesson && (
                <button
                  type="button"
                  onClick={() => {
                    dispatch({ type: 'GRAMMAR_COURSE_MARK_COMPLETE', payload: activeLesson.id });
                    openLesson(nextLesson.id);
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold shadow-sm cursor-pointer"
                >
                  <span>Next: {nextLesson.title}</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 1: COURSE PATH OVERVIEW (Matches Screenshot #1)
  // =========================================================================
  const q = (searchQuery || '').trim().toLowerCase();
  const nextRecommendedLesson =
    GRAMMAR_LESSONS.find((l) => !completedLessonIds.includes(l.id)) || GRAMMAR_LESSONS[0];
  const progressPct = Math.round((completedLessonIds.length / GRAMMAR_LESSONS.length) * 100);

  const visibleStages = GRAMMAR_STAGES.filter(
    (stage) => selectedStageId === 'ALL' || stage.id === selectedStageId
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in-up">
      {/* Page Title */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shadow-sm shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            English grammar
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
          Every structure you&apos;ll hear in real English, from the basics to advanced — with the
          form, step-by-step explanations in English &amp; Khmer, example sentences, and instant
          exercises.
        </p>
      </div>

      {/* Main 2-Column Layout: Left Course Path Sidebar + Right Lessons Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* LEFT SIDEBAR: COURSE PATH */}
        <aside className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              COURSE PATH
            </span>
            <span className="text-[11px] font-bold text-[#2563EB]">
              {completedLessonIds.length}/{GRAMMAR_LESSONS.length} done ({progressPct}%)
            </span>
          </div>

          {/* Mobile Horizontal Stage Selector (< lg) */}
          <div className="flex lg:hidden items-center gap-1.5 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => dispatch({ type: 'GRAMMAR_COURSE_SET_STAGE', payload: 'ALL' })}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 whitespace-nowrap cursor-pointer ${
                selectedStageId === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600'
              }`}
            >
              All Stages
            </button>
            {GRAMMAR_STAGES.map((stage) => (
              <button
                key={stage.id}
                type="button"
                onClick={() => dispatch({ type: 'GRAMMAR_COURSE_SET_STAGE', payload: stage.id })}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 whitespace-nowrap cursor-pointer ${
                  selectedStageId === stage.id
                    ? 'bg-[#2563EB] text-white'
                    : 'bg-white border border-slate-200 text-slate-600'
                }`}
              >
                {stage.code}: {stage.title.split(':')[0]}
              </button>
            ))}
          </div>

          {/* Desktop Vertical Course Path Timeline (>= lg) */}
          <div className="hidden lg:block bg-white/80 rounded-2xl border border-slate-200/80 p-3.5 space-y-1">
            <button
              type="button"
              onClick={() => dispatch({ type: 'GRAMMAR_COURSE_SET_STAGE', payload: 'ALL' })}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                selectedStageId === 'ALL'
                  ? 'bg-blue-50 text-[#2563EB]'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>All Stages ({GRAMMAR_LESSONS.length} lessons)</span>
              <Sparkles className="w-3.5 h-3.5" />
            </button>

            <div className="pt-1 space-y-1">
              {GRAMMAR_STAGES.map((stage) => {
                const stageLessons = GRAMMAR_LESSONS.filter((l) => l.stageId === stage.id);
                const stageDone = stageLessons.filter((l) =>
                  completedLessonIds.includes(l.id)
                ).length;
                const isSelected = selectedStageId === stage.id;
                const allStageDone = stageLessons.length > 0 && stageDone === stageLessons.length;

                return (
                  <button
                    key={stage.id}
                    type="button"
                    onClick={() =>
                      dispatch({ type: 'GRAMMAR_COURSE_SET_STAGE', payload: stage.id })
                    }
                    className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-start gap-2.5 cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/90 border border-blue-200/80'
                        : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div
                      className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        allStageDone
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : isSelected
                          ? 'border-[#2563EB] bg-blue-100'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {allStageDone && <CheckCircle2 className="w-3 h-3" />}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        {stage.code}
                      </div>
                      <div
                        className={`text-xs font-bold leading-snug ${
                          isSelected ? 'text-[#2563EB]' : 'text-slate-800'
                        }`}
                      >
                        {stage.title}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {stageDone}/{stageLessons.length} lessons
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* RIGHT COLUMN: START HERE HERO + SEARCH + STAGE LESSONS */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-5">
          {/* Blue START HERE Hero Card */}
          <div
            onClick={() => openLesson(nextRecommendedLesson.id)}
            className="rounded-2xl bg-gradient-to-r from-[#2563EB] via-blue-600 to-indigo-600 text-white p-5 sm:p-6 shadow-md shadow-blue-600/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:brightness-105 transition-all group"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Play className="w-5 h-5 fill-white text-white ml-0.5" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-blue-100">
                  {completedLessonIds.length === 0 ? 'START HERE' : 'CONTINUE LEARNING'}
                </div>
                <div className="text-sm sm:text-base font-extrabold truncate">
                  Lesson {nextRecommendedLesson.number} · {nextRecommendedLesson.title}
                </div>
                <div className="text-xs text-blue-100/90 mt-0.5">
                  Step-by-step English + Khmer explanation &amp; instant exercises
                </div>
              </div>
            </div>

            <span className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-xs sm:text-sm font-bold whitespace-nowrap shrink-0">
              <span>Start</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>

          {/* Search Input */}
          <div className="space-y-1.5">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search a structure: present perfect, passive, am/is/are, Khmer..."
                value={searchQuery}
                onChange={(e) =>
                  dispatch({ type: 'GRAMMAR_COURSE_SET_SEARCH', payload: e.target.value })
                }
                className="w-full pl-11 pr-9 py-3 rounded-2xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 shadow-sm focus:outline-none focus:border-[#2563EB]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'GRAMMAR_COURSE_SET_SEARCH', payload: '' })}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-400 px-1">
              Follow the path from top to bottom, or jump straight to any lesson.
            </p>
          </div>

          {/* Stage Sections + Numbered Lesson Cards */}
          {visibleStages.map((stage) => {
            const stageLessons = GRAMMAR_LESSONS.filter((l) => {
              if (l.stageId !== stage.id) return false;
              if (!q) return true;
              return (
                l.title.toLowerCase().includes(q) ||
                l.shortEn.toLowerCase().includes(q) ||
                l.shortKm.toLowerCase().includes(q) ||
                l.level.toLowerCase().includes(q)
              );
            });

            if (stageLessons.length === 0) return null;

            return (
              <section key={stage.id} className="space-y-3 pt-2">
                {/* Stage Header with Orange Flag Badge */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-orange-50 border border-orange-200 text-orange-500 flex items-center justify-center shrink-0 mt-0.5">
                    <Flag className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                        {stage.code}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                        {stageLessons.length} Lessons
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5">
                      {stage.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{stage.subtitleEn}</p>
                    <p className="text-xs text-slate-400 khmer-text mt-0.5">{stage.subtitleKm}</p>
                  </div>
                </div>

                {/* Numbered Lesson Cards List */}
                <div className="space-y-3 pl-0 sm:pl-3">
                  {stageLessons.map((lesson) => {
                    const isDone = completedLessonIds.includes(lesson.id);

                    // Mixed Review Dashed Blue Card (matches Screenshot #1)
                    if (lesson.isMixedReview) {
                      return (
                        <div key={lesson.id} className="flex items-start gap-3">
                          <div className="hidden sm:flex w-8 h-8 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] items-center justify-center shrink-0 mt-4">
                            <Shuffle className="w-3.5 h-3.5" />
                          </div>
                          <div
                            onClick={() => openLesson(lesson.id)}
                            className="flex-1 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/30 hover:bg-blue-50/60 p-4 sm:p-5 transition-all cursor-pointer space-y-2.5"
                          >
                            <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#2563EB]">
                              MIXED REVIEW
                            </div>
                            <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                              {lesson.title}
                            </h3>
                            <div className="text-xs font-medium text-[#2563EB]">
                              {lesson.reviewPair}
                            </div>
                            <div className="flex items-start gap-1.5 text-xs text-slate-600">
                              <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                              <div>
                                <div>{lesson.tipEn}</div>
                                <div className="khmer-text text-slate-500 mt-0.5">
                                  {lesson.tipKm}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 pt-1">
                              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#2563EB] text-white text-xs font-bold shadow-sm">
                                <Shuffle className="w-3.5 h-3.5" />
                                <span>Review</span>
                              </span>
                              <span className="text-xs text-slate-500 font-medium">
                                {lesson.exercises.length} exercises
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // Standard Numbered Grammar Lesson Card
                    return (
                      <div key={lesson.id} className="flex items-start gap-3">
                        <div
                          className={`hidden sm:flex w-8 h-8 rounded-full border text-xs font-bold items-center justify-center shrink-0 mt-4 ${
                            isDone
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-600'
                              : 'bg-white border-slate-200 text-slate-500'
                          }`}
                        >
                          {isDone ? <CheckCircle2 className="w-4 h-4" /> : lesson.number}
                        </div>

                        <div
                          onClick={() => openLesson(lesson.id)}
                          className="flex-1 bg-white rounded-2xl border border-slate-200/90 hover:border-blue-300 hover:shadow-md p-4 sm:p-5 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                        >
                          <div className="space-y-1.5 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="sm:hidden inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-[11px] font-bold text-slate-600">
                                {isDone ? '✓' : lesson.number}
                              </span>
                              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-[#2563EB] transition-colors">
                                {lesson.title}
                              </h3>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold border ${
                                  LEVEL_STYLES[lesson.level] || LEVEL_STYLES.Beginner
                                }`}
                              >
                                {lesson.level}
                              </span>
                            </div>

                            <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed">
                              {lesson.shortEn}
                            </p>
                            <p className="text-xs text-slate-500 khmer-text">{lesson.shortKm}</p>

                            <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400 font-medium">
                              <span>{lesson.steps.length} step-by-step guides</span>
                              <span>•</span>
                              <span>{lesson.exercises.length} instant exercises</span>
                            </div>
                          </div>

                          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#2563EB] group-hover:translate-x-0.5 transition-all shrink-0" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
