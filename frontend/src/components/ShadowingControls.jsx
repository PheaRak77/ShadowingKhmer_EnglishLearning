import React, { memo } from 'react';
import {
  SkipBack,
  SkipForward,
  RotateCcw,
  Play,
  Pause,
  Gauge,
  Repeat,
  Timer,
  ChevronDown,
  Captions,
  Mic,
  FastForward,
} from 'lucide-react';
import { useAppContext } from '../reducer/appReducer.js';

const SPEED_OPTIONS = [0.6, 0.75, 0.85, 1, 1.15, 1.25];
const REPEAT_OPTIONS = [
  { value: 1, label: '×1', desc: 'Play once' },
  { value: 2, label: '×2', desc: 'Repeat 2 times' },
  { value: 3, label: '×3', desc: 'Repeat 3 times' },
  { value: 0, label: '∞', desc: 'Loop sentence forever' },
];
const MODE_OPTIONS = [
  { value: 'pause_to_speak', label: 'Pause to speak', desc: 'Auto-pause after each sentence so you can shadow' },
  { value: 'auto_continue', label: 'Auto-continue', desc: 'Play continuously without pausing' },
  { value: 'manual_stop', label: 'Manual stop', desc: 'Pause after each sentence until you press Space' },
];
const PAUSE_PERCENT_OPTIONS = [0, 25, 50, 75, 100];

