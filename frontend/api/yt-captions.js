export const config = {
  runtime: 'edge',
};

const INNERTUBE_CLIENTS = [
  {
    userAgent: 'com.google.ios.youtube/20.10.4 (iPhone16,2; U; CPU iOS 18_3_2 like Mac OS X;)',
    context: {
      clientName: 'IOS',
      clientVersion: '20.10.4',
      deviceMake: 'Apple',
      deviceModel: 'iPhone16,2',
      hl: 'en',
      gl: 'US',
    },
  },
  {
    userAgent: 'com.google.android.youtube/20.10.38 (Linux; U; Android 15) gzip',
    context: {
      clientName: 'ANDROID',
      clientVersion: '20.10.38',
      androidSdkVersion: 35,
      hl: 'en',
      gl: 'US',
    },
  },
];

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const videoId = (searchParams.get('videoId') || '').trim();

  if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    return new Response(JSON.stringify({ error: 'Invalid videoId' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  for (const client of INNERTUBE_CLIENTS) {
    try {
      const playerRes = await fetch('https://www.youtube.com/youtubei/v1/player', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': client.userAgent,
        },
        body: JSON.stringify({
          videoId,
          context: { client: client.context },
        }),
      });

      if (!playerRes.ok) continue;
      const playerData = await playerRes.json();
      const tracks = playerData?.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
      if (tracks.length === 0) continue;

      const englishTrack =
        tracks.find((t) => /^en(-|$)/i.test(t.languageCode) && t.kind !== 'asr') ||
        tracks.find((t) => /^en(-|$)/i.test(t.languageCode)) ||
        tracks.find((t) => (t.languageCode || '').toLowerCase().startsWith('en'));

      if (!englishTrack?.baseUrl) continue;

      const vttUrl = englishTrack.baseUrl.includes('fmt=')
        ? englishTrack.baseUrl
        : `${englishTrack.baseUrl}&fmt=vtt`;

      const vttRes = await fetch(vttUrl, {
        headers: { 'User-Agent': client.userAgent },
      });
      if (!vttRes.ok) continue;

      const vtt = await vttRes.text();
      if (!vtt || !vtt.trim()) continue;

      const title = (playerData?.videoDetails?.title || '').trim();
      return new Response(JSON.stringify({ vtt, title }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      });
    } catch {
      continue;
    }
  }

  return new Response(JSON.stringify({ error: 'Captions unavailable from Edge' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' },
  });
}
