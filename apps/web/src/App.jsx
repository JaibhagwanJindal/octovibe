import React, { useState, useEffect } from 'react';
import { fetchUserTelemetry, calculateAllTrophies, buildArtGrid, getTotalCols, getTextWidth } from '@octovibe/core';
import { getThemes } from '@octovibe/themes';

export default function App() {
  const currentYear = new Date().getFullYear();
  const themesList = getThemes();

  const [username, setUsername] = useState('JaibhagwanJindal');
  const [activeTheme, setActiveTheme] = useState('midnight-blue');
  const [heroLayout, setHeroLayout] = useState('minimalist');
  const [langLayout, setLangLayout] = useState('pipeline');
  const [artTitle, setArtTitle] = useState('JAIBHAGWAN JINDAL');
  const [artText, setArtText] = useState('JAIBHAGWAN');
  const [artStyle, setArtStyle] = useState('flat');
  const [artBg, setArtBg] = useState('0');
  const [visible, setVisible] = useState({ hero: true, metrics: true, streak: true, languages: true, trophies: true, art: true });
  const [profile, setProfile] = useState(null);
  const [trophies, setTrophies] = useState([]);
  const [renderedGrid, setRenderedGrid] = useState([]);
  const [artCommits, setArtCommits] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const CLR_MAP = ['#151b23', '#033a16', '#196c2e', '#2ea043', '#56d364'];
  const MON_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const totalCols = getTotalCols(currentYear);

  useEffect(() => {
    fetchUserTelemetry(username).then(res => {
      setProfile(res);
      setTrophies(calculateAllTrophies(res));
    });
  }, [username]);

  useEffect(() => {
    const gridData = buildArtGrid(artText, totalCols, artBg);
    setRenderedGrid(gridData);
    let commits = 0;
    for (let r = 0; r < 7; r++)
      for (let c = 0; c < totalCols; c++) {
        const lv = gridData[r]?.[c] ?? 0;
        commits += lv === 4 ? 5 : lv;
      }
    setArtCommits(commits);
  }, [artText, artBg, totalCols]);

  if (!profile) return (
    <div className="bg-[#010409] h-screen flex items-center justify-center text-gray-400 font-mono text-sm">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-[#388bfd] border-t-transparent rounded-full animate-spin" />
        <span>Initializing unified telemetry dashboard context...</span>
      </div>
    </div>
  );

  const p = (themesList.find(t => t.id === activeTheme) || themesList[0]).palette;

  const triggerCopy = (viewMode, idx, extra = '') => {
    navigator.clipboard.writeText(`![OctoVibe](https://octovibe.vercel.app/api/render?user=${profile.login}&theme=${activeTheme}&view=${viewMode}${extra})`);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleArtInput = (e) => {
    let clean = e.target.value.toUpperCase().replace(/[^A-Z\s]/g, '').replace(/\s+/g, ' ');
    if (clean.startsWith(' ')) clean = clean.slice(1);
    while (clean.length > 0 && getTextWidth(clean) > 52) clean = clean.slice(0, -1);
    setArtText(clean);
  };

  const styles3d = [
    "from-[#373b42] to-[#1e2025] border-[#0a0b0d] shadow-[inset_0_2px_1px_rgba(255,255,255,0.15),_0_4px_4px_rgba(0,0,0,0.5)]",
    "from-[#0e5b32] to-[#052615] border-[#02120a] shadow-[inset_0_2px_1px_rgba(255,255,255,0.3),_0_4px_4px_rgba(0,0,0,0.5)]",
    "from-[#1d8a39] to-[#0a4019] border-[#04210d] shadow-[inset_0_2px_1px_rgba(255,255,255,0.4),_0_4px_4px_rgba(0,0,0,0.5)]",
    "from-[#37d653] to-[#166e27] border-[#093311] shadow-[inset_0_2px_1px_rgba(255,255,255,0.6),_0_4px_4px_rgba(0,0,0,0.5)]",
    "from-[#6df079] to-[#2fcf3e] border-[#146124] shadow-[inset_0_2px_2px_rgba(255,255,255,0.8),_0_4px_12px_rgba(109,240,121,0.7)]"
  ];

  return (
    <div className="flex h-screen bg-[#010409] text-gray-300 font-sans antialiased select-none">

      {/* LEFT SIDEBAR: MASTER CONTROL CONSOLE */}
      <aside className="w-80 bg-[#0d1117] border-r border-[#30363d] p-5 flex flex-col justify-between overflow-y-auto flex-shrink-0">
        <div className="space-y-5">
          <div className="flex items-center gap-3 border-b border-[#21262d] pb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#388bfd] to-[#238636] flex items-center justify-center font-black text-white">🐙</div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-wide">OctoVibe Workspace</h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Unified Studio Hub</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Target Account Handle</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-[#161b22] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-white outline-none font-mono focus:border-[#58a6ff]" />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Visual Theme Palette</label>
              <div className="grid grid-cols-2 gap-1.5">
                {themesList.map(t => (
                  <button key={t.id} onClick={() => setActiveTheme(t.id)}
                    className={`px-2 py-1 rounded text-[10px] font-bold border transition-all ${activeTheme === t.id ? 'border-white text-white' : 'border-transparent text-gray-500 bg-[#161b22]'}`}
                    style={{ backgroundColor: activeTheme === t.id ? p.primaryColor : '' }}>
                    {t.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Hero Component Wireframe</label>
              <select value={heroLayout} onChange={e => setHeroLayout(e.target.value)} className="w-full bg-[#161b22] border border-[#30363d] rounded-md p-1.5 text-xs text-white outline-none">
                <option value="minimalist">Ultra-Minimalist Profile</option>
                <option value="terminal">Cyber-Terminal Console</option>
                <option value="corporate">Corporate Availability Card</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Language Component Architecture</label>
              <select value={langLayout} onChange={e => setLangLayout(e.target.value)} className="w-full bg-[#161b22] border border-[#30363d] rounded-md p-1.5 text-xs text-white outline-none">
                <option value="pipeline">Continuous Pipeline Bar</option>
                <option value="grid">Isolate Categorized Badges</option>
              </select>
            </div>

            <div className="border-t border-[#21262d] pt-3 space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Contribution Grid Generator</label>
              <input type="text" value={artTitle} onChange={e => setArtTitle(e.target.value)} placeholder="Chart Title Header" className="w-full bg-[#161b22] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-white outline-none" />
              <input type="text" value={artText} onChange={handleArtInput} placeholder="Grid Characters (A-Z)" className="w-full bg-[#161b22] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-white outline-none" />
              <div className="grid grid-cols-2 gap-1.5">
                <select value={artStyle} onChange={e => setArtStyle(e.target.value)} className="bg-[#161b22] border border-[#30363d] rounded-md p-1 text-[10px] text-white outline-none">
                  <option value="flat">2D Flat</option>
                  <option value="3d">3D Glass</option>
                </select>
                <select value={artBg} onChange={e => setArtBg(e.target.value)} className="bg-[#161b22] border border-[#30363d] rounded-md p-1 text-[10px] text-white outline-none">
                  <option value="0">Shade 0</option>
                  <option value="1">Shade 1</option>
                  <option value="2">Shade 2</option>
                  <option value="random">Scramble</option>
                </select>
              </div>
            </div>

            <div className="border-t border-[#21262d] pt-3">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Active Sections Visibility</label>
              <div className="grid grid-cols-2 gap-1">
                {Object.keys(visible).map(key => (
                  <button key={key} onClick={() => setVisible(prev => ({ ...prev, [key]: !prev[key] }))}
                    className={`py-1 rounded text-[9px] font-bold uppercase tracking-wider border transition-all ${visible[key] ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/20' : 'bg-transparent text-gray-600 border-transparent'}`}>
                    {key} {visible[key] ? '✓' : '✗'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="text-[10px] text-gray-500 font-bold border-t border-[#21262d] pt-3 tracking-wide">OctoVibe Engine • Production Mirror</div>
      </aside>

      {/* RIGHT: CONTINUOUS STACKED PREVIEW CANVAS STREAM */}
      <main className="flex-1 overflow-y-auto p-10 space-y-6">

        <div className="p-8 rounded-xl border shadow-inner transition-all duration-300" style={{ backgroundColor: p.background, borderColor: p.cardBorder }}>
          <div className="min-w-[700px] space-y-8 select-text">

            {/* MODULE 1: HERO VARIANTS */}
            {visible.hero && (
              <div className="animate-fade-in">
                {heroLayout === 'minimalist' && (
                  <div className="text-center py-4">
                    <img src={profile.avatarUrl} className="w-20 h-20 rounded-full mx-auto border-4 shadow-xl" style={{ borderColor: p.primaryColor }} alt="" />
                    <h2 className="text-2xl font-black text-white tracking-tight mt-3">{profile.name}</h2>
                    <p className="text-xs font-mono font-bold" style={{ color: p.primaryColor }}>@{profile.login}</p>
                    <p className="text-xs text-gray-300 mt-2 max-w-xl mx-auto leading-relaxed">{profile.bio}</p>
                  </div>
                )}
                {heroLayout === 'terminal' && (
                  <div className="bg-black/40 rounded-xl p-5 border font-mono text-[11px] space-y-1" style={{ borderColor: p.cardBorder }}>
                    <p className="text-gray-500">// Identity Terminal Framework Loading...</p>
                    <p><span className="text-emerald-400">visitor@octovibe:~#</span> fetch info --user @{profile.login}</p>
                    <p className="text-gray-300 pl-4">{'{'}</p>
                    <p className="pl-8"><span className="text-[#58a6ff]">"name"</span>: <span className="text-amber-300">"{profile.name}"</span>,</p>
                    <p className="pl-8"><span className="text-[#58a6ff]">"bio"</span>: <span className="text-amber-300">"{profile.bio}"</span>,</p>
                    <p className="pl-8"><span className="text-[#58a6ff]">"city"</span>: <span className="text-amber-300">"{profile.location}"</span></p>
                    <p className="text-gray-300 pl-4">{'}'}</p>
                  </div>
                )}
                {heroLayout === 'corporate' && (
                  <div className="flex items-center gap-6 p-5 rounded-xl" style={{ backgroundColor: p.cardBg }}>
                    <img src={profile.avatarUrl} className="w-20 h-20 rounded-xl border shadow" style={{ borderColor: p.cardBorder }} alt="" />
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-white">{profile.name}</h3>
                        <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">Active Status</span>
                      </div>
                      <p className="text-xs text-gray-400">@{profile.login} • {profile.location}</p>
                      <p className="text-xs text-gray-300 pt-1.5">{profile.bio}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* MODULE 2: METRICS GRID */}
            {visible.metrics && (
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Repositories', val: profile.repos, icon: 'fa-book-bookmark' },
                  { label: 'Total Stars', val: profile.stars, icon: 'fa-star' },
                  { label: 'Global Commits', val: profile.commits, icon: 'fa-cubes' },
                  { label: 'Followers', val: profile.followers, icon: 'fa-users' }
                ].map((s, i) => (
                  <div key={i} className="p-4 rounded-xl border" style={{ backgroundColor: p.cardBg, borderColor: p.cardBorder }}>
                    <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase mb-1">
                      <span>{s.label}</span>
                      <i className={`fas ${s.icon}`} style={{ color: p.primaryColor }} />
                    </div>
                    <p className="text-2xl font-black text-white font-mono">{s.val}</p>
                  </div>
                ))}
              </div>
            )}

            {/* MODULE 3: STREAK */}
            {visible.streak && (
              <div className="p-5 rounded-xl border bg-black/10" style={{ borderColor: p.cardBorder }}>
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Telemetry Consistency Engine</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 bg-black/20 rounded-lg border border-white/5">
                    <p className="text-[9px] font-bold text-gray-500 uppercase">Current Active Streak</p>
                    <p className="text-2xl font-black font-mono mt-0.5" style={{ color: p.primaryColor }}>12 Days</p>
                  </div>
                  <div className="p-3 bg-black/20 rounded-lg border border-white/5">
                    <p className="text-[9px] font-bold text-gray-500 uppercase">Longest Historic Streak</p>
                    <p className="text-2xl font-black font-mono text-white mt-0.5">48 Days</p>
                  </div>
                  <div className="p-3 bg-black/20 rounded-lg border border-white/5">
                    <p className="text-[9px] font-bold text-gray-500 uppercase">Year Timeline Volume</p>
                    <p className="text-2xl font-black font-mono text-white mt-0.5">{profile.commits}</p>
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 4: LANGUAGES */}
            {visible.languages && (
              <div className="p-5 rounded-xl border bg-black/10" style={{ borderColor: p.cardBorder }}>
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Language Fingerprint Matrix</h4>
                {langLayout === 'pipeline' ? (
                  <div className="space-y-4">
                    <div className="w-full h-3 rounded-full overflow-hidden flex bg-gray-800">
                      {profile.topLanguages.map((l, i) => (
                        <div key={i} style={{ width: `${l.percentage}%`, backgroundColor: l.color }} className="h-full" />
                      ))}
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      {profile.topLanguages.map((l, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs font-bold text-white">
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: l.color }} />
                          <span className="truncate">{l.name}</span>
                          <span className="text-gray-500 font-mono ml-auto text-[10px]">{l.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {profile.topLanguages.map((l, i) => (
                      <div key={i} className="p-2.5 rounded-xl border flex items-center justify-between text-xs" style={{ backgroundColor: p.cardBg, borderColor: p.cardBorder }}>
                        <div className="flex items-center gap-2 font-bold text-white">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} />
                          <span>{l.name}</span>
                        </div>
                        <span className="font-mono font-bold" style={{ color: p.primaryColor }}>{l.percentage}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* MODULE 5: TROPHIES */}
            {visible.trophies && (
              <div className="p-5 rounded-xl border bg-black/10" style={{ borderColor: p.cardBorder }}>
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Earned Platform Rewards</h4>
                <div className="grid grid-cols-3 gap-3">
                  {trophies.map((t, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl border shadow-sm" style={{ backgroundColor: t.bg, borderColor: t.border }}>
                      <div className="w-10 h-10 rounded-full bg-[#010409] border border-white/5 flex items-center justify-center text-sm" style={{ color: t.color }}>
                        <i className={`fas ${t.icon}`} />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-white leading-none">{t.title}</h5>
                        <p className="text-[9px] font-black tracking-wider uppercase mt-1" style={{ color: t.color }}>{t.tier} Tier</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MODULE 6: CONTRIBUTION ART CANVAS */}
            {visible.art && (
              <div>
                {artStyle === 'flat' ? (
                  <div id="flatCanvas" className="p-5 bg-[#0d1117] rounded-xl border shadow-md" style={{ borderColor: p.cardBorder }}>
                    <h4 className="text-xs font-bold text-gray-400 mb-4">
                      Contribution Grid Art — <span className="text-[#56d364] font-black">{artTitle}</span>
                    </h4>
                    <div className="flex flex-col gap-1 overflow-x-auto">
                      <div className="flex pl-8 h-4 relative mb-1">
                        {MON_LABELS.map((m, i) => (
                          <span key={i} className="text-[9px] text-gray-500 font-bold absolute" style={{ left: `${i * 54 + 32}px` }}>{m}</span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <div className="text-[9px] text-gray-500 font-bold h-[85px] flex flex-col justify-between pr-1 select-none">
                          <span>Mon</span><span>Wed</span><span>Fri</span>
                        </div>
                        <div className="flex gap-[2px]">
                          {Array.from({ length: totalCols }).map((_, c) => (
                            <div key={c} className="flex flex-col gap-[2px]">
                              {Array.from({ length: 7 }).map((_, r) => {
                                const lv = renderedGrid[r]?.[c] ?? 0;
                                return (
                                  <div key={r} className="w-[11px] h-[11px] rounded-[2px]"
                                    style={{ backgroundColor: CLR_MAP[lv], border: lv === 0 ? '1px solid #21262d' : 'none' }} />
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-4">
                      <i className="fas fa-hammer text-[#58a6ff] mr-1.5"></i>
                      <b>{artCommits}</b> commits required to paint this grid in {currentYear}.
                    </p>
                  </div>
                ) : (
                  <div id="threeDCanvas" className="p-5 bg-gradient-to-b from-[#2b2f36] to-[#121417] rounded-xl border border-black shadow-2xl">
                    <h4 className="text-sm font-bold text-white mb-4 tracking-wide">
                      Contribution Grid Art — <span className="text-[#56d364] drop-shadow-[0_0_8px_rgba(86,211,100,0.4)] font-black">{artTitle}</span>
                      <span className="text-gray-400 font-normal text-xs ml-1">(Elevated Glass Edition)</span>
                    </h4>
                    <div className="flex flex-col gap-1 overflow-x-auto">
                      <div className="flex pl-10 h-4 relative mb-2">
                        {MON_LABELS.map((m, i) => (
                          <span key={i} className="text-[11px] text-gray-300 font-black absolute tracking-wider" style={{ left: `${i * 74 + 42}px` }}>{m}</span>
                        ))}
                      </div>
                      <div className="flex gap-3">
                        <div className="text-[11px] font-bold text-gray-300 h-[115px] flex flex-col justify-between pr-1 select-none">
                          <span>Mon</span><span>Wed</span><span>Fri</span>
                        </div>
                        <div className="flex gap-[4px]">
                          {Array.from({ length: totalCols }).map((_, c) => (
                            <div key={c} className="flex flex-col gap-[4px]">
                              {Array.from({ length: 7 }).map((_, r) => {
                                const lv = renderedGrid[r]?.[c] ?? 0;
                                return (
                                  <div key={r} className={`w-[14px] h-[14px] rounded-[4px] border bg-gradient-to-b ${styles3d[lv]}`} />
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-200 mt-4">
                      <i className="fas fa-charging-station text-[#56d364] mr-1.5"></i>
                      Forging this pattern requires <span className="text-[#56d364] font-black font-mono">{artCommits}</span> total commits.
                    </p>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* EMBED CODE REGISTRY */}
        <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-5 space-y-3.5 shadow-xl select-text">
          <div>
            <h3 className="text-sm font-bold text-white">Production Embed Code Generation Registry</h3>
            <p className="text-xs text-gray-400 mt-0.5">Select any layout slice to extract its markdown anchor string.</p>
          </div>
          <div className="space-y-2">
            {[
              { label: 'Complete Identity Suite', t: 'all', ext: `&hero_layout=${heroLayout}` },
              { label: '14+ Gamified Trophy Panel', t: 'trophies', ext: '' },
              { label: 'Dynamic Language Fingerprint', t: 'languages', ext: `&lang_layout=${langLayout}` },
              { label: 'Consistency Streak Module', t: 'streak', ext: '' }
            ].map((item, idx) => {
              const str = `![OctoVibe](https://octovibe.vercel.app/api/render?user=${profile.login}&theme=${activeTheme}&view=${item.t}${item.ext})`;
              return (
                <div key={idx} className="bg-[#161b22] border border-[#21262d] p-3 rounded-lg flex flex-col sm:flex-row gap-3 items-center">
                  <span className="text-xs font-bold text-gray-300 sm:w-56 flex-shrink-0">
                    <i className="fas fa-link text-[#58a6ff] mr-2"></i>{item.label}
                  </span>
                  <input type="text" readOnly value={str} className="flex-1 w-full bg-[#010409] border border-[#30363d] rounded p-2 text-[10px] font-mono text-gray-400 outline-none" />
                  <button onClick={() => triggerCopy(item.t, idx, item.ext)}
                    className="w-full sm:w-28 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-white py-1.5 rounded text-xs font-bold transition-all flex-shrink-0">
                    {copiedIndex === idx ? '✓ Copied!' : 'Copy Snippet'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

      </main>
    </div>
  );
}
