const tokenize = text => [...new Set(String(text || '').toLowerCase().match(/[a-z0-9+#.-]{2,}/g) || [])];

const vectorize = (text, vocabulary) => {
  const counts = tokenize(text).reduce((map, token) => map.set(token, (map.get(token) || 0) + 1), new Map());
  return vocabulary.map(token => counts.get(token) || 0);
};

const cosine = (a, b) => {
  const dot = a.reduce((sum, value, i) => sum + value * b[i], 0);
  const magnitude = values => Math.sqrt(values.reduce((sum, value) => sum + value * value, 0));
  const denominator = magnitude(a) * magnitude(b);
  return denominator ? dot / denominator : 0;
};

export const rankChunksSemantically = (query, chunks) => {
  const vocabulary = tokenize(`${query} ${chunks.map(chunk => chunk.content).join(' ')}`).slice(0, 500);
  const queryVector = vectorize(query, vocabulary);
  return chunks.map(chunk => ({ ...chunk, semanticScore: cosine(queryVector, vectorize(chunk.content, vocabulary)) }))
    .filter(chunk => chunk.semanticScore > 0).sort((a, b) => b.semanticScore - a.semanticScore);
};
