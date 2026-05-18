const GITHUB_API_BASE = 'https://api.github.com';

/**
 * parseGitHubProfile
 * Fetches and aggregates a GitHub user's public profile and repository data.
 *
 * @param {string} username - GitHub username to resolve
 * @param {string} [token]  - Optional GitHub PAT for higher rate limits
 * @returns {Promise<Object>} Aggregated profile payload
 */
export async function parseGitHubProfile(username, token) {
  if (!username || typeof username !== 'string') {
    throw new Error('A valid GitHub username string is required.');
  }

  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  // Parallel fetch: user profile + first page of repos
  const [userRes, reposRes] = await Promise.all([
    fetch(`${GITHUB_API_BASE}/users/${encodeURIComponent(username)}`, { headers }),
    fetch(`${GITHUB_API_BASE}/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`, { headers }),
  ]);

  if (!userRes.ok) {
    const status = userRes.status;
    if (status === 404) throw new Error(`GitHub user "${username}" not found.`);
    if (status === 403) throw new Error('GitHub API rate limit exceeded. Provide a token for higher limits.');
    throw new Error(`GitHub API error: ${status} ${userRes.statusText}`);
  }

  const userData = await userRes.json();
  const repoData = reposRes.ok ? await reposRes.json() : [];

  // Derived aggregations
  const totalStars = repoData.reduce((acc, r) => acc + (r.stargazers_count || 0), 0);
  const totalForks = repoData.reduce((acc, r) => acc + (r.forks_count || 0), 0);
  const languages = [...new Set(repoData.map(r => r.language).filter(Boolean))];
  const topRepos = [...repoData]
    .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
    .slice(0, 5)
    .map(r => ({
      name: r.name,
      description: r.description,
      stars: r.stargazers_count,
      forks: r.forks_count,
      language: r.language,
      url: r.html_url,
    }));

  return {
    username,
    fetchedAt: new Date().toISOString(),
    profile: {
      name: userData.name,
      bio: userData.bio,
      avatarUrl: userData.avatar_url,
      location: userData.location,
      blog: userData.blog,
      company: userData.company,
      twitterUsername: userData.twitter_username,
      followers: userData.followers,
      following: userData.following,
      publicRepos: userData.public_repos,
      createdAt: userData.created_at,
    },
    stats: {
      totalStars,
      totalForks,
      repoCount: repoData.length,
      languages,
    },
    topRepos,
  };
}
