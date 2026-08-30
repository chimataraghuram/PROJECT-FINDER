export const scoreRepository = repo => {
  const metadata = repo.metadata || {};
  const signals = repo.signals || {};
  const documentation = signals.hasDocumentation ? 75 : 20;
  const testing = signals.hasTests ? 80 : 25;
  const activity = metadata.updated_at ? Math.max(20, Math.min(100, 100 - Math.floor((Date.now() - new Date(metadata.updated_at)) / 86400000 / 30))) : 20;
  const portfolio = Math.round((documentation + testing + activity) / 3);
  return { documentation, testing, activity, maintenance: activity, beginnerFriendly: Math.max(10, 100 - Math.min(80, (metadata.stargazers_count || 0) / 1000)), portfolioValue: portfolio, complexity: signals.dependencyFiles?.length > 3 ? 75 : 45 };
};
