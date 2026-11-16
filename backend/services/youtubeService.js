import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const execFileAsync = promisify(execFile);

// Maximum supported video duration: 4 minutes (240 seconds)
export const MAX_VIDEO_DURATION_SECONDS = 240;

export function extractYouTubeId(url) {
  if (!url) return null;
  const regex =
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i;
  const match = url.trim().match(regex);
  if (match && match[1]) return match[1];
  if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) return url.trim();
  return null;
}

function parseTimestampToSeconds(timestampStr) {
  const parts = timestampStr.trim().split(':');
  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  if (parts.length === 3) {
    hours = parseFloat(parts[0]);
    minutes = parseFloat(parts[1]);
    seconds = parseFloat(parts[2].replace(',', '.'));
  } else if (parts.length === 2) {
    minutes = parseFloat(parts[0]);
    seconds = parseFloat(parts[1].replace(',', '.'));
  }
  return Number((hours * 3600 + minutes * 60 + seconds).toFixed(2));
}

export function parseVttAndMergeSentences(vttContent) {
  const lines = vttContent.replace(/\r\n/g, '\n').split('\n');
  const rawCues = [];
  const timeRegex =
    /((?:\d{2}:)?\d{2}:\d{2}[.,]\d{3})\s*-->\s*((?:\d{2}:)?\d{2}:\d{2}[.,]\d{3})/;

  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    const match = line.match(timeRegex);
    if (match) {
      const start = parseTimestampToSeconds(match[1]);
      const end = parseTimestampToSeconds(match[2]);
      i++;
      const textLines = [];
      while (i < lines.length && lines[i].trim() !== '' && !lines[i].includes('-->')) {
        const cleanedLine = lines[i]
          .replace(/<\d{2}:\d{2}:\d{2}\.\d{3}>/g, '')
          .replace(/<\/?c[^>]*>/g, '')
          .replace(/<\/?[^>]+(>|$)/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/\[.*?\]/g, '')
          .trim();
        if (cleanedLine) {
          textLines.push(cleanedLine);
        }
        i++;
      }

      if (textLines.length > 0 && end > start && start <= MAX_VIDEO_DURATION_SECONDS) {
        const combinedCueText = textLines.join(' ').replace(/\s+/g, ' ').trim();
        if (combinedCueText) {
          rawCues.push({
            start,
            end: Math.min(end, MAX_VIDEO_DURATION_SECONDS + 5),
            text: combinedCueText,
          });
        }
      }
    } else {
      i++;
    }
  }

  // Deduplicate rolling YouTube auto-generated captions
  const deduplicatedCues = [];
  for (const cue of rawCues) {
    if (deduplicatedCues.length === 0) {
      deduplicatedCues.push({ ...cue });
      continue;
    }
    const prev = deduplicatedCues[deduplicatedCues.length - 1];
    if (cue.text === prev.text) {
      prev.end = Math.max(prev.end, cue.end);
    } else if (cue.text.startsWith(prev.text) && cue.start - prev.start < 4) {
      prev.text = cue.text;
      prev.end = Math.max(prev.end, cue.end);
    } else if (prev.text.endsWith(cue.text)) {
      prev.end = Math.max(prev.end, cue.end);
    } else {
      deduplicatedCues.push({ ...cue });
    }
  }

  // Merge cues and split cleanly on sentence boundaries (., ?, !)
  const mergedSentences = [];
  let bufferText = '';
  let bufferStart = null;
  let bufferEnd = null;

  for (const cue of deduplicatedCues) {
    if (bufferStart === null) {
      bufferStart = cue.start;
    }
    bufferEnd = cue.end;

    let textToAppend = cue.text;
    if (bufferText) {
      const currentWords = bufferText.split(' ');
      const cueWords = textToAppend.split(' ');
      const maxOverlap = Math.min(currentWords.length, cueWords.length, 6);
      for (let overlap = maxOverlap; overlap >= 1; overlap--) {
        const suffix = currentWords.slice(-overlap).join(' ').toLowerCase();
        const prefix = cueWords.slice(0, overlap).join(' ').toLowerCase();
        if (suffix === prefix) {
          textToAppend = cueWords.slice(overlap).join(' ');
          break;
        }
      }
    }

    if (textToAppend) {
      bufferText = bufferText ? `${bufferText} ${textToAppend}` : textToAppend;
    }

    const parts = bufferText.match(/[^.?!]+[.?!]+["']?|[^.?!]+$/g) || [bufferText];
    if (parts.length > 1 || /[.?!]["']?$/.test(bufferText.trim())) {
      const totalChars = Math.max(1, bufferText.length);
      const totalDuration = Math.max(0.5, bufferEnd - bufferStart);
      let runningStart = bufferStart;
      let leftover = '';

      for (let pIdx = 0; pIdx < parts.length; pIdx++) {
        const part = parts[pIdx].trim();
        if (!part) continue;

        const isComplete = /[.?!]["']?$/.test(part);
        const wordCount = part.split(/\s+/).filter(Boolean).length;

        if (isComplete || wordCount >= 18) {
          const share = part.length / totalChars;
          const segEnd = Number(
            Math.min(bufferEnd, runningStart + Math.max(0.8, totalDuration * share)).toFixed(2)
          );
          let formatted = part.replace(/\s+/g, ' ').trim();
          if (!/[.?!]["']?$/.test(formatted)) {
            formatted += '.';
          }
          formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);

          mergedSentences.push({
            start_time: Number(runningStart.toFixed(2)),
            end_time: segEnd,
            english_text: formatted,
          });
          runningStart = segEnd;
        } else {
          leftover = part;
        }
      }

      if (leftover) {
        bufferText = leftover;
        bufferStart = runningStart;
      } else {
        bufferText = '';
        bufferStart = null;
        bufferEnd = null;
      }
    }
  }

  if (bufferText.trim()) {
    let formattedText = bufferText.replace(/\s+/g, ' ').trim();
    if (!/[.?!]["']?$/.test(formattedText)) {
      formattedText += '.';
    }
    formattedText = formattedText.charAt(0).toUpperCase() + formattedText.slice(1);
    mergedSentences.push({
      start_time: Number((bufferStart ?? 0).toFixed(2)),
      end_time: Number((bufferEnd ?? (bufferStart ?? 0) + 3).toFixed(2)),
      english_text: formattedText,
    });
  }

  return mergedSentences.filter((s) => s.start_time <= MAX_VIDEO_DURATION_SECONDS).slice(0, 100);
}

export async function fetchYoutubeCaptionsWithYtDlp(videoUrl, videoId) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), `ytdlp-${videoId}-`));
  const outputTemplate = path.join(tempDir, '%(id)s.%(ext)s');
  const titleFile = path.join(tempDir, 'title.txt');
  const canonicalUrl = `https://www.youtube.com/watch?v=${videoId}`;

  try {
    await execFileAsync(
      'yt-dlp',
      [
        '-4',
        '--js-runtimes',
        'node',
        '--extractor-args',
        'youtube:player_client=android;player_skip=webpage,configs',
        '--print-to-file',
        '%(title)s',
        titleFile,
        '--write-auto-sub',
        '--write-sub',
        '--sub-lang',
        'en',
        '--skip-download',
        '--sub-format',
        'vtt',
        '--no-playlist',
        '--no-warnings',
        '-o',
        outputTemplate,
        canonicalUrl,
      ],
      { timeout: 15000 }
    );

    let files = await fs.readdir(tempDir);
    let vttFile = files.find((f) => f.endsWith('.vtt'));

    if (!vttFile) {
      await execFileAsync(
        'yt-dlp',
        [
          '-4',
          '--js-runtimes',
          'node',
          '--print-to-file',
          '%(title)s',
          titleFile,
          '--write-auto-sub',
          '--write-sub',
          '--sub-lang',
          'en,en-US,en-GB',
          '--skip-download',
          '--sub-format',
          'vtt',
          '--no-playlist',
          '--no-warnings',
          '-o',
          outputTemplate,
          canonicalUrl,
        ],
        { timeout: 20000 }
      );
      files = await fs.readdir(tempDir);
      vttFile = files.find((f) => f.endsWith('.vtt'));
    }

    if (!vttFile) {
      throw new Error('No English captions found for this YouTube video.');
    }

    let videoTitle = '';
    try {
      videoTitle = (await fs.readFile(titleFile, 'utf-8')).trim();
    } catch {}

    const vttContent = await fs.readFile(path.join(tempDir, vttFile), 'utf-8');
    const sentences = parseVttAndMergeSentences(vttContent);
    if (!sentences || sentences.length === 0) {
      throw new Error('Parsed VTT file contained no valid caption sentences.');
    }
    sentences.videoTitle = videoTitle;
    return sentences;
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
  }
}
