import React, { useState, useEffect, useCallback } from 'react';
import { getThemes, getThemeById } from '@octovibe/themes';
import { parseGitHubProfile, calculateTrophyTiers } from '@octovibe/core';

// ── Tier colour mapping ──────────────────────────────────────────────
const TIER_STYLES = {
  Platinum: { border: 'border-[#e5e4e2]/40', text: 'text-[#e5e4e2]', bg: 'bg-[#e5e4e2]/10' },
  Gold:     { border: 'border-[#ffd700]/40', text: 'text-[#ffd700]', bg: 'bg-[#ffd700]/10' },
  Silver:   { border: 'border-[#c0c0c0]/40', text: 'text-[#c0c0c0]', bg: 'bg-[#c0c0c0]/10' },
  Bronze:   { border: 'border-[#cd7f32]/40', text: 'text-[#cd7f32]', bg: 'bg-[#cd7f32]/10' },
};

// ── NavItem ──────────────────────────────────────────────────────────
function NavItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`nav-item w-full text-left ${active ? 'active' : ''}`}
    >
      <i className={`fa-solid ${icon} w-4 text-center`} />
      {label}
    </button>
  );
}

// ── StatChip ─────────────────────────────────────────────────────────
function StatChip({ label, value, icon, accent = 'text-gh-green' }) {
  return (
    <div className="stat-chip animate-fade-in">
      <span className="text-xs text-gh-muted flex items-center gap-1.5">
        <i className={`fa-solid ${icon} text-[10px]`} />
        {label}
      </span>
      <span className={`text-xl font-bold font-mono ${accent}`}>{value ?? '—'}</span>
    </div>
  );
}