function ShadowingControls({
  activeSentence,
  onPrev,
  onReplay,
  onTogglePlay,
  onNext,
  onSkipPause,
  onChangePlaybackRate,
}) {
  const { state, dispatch } = useAppContext();
  const {
    sentences,
    activeSentenceIndex,
    playbackRate,
    shadowing,
  } = state;

  const {
    isPlaying,
    repeatCount,
    currentRepeat,
    pauseMode,
    pauseExtraPercent,
    isWaitingToSpeak,
    speakCountdownRemaining,
    speakCountdownTotal,
    playWhileSpeaking,
    openMenu,
    showShortcutsHint,
  } = shadowing;

  const toggleMenu = (menuName) => {
    dispatch({
      type: 'SHADOWING_UPDATE',
      payload: { openMenu: openMenu === menuName ? null : menuName },
    });
  };

  // Sentence duration and computed pause window for caption
  const sentDuration = activeSentence
    ? Math.max(1.2, Number((activeSentence.end_time - activeSentence.start_time).toFixed(1)))
    : 3.0;
  const computedPauseSec = Number((sentDuration * (1 + pauseExtraPercent / 100)).toFixed(1));

  // Top progress bar percentage
  const sentenceProgressPct = isWaitingToSpeak && speakCountdownTotal > 0
    ? Math.max(0, Math.min(100, Math.round((speakCountdownRemaining / speakCountdownTotal) * 100)))
    : sentences.length > 0
    ? Math.round((activeSentenceIndex / sentences.length) * 100)
    : 0;

  const activeRepeatLabel =
    REPEAT_OPTIONS.find((r) => r.value === repeatCount)?.label || '×1';
  const activeModeLabel =
    MODE_OPTIONS.find((m) => m.value === pauseMode)?.label || 'Pause to speak';

  return (
    <div className="relative bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-visible">
      {/* Slim Top Progress Track (matches reference blue progress accent) */}
      <div className="h-1 w-full bg-slate-100 rounded-t-2xl overflow-hidden">
        <div
          className={`h-full transition-all duration-200 ${
            isWaitingToSpeak ? 'bg-emerald-500' : 'bg-[#2563EB]'
          }`}
          style={{ width: `${sentenceProgressPct}%` }}
        />
      </div>

      {/* Main Transport + Pacing Controls Row */}
      <div className="px-3 sm:px-4 pt-3 pb-2.5 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
        {/* 1. Previous Sentence */}
        <button
          type="button"
          onClick={onPrev}
          disabled={activeSentenceIndex <= 1}
          title="Previous sentence (Left Arrow)"
          className="h-11 min-w-[44px] px-2.5 rounded-xl border border-slate-200/90 bg-slate-50/70 hover:bg-slate-100 disabled:opacity-40 text-slate-700 flex flex-col items-center justify-center transition-all cursor-pointer"
        >
          <SkipBack className="w-3.5 h-3.5" />
          <span className="text-[9px] font-semibold text-slate-400 leading-none mt-0.5">←</span>
        </button>

        {/* 2. Replay Current Sentence */}
        <button
          type="button"
          onClick={onReplay}
          title="Replay current sentence (R)"
          className="h-11 min-w-[44px] px-2.5 rounded-xl border border-slate-200/90 bg-slate-50/70 hover:bg-slate-100 text-slate-700 flex flex-col items-center justify-center transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="text-[9px] font-semibold text-slate-400 leading-none mt-0.5">R</span>
        </button>

        {/* 3. Primary Blue Play / Pause Button */}
        <button
          type="button"
          onClick={onTogglePlay}
          title="Play / Pause (Space)"
          className="h-11 min-w-[66px] px-4 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white shadow-sm shadow-blue-600/25 flex flex-col items-center justify-center transition-all active:scale-[0.98] cursor-pointer"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 fill-current" />
          ) : (
            <Play className="w-4 h-4 fill-current ml-0.5" />
          )}
          <span className="text-[9px] font-semibold text-blue-100 leading-none mt-0.5">
            Space
          </span>
        </button>

        {/* 4. Soft Green Next Sentence Button */}
        <button
          type="button"
          onClick={onNext}
          disabled={activeSentenceIndex >= sentences.length}
          title="Next sentence (Right Arrow)"
          className="h-11 min-w-[46px] px-2.5 rounded-xl border border-emerald-200 bg-emerald-50/90 hover:bg-emerald-100 disabled:opacity-40 text-emerald-700 flex flex-col items-center justify-center transition-all cursor-pointer"
        >
          <SkipForward className="w-3.5 h-3.5" />
          <span className="text-[9px] font-semibold text-emerald-600/80 leading-none mt-0.5">
            →
          </span>
        </button>

        {/* Subtle Divider on wider screens */}
        <div className="hidden sm:block h-6 w-px bg-slate-200/80 mx-0.5" />

        {/* 5. Speed Selector Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleMenu('speed')}
            className={`h-9 px-2.5 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
              openMenu === 'speed'
                ? 'border-[#2563EB] bg-blue-50 text-[#2563EB]'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
            }`}
            title="Playback speed"
          >
            <Gauge className="w-3.5 h-3.5 text-slate-400" />
            <span>{playbackRate}x</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {openMenu === 'speed' && (
            <div className="absolute left-0 top-11 z-40 w-32 rounded-xl bg-white border border-slate-200 shadow-xl p-1.5 space-y-0.5">
              {SPEED_OPTIONS.map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => {
                    onChangePlaybackRate(rate);
                    dispatch({ type: 'SHADOWING_UPDATE', payload: { openMenu: null } });
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between cursor-pointer ${
                    playbackRate === rate
                      ? 'bg-blue-50 text-[#2563EB]'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{rate}x</span>
                  {rate === 1 && <span className="text-[10px] text-slate-400">Normal</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 6. Repeat Count Dropdown (×1 / ×2 / ×3 / ∞) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleMenu('repeat')}
            className={`h-9 px-2.5 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
              repeatCount !== 1 || openMenu === 'repeat'
                ? 'border-blue-300 bg-blue-50 text-[#2563EB]'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
            }`}
            title="Repeat each sentence"
          >
            <Repeat className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {activeRepeatLabel}
              {repeatCount > 1 && isPlaying ? ` (${currentRepeat}/${repeatCount})` : ''}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {openMenu === 'repeat' && (
            <div className="absolute left-0 top-11 z-40 w-44 rounded-xl bg-white border border-slate-200 shadow-xl p-1.5 space-y-0.5">
              {REPEAT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    dispatch({
                      type: 'SHADOWING_UPDATE',
                      payload: { repeatCount: opt.value, currentRepeat: 1, openMenu: null },
                    })
                  }
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between cursor-pointer ${
                    repeatCount === opt.value
                      ? 'bg-blue-50 text-[#2563EB] font-bold'
                      : 'text-slate-700 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <span>{opt.label}</span>
                  <span className="text-[10px] text-slate-400">{opt.desc}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 7. Shadowing Mode Dropdown (Pause to speak / Auto-continue / Manual stop) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleMenu('mode')}
            className={`h-9 px-2.5 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
              openMenu === 'mode'
                ? 'border-[#2563EB] bg-blue-50 text-[#2563EB]'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
            }`}
            title="Shadowing pacing mode"
          >
            <Timer className="w-3.5 h-3.5 text-slate-400" />
            <span className="whitespace-nowrap">{activeModeLabel}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {openMenu === 'mode' && (
            <div className="absolute right-0 sm:left-0 top-11 z-40 w-64 rounded-xl bg-white border border-slate-200 shadow-xl p-1.5 space-y-0.5">
              {MODE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    dispatch({
                      type: 'SHADOWING_UPDATE',
                      payload: {
                        pauseMode: opt.value,
                        playWhileSpeaking: opt.value === 'auto_continue' ? playWhileSpeaking : false,
                        isWaitingToSpeak: false,
                        openMenu: null,
                      },
                    })
                  }
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                    pauseMode === opt.value
                      ? 'bg-blue-50 text-[#2563EB]'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-bold">{opt.label}</div>
                  <div className="text-[10px] text-slate-400 leading-snug mt-0.5">
                    {opt.desc}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 8. Extra Pause Buffer Dropdown (+50%) when Pause to speak is selected */}
        {pauseMode === 'pause_to_speak' && !playWhileSpeaking && (
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleMenu('pausePct')}
              className={`h-9 px-2.5 rounded-xl border text-xs font-semibold inline-flex items-center gap-1 transition-all cursor-pointer ${
                openMenu === 'pausePct'
                  ? 'border-[#2563EB] bg-blue-50 text-[#2563EB]'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
              title="Extra pause time to repeat the sentence"
            >
              <span>+{pauseExtraPercent}%</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {openMenu === 'pausePct' && (
              <div className="absolute right-0 top-11 z-40 w-28 rounded-xl bg-white border border-slate-200 shadow-xl p-1.5 space-y-0.5">
                {PAUSE_PERCENT_OPTIONS.map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() =>
                      dispatch({
                        type: 'SHADOWING_UPDATE',
                        payload: { pauseExtraPercent: pct, openMenu: null },
                      })
                    }
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                      pauseExtraPercent === pct
                        ? 'bg-blue-50 text-[#2563EB]'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    +{pct}%
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 9. Keyboard Shortcuts / Caption Helper Toggle */}
        <button
          type="button"
          onClick={() =>
            dispatch({
              type: 'SHADOWING_UPDATE',
              payload: { showShortcutsHint: !showShortcutsHint, openMenu: null },
            })
          }
          title="Show keyboard shortcuts"
          className={`h-9 w-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
            showShortcutsHint
              ? 'border-[#2563EB] bg-blue-50 text-[#2563EB]'
              : 'border-transparent hover:border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Captions className="w-4 h-4" />
        </button>
      </div>

      {/* Centered Status / Pause-to-Speak Calculation Caption (Exact Image 1 detail!) */}
      <div className="px-4 pb-2.5 text-center">
        {isWaitingToSpeak ? (
          <div className="inline-flex flex-wrap items-center justify-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
            </span>
            <Mic className="w-3.5 h-3.5" />
            <span>
              Your turn! Speak now · {speakCountdownRemaining.toFixed(1)}s
            </span>
            <button
              type="button"
              onClick={onSkipPause}
              className="ml-1 inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-white hover:bg-emerald-100 border border-emerald-200 text-[11px] font-bold text-emerald-800 cursor-pointer"
            >
              <span>Next</span>
              <FastForward className="w-3 h-3" />
            </button>
          </div>
        ) : playWhileSpeaking ? (
          <p className="text-[11px] text-slate-400 font-medium">
            Simultaneous shadowing ON · video keeps playing while you speak along
          </p>
        ) : pauseMode === 'pause_to_speak' ? (
          <p className="text-[11px] text-slate-400 font-medium">
            Pause = sentence length + {pauseExtraPercent}% · this one:{' '}
            <span className="text-slate-600 font-semibold">{sentDuration}s</span> →{' '}
            <span className="text-slate-600 font-semibold">{computedPauseSec}s</span>
          </p>
        ) : pauseMode === 'manual_stop' ? (
          <p className="text-[11px] text-slate-400 font-medium">
            Manual stop · pauses after each sentence · press <span className="font-semibold text-slate-600">Space</span> or{' '}
            <span className="font-semibold text-slate-600">→</span> when ready
          </p>
        ) : (
          <p className="text-[11px] text-slate-400 font-medium">
            Auto-continue · plays sentence by sentence without pausing
          </p>
        )}

        {showShortcutsHint && (
          <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[10px]">
                Space
              </kbd>{' '}
              Play / Pause
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[10px]">
                R
              </kbd>{' '}
              Replay sentence
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[10px]">
                ←
              </kbd>{' '}
              /{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[10px]">
                →
              </kbd>{' '}
              Prev / Next
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(ShadowingControls);

