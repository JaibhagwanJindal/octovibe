export const TROPHY_TIERS = {
  BRONZE: { label: 'Bronze', color: '#cd7f32', bg: '#1c120c', border: '#cd7f3233' },
  SILVER: { label: 'Silver', color: '#c0c0c0', bg: '#1b1b1b', border: '#c0c0c033' },
  GOLD: { label: 'Gold', color: '#ffd700', bg: '#242105', border: '#ffd70033' },
  PLATINUM: { label: 'Platinum', color: '#e5e4e2', bg: '#16191d', border: '#e5e4e233' }
};

export function calculateAllTrophies(stats) {
  const achievements = [];
  const evaluate = (id, title, value, thresholds, icon) => {
    let tier = null;
    if (value >= thresholds.platinum) tier = TROPHY_TIERS.PLATINUM;
    else if (value >= thresholds.gold) tier = TROPHY_TIERS.GOLD;
    else if (value >= thresholds.silver) tier = TROPHY_TIERS.SILVER;
    else if (value >= thresholds.bronze) tier = TROPHY_TIERS.BRONZE;
    if (tier) achievements.push({ id, title, value, ...tier, icon });
  };

  evaluate('stars', 'Star Lord', stats.stars || 0, { bronze: 10, silver: 100, gold: 500, platinum: 1000 }, 'fa-star');
  evaluate('commits', 'Commit Monster', stats.commits || 0, { bronze: 100, silver: 1000, gold: 5000, platinum: 10000 }, 'fa-cubes');
  evaluate('repos', 'Prolific Creator', stats.repos || 0, { bronze: 5, silver: 20, gold: 50, platinum: 100 }, 'fa-book-bookmark');
  evaluate('forks', 'Fork Magnet', stats.forks || 0, { bronze: 5, silver: 25, gold: 100, platinum: 500 }, 'fa-code-fork');
  evaluate('prs', 'Open Architect', stats.prs || 0, { bronze: 5, silver: 25, gold: 100, platinum: 250 }, 'fa-code-merge');
  evaluate('reviews', 'Code Auditor', stats.reviews || 0, { bronze: 2, silver: 10, gold: 50, platinum: 200 }, 'fa-clipboard-check');
  evaluate('issues', 'Bug Crusher', stats.issues || 0, { bronze: 5, silver: 20, gold: 100, platinum: 500 }, 'fa-circle-dot');
  evaluate('discussions', 'The Oracle', stats.discussions || 0, { bronze: 1, silver: 5, gold: 20, platinum: 50 }, 'fa-comments');
  evaluate('polyglot', 'The Polyglot', stats.languagesCount || 0, { bronze: 3, silver: 5, gold: 8, platinum: 12 }, 'fa-language');
  evaluate('longevity', 'The Ancient One', stats.accountAgeYears || 0, { bronze: 1, silver: 3, gold: 5, platinum: 8 }, 'fa-hourglass-start');
  evaluate('nightowl', 'The Night Owl', stats.nightCommitRatio || 0, { bronze: 10, silver: 25, gold: 50, platinum: 75 }, 'fa-moon');
  evaluate('earlybird', 'The Early Bird', stats.earlyCommitRatio || 0, { bronze: 10, silver: 25, gold: 50, platinum: 75 }, 'fa-sun');
  evaluate('docs', 'The Documentarian', stats.docsChangesK || 0, { bronze: 5, silver: 25, gold: 100, platinum: 500 }, 'fa-file-lines');
  evaluate('gists', 'Gist Genius', stats.gists || 0, { bronze: 2, silver: 10, gold: 30, platinum: 70 }, 'fa-code');

  return achievements;
}
