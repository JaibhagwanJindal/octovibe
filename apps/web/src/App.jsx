import React, { useState, useEffect } from 'react';
import { buildArtGrid, getTotalCols } from '@octovibe/core';
import { getThemes } from '@octovibe/themes';

let globalAuthPromise = null;

export default function App() {
  const currentYear = new Date().getFullYear();
  const themesList = getThemes();

  const [token, setToken] = useState(() => localStorage.getItem('octovibe_token') || '');
  const [username, setUsername] = useState(() => localStorage.getItem('octovibe_user') || 'octovibe');
  
  const [activeTheme, setActiveTheme] = useState('midnight-blue');
  const [heroLayout, setHeroLayout] = useState('minimalist');
  const [langLayout, setLangLayout] = useState('pipeline');
  
  const [artTitle, setArtTitle] = useState('OCTOVIBE VISUALS');
  const [artText, setArtText] = useState('CONNECTED');
  const [artStyle, setArtStyle] = useState('flat');
  const [artBg, setArtBg] = useState('0');

  const [showAuthWarning, setShowAuthWarning] = useState(false);
  const [visible, setVisible] = useState({ hero: true, metrics: true, streak: true, languages: true, trophies: true, art: true });
  
  const [profile, setProfile] = useState(null);
  const [trophies, setTrophies] = useState([]);
  const [renderedGrid, setRenderedGrid] = useState([]);
  const [artCommits, setArtCommits] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const CLR_MAP = ['#151b23', '#033a16', '#196c2e', '#2ea043', '#56d364'];
  const MONS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const totalCols = getTotalCols(currentYear);

  const placeholderProfile = {
    name: "OctoVibe Studio", login: "octovibe", avatarUrl: "https://github.com/identicons/octovibe.png", bio: "The ultimate open-source multi-tenant developer profile customizer hub.", location: "Global Edge Network", followers: 128, repos: 24, stars: 86, commits: 918, currentStreak: 4, longestStreak: 48, consistencyGrade: "B"
  };

  const triggerGitHubLogin = () => {
    const CLIENT_ID = 'Ov23li8kTznRESFil5bV';
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=read:user,repo`;
  };

  const executeLogout = () => {
    localStorage.removeItem('octovibe_token');
    localStorage.removeItem('octovibe_user');
    setToken('');
    setUsername('octovibe');
    setProfile(null);
    setTrophies([]);
    setArtTitle('OCTOVIBE VISUALS');
    setArtText('CONNECTED');
  };

  const handleProtectedField = (setValueAction, incomingValue) => {
    if (!token) {
      setShowAuthWarning(true);
      setTimeout(() => setShowAuthWarning(false), 4000);
      return;
    }
    setValueAction(incomingValue);
  };

  const queryTelemetryPipeline = (targetUser, targetToken) => {
    const headers = { 'Content-Type': 'application/json' };
    if (targetToken) {
      headers['Authorization'] = `Bearer ${targetToken}`;
    }

    // Pass custom dropdown configurations safely into our unified API router parameters pass
    fetch(`https://octovibe.vercel.app/api/render?user=${targetUser}&theme=${activeTheme}&hero_layout=${heroLayout}&art_style=${artStyle}&art_bg=${artBg}&json=true&_t=${Date.now()}`, { headers })
      .then(res => res.json())
      .then(resData => {
        if (resData.profile) {
          setProfile(resData.profile);
          setTrophies(resData.trophies || []);
          
          // CRITICAL DYNAMIC NAME SLICING ALGORITHM MATRIX INTEGRATION HOOK
          if (targetUser !== 'octovibe' && resData.profile.name) {
            const rawName = resData.profile.name;
            setArtTitle(rawName.toUpperCase());
            
            const cleanWords = rawName.replace(/[^a-zA-Z\s]/g, '').trim().split(/\s+/);
            if (cleanWords.length >= 2) {
              const combinedString = cleanWords[0] + cleanWords[1];
              if (combinedString.length <= 10) {
                setArtText((cleanWords[0] + " " + cleanWords[1]).toUpperCase());
              } else {
                setArtText(cleanWords[0].toUpperCase());
              }
            } else if (cleanWords.length === 1) {
              setArtText(cleanWords[0].toUpperCase());
            }
          }
        }
      })
      .catch(err => console.error("Telemetry channel syncing exception:", err));
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authCode = params.get('code');
    
    if (authCode) {
      if (!globalAuthPromise) {
        globalAuthPromise = fetch('https://octovibe.vercel.app/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: authCode })
        })
        .then(res => res.json())
        .then(data => {
          if (data.access_token) {
            return fetch('https://api.github.com/user', {
              headers: { 'Authorization': `Bearer ${data.access_token}` }
            })
            .then(r => r.json())
            .then(userData => ({ token: data.access_token, user: userData.login }));
          }
          return null;
        });
      }

      globalAuthPromise
        .then(result => {
          if (result && result.user) {
            localStorage.setItem('octovibe_token', result.token);
            localStorage.setItem('octovibe_user', result.user);
            setToken(result.token);
            setUsername(result.user);
            window.history.replaceState({}, document.title, window.location.pathname);
            queryTelemetryPipeline(result.user, result.token);
          }
        })
        .catch(err => console.error("SaaS Handshake failed:", err));
    }
  }, []);

  // Wire dropdown variables cleanly to invoke refresh calls immediately upon any change request parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hasAuthCode = params.get('code');
    if (!hasAuthCode) {
      queryTelemetryPipeline(username, token);
    }
  }, [username, token, heroLayout, activeTheme, artStyle, artBg]);

  useEffect(() => {
    const gridData = buildArtGrid(artText, totalCols, artBg);
    setRenderedGrid(gridData);
    let commits = 0;
    const remainderDays = new Date(currentYear, 11, 31).getDay() + 1;
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < totalCols; c++) {
        if (c === totalCols - 1 && r >= remainderDays) continue;
        let lv = gridData[r]?.[c] ?? 0;
        commits += lv === 4 ? 5 : lv;
      }
    }
    setArtCommits(commits);
  }, [artText, artBg, totalCols, currentYear]);

  const displayProfile = profile || placeholderProfile;
  const p = (themesList.find(t => t.id === activeTheme) || themesList[0]).palette;

  const triggerCopy = (viewMode, idx, extra = '') => {
    const targetUrl = `![OctoVibe](https://octovibe.vercel.app/api/render?user=${displayProfile.login}&theme=${activeTheme}&view=${viewMode}${extra})`;
    navigator.clipboard.writeText(targetUrl);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="flex h-screen bg-[#010409] text-gray-300 font-sans antialiased overflow-hidden select-none relative">
      
      {showAuthWarning && (
        <div className="absolute top-5 right-5 z-50 bg-amber-950/95 border border-amber-500 text-amber-300 px-4 py-3 rounded-xl flex items-center gap-3 shadow-2xl font-medium text-xs backdrop-blur animate-slideIn">
          <i className="fas fa-lock text-amber-400 animate-bounce"></i>
          <span>Information is limited without authentication. Please log in for correct information.</span>
        </div>
      )}

      <aside className="w-80 bg-[#0d1117] border-r border-[#30363d] p-5 flex flex-col justify-between overflow-y-auto flex-shrink-0">
        <div className="space-y-5">
          <div className="flex items-center gap-3 border-b border-[#21262d] pb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#388bfd] to-[#238636] flex items-center justify-center font-black text-white">🐙</div>
            <div><h1 className="text-sm font-bold text-white">OctoVibe Portal</h1><p className="text-[10px] text-gray-500 uppercase font-black">SaaS Core</p></div>
          </div>

          <div className="space-y-3">
            {!token ? (
              <button onClick={triggerGitHubLogin} className="w-full bg-[#238636] hover:bg-[#2ea043] text-white font-bold py-2.5 px-3 rounded-lg text-xs flex items-center justify-center gap-2 shadow-md transition-colors">
                <i className="fab fa-github text-sm"></i> Connect GitHub Account
              </button>
            ) : (
              <div className="bg-black/20 border border-emerald-500/20 p-2.5 rounded-lg flex items-center justify-between">
                <div className="truncate"><p className="text-[9px] uppercase font-bold text-emerald-400">Live Session Active</p><p className="text-xs font-mono font-bold text-[#58a6ff] truncate mt-0.5">@{username}</p></div>
                <button onClick={executeLogout} className="text-[10px] font-bold text-red-400 hover:text-white hover:bg-red-600 bg-red-500/5 px-2.5 py-1 rounded border border-red-500/20 transition-all">Sign Out</button>
              </div>
            )}

            <div className="pt-2">
              <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Explore Profile Handle</label>
              <input type="text" value={username} onChange={e => handleProtectedField(setUsername, e.target.value)} className="w-full bg-[#161b22] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-white outline-none font-mono focus:border-[#58a6ff]" />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Theme Stylesheet</label>
              <div className="grid grid-cols-2 gap-1.5">
                {themesList.map(t => (
                  <button key={t.id} onClick={() => setActiveTheme(t.id)} className="px-2 py-1 rounded text-[10px] font-bold bg-[#161b22]" style={{ border: activeTheme === t.id ? '1px solid white' : '1px solid transparent' }}>{t.name.split(' ')[0]}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Hero Layout</label>
              <select value={heroLayout} onChange={e => setHeroLayout(e.target.value)} className="w-full bg-[#161b22] border border-[#30363d] rounded-md p-1.5 text-xs text-white outline-none">
                <option value="minimalist">Ultra-Minimalist Profile</option>
                <option value="terminal">Cyber-Terminal Console</option>
                <option value="corporate">Corporate Availability Card</option>
              </select>
            </div>

            <div className="border-t border-[#21262d] pt-3 space-y-2">
              <label className="block text-[10px] font-bold uppercase text-gray-400">Contribution Grid Generator</label>
              <input type="text" value={artTitle} onChange={e => handleProtectedField(setArtTitle, e.target.value)} placeholder="Header Chart Title" className="w-full bg-[#161b22] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-white outline-none" />
              <input type="text" value={artText} onChange={e => setArtText(e.target.value.toUpperCase())} placeholder="Text Pattern (A-Z)" className="w-full bg-[#161b22] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-white outline-none" />
              <div className="grid grid-cols-2 gap-1.5">
                <select value={artStyle} onChange={e => setArtStyle(e.target.value)} className="bg-[#161b22] text-xs text-white p-1 rounded"><option value="flat">2D Flat</option><option value="3d">3D Glass</option></select>
                <select value={artBg} onChange={e => setArtBg(e.target.value)} className="bg-[#161b22] text-xs text-white p-1 rounded"><option value="0">Shade 0</option><option value="1">Shade 1</option><option value="2">Shade 2</option></select>
              </div>
            </div>
          </div>
        </div>
        <div className="text-[10px] text-gray-500 font-bold border-t border-[#21262d] pt-3">OctoVibe Studio Hub • SaaS Production</div>
      </aside>

      <main className="flex-1 overflow-y-auto p-10 space-y-6">
        <div className="p-8 rounded-xl border select-text" style={{ backgroundColor: p.background, borderColor: p.cardBorder }}>
          <div className="w-full space-y-8 max-w-[740px] mx-auto">
            
            {visible.hero && (
              <div className="w-full">
                {heroLayout === 'minimalist' && (
                  <div className="text-center py-2 animate-fadeIn">
                    <img src={displayProfile.avatarUrl} className="w-20 h-20 rounded-full mx-auto border-4" style={{ borderColor: p.primaryColor }} alt="" />
                    <h2 className="text-2xl font-black text-white tracking-tight mt-3">{displayProfile.name}</h2>
                    <p className="text-sm font-mono font-bold" style={{ color: p.primaryColor }}>@{displayProfile.login}</p>
                    <p className="text-xs text-gray-300 mt-2 font-medium max-w-xl mx-auto">{displayProfile.bio}</p>
                  </div>
                )}
                {heroLayout === 'terminal' && (
                  <div className="bg-black/40 rounded-xl p-5 border font-mono text-[11px] space-y-1" style={{ borderColor: p.cardBorder }}>
                    <p><span className="text-emerald-400">visitor@octovibe:~#</span> fetch info --user @{displayProfile.login}</p>
                    <p className="pl-4 text-gray-300">{`{ "name": "${displayProfile.name}", "repositories": ${displayProfile.repos} }`}</p>
                  </div>
                )}
                {heroLayout === 'corporate' && (
                  <div className="flex items-center gap-6 p-5 rounded-xl" style={{ backgroundColor: p.cardBg }}>
                    <img src={displayProfile.avatarUrl} className="w-16 h-16 rounded-xl border shadow" style={{ borderColor: p.cardBorder }} alt="" />
                    <div className="space-y-0.5">
                      <h3 className="text-lg font-bold text-white">{displayProfile.name}</h3>
                      <p className="text-xs text-gray-400">@{displayProfile.login} • {displayProfile.location}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* INTEGRATED CARD SUMMARY USER MATRIX TOOLTIPS */}
            {visible.metrics && (
              <div className="grid grid-cols-4 gap-4 w-full animate-fadeIn">
                <div className="p-4 rounded-xl border" style={{ backgroundColor: p.cardBg, borderColor: p.cardBorder }} title="Total public repositories owned by the user">
                  <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase mb-1"><span>Repositories</span><i className="fas fa-book-bookmark" style={{ color: p.primaryColor }} /></div>
                  <p className="text-2xl font-black text-white font-mono">{displayProfile.repos}</p>
                </div>
                <div className="p-4 rounded-xl border" style={{ backgroundColor: p.cardBg, borderColor: p.cardBorder }} title="Cumulative stargazers across public repositories">
                  <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase mb-1"><span>Total Stars</span><i className="fas fa-star" style={{ color: p.primaryColor }} /></div>
                  <p className="text-2xl font-black text-white font-mono">{displayProfile.stars || 0}</p>
                </div>
                <div className="p-4 rounded-xl border" style={{ backgroundColor: p.cardBg, borderColor: p.cardBorder }} title="Total combined commits, PRs, issues, and code reviews">
                  <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase mb-1"><span>Contributions</span><i className="fas fa-cubes" style={{ color: p.primaryColor }} /></div>
                  <p className="text-2xl font-black text-white font-mono">{displayProfile.commits}</p>
                </div>
                <div className="p-4 rounded-xl border" style={{ backgroundColor: p.cardBg, borderColor: p.cardBorder }} title="Ecosystem developers following this account">
                  <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase mb-1"><span>Followers</span><i className="fas fa-users" style={{ color: p.primaryColor }} /></div>
                  <p className="text-2xl font-black text-white font-mono">{displayProfile.followers || 0}</p>
                </div>
              </div>
            )}

            {/* OVERHAULED STREAK TILES CONFIGURATION VIEWPORT */}
            {visible.streak && (
              <div className="p-5 rounded-xl border bg-black/10 w-full animate-fadeIn" style={{ borderColor: p.cardBorder }}>
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Telemetry Consistency Engine</h4>
                <div className="grid grid-cols-3 gap-4 font-mono text-xs">
                  <div className="p-3 bg-black/20 rounded-lg border border-white/5" title="Consecutive days with at least one recorded contribution"><p className="text-gray-500 uppercase text-[9px]">Current Active Streak</p><p className="text-xl font-black mt-0.5" style={{ color: p.primaryColor }}>{displayProfile.currentStreak || 0} Day</p></div>
                  <div className="p-3 bg-black/20 rounded-lg border border-white/5" title="All-time maximum chronological consecutive contribution streak"><p className="text-gray-500 uppercase text-[9px]">Longest Historic Streak</p><p className="text-xl font-black text-white mt-0.5">{displayProfile.longestStreak || 0} Days</p></div>
                  <div className="p-3 bg-black/20 rounded-lg border border-white/5" title="Total contribution event footprint consistency performance grade metric"><p className="text-gray-500 uppercase text-[9px]">Consistency Grade</p><p className="text-xl font-black text-white mt-0.5">{displayProfile.consistencyGrade}</p></div>
                </div>
              </div>
            )}

            {visible.trophies && (
              <div className="p-5 rounded-xl border bg-black/10 w-full animate-fadeIn" style={{ borderColor: p.cardBorder }}>
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Earned Platform Rewards</h4>
                {trophies.length > 0 ? (
                  <div className="grid grid-cols-3 gap-3">
                    {trophies.map((t, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl border" style={{ backgroundColor: p.cardBg, borderColor: p.cardBorder }}>
                        <div className="w-9 h-9 rounded-full bg-[#010409] flex items-center justify-center text-xs" style={{ color: t.color }}><i className={`fas ${t.icon}`} /></div>
                        <div><h5 className="text-xs font-bold text-white leading-none">{t.title}</h5><p className="text-[9px] font-black tracking-wider uppercase mt-1" style={{ color: t.color }}>{t.label} Tier</p></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic font-medium">Connect your account session to view gamified reward milestones.</p>
                )}
              </div>
            )}

            {/* REACTIVE 2D FLAT VS 3D ELEVATED GLASS MATRIX GRAPH CANVAS */}
            {visible.art && (
              <div className="w-full overflow-hidden animate-fadeIn">
                <div className="p-5 rounded-xl border shadow-xl bg-[#0d1117] w-full border-[#30363d]">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xs font-bold text-gray-300">Contribution Grid Art — <span className="text-[#56d364] font-black">{artTitle}</span></h4>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-[#1f3456] text-[#58a6ff] border border-[#388bfd] rounded">2026</span>
                  </div>
                  <div className="w-full overflow-x-auto">
                    <div className="w-full flex flex-col gap-1 select-none">
                      <div className="flex h-5 relative text-[9px] text-gray-400 font-bold mb-1 pl-8 w-full">
                        {MONS.map((m, idx) => {
                          const colOffset = Math.floor((idx / 12) * totalCols);
                          return <span key={idx} className="absolute" style={{ left: `${colOffset * (artStyle === 'flat' ? 13 : 18) + 32}px` }}>{m}</span>;
                        })}
                      </div>
                      <div className="flex gap-1.5 w-full">
                        <div className="text-[9px] text-gray-500 font-bold h-[78px] flex flex-col justify-between pr-1 select-none"><span>M</span><span>W</span><span>F</span></div>
                        <div className="flex-1 grid grid-flow-col auto-cols-fr gap-[2px]">
                          {Array.from({ length: totalCols }).map((_, cIdx) => (
                            <div key={cIdx} className="grid grid-rows-7 gap-[2px]">
                              {Array.from({ length: 7 }).map((_, rIdx) => {
                                const remainderDays = new Date(currentYear, 11, 31).getDay() + 1;
                                if (cIdx === totalCols - 1 && rIdx >= remainderDays) return null;
                                const lv = renderedGrid[rIdx]?.[cIdx] ?? 0;
                                if (artStyle === 'flat') {
                                  return <div key={rIdx} className="aspect-square w-full rounded-[1.5px]" style={{ backgroundColor: CLR_MAP[lv], border: lv === 0 ? '1px solid #21262d' : 'none' }} />;
                                } else {
                                  const glows = ["from-[#373b42] to-[#1e2025] border-[#0a0b0d]", "from-[#0e5b32] to-[#052615] border-[#02120a]", "from-[#1d8a39] to-[#0a4019] border-[#04210d]", "from-[#37d653] to-[#166e27] border-[#093311]", "from-[#6df079] to-[#2fcf3e] border-[#146124] shadow-[0_3px_8px_rgba(109,240,121,0.6)]"];
                                  return <div key={rIdx} className={`w-full aspect-square rounded-[3.5px] border bg-gradient-to-b ${glows[lv]}`} />;
                                }
                              })}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-[10px] text-gray-400 border-t border-[#21262d] pt-3">
                    <span><b>{artCommits}</b> commits required to forge this layout template block footprint.</span>
                    <div className="flex items-center gap-1 select-none">
                      <span className="text-[9px] mr-1 text-gray-500">Less</span>
                      {CLR_MAP.map((c, i) => <div key={i} className="w-2.5 h-2.5 rounded-[1px]" style={{ backgroundColor: c, border: i === 0 ? '1px solid #21262d' : 'none' }} />)}
                      <span className="text-[9px] ml-1 text-gray-500">More</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* EMBED REGISTRY ROWS CONFIGURATION */}
        <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-5 space-y-3 shadow-xl select-text">
          <div><h3 className="text-sm font-bold text-white">Production Embed Code Generation Registry</h3><p className="text-xs text-gray-400">Select any layout slice to extract its markdown anchor string.</p></div>
          <div className="space-y-2">
            {[
              { label: "Complete Identity Suite Snippet", t: "all", ext: `&hero_layout=${heroLayout}` },
              { label: "14+ Gamified Trophy Panel Matrix", t: "trophies", ext: '' },
              { label: "Consistency Streak Counter Block", t: "streak", ext: '' },
              { label: "Custom Typographic Contribution Grid Art", t: "art", ext: `&art_text=${artText}&art_style=${artStyle}&art_bg=${artBg}` }
            ].map((item, idx) => {
              const str = `![OctoVibe](https://octovibe.vercel.app/api/render?user=${displayProfile.login}&theme=${activeTheme}&view=${item.t}${item.ext})`;
              return (
                <div key={idx} className="bg-[#161b22] border border-[#21262d] p-3 rounded-lg flex gap-3 items-center">
                  <span className="text-xs font-bold text-gray-300 w-64 text-left flex-shrink-0"><i className="fas fa-link text-[#388bfd] mr-2"></i>{item.label}</span>
                  <input type="text" readOnly value={str} className="flex-1 w-full bg-[#010409] border border-[#30363d] rounded p-2 text-[10px] font-mono text-gray-500 outline-none" />
                  <button onClick={() => triggerCopy(item.t, idx, item.ext)} className="bg-[#21262d] hover:bg-[#30363d] text-white px-4 py-1.5 rounded text-xs font-bold transition-all min-w-[100px]">{copiedIndex === idx ? "✓ Copied!" : "Copy Snippet"}</button>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
