/**
 * calculateTrophyTiers
 * Computes gamified achievement tiers from raw GitHub profile & repo data.
 * Tiers: Bronze → Silver → Gold → Platinum
 *
 * @param {Object} userData  - GitHub user object (followers, public_repos, etc.)
 * @param {Array}  repoData  - Array of repository objects from GitHub API
 * @returns {Array} achievements - List of earned achievement objects
 */
export function calculateTrophyTiers(userData, repoData) {
  const tiers = {
    BRONZE: 'Bronze',
    SILVER: 'Silver',
    GOLD: 'Gold',
    PLATINUM: 'Platinum',
  };

  const achievements = [];

  // ── Star Lord ────────────────────────────────────────────────────────────
  const totalStars = repoData.reduce((acc, r) => acc + (r.stargazers_count || 0), 0);

  if (totalStars >= 100) {
    achievements.push({
      id: 'stars',
      title: 'Star Lord',
      tier: tiers.PLATINUM,
      color: '#e5e4e2',
      icon: 'fa-rocket',
      value: totalStars,
      description: `Accumulated ${totalStars} total stars across all repositories.`,
    });
  } else if (totalStars >= 50) {
    achievements.push({
      id: 'stars',
      title: 'Superstar',
      tier: tiers.GOLD,
      color: '#ffd700',
      icon: 'fa-star',
      value: totalStars,
      description: `Accumulated ${totalStars} total stars across all repositories.`,
    });
  } else if (totalStars >= 10) {
    achievements.push({
      id: 'stars',
      title: 'Shooting Star',
      tier: tiers.SILVER,
      color: '#c0c0c0',
      icon: 'fa-star-half-stroke',
      value: totalStars,
      description: `Accumulated ${totalStars} total stars across all repositories.`,
    });
  } else {
    achievements.push({
      id: 'stars',
      title: 'Rising Star',
      tier: tiers.BRONZE,
      color: '#cd7f32',
      icon: 'fa-star',
      value: totalStars,
      description: `Accumulated ${totalStars} total stars across all repositories.`,
    });
  }

  // ── Repository Count ─────────────────────────────────────────────────────
  const repoCount = repoData.length;

  if (repoCount >= 50) {
    achievements.push({
      id: 'repos',
      title: 'Repository Titan',
      tier: tiers.PLATINUM,
      color: '#e5e4e2',
      icon: 'fa-database',
      value: repoCount,
      description: `Maintains ${repoCount} public repositories.`,
    });
  } else if (repoCount >= 20) {
    achievements.push({
      id: 'repos',
      title: 'Prolific Builder',
      tier: tiers.GOLD,
      color: '#ffd700',
      icon: 'fa-cubes',
      value: repoCount,
      description: `Maintains ${repoCount} public repositories.`,
    });
  } else if (repoCount >= 5) {
    achievements.push({
      id: 'repos',
      title: 'Active Creator',
      tier: tiers.SILVER,
      color: '#c0c0c0',
      icon: 'fa-cube',
      value: repoCount,
      description: `Maintains ${repoCount} public repositories.`,
    });
  } else {
    achievements.push({
      id: 'repos',
      title: 'First Forges',
      tier: tiers.BRONZE,
      color: '#cd7f32',
      icon: 'fa-hammer',
      value: repoCount,
      description: `Maintains ${repoCount} public repositories.`,
    });
  }

  // ── Follower Fame ────────────────────────────────────────────────────────
  const followers = userData?.followers ?? 0;

  if (followers >= 500) {
    achievements.push({
      id: 'followers',
      title: 'Community Icon',
      tier: tiers.PLATINUM,
      color: '#e5e4e2',
      icon: 'fa-users',
      value: followers,
      description: `Inspiring ${followers} followers on GitHub.`,
    });
  } else if (followers >= 100) {
    achievements.push({
      id: 'followers',
      title: 'Influential Dev',
      tier: tiers.GOLD,
      color: '#ffd700',
      icon: 'fa-user-group',
      value: followers,
      description: `Inspiring ${followers} followers on GitHub.`,
    });
  } else if (followers >= 20) {
    achievements.push({
      id: 'followers',
      title: 'Growing Audience',
      tier: tiers.SILVER,
      color: '#c0c0c0',
      icon: 'fa-user-plus',
      value: followers,
      description: `Inspiring ${followers} followers on GitHub.`,
    });
  } else {
    achievements.push({
      id: 'followers',
      title: 'Getting Known',
      tier: tiers.BRONZE,
      color: '#cd7f32',
      icon: 'fa-user',
      value: followers,
      description: `Inspiring ${followers} followers on GitHub.`,
    });
  }

  return achievements;
}
