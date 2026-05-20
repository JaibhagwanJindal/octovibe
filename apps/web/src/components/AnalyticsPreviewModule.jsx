import React, { useState, useEffect } from 'react';
import { fetchUserTelemetry, calculateAllTrophies } from '@octovibe/core';
import { getThemes } from '@octovibe/themes';

const TROPHY_THRESHOLDS = {
  stars: { bronze: 10, silver: 100, gold: 500, platinum: 1000 },
  commits: { bronze: 100, silver: 1000, gold: 5000, platinum: 10000 },
  repos: { bronze: 5, silver: 20, gold: 50, platinum: 100 },
  forks: { bronze: 5, silver: 25, gold: 100, platinum: 500 },
  prs: { bronze: 5, silver: 25, gold: 100, platinum: 250 },
  reviews: { bronze: 2, silver: 10, gold: 50, platinum: 200 },
  issues: { bronze: 5, silver: 20, gold: 100, platinum: 500 },
  discussions: { bronze: 1, silver: 5, gold: 20, platinum: 50 },
  polyglot: { bronze: 3, silver: 5, gold: 8, platinum: 12 },
  longevity: { bronze: 1, silver: 3, gold: 5, platinum: 8 },
  nightowl: { bronze: 10, silver: 25, gold: 50, platinum: 75 },
  earlybird: { bronze: 10, silver: 25, gold: 50, platinum: 75 },
  docs: { bronze: 5, silver: 25, gold: 100, platinum: 500 },
  gists: { bronze: 2, silver: 10, gold: 30, platinum: 70 },
};

const TROPHY_DESCRIPTIONS = {
  stars: "Total repository stargaze collections",
  commits: "Chronological pushed commit volume",
  repos: "Public code repositories maintained",
  forks: "Telemetry metrics of code distribution",
  prs: "Constructive pull requests integrated",
  reviews: "Quality assurance peer inspections",
  issues: "System ticket management tasks",
  discussions: "Community architectural conversations",
  polyglot: "Diverse programming languages utilized",
  longevity: "Annual sequence platform consistency",
  nightowl: "Late-night contribution activity ratio",
  earlybird: "Early-morning contribution activity ratio",
  docs: "Constructive documentation adjustments",
  gists: "Snippets of useful tools published",
};

const TROPHY_TITLES = {
  stars: "Star Lord",
  commits: "Commit Monster",
  repos: "Prolific Creator",
  forks: "Fork Magnet",
  prs: "Open Architect",
  reviews: "Code Auditor",
  issues: "Bug Crusher",
  discussions: "The Oracle",
  polyglot: "The Polyglot",
  longevity: "The Ancient One",
  nightowl: "The Night Owl",
  earlybird: "The Early Bird",
  docs: "The Documentarian",
  gists: "Gist Genius",
};

function getTrophyProgressInfo(id, rawValue) {
  const thresh = TROPHY_THRESHOLDS[id];
  if (!thresh) return null;
  
  const value = rawValue || 0;
  let currentTier = 'locked';
  let color = '#4b5563'; // gray-600
  let nextTier = 'bronze';
  let nextThreshold = thresh.bronze;
  let prevThreshold = 0;
  let isMaxed = false;
  
  if (value >= thresh.platinum) {
    currentTier = 'platinum';
    color = '#e5e4e2';
    isMaxed = true;
  } else if (value >= thresh.gold) {
    currentTier = 'gold';
    color = '#ffd700';
    nextTier = 'platinum';
    nextThreshold = thresh.platinum;
    prevThreshold = thresh.gold;
  } else if (value >= thresh.silver) {
    currentTier = 'silver';
    color = '#c0c0c0';
    nextTier = 'gold';
    nextThreshold = thresh.gold;
    prevThreshold = thresh.silver;
  } else if (value >= thresh.bronze) {
    currentTier = 'bronze';
    color = '#cd7f32';
    nextTier = 'silver';
    nextThreshold = thresh.silver;
    prevThreshold = thresh.bronze;
  } else {
    currentTier = 'locked';
    color = '#4b5563';
    nextTier = 'bronze';
    nextThreshold = thresh.bronze;
    prevThreshold = 0;
  }
  
  let percentage = 0;
  if (isMaxed) {
    percentage = 100;
  } else {
    const range = nextThreshold - prevThreshold;
    const progress = Math.max(0, value - prevThreshold);
    percentage = Math.min(100, Math.floor((progress / range) * 100));
  }
  
  return {
    currentTier,
    color,
    nextTier,
    nextThreshold,
    prevThreshold,
    isMaxed,
    percentage,
    text: isMaxed ? 'MAX TIER UNLOCKED 🎉' : `${value} / ${nextThreshold} to ${nextTier.toUpperCase()}`
  };
}


