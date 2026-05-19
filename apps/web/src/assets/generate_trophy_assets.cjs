const fs = require('fs');
const path = require('path');

const OUTPUT_DIR_SRC = path.join(__dirname, 'trophies');
const OUTPUT_DIR_PUB = path.resolve(__dirname, '..', '..', 'public', 'assets', 'trophies');

if (!fs.existsSync(OUTPUT_DIR_SRC)) {
  fs.mkdirSync(OUTPUT_DIR_SRC, { recursive: true });
}
if (!fs.existsSync(OUTPUT_DIR_PUB)) {
  fs.mkdirSync(OUTPUT_DIR_PUB, { recursive: true });
}

// 1. Define Tier Style Parameters
const TIER_CONFIG = {
  bronze: {
    label: 'Bronze',
    colorStart: '#f59e0b', // Warm copper-bronze
    colorEnd: '#b45309',
    glowColor: '#d97706',
    glowIntensity: '0.45',
  },
  silver: {
    label: 'Silver',
    colorStart: '#f1f5f9', // Sleek metallic silver
    colorEnd: '#64748b',
    glowColor: '#94a3b8',
    glowIntensity: '0.5',
  },
  gold: {
    label: 'Gold',
    colorStart: '#fbbf24', // Radiant liquid gold
    colorEnd: '#b45309',
    glowColor: '#f59e0b',
    glowIntensity: '0.65',
  },
  platinum: {
    label: 'Platinum',
    colorStart: '#22d3ee', // Cyber-neon icy cosmic platinum
    colorEnd: '#0891b2',
    glowColor: '#06b6d4',
    glowIntensity: '0.8',
  }
};

