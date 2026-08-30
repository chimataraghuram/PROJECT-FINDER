const vocabulary = {
  technologies: ['python', 'javascript', 'typescript', 'java', 'c++', 'go', 'rust', 'swift'],
  frameworks: ['fastapi', 'django', 'flask', 'react', 'next.js', 'nextjs', 'node.js', 'express', 'vue', 'angular', 'spring'],
  databases: ['postgresql', 'postgres', 'mongodb', 'mysql', 'redis', 'sqlite', 'qdrant', 'pinecone', 'elasticsearch'],
  aiCapabilities: ['llm', 'rag', 'ai agent', 'ai agents', 'machine learning', 'deep learning', 'computer vision', 'nlp', 'generative ai', 'embeddings'],
  projectTypes: ['api', 'backend', 'frontend', 'full stack', 'web app', 'cli', 'chatbot', 'dashboard', 'library', 'mobile'],
  quality: ['production', 'production-quality', 'well documented', 'tested', 'maintained', 'portfolio'],
  difficulty: ['beginner', 'intermediate', 'advanced']
};

export const understandQuery = query => {
  const normalized = String(query || '').toLowerCase();
  const extract = key => vocabulary[key].filter(value => normalized.includes(value));
  const domain = normalized.match(/(?:for|about|in)\s+([a-z][a-z0-9 -]{2,40})/)?.[1]?.trim() || null;
  return {
    originalQuery: query,
    domain,
    technologies: extract('technologies'),
    frameworks: extract('frameworks'),
    databases: extract('databases'),
    aiCapabilities: extract('aiCapabilities'),
    projectTypes: extract('projectTypes'),
    difficulty: extract('difficulty'),
    qualityRequirements: extract('quality'),
    activity: /active|recent|maintain/i.test(normalized) ? 'active' : null,
    portfolioRelevance: /portfolio|resume|student/i.test(normalized)
  };
};

export const rewriteResearchQuery = query => {
  const normalized = String(query || '').toLowerCase();
  const concepts = new Set([query]);
  const rules = [
    [/login|sign.?in|authenticat/, ['authentication', 'login', 'JWT', 'session', 'auth middleware', 'user model']],
    [/database|persist|storage/, ['database', 'model', 'schema', 'connection', 'migration']],
    [/how.*run|setup|install/, ['installation', 'setup', 'requirements', 'environment variables', 'docker']],
    [/api|endpoint|route/, ['API', 'endpoint', 'router', 'controller', 'request']],
    [/rag|retrieval|embedding/, ['RAG', 'retrieval', 'embedding', 'vector', 'chunk', 'rerank']]
  ];
  rules.forEach(([pattern, values]) => { if (pattern.test(normalized)) values.forEach(value => concepts.add(value)); });
  return { originalQuery: query, rewrittenQuery: [...concepts].join(' '), concepts: [...concepts].slice(1) };
};
