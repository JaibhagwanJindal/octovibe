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

function getTrophyProgress(id, value, tierLabel) {
  const thresh = TROPHY_THRESHOLDS[id];
  if (!thresh) return null;
  
  let nextLabel = '';
  let nextVal = 0;
  let prevVal = 0;
  
  if (tierLabel.toLowerCase() === 'bronze') {
    nextLabel = 'Silver';
    nextVal = thresh.silver;
    prevVal = thresh.bronze;
  } else if (tierLabel.toLowerCase() === 'silver') {
    nextLabel = 'Gold';
    nextVal = thresh.gold;
    prevVal = thresh.silver;
  } else if (tierLabel.toLowerCase() === 'gold') {
    nextLabel = 'Platinum';
    nextVal = thresh.platinum;
    prevVal = thresh.gold;
  } else {
    return {
      isMaxed: true,
      percentage: 100,
      text: 'MAX TIER UNLOCKED 🎉'
    };
  }
  
  const totalNeeded = nextVal - prevVal;
  const currentEarned = Math.max(0, value - prevVal);
  const percentage = Math.min(100, Math.floor((currentEarned / totalNeeded) * 100));
  
  return {
    isMaxed: false,
    nextLabel,
    nextVal,
    percentage,
    text: `${value} / ${nextVal} to ${nextLabel}`
  };
}

function TrophyIcon({ id, color }) {
  if (id === 'stars') {
    return <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill={color}/>;
  }
  if (id === 'commits') {
    return (
      <>
        <path d="M12 2L2 7l10 5 10-5-10-5z" fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
        <path d="M2 7v10l10 5V12L2 7z" fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
        <path d="M22 7v10l-10 5V12l10-5z" fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
      </>
    );
  }
  if (id === 'repos') {
    return (
      <>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20v3H6.5a1.5 1.5 0 0 0-1.5 1.5z" fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
        <path d="M6 2H20v15H6a3 3 0 0 0-3 3V5a3 3 0 0 1 3-3z" fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
      </>
    );
  }
  if (id === 'forks') {
    return (
      <>
        <circle cx="6" cy="6" r="3" fill="none" stroke={color} strokeWidth="2"/>
        <circle cx="18" cy="6" r="3" fill="none" stroke={color} strokeWidth="2"/>
        <circle cx="12" cy="18" r="3" fill="none" stroke={color} strokeWidth="2"/>
        <path d="M12 15V12c0-1.1-.9-2-2-2H6m6 2c0-1.1.9-2 2-2h4" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      </>
    );
  }
  if (id === 'prs') {
    return (
      <>
        <circle cx="6" cy="6" r="3" fill="none" stroke={color} strokeWidth="2"/>
        <circle cx="6" cy="18" r="3" fill="none" stroke={color} strokeWidth="2"/>
        <path d="M6 9v6" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        <circle cx="18" cy="18" r="3" fill="none" stroke={color} strokeWidth="2"/>
        <path d="M18 15V12c0-1.66-1.34-3-3-3H9" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      </>
    );
  }
  if (id === 'reviews') {
    return (
      <>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
        <path d="M9 11l2 2 4-4" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </>
    );
  }
  if (id === 'issues') {
    return (
      <>
        <path d="M12 2v2M8 5a4 4 0 0 1 8 0v3H8V5z" fill="none" stroke={color} strokeWidth="2"/>
        <rect x="6" y="8" width="12" height="8" rx="4" fill="none" stroke={color} strokeWidth="2"/>
        <path d="M6 10H3m3 3H3m3 3H3m12-6h3m-3 3h3m-3 3h3M8 20v2m8-2v2" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      </>
    );
  }
  if (id === 'discussions') {
    return (
      <>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
        <path d="M8 10h8m-8 3h5" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      </>
    );
  }
  if (id === 'polyglot') {
    return <path d="M18 16.5l4.5-4.5L18 7.5M6 7.5L1.5 12 6 16.5M14 4.5l-4 15" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>;
  }
  if (id === 'longevity') {
    return (
      <>
        <path d="M5 2h14m-14 20h14M5 2v4c0 3 2.5 5 5 6-2.5 1-5 3-5 6v4m14-20v4c0 3-2.5 5-5 6 2.5 1 5 3 5 6v4" fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
        <path d="M12 7v2m0 6v2" fill="none" stroke={color} strokeWidth="2"/>
      </>
    );
  }
  if (id === 'nightowl') {
    return (
      <>
        <path d="M12 3a9 9 0 1 0 9 9 9.75 9.75 0 0 1-9-9z" fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
        <path d="M19 3l.8 1.7 1.7.8-1.7.8-.8 1.7-.8-1.7-1.7-.8 1.7-.8z" fill={color}/>
      </>
    );
  }
  if (id === 'earlybird') {
    return (
      <>
        <circle cx="12" cy="12" r="5" fill="none" stroke={color} strokeWidth="2"/>
        <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42m12.72-12.72l1.42-1.42" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      </>
    );
  }
  if (id === 'docs') {
    return (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
        <path d="M14 2v6h6M16 13H8m8 4H8M10 9H8" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </>
    );
  }
  if (id === 'gists') {
    return <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round"/>;
  }
  return <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill={color}/>;
}


