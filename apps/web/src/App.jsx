import React, { useState, useEffect } from 'react';
import { fetchUserTelemetry, calculateAllTrophies, buildArtGrid, getTotalCols } from '@octovibe/core';
import { getThemes } from '@octovibe/themes';

export default function App() {
  const currentYear = new Date().getFullYear();
  const themesList = getThemes();

  // SaaS Multi-Tenant Authentication Sessions
  const [token, setToken] = useState(localStorage.getItem('octovibe_token') || '');
  const [username, setUsername] = useState(localStorage.getItem('octovibe_user') || 'JaibhagwanJindal');

  const [activeTheme, setActiveTheme] = useState('midnight-blue');
  const [heroLayout, setHeroLayout] = useState('minimalist');
  const [langLayout, setLangLayout] = useState('pipeline');

  const [artTitle, setArtTitle] = useState('OCTOVIBE VISUALS');
  const [artText, setArtText] = useState('CONNECTED');
  const [artStyle, setArtStyle] = useState('flat');
  const [artBg, setArtBg] = useState('0');

  const [visible, setVisible] = useState({ hero: true, metrics: true, streak: true, languages: true, trophies: true, art: true });
  const [profile, setProfile] = useState(null);
  const [trophies, setTrophies] = useState([]);
  const [renderedGrid, setRenderedGrid] = useState([]);
  const [artCommits, setArtCommits] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const CLR_MAP = ['#151b23', '#033a16', '#196c2e', '#2ea043', '#56d364'];
  const MONS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const totalCols = getTotalCols(currentYear);

  // GitHub OAuth SaaS Handshake — paste your GitHub OAuth App Client ID in Developer Settings
  const triggerGitHubLogin = () => {
    const CLIENT_ID = 'YOUR_GITHUB_OAUTH_CLIENT_ID';
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=read:user,repo`;
  };

  const executeLogout = () => {
    localStorage.removeItem('octovibe_token');
    localStorage.removeItem('octovibe_user');
    setToken('');
    setUsername('JaibhagwanJindal');
  };

  useEffect(() => {
    // Parse URL code search blocks for completed authorization code variables
    const params = new URLSearchParams(window.location.search);
    const authCode = params.get('code');
    if (authCode) {
      // Simulate rapid exchange verification loop sequence
      localStorage.setItem('octovibe_token', 'mock_secure_user_token');
      localStorage.setItem('octovibe_user', 'JaibhagwanJindal');
      setToken('mock_secure_user_token');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    fetchUserTelemetry(username, token).then(res => {
      setProfile(res);
      setTrophies(calculateAllTrophies(res));
    });
  }, [username, token]);

  useEffect(() => {
    const gridData = buildArtGrid(artText, totalCols, artBg);
    setRenderedGrid(gridData);
    let commits = 0;
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < totalCols; c++) {
        let lv = gridData[r]?.[c] ?? 0;
        commits += lv === 4 ? 5 : lv;
      }
    }
    setArtCommits(commits);
  }, [artText, artBg, totalCols]);

  if (!profile) return (
    <div className="bg-[#010409] h-screen text-gray-400 p-8 font-mono animate-pulse">
      Authorizing multi-tenant workspace nodes...
    </div>
  );

  const p = (themesList.find(t => t.id === activeTheme) || themesList[0]).palette;

  const triggerCopy = (viewMode, idx, extra = '') => {
    const targetUrl = `![OctoVibe](https://octovibe.vercel.app/api/render?user=${profile.login}&theme=${activeTheme}&view=${viewMode}${extra})`;
    navigator.clipboard.writeText(targetUrl);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="flex h-screen bg-[#010409] text-gray-300 font-sans antialiased overflow-hidden select-none">

      {/* SIDEBAR PARAMETERS CONSOLE PANEL */}
      <aside className="w-80 bg-[#0d1117] border-r border-[#30363d] p-5 flex flex-col justify-between overflow-y-auto flex-shrink-0">
        <div className="space-y-5">
          <div className="flex items-center gap-3 border-b border-[#21262d] pb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#388bfd] to-[#238636] flex items-center justify-center font-black text-white">🐙</div>
            <div>
              <h1 className="text-sm font-bold text-white">OctoVibe Portal</h1>
              <p className="text-[10px] text-gray-500 uppercase font-black">SaaS Multi-Tenant</p>
            </div>
          </div>

          <div className="space-y-3">
            {/* SaaS Authentication Trigger Buttons */}
            {!token ? (
              <button onClick={triggerGitHubLogin} className="w-full bg-[#238636] hover:bg-[#2ea043] text-white font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-2 shadow-md transition-colors">
                <i className="fab fa-github text-sm"></i> Login with GitHub
              </button>
            ) : (
              <div className="bg-black/20 border border-[#30363d] p-2.5 rounded-lg flex items-center justify-between">
                <div className="truncate">
                  <p className="text-[9px] uppercase font-bold text-gray-500">Logged in as</p>
                  <p className="text-xs font-mono font-bold text-white truncate">@{username}</p>
                </div>
                <button onClick={executeLogout} className="text-[10px] font-bold text-red-400 hover:text-red-300 bg-red-500/5 px-2 py-1 rounded border border-red-500/10 transition-colors">Logout</button>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Explore Profile Handle</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-[#161b22] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-white outline-none font-mono focus:border-[#58a6ff]" />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Theme Stylesheet</label>
              <div className="grid grid-cols-2 gap-1.5">
                {themesList.map(t => (
                  <button key={t.id} onClick={() => setActiveTheme(t.id)} className="px-2 py-1 rounded text-[10px] font-bold bg-[#161b22] transition-all" style={{ border: activeTheme === t.id ? '1px solid white' : '1px solid transparent', color: activeTheme === t.id ? '#fff' : '#6e7681' }}>{t.name.split(' ')[0]}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Hero Component Layout</label>
              <select value={heroLayout} onChange={e => setHeroLayout(e.target.value)} className="w-full bg-[#161b22] border border-[#30363d] rounded-md p-1.5 text-xs text-white outline-none">
                <option value="minimalist">Ultra-Minimalist Layout</option>
                <option value="terminal">Cyber-Terminal Engine</option>
                <option value="corporate">Corporate Profile Tag</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Language Component Architecture</label>
              <select value={langLayout} onChange={e => setLangLayout(e.target.value)} className="w-full bg-[#161b22] border border-[#30363d] rounded-md p-1.5 text-xs text-white outline-none">
                <option value="pipeline">Continuous Pipeline Bar</option>
                <option value="grid">Isolate Categorized Badges</option>
              </select>
            </div>

            <div className="border-t border-[#21262d] pt-3 space-y-2">
              <label className="block text-[10px] font-bold uppercase text-gray-400">Contribution Art Canvas Controls</label>
              <input type="text" value={artTitle} onChange={e => setArtTitle(e.target.value)} placeholder="Header Chart Title" className="w-full bg-[#161b22] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-white outline-none" />
              <input type="text" value={artText} onChange={e => setArtText(e.target.value.toUpperCase())} placeholder="Text String (A-Z)" className="w-full bg-[#161b22] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-white outline-none" />
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
              <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Active Sections Visibility</label>
              <div className="grid grid-cols-2 gap-1">
                {Object.keys(visible).map(key => (
                  <button key={key} onClick={() => setVisible(v => ({ ...v, [key]: !v[key] }))} className={`py-1 rounded text-[9px] font-bold uppercase border transition-all ${visible[key] ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/20' : 'bg-transparent text-gray-600 border-transparent'}`}>{key}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="text-[10px] text-gray-500 font-bold border-t border-[#21262d] pt-3">OctoVibe Multi-Tenant Platform</div>
      </aside>

      {/* CONTINUOUS PREVIEW CANVAS TIMELINE STREAM */}
      <main className="flex-1 overflow-y-auto p-10 space-y-6">

        <div className="p-8 rounded-xl border select-text" style={{ backgroundColor: p.background, borderColor: p.cardBorder }}>
          <div className="w-full space-y-8 max-w-[740px] mx-auto">

            {/* MODULE 1: HERO ACCOUNT SECTION */}
            {visible.hero && (
              <div className="w-full">
                {heroLayout === 'minimalist' && (
                  <div className="text-center py-2">
                    <img src={profile.avatarUrl} className="w-20 h-20 rounded-full mx-auto border-4 shadow-xl" style={{ borderColor: p.primaryColor }} alt="" />
                    <h2 className="text-2xl font-black text-white tracking-tight mt-3">{profile.name}</h2>
                    <p className="text-sm font-mono font-bold" style={{ color: p.primaryColor }}>@{profile.login}</p>
                    <p className="text-xs text-gray-300 mt-2 font-medium leading-relaxed max-w-xl mx-auto">{profile.bio}</p>
                  </div>
                )}
                {heroLayout === 'terminal' && (
                  <div className="bg-black/40 rounded-xl p-5 border font-mono text-[11px] space-y-1" style={{ borderColor: p.cardBorder }}>
                    <p><span className="text-emerald-400">visitor@octovibe:~#</span> fetch info --user @{profile.login}</p>
                    <p className="pl-4 text-gray-300">{`{ "name": "${profile.name}", "repositories": ${profile.repos}, "bio": "${profile.bio}" }`}</p>
                  </div>
                )}
                {heroLayout === 'corporate' && (
                  <div className="flex items-center gap-6 p-5 rounded-xl" style={{ backgroundColor: p.cardBg }}>
                    <img src={profile.avatarUrl} className="w-16 h-16 rounded-xl border shadow" style={{ borderColor: p.cardBorder }} alt="" />
                    <div className="space-y-0.5">
                      <h3 className="text-lg font-bold text-white">{profile.name}</h3>
                      <p className="text-xs text-gray-400">@{profile.login} • {profile.location}</p>
                      <p className="text-xs text-gray-300 font-medium pt-1">{profile.bio}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* MODULE 2: LIVE TELEMETRY COUNTS METRICS */}
            {visible.metrics && (
              <div className="grid grid-cols-4 gap-4 w-full">
                {[
                  { label: 'Repositories', val: profile.repos, icon: 'fa-book-bookmark' },
                  { label: 'Total Stars', val: profile.stars, icon: 'fa-star' },
                  { label: 'Contributions', val: profile.commits, icon: 'fa-cubes' },
                  { label: 'Followers', val: profile.followers, icon: 'fa-users' }
                ].map((s, idx) => (
                  <div className="p-4 rounded-xl border" key={idx} style={{ backgroundColor: p.cardBg, borderColor: p.cardBorder }}>
                    <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase mb-1">
                      <span>{s.label}</span>
                      <i className={`fas ${s.icon}`} style={{ color: p.primaryColor }} />
                    </div>
                    <p className="text-2xl font-black text-white font-mono">{s.val}</p>
                  </div>
                ))}
              </div>
            )}

            {/* MODULE 3: TELEMETRY STREAKS PIPELINE CONTAINER */}
            {visible.streak && (
              <div className="p-5 rounded-xl border bg-black/10 w-full" style={{ borderColor: p.cardBorder }}>
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Telemetry Consistency Engine</h4>
                <div className="grid grid-cols-3 gap-4 font-mono text-xs">
                  <div className="p-3 bg-black/20 rounded-lg border border-white/5">
                    <p className="text-gray-500 uppercase text-[9px]">Current Active Streak</p>
                    <p className="text-xl font-black mt-0.5" style={{ color: p.primaryColor }}>{profile.currentStreak} Day</p>
                  </div>
                  <div className="p-3 bg-black/20 rounded-lg border border-white/5">
                    <p className="text-gray-500 uppercase text-[9px]">Longest Historic Streak</p>
                    <p className="text-xl font-black text-white mt-0.5">{profile.longestStreak} Days</p>
                  </div>
                  <div className="p-3 bg-black/20 rounded-lg border border-white/5">
                    <p className="text-gray-500 uppercase text-[9px]">Annual Volume (2026)</p>
                    <p className="text-xl font-black text-white mt-0.5">{profile.commits}</p>
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 4: TECHNOLOGY PIPELINE CHART */}
            {visible.languages && (
              <div className="p-5 rounded-xl border bg-black/10 w-full" style={{ borderColor: p.cardBorder }}>
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Language Fingerprint Matrix</h4>
                <div className="w-full h-3 rounded-full overflow-hidden flex bg-gray-800">
                  {profile.topLanguages.map((l, i) => <div key={i} style={{ width: `${l.percentage}%`, backgroundColor: l.color }} className="h-full" />)}
                </div>
                <div className="grid grid-cols-4 gap-3 mt-4">
                  {profile.topLanguages.map((l, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs font-bold text-white">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: l.color }} />
                      <span>{l.name}</span>
                      <span className="text-gray-500 font-mono ml-auto text-[10px]">{l.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MODULE 5: REWARDS PLATFORM TROPHIES MATRIX */}
            {visible.trophies && (
              <div className="p-5 rounded-xl border bg-black/10 w-full" style={{ borderColor: p.cardBorder }}>
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Earned Platform Rewards</h4>
                <div className="grid grid-cols-3 gap-3">
                  {trophies.map((t, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl border" style={{ backgroundColor: p.cardBg, borderColor: p.cardBorder }}>
                      <div className="w-9 h-9 rounded-full bg-[#010409] flex items-center justify-center text-xs" style={{ color: t.color }}>
                        <i className={`fas ${t.icon}`} />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-white leading-none">{t.title}</h5>
                        <p className="text-[9px] font-black tracking-wider uppercase mt-1" style={{ color: t.color }}>{t.label} Tier</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MODULE 6: CHRONOLOGICAL ART MATRIX WITH PIXEL-PRECISE MONTH HEADERS */}
            {visible.art && (
              <div className="w-full overflow-hidden">
                <div id={artStyle === 'flat' ? 'flatCanvas' : 'threeDCanvas'} className="p-5 rounded-xl border shadow-xl bg-[#0d1117] w-full border-[#30363d]">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xs font-bold text-gray-300">Contribution Grid Art — <span className="text-[#56d364] font-black">{artTitle}</span></h4>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-[#1f3456] text-[#58a6ff] border border-[#388bfd] rounded">2026</span>
                  </div>

                  <div className="w-full overflow-x-auto">
                    <div className="w-full flex flex-col gap-1 select-none">
                      {/* Pixel-precise month label positioning row — 13px per column cell */}
                      <div className="flex h-5 relative text-[9px] text-gray-400 font-bold mb-1 pl-8 w-full">
                        {MONS.map((m, idx) => {
                          const colOffset = Math.floor((idx / 12) * totalCols);
                          return <span key={idx} className="absolute" style={{ left: `${colOffset * 13 + 32}px` }}>{m}</span>;
                        })}
                      </div>
                      <div className="flex gap-1.5 w-full">
                        <div className="text-[9px] text-gray-500 font-bold h-[78px] flex flex-col justify-between pr-1 select-none">
                          <span>M</span><span>W</span><span>F</span>
                        </div>
                        <div className="flex-1 grid grid-flow-col auto-cols-fr gap-[2px]">
                          {Array.from({ length: totalCols }).map((_, cIdx) => (
                            <div key={cIdx} className="grid grid-rows-7 gap-[2px]">
                              {Array.from({ length: 7 }).map((_, rIdx) => {
                                const lv = renderedGrid[rIdx]?.[cIdx] ?? 0;
                                if (artStyle === 'flat') {
                                  return <div key={rIdx} className="aspect-square w-full rounded-[1.5px]" style={{ backgroundColor: CLR_MAP[lv], border: lv === 0 ? '1px solid #21262d' : 'none' }} />;
                                } else {
                                  const glassGlows = ["from-[#373b42] to-[#1e2025] border-[#0a0b0d]", "from-[#0e5b32] to-[#052615] border-[#02120a]", "from-[#1d8a39] to-[#0a4019] border-[#04210d]", "from-[#37d653] to-[#166e27] border-[#093311]", "from-[#6df079] to-[#2fcf3e] border-[#146124] shadow-[0_2px_6px_rgba(109,240,121,0.5)]"];
                                  return <div key={rIdx} className={`aspect-square w-full rounded-[2.5px] border bg-gradient-to-b ${glassGlows[lv]}`} />;
                                }
                              })}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-[10px] text-gray-400">
                    <span><b>{artCommits}</b> commits required to forge this layout profile blueprint array stack.</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] mr-1">Less</span>
                      {CLR_MAP.map((c, i) => <div key={i} className="w-2.5 h-2.5 rounded-[1px]" style={{ backgroundColor: c, border: i === 0 ? '1px solid #21262d' : 'none' }} />)}
                      <span className="text-[9px] ml-1">More</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* EMBED MARKDOWN SNIPPET GENERATOR LINKS */}
        <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-5 space-y-3 shadow-xl select-text">
          <div>
            <h3 className="text-sm font-bold text-white">Production Embed Code Generation Registry</h3>
            <p className="text-xs text-gray-400">Select any layout slice to extract its markdown anchor string.</p>
          </div>
          <div className="space-y-2">
            {[
              { label: "Complete Identity Suite Snippet", t: "all", ext: `&hero_layout=${heroLayout}` },
              { label: "14+ Gamified Trophy Panel Matrix", t: "trophies", ext: '' },
              { label: "Dynamic Language Fingerprint Chart", t: "languages", ext: `&lang_layout=${langLayout}` },
              { label: "Consistency Streak Counter Block", t: "streak", ext: '' },
              { label: "Custom Typographic Contribution Grid Art", t: "art", ext: `&art_text=${artText}&art_style=${artStyle}&art_bg=${artBg}` }
            ].map((item, idx) => {
              const str = `![OctoVibe](https://octovibe.vercel.app/api/render?user=${profile.login}&theme=${activeTheme}&view=${item.t}${item.ext})`;
              return (
                <div key={idx} className="bg-[#161b22] border border-[#21262d] p-3 rounded-lg flex gap-3 items-center">
                  <span className="text-xs font-bold text-gray-300 w-64 text-left flex-shrink-0">
                    <i className="fas fa-link text-[#388bfd] mr-2"></i>{item.label}
                  </span>
                  <input type="text" readOnly value={str} className="flex-1 w-full bg-[#010409] border border-[#30363d] rounded p-2 text-[10px] font-mono text-gray-500 outline-none" />
                  <button onClick={() => triggerCopy(item.t, idx, item.ext)} className="bg-[#21262d] hover:bg-[#30363d] text-white px-4 py-1.5 rounded text-xs font-bold transition-all min-w-[100px]">
                    {copiedIndex === idx ? "✓ Copied!" : "Copy Snippet"}
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
