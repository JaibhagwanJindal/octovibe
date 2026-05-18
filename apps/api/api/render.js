import { fetchUserTelemetry, calculateAllTrophies, buildArtGrid, getTotalCols } from '@octovibe/core';
import { getThemeById } from '@octovibe/themes';

export default async function handler(req, res) {
  // Inject robust multi-tenant cross-origin parameters
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const {
    user = 'octovibe',
    theme = 'midnight-blue',
    view = 'all',
    json = 'false',
    lang_layout = 'pipeline',
    art_text = 'CONNECTED',
    art_style = 'flat',
    art_bg = '0'
  } = req.query;

  // Extract authorization tokens passed from the client browser session header
  const authHeader = req.headers.authorization || '';
  const userToken = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : '';

  try {
    const data = await fetchUserTelemetry(user, userToken);
    const trophies = calculateAllTrophies(data);

    // CRITICAL SAAS HOOK: Return clean JSON telemetry payload if requested by the frontend dashboard
    if (json === 'true') {
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).json({ profile: data, trophies });
    }

    const activeTheme = getThemeById(theme);
    const p = activeTheme.palette;
    let svgContent = '';

    // VIEW MODE A: UNIFIED MASTER PROFILE SUITE
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
          <text x="320" y="0" font-size="11" font-weight="bold" fill="${p.textTertiary}">ANNUAL CONTRIBUTIONS</text><text x="320" y="28" font-size="20" font-weight="700" fill="${p.textPrimary}">${data.commits}</text>
          <text x="560" y="0" font-size="11" font-weight="bold" fill="${p.textTertiary}">TROPHIES</text><text x="560" y="28" font-size="20" font-weight="700" fill="${p.textPrimary}">${trophies.length}</text>
        </g>
      </svg>`;
    }

    // VIEW MODE B: REWARDS PLATFORM TROPHY PANEL MATRIX
    else if (view === 'trophies') {
      let cardItems = trophies.map((t, i) => {
        let x = (i % 3) * 250 + 10;
        let y = Math.floor(i / 3) * 90 + 10;
        return `<g transform="translate(${x}, ${y})">
          <rect width="240" height="80" rx="10" fill="${p.cardBg}" stroke="${p.cardBorder}" stroke-width="1.5"/>
          <circle cx="40" cy="40" r="22" fill="${p.background}" stroke="${t.color}" stroke-width="1.5"/>
          <text x="40" y="45" fill="${t.color}" font-family="sans-serif" font-size="16" text-anchor="middle" font-weight="bold">🏆</text>
          <text x="75" y="35" fill="${p.textPrimary}" font-family="sans-serif" font-size="12" font-weight="bold">${t.title}</text>
          <text x="75" y="55" fill="${t.color}" font-family="sans-serif" font-size="10" font-weight="bold">${t.label} Tier</text>
        </g>`;
      }).join('');
      svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="770" height="${Math.ceil(trophies.length / 3) * 90 + 20}"><rect width="100%" height="100%" fill="${p.background}" rx="12"/>${cardItems}</svg>`;
    }

    // VIEW MODE C: TECHNOLOGY DENSITY DISTRIBUTION CHART
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

    // VIEW MODE D: LIVE GRAPHQL STREAK PIPELINE
    else if (view === 'streak') {
      svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="780" height="140">
        <rect width="100%" height="100%" fill="${p.background}" rx="12" stroke="${p.cardBorder}" stroke-width="1"/>
        <g transform="translate(40, 45)" font-family="sans-serif">
          <g transform="translate(0, 0)">
            <text x="0" y="0" font-size="11" font-weight="bold" fill="${p.textTertiary}">CURRENT STREAK</text>
            <text x="0" y="32" font-size="28" font-weight="800" fill="${p.primaryColor}">${data.currentStreak} Day</text>
            <text x="0" y="52" font-size="10" fill="${p.textSecondary}">Active Coding Window</text>
          </g>
          <g transform="translate(250, 0)">
            <text x="0" y="0" font-size="11" font-weight="bold" fill="${p.textTertiary}">LONGEST STREAK</text>
            <text x="0" y="32" font-size="28" font-weight="800" fill="${p.textPrimary}">${data.longestStreak} Days</text>
            <text x="0" y="52" font-size="10" fill="${p.textSecondary}">Lifetime Record Metric</text>
          </g>
          <g transform="translate(500, 0)">
            <text x="0" y="0" font-size="11" font-weight="bold" fill="${p.textTertiary}">ANNUAL CONTRIBUTIONS</text>
            <text x="0" y="32" font-size="28" font-weight="800" fill="${p.textPrimary}">${data.commits}</text>
            <text x="0" y="52" font-size="10" fill="${p.textSecondary}">Year Timeline Volume</text>
          </g>
        </g>
      </svg>`;
    }

    // VIEW MODE E: TYPOGRAPHIC CONTRIBUTION GRID ART WITH MONTH HEADERS
    else if (view === 'art') {
      const currentYear = new Date().getFullYear();
      const totalCols = getTotalCols(currentYear);
      const grid = buildArtGrid(art_text, totalCols, art_bg);
      let cellWidth = art_style === 'flat' ? 11 : 14;
      let cellGap = art_style === 'flat' ? 2 : 4;
      let svgWidth = totalCols * (cellWidth + cellGap) + 100;

      const CLR_ARRAY = ['#151b23', '#033a16', '#196c2e', '#2ea043', '#56d364'];
      const MONS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      let gridCells = '';
      for (let c = 0; c < totalCols; c++) {
        for (let r = 0; r < 7; r++) {
          const lv = grid[r]?.[c] || 0;
          let x = c * (cellWidth + cellGap) + 50;
          let y = r * (cellWidth + cellGap) + 60;
          gridCells += `<rect x="${x}" y="${y}" width="${cellWidth}" height="${cellWidth}" rx="${art_style === 'flat' ? 2 : 4}" fill="${CLR_ARRAY[lv]}" ${lv === 0 && art_style === 'flat' ? 'stroke="#21262d" stroke-width="1"' : ''} />`;
        }
      }

      let monthHeaders = MONS.map((m, idx) => {
        let columnSegmentOffset = Math.floor((idx / 12) * totalCols);
        let x = columnSegmentOffset * (cellWidth + cellGap) + 50;
        return `<text x="${x}" y="48" fill="${p.textTertiary}" font-family="sans-serif" font-size="9" font-weight="bold">${m}</text>`;
      }).join('');

      svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="190">
        <rect width="100%" height="100%" fill="${p.background}" rx="12" stroke="${p.cardBorder}" stroke-width="1"/>
        <text x="30" y="35" fill="${p.textPrimary}" font-family="sans-serif" font-size="13" font-weight="bold">${art_text}</text>
        <g transform="translate(${svgWidth - 90}, 23)"><rect width="50" height="18" rx="4" fill="${p.cardBg}" stroke="${p.primaryColor}" stroke-width="1"/><text x="25" y="13" fill="${p.textPrimary}" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">2026</text></g>
        ${monthHeaders}
        ${gridCells}
        <g transform="translate(50, 170)" font-family="sans-serif" font-size="10" fill="${p.textTertiary}"><text x="0" y="0">Less</text><rect x="30" y="-8" width="10" height="10" rx="1" fill="#151b23" stroke="#21262d" /><rect x="44" y="-8" width="10" height="10" rx="1" fill="#033a16" /><rect x="58" y="-8" width="10" height="10" rx="1" fill="#196c2e" /><rect x="72" y="-8" width="10" height="10" rx="1" fill="#2ea043" /><rect x="86" y="-8" width="10" height="10" rx="1" fill="#56d364" /><text x="102" y="0">More</text></g>
      </svg>`;
    }

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'max-age=0, s-maxage=3600, must-revalidate');
    res.status(200).send(svgContent);

  } catch (err) {
    console.error('OctoVibe render error:', err.message);
    res.status(500).send('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="50"><text x="10" y="30" fill="red" font-family="sans-serif" font-size="12">Render Error</text></svg>');
  }
}