export default function AnalyticsPreviewModule({ username }) {
  const [profile, setProfile] = useState(null);
  const [trophies, setTrophies] = useState([]);
  const [activeTheme, setActiveTheme] = useState('midnight-blue');
  const [selectedView, setSelectedView] = useState('all');
  const [langLayout, setLangLayout] = useState('pipeline');
  const [copied, setCopied] = useState(false);
  
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
                  <img src={profile.avatarUrl} className="w-20 h-20 rounded-full border-4 shadow-md" style={{ borderColor: p.primaryColor }} alt="" />
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
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-100 uppercase tracking-widest">
                      Earned Profile Trophies
                    </h4>
                    <p className="text-xs text-gray-400 mt-1">
                      Gamified milestones calculated from live telemetry. Hover over badges to inspect.
                    </p>
                  </div>
                  <div className="flex items-center gap-4 bg-slate-900/50 border border-white/5 px-3 py-1.5 rounded-lg">
                    <span className="text-[11px] font-mono font-bold text-gray-400">TROPHIES UNLOCKED:</span>
                    <span className="text-sm font-black text-[#58a6ff] font-mono">{trophies.length} / 14</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {trophies.map((t, i) => {
                    const prog = getTrophyProgress(t.id, t.value, t.label);
                    const description = TROPHY_DESCRIPTIONS[t.id] || "";
                    
                    return (
                      <div 
                        key={i} 
                        className="group relative flex flex-col justify-between p-4 rounded-xl border transition-all duration-300 bg-[#0B0F19]/80 backdrop-blur-md hover:scale-[1.03] overflow-hidden"
                        style={{ 
                          borderColor: p.cardBorder,
                          boxShadow: `0 4px 12px rgba(0, 0, 0, 0.4)`
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = t.color;
                          e.currentTarget.style.boxShadow = `0 0 20px ${t.color}25, 0 4px 20px rgba(0, 0, 0, 0.5)`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = p.cardBorder;
                          e.currentTarget.style.boxShadow = `0 4px 12px rgba(0, 0, 0, 0.4)`;
                        }}
                      >
                        {/* Top row with Badge Icon and Title */}
                        <div className="flex items-start gap-4">
                          {/* Standalone Glowing Trophy SVG Asset */}
                          <div className="w-14 h-14 flex-shrink-0 transition-transform duration-500 group-hover:rotate-[12deg] group-hover:scale-105 filter drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]">
                            <img 
                              src={`/assets/trophies/${t.id}_${t.label.toLowerCase()}.svg`} 
                              alt={t.title} 
                              className="w-full h-full object-contain"
                            />
                          </div>

                          <div className="space-y-1">
                            <h5 className="text-xs font-black text-slate-50 font-sans tracking-wide leading-tight flex items-center gap-1.5">
                              {t.title}
                            </h5>
                            <p className="text-[10px] text-gray-400 font-medium">
                              {description}
                            </p>
                            <div 
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase"
                              style={{ 
                                backgroundColor: `${t.color}15`, 
                                color: t.color,
                                border: `1.5px solid ${t.color}30` 
                              }}
                            >
                              {t.label} Tier
                            </div>
                          </div>
                        </div>

                        {/* Gamified progress meter section at bottom */}
                        {prog && (
                          <div className="mt-4 pt-3 border-t border-white/5 space-y-1.5">
                            <div className="flex justify-between items-center text-[9px] font-bold font-mono">
                              <span className="text-gray-400">TIER PROGRESS</span>
                              <span style={{ color: t.color }}>{prog.text}</span>
                            </div>
                            
                            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                              <div 
                                className="h-full rounded-full transition-all duration-500 ease-out"
                                style={{ 
                                  width: `${prog.percentage}%`, 
                                  backgroundColor: t.color,
                                  boxShadow: `0 0 8px ${t.color}`
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
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

    </div>
  );
}