export default function AnalyticsPreviewModule({ username }) {
  const [profile, setProfile] = useState(null);
  const [trophies, setTrophies] = useState([]);
  const [activeTheme, setActiveTheme] = useState('midnight-blue');
  const [selectedView, setSelectedView] = useState('all');
  const [langLayout, setLangLayout] = useState('pipeline');
  const [copied, setCopied] = useState(false);
  const [showTrophyModal, setShowTrophyModal] = useState(false);
  
  const themesList = getThemes();

  useEffect(() => {
    fetchUserTelemetry(username).then(res => {
      setProfile(res);
      setTrophies(calculateAllTrophies(res));
    });
  }, [username]);

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400 font-semibold animate-pulse space-y-3">
        <div className="w-8 h-8 border-4 border-[#388bfd] border-t-transparent rounded-full animate-spin"></div>
        <span>Hydrating developer telemetry profile configurations...</span>
      </div>
    );
  }

  const currentThemeData = themesList.find(t => t.id === activeTheme) || themesList[0];
  const p = currentThemeData.palette;

  const baseSnippetUrl = `https://YOUR_VERCEL_PROJECT.vercel.app/api/render?user=${profile.login}&theme=${activeTheme}&view=${selectedView}${selectedView === 'languages' ? `&lang_layout=${langLayout}` : ''}`;
  const markdownEmbedString = `![OctoVibe](${baseSnippetUrl})`;

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownEmbedString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl animate-fadeIn">
      {/* Theme Matrix Palette Customizer Selector */}
      <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-5 flex items-center justify-between flex-wrap gap-4 shadow-xl">
        <div>
          <h3 className="text-sm font-bold text-white">Visual Aesthetic Workspace</h3>
          <p className="text-xs text-gray-400 mt-0.5">Swap profile theme vector styles instantly.</p>
        </div>
        <div className="flex gap-2">
          {themesList.map(t => (
            <button 
              key={t.id} 
              onClick={() => setActiveTheme(t.id)} 
              className={`px-4 py-1.5 text-xs font-bold rounded-lg border transition-all ${activeTheme === t.id ? 'border-white text-white' : 'border-transparent text-gray-400 bg-[#161b22]'}`} 
              style={{ backgroundColor: activeTheme === t.id ? p.primaryColor : '' }}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Target Presentation Block Layout Navigation Selector Router */}
      <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-5 space-y-3 shadow-xl">
        <div>
          <h3 className="text-sm font-bold text-white">Target Layout Module</h3>
          <p className="text-xs text-gray-400 mt-0.5">Select the specific data panel variant to review and generate.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'Composite Profile Suite', icon: 'fa-id-card' },
            { id: 'trophies', label: 'Trophy Achievement Matrix', icon: 'fa-trophy' },
            { id: 'languages', label: 'Language Fingerprint Chart', icon: 'fa-code' },
            { id: 'streak', label: 'Telemetry Consistency Streak', icon: 'fa-fire' }
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setSelectedView(opt.id)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${selectedView === opt.id ? 'bg-[#1f3456] text-[#58a6ff] border border-[#388bfd]' : 'bg-[#161b22] text-gray-400 border border-transparent hover:text-white'}`}
            >
              <i className={`fas ${opt.icon}`}></i> {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Local Rendering High-Fidelity Simulation Box Frame Container */}
      <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-4 shadow-md">
        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2 px-1">
          <i className="fas fa-eye text-[#388bfd]"></i> Local Render Preview Mirror
        </div>

        <div className="p-8 rounded-xl border transition-all duration-300 overflow-x-auto shadow-inner" style={{ backgroundColor: p.background, borderColor: p.cardBorder }}>
          <div className="min-w-[680px]">
            
            {/* View Layer A: Composite Core Identity Overview Layout */}
            {selectedView === 'all' && (
              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <img 
                    src={profile.avatarUrl || 'logo.png'} 
                    onError={(e) => { e.target.src = 'logo.png'; }} 
                    className="w-20 h-20 rounded-full border-4 shadow-md" 
                    style={{ borderColor: p.primaryColor }} 
                    alt="" 
                  />
                  <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">{profile.name}</h2>
                    <p className="text-sm font-mono font-bold" style={{ color: p.primaryColor }}>@{profile.login}</p>
                    <p className="text-xs text-gray-300 mt-1 max-w-xl font-medium leading-relaxed">{profile.bio}</p>
                    <p className="text-[10px] text-gray-500 mt-1"><i className="fas fa-map-marker-alt mr-1"></i> {profile.location}</p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-dashed" style={{ borderColor: p.cardBorder }}>
                  {[{ label: 'Repositories', val: profile.repos }, { label: 'Total Stars', val: profile.stars }, { label: 'Global Commits', val: profile.commits }, { label: 'Badges Unlocked', val: trophies.length }].map((stat, i) => (
                    <div key={i}>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{stat.label}</p>
                      <p className="text-xl font-black text-white mt-0.5">{stat.val}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* View Layer B: Premium Gamified 14+ Trophy Matrix Grid Panel */}
            {selectedView === 'trophies' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-4 flex-wrap gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-100 uppercase tracking-widest">
                      Earned Profile Trophies
                    </h4>
                    <p className="text-xs text-gray-400 mt-1">
                      Represented visually by their tier colors. Hover for details.
                    </p>
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    <button 
                      onClick={() => setShowTrophyModal(true)} 
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-900/60 hover:bg-slate-950/80 border border-[#30363d] text-white hover:text-[#58a6ff] hover:scale-105 active:scale-95 transition-all select-none"
                    >
                      <i className="fas fa-circle-info text-sky-400"></i> Trophy Milestones Guide
                    </button>
                    <div className="flex items-center gap-2 bg-slate-900/50 border border-white/5 px-3 py-1.5 rounded-lg">
                      <span className="text-[11px] font-mono font-bold text-gray-400">UNLOCKED:</span>
                      <span className="text-sm font-black text-[#58a6ff] font-mono">{trophies.length} / 14</span>
                    </div>
                  </div>
                </div>

                {trophies.length > 0 ? (
                  <div className="flex flex-wrap gap-4 justify-start">
                    {trophies.map((t, i) => {
                      const tierGlowColor = t.color;
                      return (
                        <div 
                          key={i} 
                          className="relative w-28 h-28 flex items-center justify-center rounded-2xl border transition-all duration-300 bg-[#0B0F19]/60 backdrop-blur-sm group hover:scale-[1.06]"
                          style={{ 
                            borderColor: `${tierGlowColor}33`,
                            boxShadow: `0 4px 12px rgba(0, 0, 0, 0.4), inset 0 0 12px ${tierGlowColor}10`
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = tierGlowColor;
                            e.currentTarget.style.boxShadow = `0 0 20px ${tierGlowColor}30, inset 0 0 16px ${tierGlowColor}15`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = `${tierGlowColor}33`;
                            e.currentTarget.style.boxShadow = `0 4px 12px rgba(0, 0, 0, 0.4), inset 0 0 12px ${tierGlowColor}10`;
                          }}
                          title={`${t.title} (${t.label} Tier) — Progress: ${t.value}`}
                        >
                          <img 
                            src={`assets/trophies/${t.id}_${t.label.toLowerCase()}.svg`} 
                            alt={t.title} 
                            className="w-20 h-20 object-contain filter drop-shadow-[0_0_6px_rgba(0,0,0,0.3)] transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[6deg]"
                          />
                          <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tierGlowColor, boxShadow: `0 0 6px ${tierGlowColor}` }}></div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic font-medium">Connect your account session to view gamified reward milestones.</p>
                )}
              </div>
            )}

            {/* View Layer C: Language Fingerprint Graph System Panels */}
            {selectedView === 'languages' && (
              <div className="space-y-5">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Language Processing volume</h4>
                  <div className="flex bg-[#161b22] border border-[#30363d] p-1 rounded-lg gap-1">
                    <button onClick={() => setLangLayout('pipeline')} className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${langLayout === 'pipeline' ? 'bg-[#21262d] text-white' : 'text-gray-400'}`}>Pipeline Bar</button>
                    <button onClick={() => setLangLayout('grid')} className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${langLayout === 'grid' ? 'bg-[#21262d] text-white' : 'text-gray-400'}`}>Grid Badges</button>
                  </div>
                </div>

                {langLayout === 'pipeline' ? (
                  <div className="space-y-4">
                    <div className="w-full h-3 rounded-full overflow-hidden flex bg-gray-800 shadow-inner">
                      {profile.topLanguages.map((l, i) => (
                        <div key={i} style={{ width: `${l.percentage}%`, backgroundColor: l.color }} className="h-full" />
                      ))}
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      {profile.topLanguages.map((l, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: l.color }} />
                          <span className="text-xs font-bold text-white truncate">{l.name}</span>
                          <span className="text-[11px] text-gray-400 ml-auto font-mono font-bold">{l.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {profile.topLanguages.map((l, i) => (
                      <div key={i} className="p-3 rounded-xl border flex items-center justify-between" style={{ backgroundColor: p.cardBg, borderColor: p.cardBorder }}>
                        <div className="flex items-center gap-2.5">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: l.color }} />
                          <span className="text-xs font-bold text-white">{l.name}</span>
                        </div>
                        <span className="text-xs font-black font-mono" style={{ color: p.primaryColor }}>{l.percentage}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* View Layer D: Precision Telemetry Consistency Streak Block Layout */}
            {selectedView === 'streak' && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Consistency Activity Telemetry</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border bg-black/20" style={{ borderColor: p.cardBorder }}>
                    <p className="text-[10px] font-bold text-gray-500 uppercase">Current Session Streak</p>
                    <p className="text-2xl font-black font-mono mt-1" style={{ color: p.primaryColor }}>{profile.currentStreak} Days</p>
                    <p className="text-[11px] text-gray-400 mt-1">Ongoing active daily adjustments</p>
                  </div>
                  <div className="p-4 rounded-xl border bg-black/20" style={{ borderColor: p.cardBorder }}>
                    <p className="text-[10px] font-bold text-gray-500 uppercase">Longest Metric Record</p>
                    <p className="text-2xl font-black font-mono text-white mt-1">{profile.longestStreak} Days</p>
                    <p className="text-[11px] text-gray-400 mt-1">Lifetime historic sequence boundary</p>
                  </div>
                  <div className="p-4 rounded-xl border bg-black/20" style={{ borderColor: p.cardBorder }}>
                    <p className="text-[10px] font-bold text-gray-500 uppercase">Global Annual Volume</p>
                    <p className="text-2xl font-black font-mono text-white mt-1">{profile.commits}</p>
                    <p className="text-[11px] text-gray-400 mt-1">Aggregated platform contribution set</p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* 4. MARKDOWN ANCHOR CLIPBOARD SNIPPET DELIVERY BAR */}
      <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-6 space-y-4 shadow-xl">
        <div>
          <h3 className="text-sm font-bold text-white">Profile README Direct Insertion Snippet</h3>
          <p className="text-xs text-gray-400 mt-0.5">Copy this dynamic reference anchor markup directly into your repository profile markdown file.</p>
        </div>
        <div className="flex gap-2">
          <input 
            type="text" 
            readOnly 
            value={markdownEmbedString}
            className="flex-1 bg-[#161b22] border border-[#30363d] rounded-lg p-3 text-xs font-mono text-gray-400 outline-none select-all"
          />
          <button 
            onClick={handleCopy} 
            className="bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-white px-5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 flex-shrink-0 min-w-[110px]"
          >
            {copied ? (
              <><i className="fas fa-check text-green-400"></i> Copied!</>
            ) : (
              <><i className="fas fa-copy"></i> Copy Link</>
            )}
          </button>
        </div>
      </div>

      {/* GLASSMORPHIC TROPHY MILESTONES GUIDE POPUP MODAL */}
      {showTrophyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto animate-fadeIn select-text">
          <div className="relative bg-[#0d1117]/95 border border-[#30363d] rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-scaleUp">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#30363d] bg-[#161b22]/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ffd700] to-[#cd7f32] flex items-center justify-center shadow-lg text-black">
                  <i className="fas fa-trophy text-lg animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white tracking-wide">OctoVibe Trophies & Milestones Guide</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Track your progress toward higher developer status tiers</p>
                </div>
              </div>
              <button 
                onClick={() => setShowTrophyModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#21262d] hover:bg-[#30363d] text-gray-400 hover:text-white border border-[#30363d] transition-all hover:scale-105"
              >
                <i className="fas fa-xmark text-sm" />
              </button>
            </div>

            {/* Modal Content - Scrollable Grid */}
            <div className="p-6 overflow-y-auto flex-1 bg-black/10 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(TROPHY_THRESHOLDS).map((id) => {
                  let val = 0;
                  if (id === 'stars') val = profile.stars || 0;
                  else if (id === 'commits') val = profile.commits || 0;
                  else if (id === 'repos') val = profile.repos || 0;
                  else if (id === 'forks') val = profile.forks || 0;
                  else if (id === 'prs') val = profile.prs || 0;
                  else if (id === 'reviews') val = profile.reviews || 0;
                  else if (id === 'issues') val = profile.issues || 0;
                  else if (id === 'discussions') val = profile.discussions || 0;
                  else if (id === 'polyglot') val = profile.languagesCount || 0;
                  else if (id === 'longevity') val = profile.accountAgeYears || 0;
                  else if (id === 'nightowl') val = profile.nightCommitRatio || 0;
                  else if (id === 'earlybird') val = profile.earlyCommitRatio || 0;
                  else if (id === 'docs') val = profile.docsChangesK || 0;
                  else if (id === 'gists') val = profile.gists || 0;

                  const title = TROPHY_TITLES[id];
                  const description = TROPHY_DESCRIPTIONS[id];
                  const prog = getTrophyProgressInfo(id, val);

                  const isLocked = prog.currentTier === 'locked';
                  const tierColor = prog.color;

                  return (
                    <div 
                      key={id} 
                      className={`p-4 rounded-xl border transition-all duration-300 ${isLocked ? 'bg-[#161b22]/30 border-dashed border-gray-800' : 'bg-[#0B0F19]/80 border-[#30363d]'}`}
                      style={{ 
                        borderColor: isLocked ? '' : `${tierColor}33`,
                        boxShadow: isLocked ? 'none' : `0 4px 12px rgba(0, 0, 0, 0.4), inset 0 0 10px ${tierColor}05`
                      }}
                    >
                      <div className="flex items-start gap-4">
                        {/* Trophy Icon Area */}
                        <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center relative">
                          <img 
                            src={`assets/trophies/${id}_${isLocked ? 'bronze' : prog.currentTier}.svg`} 
                            alt={title} 
                            className={`w-full h-full object-contain filter drop-shadow-[0_0_6px_rgba(0,0,0,0.4)] ${isLocked ? 'grayscale opacity-30 brightness-50' : ''}`}
                          />
                          {isLocked && (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                              <i className="fas fa-lock text-xs bg-[#0d1117] p-1.5 rounded-full border border-gray-800" />
                            </div>
                          )}
                        </div>

                        {/* Text and Status Info */}
                        <div className="flex-1 space-y-0.5">
                          <div className="flex items-center justify-between">
                            <h4 className={`text-xs font-black tracking-wide ${isLocked ? 'text-gray-500' : 'text-slate-100'}`}>{title}</h4>
                            <span 
                              className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider border"
                              style={{ 
                                backgroundColor: isLocked ? '#1f293720' : `${tierColor}15`, 
                                color: isLocked ? '#6b7280' : tierColor,
                                borderColor: isLocked ? '#37415130' : `${tierColor}30` 
                              }}
                            >
                              {isLocked ? 'Locked' : `${prog.currentTier} tier`}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400 font-medium leading-normal">{description}</p>
                          <p className="text-[10px] font-semibold font-mono text-gray-500 mt-1">Current telemetry: <span className={isLocked ? 'text-gray-400' : 'text-white'}>{val}</span></p>
                        </div>
                      </div>

                      {/* Progress bar and Thresholds list */}
                      <div className="mt-3.5 pt-3.5 border-t border-[#30363d]/40 space-y-2">
                        <div className="flex justify-between items-center text-[9px] font-bold font-mono">
                          <span className="text-gray-400 uppercase tracking-widest">Progress</span>
                          <span style={{ color: isLocked ? '#9ca3af' : tierColor }}>{prog.text}</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#010409] rounded-full overflow-hidden border border-white/5">
                          <div 
                            className="h-full rounded-full transition-all duration-500"
                            style={{ 
                              width: `${prog.percentage}%`, 
                              backgroundColor: isLocked ? '#4b5563' : tierColor,
                              boxShadow: isLocked ? 'none' : `0 0 6px ${tierColor}`
                            }}
                          />
                        </div>
                        {/* Threshold details */}
                        <div className="flex justify-between text-[8px] font-mono text-gray-500 pt-0.5">
                          <span>Bronze: {TROPHY_THRESHOLDS[id].bronze}</span>
                          <span>Silver: {TROPHY_THRESHOLDS[id].silver}</span>
                          <span>Gold: {TROPHY_THRESHOLDS[id].gold}</span>
                          <span>Plat: {TROPHY_THRESHOLDS[id].platinum}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#30363d] bg-[#161b22]/30 flex justify-end">
              <button 
                onClick={() => setShowTrophyModal(false)}
                className="px-5 py-1.5 text-xs font-bold rounded-lg bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-white transition-all active:scale-95"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
