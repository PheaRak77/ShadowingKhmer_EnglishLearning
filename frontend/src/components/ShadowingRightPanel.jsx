import React, { memo } from 'react';
import {
  Search,
  Volume2,
  Check,
  CheckCircle2,
  BookmarkPlus,
  Loader2,
  X,
  Languages,
  Lightbulb,
  Keyboard,
  BookOpen,
  GraduationCap,
  Play,
  ArrowRight,
  Lock,
} from 'lucide-react';
import { useAppContext } from '../reducer/appReducer.js';

function ShadowingRightPanel({
  filteredSentences,
  activeSentenceRef,
  isGuest,
  onSentenceClick,
  onWordClick,
  onSpeakText,
  onSaveWord,
  onSelectPracticeMode,
  onOpenLibraryLesson,
}) {
  const { state, dispatch } = useAppContext();
  const {
    sentences,
    vocabulary,
    grammarPoints,
    library,
    currentLesson,
    activeSentenceIndex,
    visibleKhmerMap,
    showAllKhmer,
    completedSentencesMap,
    sentenceSearchQuery,
    selectedWordPopup,
    shadowing,
  } = state;

  const { rightTab } = shadowing;
  const completedCount = Object.values(completedSentencesMap).filter(Boolean).length;

  const otherVideos = (library?.lessons || []).filter(
    (item) => item.id !== currentLesson?.id
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
      {/* Top 3 Reference Pill Tabs: Transcript | Same lesson | More videos to practice */}
      <div className="px-3.5 sm:px-4 pt-3.5 pb-3 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto">
        {[
          { id: 'transcript', label: 'Transcript' },
          { id: 'same_lesson', label: 'Same lesson' },
          { id: 'more_videos', label: 'More videos to practice' },
        ].map((tab) => {
          const isActive = rightTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() =>
                dispatch({
                  type: 'SHADOWING_UPDATE',
                  payload: { rightTab: tab.id, openMenu: null },
                })
              }
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* =========================================================
          TAB 1: TRANSCRIPT (Matches Image 1 Clean Sentence Rows)
      ========================================================= */}
      {rightTab === 'transcript' && (
        <>
          {/* Sentence Count & Khmer List Toggle */}
          <div className="px-4 pt-3.5 pb-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-[13px] font-semibold text-slate-500">
                {sentences.length} sentences
              </span>
              {completedCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-bold text-emerald-700">
                  {completedCount}/{sentences.length} done
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => dispatch({ type: 'TOGGLE_ALL_KHMER' })}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer khmer-text ${
                showAllKhmer
                  ? 'bg-blue-50 text-[#2563EB] border-blue-200'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
              title="Show or hide Khmer translations inside the transcript list"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{showAllKhmer ? 'លាក់ខ្មែរ' : 'បង្ហាញខ្មែរ'}</span>
            </button>
          </div>

          {/* Lightbulb Tip + Inline Search Pill (Matches Image 1 rounded callout box) */}
          <div className="px-4 pb-3">
            <div className="relative flex items-center rounded-xl border border-slate-200/90 bg-slate-50/50 focus-within:bg-white focus-within:border-[#2563EB] transition-colors">
              {sentenceSearchQuery ? (
                <Search className="w-3.5 h-3.5 text-[#2563EB] absolute left-3" />
              ) : (
                <Lightbulb className="w-3.5 h-3.5 text-blue-500 absolute left-3" />
              )}
              <input
                type="text"
                placeholder="Click any sentence to jump · search English or Khmer..."
                value={sentenceSearchQuery}
                onChange={(e) =>
                  dispatch({ type: 'SET_SENTENCE_SEARCH', payload: e.target.value })
                }
                className="w-full pl-9 pr-8 py-2 bg-transparent text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none"
              />
              {sentenceSearchQuery && (
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'SET_SENTENCE_SEARCH', payload: '' })}
                  className="absolute right-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Clicked Word Popup Bar */}
          {selectedWordPopup && (
            <div className="mx-4 mb-3 p-3 rounded-xl bg-blue-50/90 border border-blue-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  type="button"
                  onClick={() => onSpeakText(selectedWordPopup.cleanWord)}
                  className="w-8 h-8 rounded-lg bg-[#2563EB] text-white flex items-center justify-center shadow-xs hover:bg-blue-700 cursor-pointer shrink-0"
                  title="Pronounce word"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
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
                    <div className="text-xs font-medium text-blue-800 khmer-text truncate">
                      {selectedWordPopup.existingMatch.khmer_meaning}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={selectedWordPopup.saving || selectedWordPopup.saved}
                  onClick={onSaveWord}
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
                      <span>Saved</span>
                    </>
                  ) : (
                    <>
                      <BookmarkPlus className="w-3.5 h-3.5" />
                      <span>Save</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'CLOSE_WORD_POPUP' })}
                  className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Clean Airy Sentence Rows List */}
          <div className="divide-y divide-slate-100 max-h-[540px] lg:max-h-[610px] overflow-y-auto smooth-scroll border-t border-slate-100">
            {filteredSentences.map((s) => {
              const isActive = activeSentenceIndex === s.sentence_index;
              const isKhmerShown = !!visibleKhmerMap[s.sentence_index];
              const isCompleted = !!completedSentencesMap[s.sentence_index];
              const words = s.english_text.split(' ');

              return (
                <div
                  key={s.id || s.sentence_index}
                  ref={isActive ? activeSentenceRef : null}
                  onClick={() => onSentenceClick(s)}
                  className={`group px-4 py-3.5 transition-all duration-150 cursor-pointer flex items-start gap-3 ${
                    isActive
                      ? 'bg-blue-50/75 border-l-[3px] border-l-[#2563EB]'
                      : 'border-l-[3px] border-l-transparent hover:bg-slate-50/90'
                  }`}
                >
                  {/* Circular Number / Emerald Check Badge (exact Image 1 style) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch({
                        type: 'TOGGLE_COMPLETE_SENTENCE',
                        payload: s.sentence_index,
                      });
                    }}
                    title={isCompleted ? 'Marked as practiced' : 'Mark as practiced'}
                    className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#2563EB] text-white shadow-xs'
                        : isCompleted
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-600'
                        : 'bg-white border border-slate-200 text-slate-500 group-hover:border-blue-300 group-hover:text-[#2563EB]'
                    }`}
                  >
                    {isCompleted && !isActive ? (
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    ) : (
                      s.sentence_index
                    )}
                  </button>

                  {/* Sentence English + Optional Khmer */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div
                      className={`text-[13px] sm:text-sm leading-relaxed flex flex-wrap gap-x-1 ${
                        isActive
                          ? 'font-semibold text-slate-900'
                          : isCompleted
                          ? 'font-medium text-slate-500'
                          : 'font-medium text-slate-800'
                      }`}
                    >
                      {words.map((word, wIdx) => (
                        <span
                          key={wIdx}
                          onClick={(e) => onWordClick(e, word, s)}
                          className="hover:bg-blue-100/80 hover:text-[#2563EB] rounded px-0.5 transition-colors cursor-pointer"
                          title="Click to pronounce or save word"
                        >
                          {word}
                        </span>
                      ))}
                    </div>

                    {isKhmerShown && s.khmer_text && (
                      <div className="mt-2 px-2.5 py-1.5 rounded-xl bg-amber-50/75 border border-amber-200/60 text-slate-700 text-xs khmer-text leading-relaxed">
                        {s.khmer_text}
                      </div>
                    )}
                  </div>

                  {/* Compact Subtle Action Icons */}
                  <div
                    className="flex items-center gap-0.5 shrink-0 opacity-75 sm:opacity-60 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => onSpeakText(s.english_text)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-[#2563EB] hover:bg-blue-50 transition-colors cursor-pointer"
                      title="Listen to sentence"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        dispatch({
                          type: 'TOGGLE_SENTENCE_KHMER',
                          payload: s.sentence_index,
                        })
                      }
                      className={`px-1.5 py-0.5 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer khmer-text ${
                        isKhmerShown
                          ? 'bg-[#2563EB] text-white border-[#2563EB]'
                          : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100'
                      }`}
                      title="Toggle Khmer translation"
                    >
                      ខ្មែរ
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredSentences.length === 0 && (
              <div className="py-12 px-4 text-center text-xs text-slate-400">
                No matching sentences found.
              </div>
            )}
          </div>
        </>
      )}

      {/* =========================================================
          TAB 2: SAME LESSON (Quick Practice Modes + Vocab Preview)
      ========================================================= */}
      {rightTab === 'same_lesson' && (
        <div className="p-4 space-y-3.5 max-h-[660px] overflow-y-auto smooth-scroll">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Practice this lesson another way
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 khmer-text">
              ហ្វឹកហាត់មេរៀនដដែលនេះជាមួយ Dictation, ពាក្យសព្ទ និងវេយ្យាករណ៍
            </p>
          </div>

          <div className="space-y-2.5">
            {[
              {
                mode: 'dictation',
                title: 'Dictation (Listen & Type)',
                desc: `Type what you hear across ${sentences.length} sentences`,
                badge: `${sentences.length} clips`,
                icon: Keyboard,
                color: 'bg-amber-50 text-amber-600 border-amber-200',
              },
              {
                mode: 'vocabulary',
                title: 'Vocabulary & Flashcards',
                desc: 'Review key words with IPA, audio & Khmer meaning',
                badge: `${vocabulary.length} words`,
                icon: BookOpen,
                color: 'bg-purple-50 text-purple-600 border-purple-200',
              },
              {
                mode: 'grammar',
                title: 'Lesson Grammar Notes',
                desc: 'Bilingual English–Khmer structures used in this video',
                badge: `${grammarPoints.length} rules`,
                icon: GraduationCap,
                color: 'bg-rose-50 text-rose-600 border-rose-200',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.mode}
                  type="button"
                  onClick={() => onSelectPracticeMode(item.mode)}
                  className="w-full p-3.5 rounded-2xl border border-slate-200 hover:border-blue-300 bg-white hover:bg-blue-50/30 transition-all text-left flex items-center gap-3 cursor-pointer group"
                >
                  <div
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${item.color}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#2563EB] transition-colors">
                        {item.title}
                      </span>
                      {isGuest && <Lock className="w-3 h-3 text-slate-400" />}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">{item.desc}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[11px] font-semibold text-slate-600">
                      {item.badge}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#2563EB] group-hover:translate-x-0.5 transition-all" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Preview of Key Vocabulary in This Lesson */}
          {vocabulary.length > 0 && (
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Key words in this video
                </span>
                <button
                  type="button"
                  onClick={() => onSelectPracticeMode('vocabulary')}
                  className="text-xs font-semibold text-[#2563EB] hover:underline cursor-pointer"
                >
                  Open all →
                </button>
              </div>
              <div className="space-y-1.5">
                {vocabulary.slice(0, 6).map((v, i) => (
                  <div
                    key={v.id || i}
                    className="px-3 py-2 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-900">{v.word}</span>
                        {v.ipa && (
                          <span className="text-[11px] font-mono text-slate-400">{v.ipa}</span>
                        )}
                      </div>
                      <div className="text-xs text-[#2563EB] khmer-text truncate">
                        {v.khmer_meaning}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onSpeakText(v.word)}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-[#2563EB] cursor-pointer shrink-0"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================
          TAB 3: MORE VIDEOS TO PRACTICE (Curated Library Switcher)
      ========================================================= */}
      {rightTab === 'more_videos' && (
        <div className="p-4 space-y-3 max-h-[660px] overflow-y-auto smooth-scroll">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">More videos to practice</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Jump straight into another curated English story
              </p>
            </div>
            <button
              type="button"
              onClick={() => dispatch({ type: 'SET_ACTIVE_SCREEN', payload: 'library' })}
              className="text-xs font-semibold text-[#2563EB] hover:underline cursor-pointer shrink-0"
            >
              See all
            </button>
          </div>

          {otherVideos.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <p className="text-xs text-slate-500">No other published lessons yet.</p>
              <button
                type="button"
                onClick={() => dispatch({ type: 'SET_ACTIVE_SCREEN', payload: 'library' })}
                className="px-3.5 py-2 rounded-xl bg-blue-50 text-[#2563EB] text-xs font-semibold cursor-pointer"
              >
                Browse All Lessons
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {otherVideos.slice(0, 12).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onOpenLibraryLesson(item)}
                  className="w-full p-2.5 rounded-2xl border border-slate-200/90 hover:border-blue-300 bg-white hover:bg-blue-50/30 transition-all text-left flex items-center gap-3 cursor-pointer group"
                >
                  <div className="relative w-24 h-14 rounded-xl overflow-hidden bg-slate-900 shrink-0">
                    <img
                      src={`https://i.ytimg.com/vi/${item.video_id}/mqdefault.jpg`}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-emerald-500/95 text-white text-[9px] font-extrabold">
                      {item.cefr_level || 'A2'}
                    </span>
                    <span className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-5 h-5 text-white fill-current" />
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-xs sm:text-[13px] font-bold text-slate-900 group-hover:text-[#2563EB] line-clamp-2 leading-snug">
                      {item.title}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                      <span>{item.sentence_count || 0} sentences</span>
                      {item.tags && (
                        <span className="truncate">· {item.tags.split(',')[0]}</span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default memo(ShadowingRightPanel);

