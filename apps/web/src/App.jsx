import React, { useState, useEffect } from 'react';
import { buildArtGrid, getTotalCols, calculateAllTrophies } from '@octovibe/core';
import { getThemes } from '@octovibe/themes';

let globalAuthPromise = null;

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

export default function App() {
  const currentYear = new Date().getFullYear();
  const themesList = getThemes();

  const [token, setToken] = useState(() => localStorage.getItem('octovibe_token') || '');
  const [username, setUsername] = useState(() => localStorage.getItem('octovibe_user') || 'octovibe');
  
  const [activeTheme, setActiveTheme] = useState('midnight-blue');
  const [heroLayout, setHeroLayout] = useState('minimalist');
  const [langLayout, setLangLayout] = useState('pipeline');
  const [renderMode, setRenderMode] = useState('combined');
  
  const [artTitle, setArtTitle] = useState('OCTOVIBE VISUALS');
  const [artText, setArtText] = useState('CONNECTED');
  const [artStyle, setArtStyle] = useState('flat');
  const [artBg, setArtBg] = useState('0');

  const [customBio, setCustomBio] = useState('');
  const [langStr, setLangStr] = useState('JavaScript, TypeScript, Python, HTML5, CSS3, C++');
  const [frameStr, setFrameStr] = useState('React, Next.js, Node.js, Express, TailwindCSS');
  const [cloudStr, setCloudStr] = useState('Firebase, PostgreSQL, AWS, Vercel, Docker');

  const [showAuthWarning, setShowAuthWarning] = useState(false);
  const [visible, setVisible] = useState({ hero: true, metrics: true, streak: true, languages: true, trophies: true, art: true, socials: true });
  const [socials, setSocials] = useState({ instagram: '', facebook: '', threads: '', linkedin: '', x: '', medium: '', blog: '', website: '' });
  
  const [profile, setProfile] = useState(null);
  const [trophies, setTrophies] = useState([]);
  const [renderedGrid, setRenderedGrid] = useState([]);
  const [artCommits, setArtCommits] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState(null);
  
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStatus, setDeployStatus] = useState('');
  const [showTrophyModal, setShowTrophyModal] = useState(false);

  const CLR_MAP = ['#151b23', '#033a16', '#196c2e', '#2ea043', '#56d364'];
  const MONS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const totalCols = getTotalCols(currentYear);

  const placeholderProfile = {
    name: "OctoVibe Studio", login: "octovibe", avatarUrl: "logo.png", bio: "The ultimate open-source multi-tenant developer profile customizer hub.", location: "Global Edge Network", followers: 128, repos: 24, stars: 86, commits: 918, currentStreak: 4, longestStreak: 48, consistencyGrade: "B"
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
    const remainderDays = (currentYear % 4 === 0 && (currentYear % 100 !== 0 || currentYear % 400 === 0)) ? 2 : 1;
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
  const displayBio = customBio || displayProfile.bio;
  const earnedTrophies = calculateAllTrophies(displayProfile);
  const p = (themesList.find(t => t.id === activeTheme) || themesList[0]).palette;

  const getEmbedUrl = (type, baseUrl) => {
    let ext = '';
    const bioQuery = customBio ? `&bio=${encodeURIComponent(customBio)}` : '';
    const stackQuery = `&langs=${encodeURIComponent(langStr)}&frames=${encodeURIComponent(frameStr)}&cloud=${encodeURIComponent(cloudStr)}`;
    
    const activeSocialParams = [];
    if (visible.socials) {
      if (socials.instagram) activeSocialParams.push(`instagram=${encodeURIComponent(socials.instagram)}`);
      if (socials.facebook) activeSocialParams.push(`facebook=${encodeURIComponent(socials.facebook)}`);
      if (socials.threads) activeSocialParams.push(`threads=${encodeURIComponent(socials.threads)}`);
      if (socials.linkedin) activeSocialParams.push(`linkedin=${encodeURIComponent(socials.linkedin)}`);
      if (socials.x) activeSocialParams.push(`x=${encodeURIComponent(socials.x)}`);
      if (socials.medium) activeSocialParams.push(`medium=${encodeURIComponent(socials.medium)}`);
      if (socials.blog) activeSocialParams.push(`blog=${encodeURIComponent(socials.blog)}`);
      if (socials.website) activeSocialParams.push(`website=${encodeURIComponent(socials.website)}`);
    }
    const socialQuery = activeSocialParams.length > 0 ? `&${activeSocialParams.join('&')}` : '';

    if (type === 'all') ext = `&hero_layout=${heroLayout}${bioQuery}${socialQuery}`;
    if (type === 'streak') ext = `&view=streak`;
    if (type === 'trophies') ext = `&view=trophies`;
    if (type === 'art') ext = `&view=art&hero_layout=${heroLayout}&art_style=${artStyle}&art_bg=${artBg}&art_title=${encodeURIComponent(artTitle)}&art_text=${encodeURIComponent(artText)}`;
    if (type === 'arsenal') ext = `&view=arsenal${stackQuery}`;
    if (type === 'combined') {
      const activeSectionsList = [];
      if (visible.hero) activeSectionsList.push('hero');
      if (visible.streak) activeSectionsList.push('streak');
      if (visible.languages) activeSectionsList.push('arsenal');
      if (visible.trophies) activeSectionsList.push('trophies');
      if (visible.art) activeSectionsList.push('art');
      const sectionsParam = activeSectionsList.join(',');
      ext = `&view=combined&sections=${sectionsParam}${bioQuery}${stackQuery}&art_style=${artStyle}&art_bg=${artBg}&art_title=${encodeURIComponent(artTitle)}&art_text=${encodeURIComponent(artText)}${socialQuery}`;
    }
    return `${baseUrl}${ext}`;
  };

  const getEmbedCode = (type, baseUrl) => {
    return `[![OctoVibe Metric](${getEmbedUrl(type, baseUrl)})](https://github.com/JaibhagwanJindal/octovibe)`;
  };

  const triggerCopy = (viewMode, idx, extra = '') => {
    const targetUrl = `https://octovibe.vercel.app/api/render?user=${displayProfile.login}&theme=${activeTheme}`;
    const code = getEmbedCode(viewMode, targetUrl);
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleLaunchProfile = async () => {
    if (!token) {
      setShowAuthWarning(true);
      setTimeout(() => setShowAuthWarning(false), 4000);
      return;
    }
    setIsDeploying(true);
    setDeployStatus('');
    try {
      const baseUrl = `https://octovibe.vercel.app/api/render?user=${displayProfile.login}&theme=${activeTheme}`;
      
      const activeSocials = [
        { id: 'instagram', url: socials.instagram },
        { id: 'facebook', url: socials.facebook },
        { id: 'threads', url: socials.threads },
        { id: 'linkedin', url: socials.linkedin },
        { id: 'x', url: socials.x },
        { id: 'medium', url: socials.medium },
        { id: 'blog', url: socials.blog },
        { id: 'website', url: socials.website }
      ].filter(s => s.url);

      let socialsHtml = '';
      if (visible.socials && activeSocials.length > 0) {
        socialsHtml = '\n<p align="center">\n' + activeSocials.map(s => {
          return `  <a href="${s.url}" target="_blank"><img src="https://octovibe.vercel.app/api/render?view=social&platform=${s.id}&theme=${activeTheme}" width="32" height="32" style="margin: 0 4px;" /></a>`;
        }).join('\n') + '\n</p>\n';
      }

      let mdContent = '';
      if (renderMode === 'combined') {
        const renderImg = `<a href="https://github.com/JaibhagwanJindal/octovibe"><img src="${getEmbedUrl('combined', baseUrl)}" alt="OctoVibe Metric" /></a>`;
        mdContent = `<h1 align="center">Hi 👋, I'm ${displayProfile.name}</h1>

<p align="center">
  ${renderImg}
</p>
${socialsHtml}`;
      } else {
        const renderImg = (type) => `<a href="https://github.com/JaibhagwanJindal/octovibe"><img src="${getEmbedUrl(type, baseUrl)}" alt="OctoVibe Metric" /></a>`;
        mdContent = `<h1 align="center">Hi 👋, I'm ${displayProfile.name}</h1>

<p align="center">
  ${renderImg('all')}${visible.streak ? renderImg('streak') : ''}${visible.languages ? renderImg('arsenal') : ''}${visible.trophies ? renderImg('trophies') : ''}${visible.art ? renderImg('art') : ''}
</p>
${socialsHtml}`;
      }
      const repoName = displayProfile.login;
      let sha = null;
      let repoExists = true;
      
      try {
        const checkRes = await fetch(`https://api.github.com/repos/${displayProfile.login}/${repoName}/contents/README.md`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (checkRes.ok) {
          const fileData = await checkRes.json();
          sha = fileData.sha;
        } else if (checkRes.status === 404) {
          const repoCheck = await fetch(`https://api.github.com/repos/${displayProfile.login}/${repoName}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (repoCheck.status === 404) repoExists = false;
        }
      } catch (e) {
        console.error("Repository check failed", e);
      }

      if (!repoExists) {
        const createRes = await fetch(`https://api.github.com/user/repos`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: repoName, description: 'My GitHub Profile', private: false, auto_init: true })
        });
        if (!createRes.ok) throw new Error('Failed to create profile repository.');
      }

      const utf8ToBase64 = (str) => window.btoa(unescape(encodeURIComponent(str)));
      const pushRes = await fetch(`https://api.github.com/repos/${displayProfile.login}/${repoName}/contents/README.md`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Update profile via OctoVibe 🚀',
          content: utf8ToBase64(mdContent.trim()),
          sha: sha || undefined
        })
      });

      if (pushRes.ok) {
        setDeployStatus(`✅ Success! Your GitHub profile is now live. Visit github.com/${displayProfile.login} to view your stunning new telemetry board!`);
      } else {
        throw new Error('Failed to update README.md');
      }
    } catch (err) {
      setDeployStatus(`❌ Error: ${err.message}`);
    } finally {
      setIsDeploying(false);
    }
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
            <img src="logo.png" className="w-8 h-8 rounded-lg object-contain" alt="OctoVibe Logo" />
            <div><h1 className="text-sm font-bold text-white tracking-wide">OctoVibe</h1><p className="text-[10px] text-gray-500 uppercase font-black tracking-wider">Gamified Developer Telemetry</p></div>
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
              <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Layout Rendering Mode</label>
              <div className="grid grid-cols-2 gap-1.5">
                <button onClick={() => setRenderMode('combined')} className="px-2 py-1.5 rounded text-[10px] font-bold bg-[#161b22] text-gray-300 transition-all hover:text-white" style={{ border: renderMode === 'combined' ? '1px solid #58a6ff' : '1px solid transparent', color: renderMode === 'combined' ? '#58a6ff' : '' }}>
                  <i className="fas fa-layer-group mr-1"></i> Unified Card
                </button>
                <button onClick={() => setRenderMode('individual')} className="px-2 py-1.5 rounded text-[10px] font-bold bg-[#161b22] text-gray-300 transition-all hover:text-white" style={{ border: renderMode === 'individual' ? '1px solid #58a6ff' : '1px solid transparent', color: renderMode === 'individual' ? '#58a6ff' : '' }}>
                  <i className="fas fa-grip-horizontal mr-1"></i> Separate Cards
                </button>
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
              <label className="block text-[10px] font-bold uppercase text-gray-400">Hero Biography</label>
              <textarea value={customBio} onChange={e => handleProtectedField(setCustomBio, e.target.value)} placeholder="Write a custom bio..." className="w-full bg-[#161b22] border border-[#30363d] rounded-md px-3 py-2 text-xs text-white outline-none resize-none h-16 focus:border-[#58a6ff]"></textarea>
            </div>

            <div className="border-t border-[#21262d] pt-3 space-y-2">
              <label className="block text-[10px] font-bold uppercase text-gray-400">Tech Stack Arsenal</label>
              <input type="text" value={langStr} onChange={e => handleProtectedField(setLangStr, e.target.value)} placeholder="Languages (comma separated)" className="w-full bg-[#161b22] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-white outline-none mb-1.5" />
              <input type="text" value={frameStr} onChange={e => handleProtectedField(setFrameStr, e.target.value)} placeholder="Frameworks (comma separated)" className="w-full bg-[#161b22] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-white outline-none mb-1.5" />
              <input type="text" value={cloudStr} onChange={e => handleProtectedField(setCloudStr, e.target.value)} placeholder="Cloud & Tools (comma separated)" className="w-full bg-[#161b22] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-white outline-none" />
            </div>

            <div className="border-t border-[#21262d] pt-3 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] font-bold uppercase text-gray-400">Social Connections</label>
                <div className="flex items-center gap-1.5">
                  <input 
                    type="checkbox" 
                    id="visible-socials" 
                    checked={visible.socials ?? true} 
                    onChange={e => setVisible(prev => ({ ...prev, socials: e.target.checked }))} 
                    className="w-3 h-3 rounded bg-[#161b22] border-[#30363d] text-[#58a6ff] focus:ring-0 focus:ring-offset-0 cursor-pointer" 
                  />
                  <label htmlFor="visible-socials" className="text-[9px] font-bold uppercase text-gray-500 cursor-pointer select-none">Show</label>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-[10px]"><i className="fab fa-instagram" /></span>
                  <input type="text" value={socials.instagram} onChange={e => setSocials(prev => ({ ...prev, instagram: e.target.value }))} placeholder="Instagram URL" className="w-full bg-[#161b22] border border-[#30363d] rounded-md pl-6 pr-2 py-1.5 text-[10px] text-white outline-none focus:border-[#58a6ff] placeholder-gray-600 transition-colors" />
                </div>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-[10px]"><i className="fab fa-facebook" /></span>
                  <input type="text" value={socials.facebook} onChange={e => setSocials(prev => ({ ...prev, facebook: e.target.value }))} placeholder="Facebook URL" className="w-full bg-[#161b22] border border-[#30363d] rounded-md pl-6 pr-2 py-1.5 text-[10px] text-white outline-none focus:border-[#58a6ff] placeholder-gray-600 transition-colors" />
                </div>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-[10px]"><i className="fas fa-at" /></span>
                  <input type="text" value={socials.threads} onChange={e => setSocials(prev => ({ ...prev, threads: e.target.value }))} placeholder="Threads URL" className="w-full bg-[#161b22] border border-[#30363d] rounded-md pl-6 pr-2 py-1.5 text-[10px] text-white outline-none focus:border-[#58a6ff] placeholder-gray-600 transition-colors" />
                </div>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-[10px]"><i className="fab fa-linkedin" /></span>
                  <input type="text" value={socials.linkedin} onChange={e => setSocials(prev => ({ ...prev, linkedin: e.target.value }))} placeholder="LinkedIn URL" className="w-full bg-[#161b22] border border-[#30363d] rounded-md pl-6 pr-2 py-1.5 text-[10px] text-white outline-none focus:border-[#58a6ff] placeholder-gray-600 transition-colors" />
                </div>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-[10px]"><i className="fab fa-x-twitter" /></span>
                  <input type="text" value={socials.x} onChange={e => setSocials(prev => ({ ...prev, x: e.target.value }))} placeholder="X / Twitter" className="w-full bg-[#161b22] border border-[#30363d] rounded-md pl-6 pr-2 py-1.5 text-[10px] text-white outline-none focus:border-[#58a6ff] placeholder-gray-600 transition-colors" />
                </div>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-[10px]"><i className="fab fa-medium" /></span>
                  <input type="text" value={socials.medium} onChange={e => setSocials(prev => ({ ...prev, medium: e.target.value }))} placeholder="Medium URL" className="w-full bg-[#161b22] border border-[#30363d] rounded-md pl-6 pr-2 py-1.5 text-[10px] text-white outline-none focus:border-[#58a6ff] placeholder-gray-600 transition-colors" />
                </div>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-[10px]"><i className="fas fa-pen-nib" /></span>
                  <input type="text" value={socials.blog} onChange={e => setSocials(prev => ({ ...prev, blog: e.target.value }))} placeholder="Blog URL" className="w-full bg-[#161b22] border border-[#30363d] rounded-md pl-6 pr-2 py-1.5 text-[10px] text-white outline-none focus:border-[#58a6ff] placeholder-gray-600 transition-colors" />
                </div>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-[10px]"><i className="fas fa-globe" /></span>
                  <input type="text" value={socials.website} onChange={e => setSocials(prev => ({ ...prev, website: e.target.value }))} placeholder="Website URL" className="w-full bg-[#161b22] border border-[#30363d] rounded-md pl-6 pr-2 py-1.5 text-[10px] text-white outline-none focus:border-[#58a6ff] placeholder-gray-600 transition-colors" />
                </div>
              </div>
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
        <div className="text-[10px] text-gray-500 font-bold border-t border-[#21262d] pt-3">OctoVibe Studio Hub • Developer Telemetry</div>
      </aside>

      <main className="flex-1 overflow-y-auto p-10 space-y-6">
        <div className="p-8 rounded-xl border select-text" style={{ backgroundColor: p.background, borderColor: p.cardBorder }}>
          <div className="w-full space-y-8 max-w-[740px] mx-auto">
            
            {(() => {
              const activeSocials = [
                { id: 'instagram', url: socials.instagram, icon: 'fab fa-instagram' },
                { id: 'facebook', url: socials.facebook, icon: 'fab fa-facebook' },
                { id: 'threads', url: socials.threads, icon: 'fas fa-at' },
                { id: 'linkedin', url: socials.linkedin, icon: 'fab fa-linkedin' },
                { id: 'x', url: socials.x, icon: 'fab fa-x-twitter' },
                { id: 'medium', url: socials.medium, icon: 'fab fa-medium' },
                { id: 'blog', url: socials.blog, icon: 'fas fa-pen-nib' },
                { id: 'website', url: socials.website, icon: 'fas fa-globe' }
              ].filter(s => s.url);

              return visible.hero && (
                <div className="w-full">
                  {heroLayout === 'minimalist' && (
                    <div className="text-center py-2 animate-fadeIn">
                      <img src={displayProfile.avatarUrl || 'logo.png'} onError={(e) => { e.target.src = 'logo.png'; }} className="w-20 h-20 rounded-full mx-auto border-4" style={{ borderColor: p.primaryColor }} alt="" />
                      <h2 className="text-2xl font-black text-white tracking-tight mt-3">{displayProfile.name}</h2>
                      <p className="text-sm font-mono font-bold" style={{ color: p.primaryColor }}>@{displayProfile.login}</p>
                      <p className="text-xs text-gray-300 mt-2 font-medium max-w-xl mx-auto">{displayBio}</p>
                      {visible.socials && activeSocials.length > 0 && (
                        <div className="flex items-center justify-center gap-2 mt-4">
                          {activeSocials.map(s => (
                            <a 
                              key={s.id} 
                              href={s.url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="w-7 h-7 rounded-lg flex items-center justify-center border transition-all duration-300 hover:scale-110" 
                              style={{ 
                                backgroundColor: p.cardBg, 
                                borderColor: p.cardBorder,
                                color: p.textSecondary
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = p.primaryColor;
                                e.currentTarget.style.color = p.primaryColor;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = p.cardBorder;
                                e.currentTarget.style.color = p.textSecondary;
                              }}
                            >
                              <i className={`${s.icon} text-xs`} />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {heroLayout === 'terminal' && (
                    <div className="bg-black/40 rounded-xl p-5 border font-mono text-[11px] space-y-1" style={{ borderColor: p.cardBorder }}>
                      <p><span className="text-emerald-400">visitor@octovibe:~#</span> fetch info --user @{displayProfile.login}</p>
                      <p className="pl-4 text-gray-300">{`{ "name": "${displayProfile.name}", "repositories": ${displayProfile.repos} }`}</p>
                      <p className="pl-4 text-gray-300">{`{ "bio": "${displayBio}" }`}</p>
                      {visible.socials && activeSocials.length > 0 && (
                        <p className="pl-4 text-emerald-400 font-mono">
                          {`{ "socials": [ `}
                          {activeSocials.map((s, idx) => (
                            <span key={s.id}>
                              <a href={s.url} target="_blank" rel="noopener noreferrer" className="hover:underline text-cyan-400">"{s.id}"</a>
                              {idx < activeSocials.length - 1 ? ', ' : ''}
                            </span>
                          ))}
                          {` ] }`}
                        </p>
                      )}
                    </div>
                  )}
                  {heroLayout === 'corporate' && (
                    <div className="flex items-center gap-6 p-5 rounded-xl animate-fadeIn" style={{ backgroundColor: p.cardBg }}>
                      <img src={displayProfile.avatarUrl || 'logo.png'} onError={(e) => { e.target.src = 'logo.png'; }} className="w-16 h-16 rounded-xl border shadow" style={{ borderColor: p.cardBorder }} alt="" />
                      <div className="space-y-1">
                        <h3 className="text-lg font-bold text-white">{displayProfile.name}</h3>
                        <p className="text-xs text-gray-400">@{displayProfile.login} • {displayProfile.location}</p>
                        {visible.socials && activeSocials.length > 0 && (
                          <div className="flex items-center gap-1.5 mt-1.5">
                            {activeSocials.map(s => (
                              <a 
                                key={s.id} 
                                href={s.url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="w-6 h-6 rounded-md flex items-center justify-center border transition-all duration-300 hover:scale-110" 
                                style={{ 
                                  backgroundColor: p.background, 
                                  borderColor: p.cardBorder,
                                  color: p.textSecondary
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.borderColor = p.primaryColor;
                                  e.currentTarget.style.color = p.primaryColor;
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.borderColor = p.cardBorder;
                                  e.currentTarget.style.color = p.textSecondary;
                                }}
                              >
                                <i className={`${s.icon} text-[10px]`} />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

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

            {visible.languages && (
              <div className="grid grid-cols-3 gap-4 w-full animate-fadeIn">
                <div className="col-span-1 p-5 rounded-xl border bg-black/10 flex flex-col gap-4" style={{ borderColor: p.cardBorder }}>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Top Languages</h4>
                  <div className="space-y-4 flex-1 justify-center flex flex-col">
                    {displayProfile.topLanguages ? displayProfile.topLanguages.map((lang, i) => (
                      <div key={i} className="w-full">
                        <div className="flex justify-between text-[10px] font-bold mb-1.5">
                          <span style={{ color: lang.color }}>{lang.name}</span>
                          <span className="text-gray-500">{lang.percentage}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${lang.percentage}%`, backgroundColor: lang.color }}></div>
                        </div>
                      </div>
                    )) : <p className="text-xs text-gray-500 italic">No language data found.</p>}
                  </div>
                </div>

                <div className="col-span-2 p-5 rounded-xl border bg-black/10" style={{ borderColor: p.cardBorder }}>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Tech Stack & Ecosystem</h4>
                  <div className="space-y-4">
                    <div>
                      <h5 className="text-[9px] font-bold text-gray-500 uppercase mb-2">Languages</h5>
                      <div className="flex flex-wrap gap-1.5">
                        {langStr.split(',').map(s => s.trim()).filter(Boolean).map((s, i) => (
                          <span key={i} className="px-2 py-1 text-[9px] font-bold rounded bg-[#161b22] border border-[#30363d] text-gray-300 shadow-sm">{s}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="text-[9px] font-bold text-gray-500 uppercase mb-2">Frameworks & Libraries</h5>
                      <div className="flex flex-wrap gap-1.5">
                        {frameStr.split(',').map(s => s.trim()).filter(Boolean).map((s, i) => (
                          <span key={i} className="px-2 py-1 text-[9px] font-bold rounded bg-[#161b22] border border-[#30363d] text-[#58a6ff] shadow-sm">{s}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="text-[9px] font-bold text-gray-500 uppercase mb-2">Cloud & Database</h5>
                      <div className="flex flex-wrap gap-1.5">
                        {cloudStr.split(',').map(s => s.trim()).filter(Boolean).map((s, i) => (
                          <span key={i} className="px-2 py-1 text-[9px] font-bold rounded bg-[#161b22] border border-[#30363d] text-[#56d364] shadow-sm">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {visible.trophies && (
              <div className="p-5 rounded-xl border bg-black/10 w-full animate-fadeIn" style={{ borderColor: p.cardBorder }}>
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Earned Platform Rewards</h4>
                    <p className="text-[10px] text-gray-500 font-medium mt-0.5">Represented visually by their tier colors. Hover for details.</p>
                  </div>
                  <button 
                    onClick={() => setShowTrophyModal(true)} 
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold rounded bg-slate-900/60 hover:bg-slate-950/80 border border-[#30363d] text-white hover:text-[#58a6ff] hover:scale-105 active:scale-95 transition-all select-none"
                  >
                    <i className="fas fa-circle-info text-sky-400"></i> Trophy Milestones Guide
                  </button>
                </div>

                {earnedTrophies.length > 0 ? (
                  <div className="flex flex-wrap gap-4 justify-start">
                    {earnedTrophies.map((t, i) => {
                      const tierGlowColor = t.color;
                      return (
                        <div 
                          key={i} 
                          className="relative w-24 h-24 flex items-center justify-center rounded-2xl border transition-all duration-300 bg-[#0B0F19]/60 backdrop-blur-sm group hover:scale-[1.06]"
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
                            className="w-16 h-16 object-contain filter drop-shadow-[0_0_6px_rgba(0,0,0,0.3)] transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[6deg]"
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
                      <div className="flex gap-1.5 w-full mb-1">
                        <div className="text-[9px] font-bold pr-1 invisible">M</div>
                        <div className="flex-1 relative h-5 text-[9px] text-gray-400 font-bold">
                          {MONS.map((m, idx) => {
                            const colOffset = Math.floor((idx / 12) * totalCols);
                            return <span key={idx} className="absolute" style={{ left: `${(colOffset / totalCols) * 100}%` }}>{m}</span>;
                          })}
                        </div>
                      </div>
                      <div className="flex gap-1.5 w-full">
                        <div className="text-[9px] text-gray-500 font-bold h-[78px] flex flex-col justify-between pr-1 select-none"><span>M</span><span>W</span><span>F</span></div>
                        <div className="flex-1 grid grid-flow-col auto-cols-fr gap-[2px]">
                          {Array.from({ length: totalCols }).map((_, cIdx) => (
                            <div key={cIdx} className="grid grid-rows-7 gap-[2px]">
                              {Array.from({ length: 7 }).map((_, rIdx) => {
                                const remainderDays = (currentYear % 4 === 0 && (currentYear % 100 !== 0 || currentYear % 400 === 0)) ? 2 : 1;
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

        {/* AUTOMATED LAUNCH V1 DEPLOYMENT FLOW */}
        <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-8 shadow-xl mt-8 animate-fadeIn">
          <div className="text-center mb-6">
            <h3 className="text-xl font-black text-white tracking-tight">Launch Profile to GitHub</h3>
            <p className="text-xs text-gray-400 mt-2 max-w-lg mx-auto leading-relaxed">
              Automatically generate the final markdown blueprint and securely push this exact layout directly to your <code className="text-[#58a6ff] bg-[#161b22] px-1.5 py-0.5 rounded mx-1">@{displayProfile.login}/{displayProfile.login}</code> repository.
            </p>
          </div>
          
          <div className="flex flex-col items-center justify-center">
            <button 
              onClick={handleLaunchProfile}
              disabled={isDeploying}
              className={`px-8 py-3 rounded-lg font-bold text-sm shadow-xl transition-all w-64 ${isDeploying ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-[#2ea043] hover:bg-[#2c974b] text-white hover:scale-105'}`}
            >
              {isDeploying ? 'Deploying to GitHub...' : '🚀 Push to Profile'}
            </button>
            {deployStatus && (
              <div className={`mt-4 text-center text-xs font-bold px-4 py-2 rounded-md ${deployStatus.includes('Success') ? 'text-[#56d364] bg-[#56d364]/10' : 'text-red-400 bg-red-400/10'}`}>
                {deployStatus}
              </div>
            )}
          </div>
        </div>
      </main>

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
                  if (id === 'stars') val = displayProfile.stars;
                  else if (id === 'commits') val = displayProfile.commits;
                  else if (id === 'repos') val = displayProfile.repos;
                  else if (id === 'forks') val = displayProfile.forks || 0;
                  else if (id === 'prs') val = displayProfile.prs || 0;
                  else if (id === 'reviews') val = displayProfile.reviews || 0;
                  else if (id === 'issues') val = displayProfile.issues || 0;
                  else if (id === 'discussions') val = displayProfile.discussions || 0;
                  else if (id === 'polyglot') val = displayProfile.languagesCount || 0;
                  else if (id === 'longevity') val = displayProfile.accountAgeYears || 0;
                  else if (id === 'nightowl') val = displayProfile.nightCommitRatio || 0;
                  else if (id === 'earlybird') val = displayProfile.earlyCommitRatio || 0;
                  else if (id === 'docs') val = displayProfile.docsChangesK || 0;
                  else if (id === 'gists') val = displayProfile.gists || 0;

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
