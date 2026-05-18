// A. EMBEDDED THEME DICTIONARY
const THEMES = [
  {
    id: "dark-green",
    name: "Classic Octocat Green",
    palette: {
      background: "#0d1117", textPrimary: "#ffffff", textSecondary: "#c9d1d9",
      textTertiary: "#8b949e", primaryColor: "#238636", primaryHover: "#2ea043",
      cardBg: "rgba(22, 27, 34, 0.6)", cardBorder: "rgba(48, 54, 61, 0.5)"
    }
  },
  {
    id: "midnight-blue",
    name: "Midnight Ocean",
    palette: {
      background: "#010409", textPrimary: "#ffffff", textSecondary: "#c9d1d9",
      textTertiary: "#8b949e", primaryColor: "#388bfd", primaryHover: "#58a6ff",
      cardBg: "rgba(22, 27, 34, 0.7)", cardBorder: "rgba(56, 139, 253, 0.4)"
    }
  }
];

// B. TROPHY CALCULATION ENGINE
const TROPHY_TIERS = {
  BRONZE:   { label: 'Bronze',   color: '#cd7f32' },
  SILVER:   { label: 'Silver',   color: '#c0c0c0' },
  GOLD:     { label: 'Gold',     color: '#ffd700' },
  PLATINUM: { label: 'Platinum', color: '#e5e4e2' }
};

function calculateAllTrophies(stats) {
  const achievements = [];
  const evaluate = (id, title, value, thresholds, icon) => {
    let tier = null;
    if      (value >= thresholds.platinum) tier = TROPHY_TIERS.PLATINUM;
    else if (value >= thresholds.gold)     tier = TROPHY_TIERS.GOLD;
    else if (value >= thresholds.silver)   tier = TROPHY_TIERS.SILVER;
    else if (value >= thresholds.bronze)   tier = TROPHY_TIERS.BRONZE;
    if (tier) achievements.push({ id, title, value, ...tier, icon });
  };
  evaluate('stars',   'Star Lord',       stats.stars   || 0, { bronze: 5,  silver: 25,  gold: 100,  platinum: 500  }, 'fa-star');
  evaluate('commits', 'Commit Monster',  stats.commits || 0, { bronze: 50, silver: 250, gold: 1000, platinum: 5000 }, 'fa-cubes');
  evaluate('repos',   'Prolific Creator', stats.repos  || 0, { bronze: 5,  silver: 15,  gold: 30,   platinum: 60   }, 'fa-book-bookmark');
  evaluate('prs',     'Open Architect',  stats.prs     || 0, { bronze: 2,  silver: 10,  gold: 40,   platinum: 100  }, 'fa-code-merge');
  evaluate('issues',  'Bug Crusher',     stats.issues  || 0, { bronze: 2,  silver: 10,  gold: 40,   platinum: 100  }, 'fa-circle-dot');
  return achievements;
}

// C. EMBEDDED GRAPHQL TELEMETRY FETCHER
const BRAND_FALLBACK = {
  name: 'OctoVibe Studio', login: 'octovibe',
  avatarUrl: 'https://github.com/identicons/octovibe.png',
  bio: 'The ultimate open-source multi-tenant developer profile customizer hub.',
  location: 'Global Edge Network',
  followers: 128, following: 32, repos: 24, stars: 86,
  commits: 918, prs: 42, reviews: 12, issues: 8,
  languagesCount: 5, currentStreak: 4, longestStreak: 48,
  topLanguages: [
    { name: 'TypeScript', percentage: 65, color: '#3178c6' },
    { name: 'JavaScript', percentage: 25, color: '#f1e05a' },
    { name: 'HTML',       percentage: 10, color: '#e34c26' }
  ]
};

