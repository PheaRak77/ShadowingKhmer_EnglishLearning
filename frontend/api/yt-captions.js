const INNERTUBE_CLIENTS = [
  {
    name: 'IOS',
    clientId: '5',
    clientVersion: '20.10.4',
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
    name: 'ANDROID',
    clientId: '3',
    clientVersion: '20.10.38',
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

export default async function handler(req, res) {
  const videoId = String(req.query?.videoId || '').trim();

  if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    return res.status(400).json({ error: 'Invalid videoId' });
  }

  const reasons = [];

  for (const client of INNERTUBE_CLIENTS) {
    try {
      const playerRes = await fetch('https://www.youtube.com/youtubei/v1/player', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': client.userAgent,
          'X-YouTube-Client-Name': client.clientId,
          'X-YouTube-Client-Version': client.clientVersion,
        },
        body: JSON.stringify({
          videoId,
          context: { client: client.context },
        }),
        signal: AbortSignal.timeout(4500),
      });

      if (!playerRes.ok) {
        reasons.push(`${client.name}:HTTP_${playerRes.status}`);
        continue;
      }

      const playerData = await playerRes.json();
      const tracks = playerData?.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
      if (tracks.length === 0) {
        reasons.push(`${client.name}:${playerData?.playabilityStatus?.status || 'NO_TRACKS'}`);
        continue;
      }

      const englishTrack =
        tracks.find((t) => /^en(-|$)/i.test(t.languageCode) && t.kind !== 'asr') ||
        tracks.find((t) => /^en(-|$)/i.test(t.languageCode)) ||
        tracks.find((t) => (t.languageCode || '').toLowerCase().startsWith('en'));

      if (!englishTrack?.baseUrl) {
        reasons.push(`${client.name}:NO_EN`);
        continue;
      }

      const vttUrl = englishTrack.baseUrl.includes('fmt=')
        ? englishTrack.baseUrl
        : `${englishTrack.baseUrl}&fmt=vtt`;

      const vttRes = await fetch(vttUrl, {
        headers: { 'User-Agent': client.userAgent },
        signal: AbortSignal.timeout(4500),
      });
      if (!vttRes.ok) {
        reasons.push(`${client.name}:VTT_${vttRes.status}`);
        continue;
      }

      const vtt = await vttRes.text();
      if (!vtt || !vtt.trim()) {
        reasons.push(`${client.name}:EMPTY_VTT`);
        continue;
      }

      const title = (playerData?.videoDetails?.title || '').trim();
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json({ vtt, title, source: client.name });
    } catch (err) {
      reasons.push(`${client.name}:${err.message}`);
    }
  }

  return res.status(404).json({ error: 'Captions unavailable', reasons });
}
