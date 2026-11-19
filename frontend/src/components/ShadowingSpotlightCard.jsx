import React, { memo } from 'react';
import {
  Bookmark,
  Check,
  Clock,
  Volume2,
  Eye,
  EyeOff,
  Activity,
  HelpCircle,
  Languages,
  ChevronDown,
} from 'lucide-react';
import { useAppContext } from '../reducer/appReducer.js';
import { analyzeSentenceTokens } from '../utils/phonetics.js';

function ShadowingSpotlightCard({
  activeSentence,
  onWordClick,
  onSpeakSentence,
}) {
  const { state, dispatch } = useAppContext();
  const {
    vocabulary,
    completedSentencesMap,
    shadowing,
  } = state;

  if (!activeSentence) return null;

  const {
    accent,
    showIPA,
    showIntonation,
    showIntonationHelp,
    showSpotlightKhmer,
    playWhileSpeaking,
    endPaddingSec,
    isWaitingToSpeak,
  } = shadowing;

  const isSaved = !!completedSentencesMap[activeSentence.sentence_index];
  const { tokens, endingArrow } = analyzeSentenceTokens(
    activeSentence.english_text,
    accent,
    vocabulary
  );

  const cycleEndPadding = () => {
    const nextPad = endPaddingSec === 0 ? 0.4 : endPaddingSec === 0.4 ? 0.8 : 0;
    dispatch({
      type: 'SHADOWING_UPDATE',
      payload: { endPaddingSec: nextPad },
    });
  };

  return (
    <div
      className={`bg-white rounded-2xl border shadow-sm transition-all duration-300 ${
        isWaitingToSpeak
          ? 'border-emerald-300 ring-2 ring-emerald-500/15'
          : 'border-slate-200/90'
      }`}
    >
      {/* Top Row: Save (left) & Last word cut? (right) */}
      <div className="px-4 sm:px-5 pt-4 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() =>
            dispatch({
              type: 'TOGGLE_COMPLETE_SENTENCE',
              payload: activeSentence.sentence_index,
            })
          }
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
            isSaved
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-white border-slate-200/90 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
          title="Mark this sentence as practiced / saved"
        >
          {isSaved ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Saved</span>
            </>
          ) : (
            <>
              <Bookmark className="w-3.5 h-3.5 text-slate-400" />
              <span>Save</span>
            </>
          )}
        </button>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onSpeakSentence(activeSentence.english_text)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200/90 bg-white hover:bg-blue-50 hover:border-blue-200 text-slate-500 hover:text-[#2563EB] text-xs font-semibold transition-all cursor-pointer"
            title={`Listen in ${accent} accent`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">{accent}</span>
          </button>

          <button
            type="button"
            onClick={cycleEndPadding}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              endPaddingSec > 0
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-white border-slate-200/90 text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
            title="Add extra buffer at the end of each clip so the last word is never cut off"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>
              {endPaddingSec > 0 ? `Tail +${endPaddingSec}s` : 'Last word cut?'}
            </span>
          </button>
        </div>
      </div>

      {/* Hero Active Sentence + IPA + Khmer */}
      <div className="px-4 sm:px-8 pt-6 pb-5 text-center space-y-3">
        {/* English Sentence with Word Stress, Intonation Arrows, and Click-to-Save Words */}
        <div className="flex flex-wrap items-baseline justify-center gap-x-1.5 sm:gap-x-2 gap-y-2 leading-snug">
          {tokens.map((tok, idx) => (
            <span key={idx} className="inline-flex flex-col items-center group">
              <span className="inline-flex items-baseline">
                <button
                  type="button"
                  onClick={(e) => onWordClick(e, tok.rawWord, activeSentence)}
                  className={`text-xl sm:text-2xl lg:text-[26px] tracking-tight rounded-lg px-1 py-0.5 transition-colors hover:bg-blue-50 hover:text-[#2563EB] cursor-pointer ${
                    showIntonation
                      ? tok.isStressed
                        ? 'font-bold text-slate-950'
                        : 'font-normal text-slate-700'
                      : 'font-semibold text-slate-900'
                  }`}
                  title="Click to pronounce or save word"
                >
                  {tok.rawWord}
                </button>
                {showIntonation && tok.hasMidRise && (
                  <span className="text-sm sm:text-base font-bold text-[#2563EB] -ml-0.5 select-none">
                    ↗
                  </span>
                )}
                {showIntonation && tok.isLast && endingArrow && (
                  <span className="text-sm sm:text-base font-bold text-[#2563EB] ml-0.5 select-none">
                    {endingArrow}
                  </span>
                )}
              </span>

              {/* Word-aligned IPA underneath */}
              {showIPA && tok.ipa && (
                <span className="text-[11px] sm:text-xs font-mono text-slate-400 tracking-normal mt-0.5 select-all">
                  {tok.ipa}
                </span>
              )}
            </span>
          ))}
        </div>

        {/* Khmer Translation Pill */}
        {showSpotlightKhmer && activeSentence.khmer_text && (
          <div className="pt-1 flex justify-center">
            <div className="inline-block max-w-xl px-4 py-2 rounded-2xl bg-amber-50/75 border border-amber-200/70 text-slate-800 text-xs sm:text-sm font-medium khmer-text leading-relaxed">
              {activeSentence.khmer_text}
            </div>
          </div>
        )}

        {/* "Play the video while I speak" Toggle Row (matches Image 1) */}
        <div className="pt-3 flex items-center justify-center gap-2.5">
          <Volume2 className="w-4 h-4 text-slate-400" />
          <span className="text-xs sm:text-[13px] font-medium text-slate-500">
            Play the video while I speak
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={playWhileSpeaking}
            onClick={() =>
              dispatch({
                type: 'SHADOWING_UPDATE',
                payload: {
                  playWhileSpeaking: !playWhileSpeaking,
                  isWaitingToSpeak: false,
                },
              })
            }
            className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 cursor-pointer ${
              playWhileSpeaking ? 'bg-[#2563EB]' : 'bg-slate-200'
            }`}
            title="Keep video playing continuously while you shadow simultaneously"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                playWhileSpeaking ? 'translate-x-[18px]' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Intonation Quick Guide Popover */}
      {showIntonationHelp && (
        <div className="mx-4 sm:mx-6 mb-3 p-3 rounded-xl bg-blue-50/80 border border-blue-200/80 text-xs text-slate-700 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <span>
            <strong className="text-slate-950">Bold words</strong> = stressed syllables (say slightly louder & clearer)
          </span>
          <span>
            <strong className="text-[#2563EB]">↗</strong> = rising pitch
          </span>
          <span>
            <strong className="text-[#2563EB]">↘</strong> = falling pitch
          </span>
        </div>
      )}

      {/* Bottom Action Pill Bar (US | IPA | Intonation ? | Translate ខ្មែរ) */}
      <div className="px-4 sm:px-6 py-3.5 border-t border-slate-100 flex flex-wrap items-center justify-center gap-2">
        {/* Accent Pill: US / UK */}
        <button
          type="button"
          onClick={() =>
            dispatch({
              type: 'SHADOWING_UPDATE',
              payload: { accent: accent === 'US' ? 'UK' : 'US' },
            })
          }
          className="h-9 px-3.5 rounded-xl bg-blue-50/90 hover:bg-blue-100 border border-blue-200/80 text-[#2563EB] text-xs font-bold transition-all cursor-pointer"
          title="Switch pronunciation & IPA between US and UK English"
        >
          {accent}
        </button>

        {/* IPA Pill */}
        <button
          type="button"
          onClick={() =>
            dispatch({
              type: 'SHADOWING_UPDATE',
              payload: { showIPA: !showIPA },
            })
          }
          className={`h-9 px-3.5 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
            showIPA
              ? 'border-slate-900 bg-blue-50/40 text-slate-900 shadow-sm'
              : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
          }`}
        >
          {showIPA ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>IPA</span>
        </button>

        {/* Intonation Pill + ? Helper */}
        <div className="inline-flex items-center rounded-xl overflow-hidden border border-blue-200/90 bg-blue-50/60">
          <button
            type="button"
            onClick={() =>
              dispatch({
                type: 'SHADOWING_UPDATE',
                payload: { showIntonation: !showIntonation },
              })
            }
            className={`h-9 px-3 text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
              showIntonation
                ? 'bg-blue-100/80 text-[#2563EB]'
                : 'bg-white text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Intonation</span>
          </button>
          <button
            type="button"
            onClick={() =>
              dispatch({
                type: 'SHADOWING_UPDATE',
                payload: { showIntonationHelp: !showIntonationHelp },
              })
            }
            className={`h-9 px-2 border-l border-blue-200/80 flex items-center justify-center transition-colors cursor-pointer ${
              showIntonationHelp
                ? 'bg-[#2563EB] text-white'
                : 'bg-white text-slate-400 hover:text-[#2563EB]'
            }`}
            title="What do bold words and arrows mean?"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Translate (Khmer) Pill */}
        <button
          type="button"
          onClick={() =>
            dispatch({
              type: 'SHADOWING_UPDATE',
              payload: { showSpotlightKhmer: !showSpotlightKhmer },
            })
          }
          className={`h-9 px-3.5 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
            showSpotlightKhmer
              ? 'border-amber-300 bg-amber-50/80 text-amber-900'
              : 'border-slate-200 bg-slate-50/80 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Languages className="w-3.5 h-3.5" />
          <span>Translate</span>
          <span className="text-[11px] font-bold khmer-text opacity-85">ខ្មែរ</span>
          <ChevronDown className="w-3 h-3 opacity-60" />
        </button>
      </div>
    </div>
  );
}

export default memo(ShadowingSpotlightCard);