// ── TrophyCard ───────────────────────────────────────────────────────
function TrophyCard({ achievement }) {
  const styles = TIER_STYLES[achievement.tier] || TIER_STYLES.Bronze;
  return (
    <div
      className={`card p-4 flex flex-col gap-2 animate-slide-up hover:scale-[1.02] transition-transform duration-200`}
    >
      <div className="flex items-start justify-between">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${styles.bg} border ${styles.border}`}
        >
          <i className={`fa-solid ${achievement.icon} ${styles.text} text-lg`} />
        </div>
        <span className={`tier-badge ${styles.border} border ${styles.text} ${styles.bg}`}>
          {achievement.tier}
        </span>
      </div>
      <div>
        <p className="text-sm font-semibold text-white">{achievement.title}</p>
        <p className="text-xs text-gh-muted mt-0.5">{achievement.description}</p>
      </div>
    </div>
  );
}

// ── SVG Preview Card ─────────────────────────────────────────────────
function SvgPreviewCard({ username, themeId }) {
  const apiUrl = `/api/render?user=${encodeURIComponent(username)}&theme=${encodeURIComponent(themeId)}`;
  return (
    <div className="card p-5 flex flex-col gap-3">
      <p className="section-title flex items-center gap-2">
        <i className="fa-solid fa-image text-gh-green" />
        SVG Card Preview
      </p>
      <div className="rounded-lg overflow-hidden border border-gh-border/40 bg-gh-canvas">
        <img
          src={apiUrl}
          alt={`OctoVibe card for ${username}`}
          className="w-full h-auto"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      </div>
      <div className="flex items-center gap-2">
        <code className="flex-1 text-xs text-gh-muted bg-gh-canvas rounded px-2 py-1.5 border border-gh-border/60 truncate font-mono">
          {`![OctoVibe](https://octovibe.vercel.app${apiUrl})`}
        </code>
        <button
          className="btn-ghost text-xs px-3 py-1.5"
          onClick={() => navigator.clipboard?.writeText(`![OctoVibe](https://octovibe.vercel.app${apiUrl})`)}
          title="Copy embed code"
        >
          <i className="fa-regular fa-copy" />
        </button>
      </div>
    </div>
  );
}

// ── Sidebar ──────────────────────────────────────────────────────────
function Sidebar({ username, setUsername, themeId, setThemeId, onAnalyze, loading, activeNav, setActiveNav }) {
  const themes = getThemes();

  return (
    <aside className="w-72 shrink-0 bg-[#010409] border-r border-gh-border flex flex-col h-screen sticky top-0">
      {/* Brand */}
      <div className="p-5 border-b border-gh-border">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🐙</span>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-white leading-none">OctoVibe</h1>
            <p className="text-[10px] text-gh-muted tracking-widest uppercase mt-0.5">Profile Analytics Hub</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="p-3 border-b border-gh-border space-y-0.5">
        {[
          { icon: 'fa-chart-line', label: 'Analytics', id: 'analytics' },
          { icon: 'fa-trophy',     label: 'Trophies',  id: 'trophies'  },
          { icon: 'fa-palette',    label: 'Themes',    id: 'themes'    },
          { icon: 'fa-code',       label: 'Embed',     id: 'embed'     },
        ].map((item) => (
          <NavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={activeNav === item.id}
            onClick={() => setActiveNav(item.id)}
          />
        ))}
      </nav>

      {/* Controls */}
      <div className="p-4 flex-1 overflow-y-auto space-y-5">
        {/* Username */}
        <div>
          <label className="section-title block">GitHub Handle</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gh-muted text-sm">@</span>
            <input
              id="username-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onAnalyze()}
              placeholder="torvalds"
              className="input-field pl-7"
            />
          </div>
        </div>

        {/* Theme picker */}
        <div>
          <label className="section-title block">Theme</label>
          <div className="space-y-1.5">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setThemeId(t.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg border text-sm transition-all duration-150
                  ${themeId === t.id
                    ? 'border-gh-green/60 bg-gh-green/10 text-white'
                    : 'border-gh-border text-gh-muted hover:border-gh-border/80 hover:text-white'
                  }`}
              >
                <span
                  className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                  style={{ backgroundColor: t.palette.primaryColor }}
                />
                <span className="flex-1 text-left truncate">{t.name}</span>
                {themeId === t.id && <i className="fa-solid fa-check text-gh-green text-xs" />}
              </button>
            ))}
          </div>
        </div>

        {/* Analyze button */}
        <button
          id="analyze-btn"
          onClick={onAnalyze}
          disabled={loading}
          className="btn-primary w-full justify-center"
        >
          {loading
            ? <><i className="fa-solid fa-circle-notch fa-spin" /> Fetching…</>
            : <><i className="fa-solid fa-magnifying-glass-chart" /> Analyze Profile</>
          }
        </button>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gh-border">
        <p className="text-[10px] text-gh-muted/60 text-center">
          OctoVibe Monorepo · Phase 1 Initialized ✓
        </p>
      </div>
    </aside>
  );
}

// ── Main App ─────────────────────────────────────────────────────────
export default function App() {
  const [username, setUsername]     = useState('JaibhagwanJindal');
  const [themeId, setThemeId]       = useState('dark-green');
  const [activeNav, setActiveNav]   = useState('analytics');
  const [profileData, setProfileData] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [analyzed, setAnalyzed]     = useState(false);

  const theme = getThemeById(themeId);

  const handleAnalyze = useCallback(async () => {
    if (!username.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await parseGitHubProfile(username.trim());
      const trophies = calculateTrophyTiers(data.profile, data.topRepos ?? []);
      setProfileData(data);
      setAchievements(trophies);
      setAnalyzed(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [username]);

  // Auto-analyze on first load
  useEffect(() => {
    handleAnalyze();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const accentColor = theme.palette.primaryColor;

  return (
    <div className="flex min-h-screen bg-gh-canvas">
      {/* Ambient background blobs */}
      <div
        className="gradient-blob w-96 h-96 -top-24 -left-24"
        style={{ backgroundColor: accentColor }}
      />
      <div
        className="gradient-blob w-64 h-64 bottom-12 right-12"
        style={{ backgroundColor: accentColor, animationDelay: '4s' }}
      />

      {/* Sidebar */}
      <Sidebar
        username={username}
        setUsername={setUsername}
        themeId={themeId}
        setThemeId={setThemeId}
        onAnalyze={handleAnalyze}
        loading={loading}
        activeNav={activeNav}
        setActiveNav={setActiveNav}
      />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-8 relative">

        {/* ── Error banner ── */}
        {error && (
          <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm animate-fade-in">
            <i className="fa-solid fa-triangle-exclamation" />
            {error}
          </div>
        )}

        {/* ── Hero / welcome ── */}
        {!analyzed && !loading && (
          <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center animate-fade-in">
            <div className="text-7xl mb-6">🐙</div>
            <h2 className="text-4xl font-extrabold text-white tracking-tight mb-3">
              Set your profile vibe<br />
              <span style={{ color: accentColor }}>on the Octoverse.</span>
            </h2>
            <p className="text-gh-muted max-w-md mb-8">
              Enter a GitHub username and click <strong className="text-white">Analyze Profile</strong> to generate
              telemetry, trophies, and an embeddable SVG card.
            </p>
            <button onClick={handleAnalyze} className="btn-primary text-base px-6 py-3">
              <i className="fa-solid fa-rocket" /> Get Started
            </button>
          </div>
        )}

        {/* ── Loading skeleton ── */}
        {loading && (
          <div className="space-y-6 animate-pulse">
            <div className="h-28 rounded-xl bg-gh-surface shimmer" />
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-lg bg-gh-surface shimmer" />)}
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => <div key={i} className="h-36 rounded-xl bg-gh-surface shimmer" />)}
            </div>
          </div>
        )}

        {/* ── Populated dashboard ── */}
        {analyzed && profileData && !loading && (
          <div className="space-y-8 animate-fade-in">

            {/* Profile hero */}
            <div className="card p-6 flex items-center gap-6">
              <img
                src={profileData.profile.avatarUrl}
                alt={`${profileData.profile.name || username}'s avatar`}
                className="w-20 h-20 rounded-full border-2"
                style={{ borderColor: accentColor }}
              />
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-extrabold text-white truncate">
                  {profileData.profile.name || `@${profileData.username}`}
                </h2>
                <p className="text-sm text-gh-muted mt-0.5 flex items-center gap-2">
                  <i className="fa-brands fa-github" />
                  <span className="mono">@{profileData.username}</span>
                </p>
                {profileData.profile.bio && (
                  <p className="text-sm text-gh-text mt-2 line-clamp-2">{profileData.profile.bio}</p>
                )}
                <div className="flex flex-wrap gap-4 mt-3 text-xs text-gh-muted">
                  {profileData.profile.location && (
                    <span className="flex items-center gap-1.5">
                      <i className="fa-solid fa-location-dot" /> {profileData.profile.location}
                    </span>
                  )}
                  {profileData.profile.blog && (
                    <a
                      href={profileData.profile.blog.startsWith('http') ? profileData.profile.blog : `https://${profileData.profile.blog}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 hover:text-white transition-colors"
                    >
                      <i className="fa-solid fa-link" /> {profileData.profile.blog}
                    </a>
                  )}
                  {profileData.profile.company && (
                    <span className="flex items-center gap-1.5">
                      <i className="fa-solid fa-building" /> {profileData.profile.company}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-gh-muted">Fetched</p>
                <p className="text-xs font-mono text-gh-muted">
                  {new Date(profileData.fetchedAt).toLocaleTimeString()}
                </p>
              </div>
            </div>

            {/* Stats row */}
            <div>
              <p className="section-title">Core Metrics</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatChip label="Followers"  value={profileData.profile.followers}   icon="fa-users"      accent="text-gh-green" />
                <StatChip label="Following"  value={profileData.profile.following}   icon="fa-user-check" accent="text-gh-blue" />
                <StatChip label="Repos"      value={profileData.profile.publicRepos} icon="fa-folder-open" accent="text-gh-green" />
                <StatChip label="Total Stars" value={profileData.stats.totalStars}   icon="fa-star"        accent="text-[#ffd700]" />
              </div>
            </div>

            {/* Trophies */}
            {(activeNav === 'trophies' || activeNav === 'analytics') && (
              <div>
                <p className="section-title">Earned Trophies</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.map((a) => (
                    <TrophyCard key={a.id} achievement={a} />
                  ))}
                </div>
              </div>
            )}

            {/* Top repos */}
            {profileData.topRepos?.length > 0 && (activeNav === 'analytics' || activeNav === 'trophies') && (
              <div>
                <p className="section-title">Top Repositories</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {profileData.topRepos.map((repo) => (
                    <a
                      key={repo.name}
                      href={repo.url}
                      target="_blank"
                      rel="noreferrer"
                      className="card p-4 flex flex-col gap-2 no-underline hover:no-underline group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-white group-hover:text-gh-green transition-colors truncate">
                          <i className="fa-solid fa-book-open mr-2 text-gh-muted text-xs" />
                          {repo.name}
                        </span>
                        <i className="fa-solid fa-arrow-up-right-from-square text-gh-muted text-xs opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      {repo.description && (
                        <p className="text-xs text-gh-muted line-clamp-2">{repo.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-auto pt-1 text-xs text-gh-muted">
                        {repo.language && (
                          <span className="flex items-center gap-1">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: accentColor }}
                            />
                            {repo.language}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <i className="fa-solid fa-star text-[#ffd700]" /> {repo.stars}
                        </span>
                        <span className="flex items-center gap-1">
                          <i className="fa-solid fa-code-fork" /> {repo.forks}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {profileData.stats.languages?.length > 0 && (
              <div>
                <p className="section-title">Language Fingerprint</p>
                <div className="flex flex-wrap gap-2">
                  {profileData.stats.languages.map((lang) => (
                    <span
                      key={lang}
                      className="px-3 py-1 rounded-full text-xs font-medium border border-gh-border bg-gh-surface text-gh-text hover:border-gh-green/60 transition-colors"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* SVG Embed preview */}
            {(activeNav === 'embed' || activeNav === 'analytics') && (
              <SvgPreviewCard username={profileData.username} themeId={themeId} />
            )}

          </div>
        )}
      </main>
    </div>
  );
}