// 2. Define Icon Vector Generators
const ICONS = {
  stars: (c) => `<path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="${c}"/>`,
  
  commits: (c) => `
    <path d="M12 2L2 7l10 5 10-5-10-5z" fill="none" stroke="${c}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M2 7v10l10 5V12L2 7z" fill="none" stroke="${c}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M22 7v10l-10 5V12l10-5z" fill="none" stroke="${c}" stroke-width="2" stroke-linejoin="round"/>
  `,
  
  repos: (c) => `
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20v3H6.5a1.5 1.5 0 0 0-1.5 1.5z" fill="none" stroke="${c}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M6 2H20v15H6a3 3 0 0 0-3 3V5a3 3 0 0 1 3-3z" fill="none" stroke="${c}" stroke-width="2" stroke-linejoin="round"/>
  `,
  
  forks: (c) => `
    <circle cx="6" cy="6" r="3" fill="none" stroke="${c}" stroke-width="2"/>
    <circle cx="18" cy="6" r="3" fill="none" stroke="${c}" stroke-width="2"/>
    <circle cx="12" cy="18" r="3" fill="none" stroke="${c}" stroke-width="2"/>
    <path d="M12 15V12c0-1.1-.9-2-2-2H6m6 2c0-1.1.9-2 2-2h4" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round"/>
  `,
  
  prs: (c) => `
    <circle cx="6" cy="6" r="3" fill="none" stroke="${c}" stroke-width="2"/>
    <circle cx="6" cy="18" r="3" fill="none" stroke="${c}" stroke-width="2"/>
    <path d="M6 9v6" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round"/>
    <circle cx="18" cy="18" r="3" fill="none" stroke="${c}" stroke-width="2"/>
    <path d="M18 15V12c0-1.66-1.34-3-3-3H9" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round"/>
  `,
  
  reviews: (c) => `
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="none" stroke="${c}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M9 11l2 2 4-4" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  
  issues: (c) => `
    <path d="M12 2v2M8 5a4 4 0 0 1 8 0v3H8V5z" fill="none" stroke="${c}" stroke-width="2"/>
    <rect x="6" y="8" width="12" height="8" rx="4" fill="none" stroke="${c}" stroke-width="2"/>
    <path d="M6 10H3m3 3H3m3 3H3m12-6h3m-3 3h3m-3 3h3M8 20v2m8-2v2" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round"/>
  `,
  
  discussions: (c) => `
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="none" stroke="${c}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M8 10h8m-8 3h5" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round"/>
  `,
  
  polyglot: (c) => `
    <path d="M18 16.5l4.5-4.5L18 7.5M6 7.5L1.5 12 6 16.5M14 4.5l-4 15" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  
  longevity: (c) => `
    <path d="M5 2h14m-14 20h14M5 2v4c0 3 2.5 5 5 6-2.5 1-5 3-5 6v4m14-20v4c0 3-2.5 5-5 6 2.5 1 5 3 5 6v4" fill="none" stroke="${c}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M12 7v2m0 6v2" fill="none" stroke="${c}" stroke-width="2"/>
  `,
  
  nightowl: (c) => `
    <path d="M12 3a9 9 0 1 0 9 9 9.75 9.75 0 0 1-9-9z" fill="none" stroke="${c}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M19 3l.8 1.7 1.7.8-1.7.8-.8 1.7-.8-1.7-1.7-.8 1.7-.8z" fill="${c}"/>
  `,
  
  earlybird: (c) => `
    <circle cx="12" cy="12" r="5" fill="none" stroke="${c}" stroke-width="2"/>
    <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42m12.72-12.72l1.42-1.42" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round"/>
  `,
  
  docs: (c) => `
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="none" stroke="${c}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M14 2v6h6M16 13H8m8 4H8M10 9H8" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  
  gists: (c) => `
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="none" stroke="${c}" stroke-width="2" stroke-linejoin="round"/>
  `
};

// 3. SVG Template
function makeTrophySvg(id, tier, cfg) {
  const iconDrawer = ICONS[id];
  const mainColor = cfg.colorStart;
  const innerPaths = iconDrawer(mainColor);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="100%" height="100%">
  <defs>
    <!-- Background Obsdian Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0B0F19" stop-opacity="0.98"/>
      <stop offset="100%" stop-color="#111827" stop-opacity="0.85"/>
    </linearGradient>
    
    <!-- Metallic Tier Gradient -->
    <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${cfg.colorStart}"/>
      <stop offset="50%" stop-color="${cfg.colorStart}dd"/>
      <stop offset="100%" stop-color="${cfg.colorEnd}"/>
    </linearGradient>

    <!-- Neon Glow Filter -->
    <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="5" result="blur"/>
      <feFlood flood-color="${cfg.glowColor}" flood-opacity="${cfg.glowIntensity}" result="glowColor"/>
      <feComposite in="glowColor" in2="blur" operator="in" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Ambient Outer Glow -->
  <rect x="18" y="18" width="84" height="84" rx="20" fill="none" stroke="${cfg.glowColor}" stroke-width="2" filter="url(#neonGlow)" opacity="0.3"/>

  <!-- Sleek Cyber-Shield Container -->
  <rect x="15" y="15" width="90" height="90" rx="22" fill="url(#bgGrad)" stroke="url(#borderGrad)" stroke-width="2" filter="url(#neonGlow)"/>

  <!-- Cybernetic Corner Detail Points -->
  <rect x="22" y="22" width="76" height="76" rx="16" fill="none" stroke="url(#borderGrad)" stroke-width="0.75" opacity="0.35"/>

  <!-- Outer Crosshair Tick Markers -->
  <line x1="60" y1="11" x2="60" y2="15" stroke="${cfg.colorStart}" stroke-width="1.5" opacity="0.75" />
  <line x1="60" y1="105" x2="60" y2="109" stroke="${cfg.colorStart}" stroke-width="1.5" opacity="0.75" />
  <line x1="11" y1="60" x2="15" y2="60" stroke="${cfg.colorStart}" stroke-width="1.5" opacity="0.75" />
  <line x1="105" y1="60" x2="109" y2="60" stroke="${cfg.colorStart}" stroke-width="1.5" opacity="0.75" />

  <!-- Inner Concentric Orbit -->
  <circle cx="60" cy="60" r="23" fill="#05070c" fill-opacity="0.7" stroke="url(#borderGrad)" stroke-width="1" opacity="0.45"/>

  <!-- Central Vector Icon -->
  <g transform="translate(48, 48) scale(1.0)" filter="drop-shadow(0 0 2px ${cfg.glowColor}55)">
    ${innerPaths}
  </g>
</svg>
`;
}

// 4. Generate all combinations
console.log('--- Generating Standalone Gamified Trophy Vector Assets ---');
let totalCreated = 0;

for (const [trophyId, iconFunc] of Object.entries(ICONS)) {
  for (const [tierName, config] of Object.entries(TIER_CONFIG)) {
    const filename = `${trophyId}_${tierName}.svg`;
    const filepathSrc = path.join(OUTPUT_DIR_SRC, filename);
    const filepathPub = path.join(OUTPUT_DIR_PUB, filename);
    const svgContent = makeTrophySvg(trophyId, tierName, config);
    
    fs.writeFileSync(filepathSrc, svgContent, 'utf8');
    fs.writeFileSync(filepathPub, svgContent, 'utf8');
    totalCreated++;
  }
}

console.log(`Successfully compiled and wrote ${totalCreated} premium glowing SVG assets in BOTH src and public directories!`);
