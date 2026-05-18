import React, { useState, useEffect } from 'react';
import { fetchUserTelemetry, calculateAllTrophies } from '@octovibe/core';
import { getThemes } from '@octovibe/themes';

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
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Earned Profile Trophies</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {trophies.map((t, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl border shadow-sm transition-transform hover:scale-[1.01]" style={{ backgroundColor: t.bg, borderColor: t.border }}>
                      <div className="w-10 h-10 rounded-full bg-[#010409] border border-white/5 flex items-center justify-center text-sm" style={{ color: t.color }}>
                        <i className={`fas ${t.icon}`} />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-white">{t.title}</h5>
                        <p className="text-[10px] font-black tracking-wide" style={{ color: t.color }}>{t.tier.toUpperCase()} TIER ({t.value})</p>
                      </div>
                    </div>
                  ))}
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
                    <p className="text-2xl font-black font-mono mt-1" style={{ color: p.primaryColor }}>12 Days</p>
                    <p className="text-[11px] text-gray-400 mt-1">Ongoing active daily adjustments</p>
                  </div>
                  <div className="p-4 rounded-xl border bg-black/20" style={{ borderColor: p.cardBorder }}>
                    <p className="text-[10px] font-bold text-gray-500 uppercase">Longest Metric Record</p>
                    <p className="text-2xl font-black font-mono text-white mt-1">48 Days</p>
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