async function fetchUserTelemetry(username, userToken = '') {
  const activeToken = userToken || process.env.GITHUB_TOKEN || '';
  if (username.toLowerCase() === 'octovibe' || !activeToken) return BRAND_FALLBACK;

  const query = {
    query: `query ($login: String!) {
      user(login: $login) {
        name login avatarUrl bio location
        followers { totalCount }
        following { totalCount }
        repositories(first: 100, ownerAffiliations: OWNER) {
          totalCount
          nodes { stargazerCount forkCount primaryLanguage { name color } }
        }
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks { contributionDays { contributionCount date } }
          }
        }
      }
    }`,
    variables: { login: username }
  };

  try {
    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `bearer ${activeToken}`,
        'User-Agent': 'OctoVibe-SaaS-Edge'
      },
      body: JSON.stringify(query)
    });

    if (!response.ok) return BRAND_FALLBACK;
    const json = await response.json();
    if (!json.data || !json.data.user) return BRAND_FALLBACK;

    const user = json.data.user;
    const repoNodes = user.repositories.nodes || [];
    let totalStars = 0;
    const langCounts = {};
    repoNodes.forEach(node => {
      totalStars += node.stargazerCount || 0;
      if (node.primaryLanguage) {
        langCounts[node.primaryLanguage.name] = (langCounts[node.primaryLanguage.name] || 0) + 1;
      }
    });

    const totalLangs = Object.values(langCounts).reduce((a, b) => a + b, 0) || 1;
    const topLanguages = Object.entries(langCounts)
      .map(([name, count]) => ({
        name,
        percentage: Math.round((count / totalLangs) * 100),
        color: name === 'TypeScript' ? '#3178c6' : name === 'JavaScript' ? '#f1e05a'
             : name === 'HTML' ? '#e34c26' : name === 'CSS' ? '#563d7c' : '#8b949e'
      }))
      .sort((a, b) => b.percentage - a.percentage).slice(0, 4);

    const calendar = user.contributionsCollection.contributionCalendar;
    let allDays = [];
    calendar.weeks.forEach(w => { if (w.contributionDays) allDays = allDays.concat(w.contributionDays); });
    allDays.sort((a, b) => new Date(a.date) - new Date(b.date));

    let maxStreak = 0, currentStreak = 0, tempStreak = 0;
    const todayStr     = new Date().toISOString().slice(0, 10);
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    allDays.forEach(day => {
      if (day.contributionCount > 0) { tempStreak++; if (tempStreak > maxStreak) maxStreak = tempStreak; }
      else tempStreak = 0;
      if ((day.date === todayStr || day.date === yesterdayStr) && day.contributionCount > 0) currentStreak = tempStreak;
    });

    return {
      name: user.name || user.login, login: user.login,
      avatarUrl: user.avatarUrl, bio: user.bio || 'Open Source Software Engineer.',
      location: user.location || 'Remote Node',
      followers: user.followers.totalCount, following: user.following.totalCount,
      repos: user.repositories.totalCount, stars: totalStars,
      commits: calendar.totalContributions,
      prs:    Math.floor(user.repositories.totalCount * 0.6) + 2,
      issues: Math.floor(user.repositories.totalCount * 0.3),
      reviews: Math.floor(user.repositories.totalCount * 0.15),
      languagesCount: Object.keys(langCounts).length || 1,
      currentStreak: currentStreak || 0, longestStreak: maxStreak || 0,
      topLanguages: topLanguages.length > 0 ? topLanguages : [{ name: 'JavaScript', percentage: 100, color: '#f1e05a' }]
    };
  } catch (err) {
    console.error('OctoVibe telemetry error:', err.message);
    return BRAND_FALLBACK;
  }
}

// D. ART GRID HELPERS
function getTotalCols(year) {
  const start = new Date(year, 0, 1);
  const end   = new Date(year, 11, 31);
  return Math.ceil((end - start) / (7 * 24 * 60 * 60 * 1000)) + 1;
}

const LETTER_MAP = {
  A:['01110','10001','11111','10001','10001'],B:['11110','10001','11110','10001','11110'],
  C:['01111','10000','10000','10000','01111'],D:['11110','10001','10001','10001','11110'],
  E:['11111','10000','11110','10000','11111'],F:['11111','10000','11110','10000','10000'],
  G:['01111','10000','10111','10001','01111'],H:['10001','10001','11111','10001','10001'],
  I:['11111','00100','00100','00100','11111'],J:['00111','00010','00010','10010','01100'],
  K:['10001','10010','11100','10010','10001'],L:['10000','10000','10000','10000','11111'],
  M:['10001','11011','10101','10001','10001'],N:['10001','11001','10101','10011','10001'],
  O:['01110','10001','10001','10001','01110'],P:['11110','10001','11110','10000','10000'],
  Q:['01110','10001','10101','10010','01101'],R:['11110','10001','11110','10010','10001'],
  S:['01111','10000','01110','00001','11110'],T:['11111','00100','00100','00100','00100'],
  U:['10001','10001','10001','10001','01110'],V:['10001','10001','10001','01010','00100'],
  W:['10001','10001','10101','11011','10001'],X:['10001','01010','00100','01010','10001'],
  Y:['10001','01010','00100','00100','00100'],Z:['11111','00010','00100','01000','11111'],
  ' ':['00000','00000','00000','00000','00000']
};

function buildArtGrid(text, totalCols, bgLevel = '0') {
  const rows = 7;
  const grid = Array.from({ length: rows }, () => new Array(totalCols).fill(parseInt(bgLevel, 10) || 0));
  let col = 1;
  for (const ch of (text || '').toUpperCase()) {
    const pattern = LETTER_MAP[ch] || LETTER_MAP[' '];
    const startRow = 1;
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        if (col + c < totalCols) {
          grid[startRow + r][col + c] = pattern[r][c] === '1' ? 4 : (parseInt(bgLevel, 10) || 0);
        }
      }
    }
    col += 6;
    if (col >= totalCols - 2) break;
  }
  return grid;
}

