import { getThemeById } from '@octovibe/themes';
import { parseGitHubProfile, calculateTrophyTiers } from '@octovibe/core';

/**
 * Vercel Serverless Function — SVG Render Engine
 * Route: GET /api/render?user=<username>&theme=<themeId>
 *
 * Returns a dynamic SVG card representing the user's OctoVibe profile stats.
 */
export default async function handler(req, res) {
  const { user = 'guest', theme: themeId = 'dark-green' } = req.query;

  // Resolve theme palette
  const theme = getThemeById(themeId);
  const { background, textPrimary, textSecondary, primaryColor, cardBg, cardBorder } = theme.palette;

  // Attempt live GitHub data fetch; fall back to guest defaults
  let profile = null;
  let achievements = [];

  if (user !== 'guest') {
    try {
      const data = await parseGitHubProfile(user);
      achievements = calculateTrophyTiers(data.profile, data.topRepos ?? []);
      profile = data.profile;
    } catch (_err) {
      // Graceful degradation — render a guest/error card
    }
  }

  const displayName = profile?.name || `@${user}`;
  const bio = profile?.bio ? escapeXml(profile.bio.slice(0, 60)) : 'GitHub Profile Analytics & Trophies';
  const followers = profile?.followers ?? '—';
  const repos = profile?.publicRepos ?? '—';
  const stars = profile ? achievements.find(a => a.id === 'stars')?.value ?? 0 : '—';

  // Trophy badge row (up to 3)
  const trophyBadges = achievements.slice(0, 3).map((a, i) => `
    <g transform="translate(${20 + i * 100}, 130)">
      <rect width="88" height="36" rx="8" fill="${cardBg}" stroke="${cardBorder}" stroke-width="1"/>
      <text x="44" y="14" text-anchor="middle" font-size="9" fill="${textSecondary}" font-family="'Segoe UI', sans-serif">${escapeXml(a.tier)}</text>
      <text x="44" y="29" text-anchor="middle" font-size="10" fill="${a.color}" font-weight="bold" font-family="'Segoe UI', sans-serif">${escapeXml(a.title)}</text>
    </g>
  `).join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="340" height="180" role="img" aria-label="OctoVibe card for ${escapeXml(user)}">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${background}"/>
      <stop offset="100%" stop-color="${background}dd"/>
    </linearGradient>
    <clipPath id="roundRect">
      <rect width="340" height="180" rx="12"/>
    </clipPath>
  </defs>

  <!-- Background -->
  <rect width="340" height="180" rx="12" fill="url(#bgGrad)" stroke="${cardBorder}" stroke-width="1.5"/>

  <!-- Header accent bar -->
  <rect x="0" y="0" width="340" height="3" rx="1.5" fill="${primaryColor}"/>

  <!-- OctoVibe brand mark -->
  <text x="20" y="24" font-size="11" fill="${primaryColor}" font-weight="bold" font-family="'Segoe UI', monospace" letter-spacing="1">🐙 OCTOVIBE</text>
  <text x="320" y="24" text-anchor="end" font-size="9" fill="${textSecondary}" font-family="'Segoe UI', sans-serif" opacity="0.6">${escapeXml(theme.name)}</text>

  <!-- Divider -->
  <line x1="20" y1="32" x2="320" y2="32" stroke="${cardBorder}" stroke-width="0.8"/>

  <!-- Display name -->
  <text x="20" y="58" font-size="18" fill="${textPrimary}" font-weight="700" font-family="'Segoe UI', sans-serif">${escapeXml(displayName)}</text>
  <text x="20" y="76" font-size="10" fill="${textSecondary}" font-family="'Segoe UI', sans-serif" opacity="0.8">${bio}</text>

  <!-- Stats row -->
  <text x="20" y="108" font-size="9" fill="${textSecondary}" font-family="'Segoe UI', sans-serif" opacity="0.6">FOLLOWERS</text>
  <text x="20" y="122" font-size="13" fill="${primaryColor}" font-weight="bold" font-family="'Segoe UI', monospace">${followers}</text>

  <text x="120" y="108" font-size="9" fill="${textSecondary}" font-family="'Segoe UI', sans-serif" opacity="0.6">REPOS</text>
  <text x="120" y="122" font-size="13" fill="${primaryColor}" font-weight="bold" font-family="'Segoe UI', monospace">${repos}</text>

  <text x="210" y="108" font-size="9" fill="${textSecondary}" font-family="'Segoe UI', sans-serif" opacity="0.6">TOTAL STARS</text>
  <text x="210" y="122" font-size="13" fill="${primaryColor}" font-weight="bold" font-family="'Segoe UI', monospace">${stars}</text>

  <!-- Trophy badges -->
  ${trophyBadges}

  <!-- Footer -->
  <text x="320" y="172" text-anchor="end" font-size="8" fill="${textSecondary}" font-family="'Segoe UI', sans-serif" opacity="0.4">octovibe.dev</text>
</svg>`;

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400');
  res.status(200).send(svg);
}

/** Escape XML special characters to prevent SVG injection. */
function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
