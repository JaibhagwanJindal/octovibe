import { fetchUserTelemetry, calculateAllTrophies } from '@octovibe/core';
import { getThemeById } from '@octovibe/themes';

export default async function handler(req, res) {
  const { user = 'JaibhagwanJindal', theme = 'midnight-blue', view = 'all', lang_layout = 'pipeline' } = req.query;
  
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'max-age=0, s-maxage=3600, must-revalidate');

  const data = await fetchUserTelemetry(user);
  const trophies = calculateAllTrophies(data);
  const activeTheme = getThemeById(theme);
  const p = activeTheme.palette;

  let svgContent = '';

  if (view === 'all') {
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="780" height="260">
      <rect width="100%" height="100%" fill="${p.background}" rx="14" stroke="${p.cardBorder}" stroke-width="1"/>
      <g transform="translate(30, 45)">
        <circle cx="40" cy="40" r="40" fill="${p.cardBg}" stroke="${p.primaryColor}" stroke-width="3"/>
        <text x="40" y="46" fill="${p.textPrimary}" font-family="sans-serif" font-size="24" text-anchor="middle">🐙</text>
        <text x="100" y="35" font-weight="800" font-size="22" fill="${p.primaryColor}" font-family="sans-serif">${data.name}</text>
        <text x="100" y="60" font-family="sans-serif" font-size="14" fill="${p.textSecondary}">@${data.login}</text>
      </g>
      <g transform="translate(30, 150)" font-family="sans-serif">
        <text x="0" y="0" font-size="11" font-weight="bold" fill="${p.textTertiary}">REPOSITORIES</text><text x="0" y="28" font-size="20" font-weight="700" fill="${p.textPrimary}">${data.repos}</text>
        <text x="160" y="0" font-size="11" font-weight="bold" fill="${p.textTertiary}">TOTAL STARS</text><text x="160" y="28" font-size="20" font-weight="700" fill="${p.textPrimary}">${data.stars}</text>
        <text x="320" y="0" font-size="11" font-weight="bold" fill="${p.textTertiary}">GLOBAL COMMITS</text><text x="320" y="28" font-size="20" font-weight="700" fill="${p.textPrimary}">${data.commits}</text>
        <text x="480" y="0" font-size="11" font-weight="bold" fill="${p.textTertiary}">TROPHIES</text><text x="480" y="28" font-size="20" font-weight="700" fill="${p.textPrimary}">${trophies.length}</text>
      </g>
    </svg>`;
  }
  
  else if (view === 'trophies') {
    let cardItems = trophies.map((t, i) => {
      let x = (i % 3) * 250 + 10;
      let y = Math.floor(i / 3) * 90 + 10;
      return `<g transform="translate(${x}, ${y})">
        <rect width="240" height="80" rx="10" fill="${t.bg}" stroke="${t.border}" stroke-width="1.5"/>
        <circle cx="40" cy="40" r="22" fill="${p.background}" stroke="${t.color}" stroke-width="1"/>
        <text x="40" y="45" fill="${t.color}" font-family="sans-serif" font-size="16" text-anchor="middle" font-weight="bold">🏆</text>
        <text x="75" y="35" fill="${p.textPrimary}" font-family="sans-serif" font-size="12" font-weight="bold">${t.title}</text>
        <text x="75" y="55" fill="${t.color}" font-family="sans-serif" font-size="10" font-weight="bold">${t.tier} Tier</text>
      </g>`;
    }).join('');
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="770" height="${Math.ceil(trophies.length / 3) * 90 + 20}">
      <rect width="100%" height="100%" fill="${p.background}" rx="12"/>
      ${cardItems}
    </svg>`;
  }

  else if (view === 'languages') {
    let internalContent = '';
    if (lang_layout === 'pipeline') {
      let currentX = 0;
      let segments = data.topLanguages.map(l => {
        let width = (l.percentage / 100) * 720;
        let rect = `<rect x="${currentX}" y="0" width="${width}" height="12" fill="${l.color}" />`;
        currentX += width;
        return rect;
      }).join('');

      let labelLegend = data.topLanguages.map((l, i) => {
        let x = (i % 4) * 170;
        let y = Math.floor(i / 4) * 25 + 35;
        return `<g transform="translate(${x}, ${y})">
          <circle cx="6" cy="-4" r="5" fill="${l.color}"/>
          <text x="18" y="0" fill="${p.textPrimary}" font-family="sans-serif" font-size="12" font-weight="bold">${l.name}</text>
          <text x="110" y="0" fill="${p.textTertiary}" font-family="sans-serif" font-size="11">${l.percentage}%</text>
        </g>`;
      }).join('');
      internalContent = `<g transform="translate(30, 60)">${segments}</g><g transform="translate(30, 100)">${labelLegend}</g>`;
    } else {
      internalContent = data.topLanguages.map((l, i) => {
        let x = (i % 3) * 240 + 30;
        let y = Math.floor(i / 3) * 50 + 60;
        return `<g transform="translate(${x}, ${y})">
          <rect width="220" height="36" rx="8" fill="${p.cardBg}" stroke="${p.cardBorder}" stroke-width="1"/>
          <circle cx="20" cy="18" r="5" fill="${l.color}"/>
          <text x="35" y="22" fill="${p.textPrimary}" font-family="sans-serif" font-size="12" font-weight="bold">${l.name}</text>
          <text x="175" y="22" fill="${p.primaryColor}" font-family="sans-serif" font-size="11" font-weight="bold">${l.percentage}%</text>
        </g>`;
      }).join('');
    }

    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="780" height="180">
      <rect width="100%" height="100%" fill="${p.background}" rx="12" stroke="${p.cardBorder}" stroke-width="1"/>
      <text x="30" y="35" fill="${p.textPrimary}" font-family="sans-serif" font-size="14" font-weight="bold">LANGUAGE FINGERPRINT</text>
      ${internalContent}
    </svg>`;
  }

  else if (view === 'streak') {
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="780" height="140">
      <rect width="100%" height="100%" fill="${p.background}" rx="12" stroke="${p.cardBorder}" stroke-width="1"/>
      <g transform="translate(40, 45)" font-family="sans-serif">
        <g transform="translate(0, 0)">
          <text x="0" y="0" font-size="11" font-weight="bold" fill="${p.textTertiary}">CURRENT STREAK</text>
          <text x="0" y="32" font-size="28" font-weight="800" fill="${p.primaryColor}">12 Days</text>
          <text x="0" y="52" font-size="10" fill="${p.textSecondary}">Active Coding Window</text>
        </g>
        <g transform="translate(250, 0)">
          <text x="0" y="0" font-size="11" font-weight="bold" fill="${p.textTertiary}">LONGEST STREAK</text>
          <text x="0" y="32" font-size="28" font-weight="800" fill="${p.textPrimary}">48 Days</text>
          <text x="0" y="52" font-size="10" fill="${p.textSecondary}">Lifetime Record Metric</text>
        </g>
        <g transform="translate(500, 0)">
          <text x="0" y="0" font-size="11" font-weight="bold" fill="${p.textTertiary}">TOTAL CONTRIBUTIONS</text>
          <text x="0" y="32" font-size="28" font-weight="800" fill="${p.textPrimary}">${data.commits}</text>
          <text x="0" y="52" font-size="10" fill="${p.textSecondary}">Year Timeline Volume</text>
        </g>
      </g>
    </svg>`;
  }

  res.status(200).send(svgContent);
}