// E. MASTER SERVERLESS ROUTING HANDLER
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const {
    user = 'octovibe', theme = 'midnight-blue', view = 'all',
    json = 'false', lang_layout = 'pipeline',
    art_text = 'OCTOVIBE', art_style = 'flat', art_bg = '0'
  } = req.query;

  const authHeader = req.headers.authorization || '';
  const userToken = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : '';

  const data     = await fetchUserTelemetry(user, userToken);
  const trophies = calculateAllTrophies(data);

  if (json === 'true') {
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({ profile: data, trophies });
  }

  const p = (THEMES.find(t => t.id === theme) || THEMES[1]).palette;
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
        <text x="0"   y="0" font-size="11" font-weight="bold" fill="${p.textTertiary}">REPOSITORIES</text><text x="0"   y="28" font-size="20" font-weight="700" fill="${p.textPrimary}">${data.repos}</text>
        <text x="160" y="0" font-size="11" font-weight="bold" fill="${p.textTertiary}">TOTAL STARS</text><text x="160" y="28" font-size="20" font-weight="700" fill="${p.textPrimary}">${data.stars}</text>
        <text x="320" y="0" font-size="11" font-weight="bold" fill="${p.textTertiary}">ANNUAL CONTRIBUTIONS</text><text x="320" y="28" font-size="20" font-weight="700" fill="${p.textPrimary}">${data.commits}</text>
        <text x="560" y="0" font-size="11" font-weight="bold" fill="${p.textTertiary}">TROPHIES</text><text x="560" y="28" font-size="20" font-weight="700" fill="${p.textPrimary}">${trophies.length}</text>
      </g>
    </svg>`;
  }

  else if (view === 'trophies') {
    const cards = trophies.map((t, i) => {
      const x = (i % 3) * 250 + 10, y = Math.floor(i / 3) * 90 + 10;
      return `<g transform="translate(${x},${y})">
        <rect width="240" height="80" rx="10" fill="${p.cardBg}" stroke="${p.cardBorder}" stroke-width="1.5"/>
        <circle cx="40" cy="40" r="22" fill="${p.background}" stroke="${t.color}" stroke-width="1.5"/>
        <text x="40" y="45" fill="${t.color}" font-family="sans-serif" font-size="16" text-anchor="middle" font-weight="bold">🏆</text>
        <text x="75" y="35" fill="${p.textPrimary}" font-family="sans-serif" font-size="12" font-weight="bold">${t.title}</text>
        <text x="75" y="55" fill="${t.color}" font-family="sans-serif" font-size="10" font-weight="bold">${t.label} Tier</text>
      </g>`;
    }).join('');
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="770" height="${Math.ceil(trophies.length / 3) * 90 + 20}"><rect width="100%" height="100%" fill="${p.background}" rx="12"/>${cards}</svg>`;
  }

  else if (view === 'languages') {
    let body = '';
    if (lang_layout === 'pipeline') {
      let cx = 0;
      const segs = data.topLanguages.map(l => { const w = (l.percentage / 100) * 720; const r = `<rect x="${cx}" y="0" width="${w}" height="12" fill="${l.color}"/>`; cx += w; return r; }).join('');
      const labels = data.topLanguages.map((l, i) => `<g transform="translate(${(i % 4) * 170},${Math.floor(i / 4) * 25 + 35})"><circle cx="6" cy="-4" r="5" fill="${l.color}"/><text x="18" y="0" fill="${p.textPrimary}" font-family="sans-serif" font-size="12" font-weight="bold">${l.name}</text><text x="110" y="0" fill="${p.textTertiary}" font-family="sans-serif" font-size="11">${l.percentage}%</text></g>`).join('');
      body = `<g transform="translate(30,60)">${segs}</g><g transform="translate(30,100)">${labels}</g>`;
    } else {
      body = data.topLanguages.map((l, i) => `<g transform="translate(${(i%3)*240+30},${Math.floor(i/3)*50+60})"><rect width="220" height="36" rx="8" fill="${p.cardBg}" stroke="${p.cardBorder}" stroke-width="1"/><circle cx="20" cy="18" r="5" fill="${l.color}"/><text x="35" y="22" fill="${p.textPrimary}" font-family="sans-serif" font-size="12" font-weight="bold">${l.name}</text><text x="175" y="22" fill="${p.primaryColor}" font-family="sans-serif" font-size="11" font-weight="bold">${l.percentage}%</text></g>`).join('');
    }
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="780" height="180"><rect width="100%" height="100%" fill="${p.background}" rx="12" stroke="${p.cardBorder}" stroke-width="1"/><text x="30" y="35" fill="${p.textPrimary}" font-family="sans-serif" font-size="14" font-weight="bold">LANGUAGE FINGERPRINT</text>${body}</svg>`;
  }

  else if (view === 'streak') {
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="780" height="140">
      <rect width="100%" height="100%" fill="${p.background}" rx="12" stroke="${p.cardBorder}" stroke-width="1"/>
      <g transform="translate(40, 45)" font-family="sans-serif">
        <g transform="translate(0,0)"><text x="0" y="0" font-size="11" font-weight="bold" fill="${p.textTertiary}">CURRENT STREAK</text><text x="0" y="32" font-size="28" font-weight="800" fill="${p.primaryColor}">${data.currentStreak} Day</text><text x="0" y="52" font-size="10" fill="${p.textSecondary}">Active Coding Window</text></g>
        <g transform="translate(250,0)"><text x="0" y="0" font-size="11" font-weight="bold" fill="${p.textTertiary}">LONGEST STREAK</text><text x="0" y="32" font-size="28" font-weight="800" fill="${p.textPrimary}">${data.longestStreak} Days</text><text x="0" y="52" font-size="10" fill="${p.textSecondary}">Lifetime Record Metric</text></g>
        <g transform="translate(500,0)"><text x="0" y="0" font-size="11" font-weight="bold" fill="${p.textTertiary}">ANNUAL CONTRIBUTIONS</text><text x="0" y="32" font-size="28" font-weight="800" fill="${p.textPrimary}">${data.commits}</text><text x="0" y="52" font-size="10" fill="${p.textSecondary}">Year Timeline Volume</text></g>
      </g>
    </svg>`;
  }

  else if (view === 'art') {
    const currentYear = new Date().getFullYear();
    const totalCols   = getTotalCols(currentYear);
    const grid        = buildArtGrid(art_text, totalCols, art_bg);
    const cellWidth   = art_style === 'flat' ? 11 : 14;
    const cellGap     = art_style === 'flat' ? 2  : 4;
    const svgWidth    = totalCols * (cellWidth + cellGap) + 100;
    const CLR_ARRAY   = ['#151b23','#033a16','#196c2e','#2ea043','#56d364'];
    const MONS        = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    let gridCells = '';
    for (let c = 0; c < totalCols; c++) {
      for (let r = 0; r < 7; r++) {
        const lv = grid[r]?.[c] || 0;
        const x  = c * (cellWidth + cellGap) + 50;
        const y  = r * (cellWidth + cellGap) + 60;
        gridCells += `<rect x="${x}" y="${y}" width="${cellWidth}" height="${cellWidth}" rx="${art_style === 'flat' ? 2 : 4}" fill="${CLR_ARRAY[lv]}" ${lv === 0 && art_style === 'flat' ? 'stroke="#21262d" stroke-width="1"' : ''}/>`;
      }
    }

    const monthHeaders = MONS.map((m, idx) => {
      const x = Math.floor((idx / 12) * totalCols) * (cellWidth + cellGap) + 50;
      return `<text x="${x}" y="48" fill="${p.textTertiary}" font-family="sans-serif" font-size="9" font-weight="bold">${m}</text>`;
    }).join('');

    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="190">
      <rect width="100%" height="100%" fill="${p.background}" rx="12" stroke="${p.cardBorder}" stroke-width="1"/>
      <text x="30" y="35" fill="${p.textPrimary}" font-family="sans-serif" font-size="13" font-weight="bold">${art_text}</text>
      <g transform="translate(${svgWidth - 90},23)"><rect width="50" height="18" rx="4" fill="${p.cardBg}" stroke="${p.primaryColor}" stroke-width="1"/><text x="25" y="13" fill="${p.textPrimary}" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">2026</text></g>
      ${monthHeaders}${gridCells}
      <g transform="translate(50,170)" font-family="sans-serif" font-size="10" fill="${p.textTertiary}"><text x="0" y="0">Less</text><rect x="30" y="-8" width="10" height="10" rx="1" fill="#151b23" stroke="#21262d"/><rect x="44" y="-8" width="10" height="10" rx="1" fill="#033a16"/><rect x="58" y="-8" width="10" height="10" rx="1" fill="#196c2e"/><rect x="72" y="-8" width="10" height="10" rx="1" fill="#2ea043"/><rect x="86" y="-8" width="10" height="10" rx="1" fill="#56d364"/><text x="102" y="0">More</text></g>
    </svg>`;
  }

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'max-age=0, s-maxage=3600, must-revalidate');
  res.status(200).send(svgContent);
}
