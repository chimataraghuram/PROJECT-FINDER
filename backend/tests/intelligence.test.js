import test from 'node:test';
import assert from 'node:assert/strict';
import { understandQuery, rewriteResearchQuery } from '../services/queryUnderstanding.js';
import { rankChunksSemantically } from '../services/semanticSearch.js';
import { scoreRepository } from '../services/projectAnalysis.js';
import { extractCodeStructure } from '../services/codeStructure.js';
import { classify } from '../controllers/quickResearchController.js';

test('understands technical requirements from natural language', () => {
  const result = understandQuery('Find beginner RAG projects using FastAPI and PostgreSQL');
  assert.ok(result.frameworks.includes('fastapi'));
  assert.ok(result.databases.includes('postgresql'));
  assert.ok(result.aiCapabilities.includes('rag'));
  assert.ok(result.difficulty.includes('beginner'));
});

test('ranks semantically related chunks above unrelated chunks', () => {
  const result = rankChunksSemantically('redis caching', [
    { content: 'This service uses Redis for caching API responses.' },
    { content: 'A frontend component renders a static landing page.' }
  ]);
  assert.equal(result.length, 1);
  assert.match(result[0].content, /Redis/);
});

test('analysis produces bounded heuristic scores', () => {
  const scores = scoreRepository({ metadata: { updated_at: new Date().toISOString(), stargazers_count: 100 }, signals: { hasTests: true, hasDocumentation: true, dependencyFiles: [] } });
  for (const score of Object.values(scores)) assert.ok(score >= 0 && score <= 100);
});

test('extracts useful source-code structure', () => {
  const structure = extractCodeStructure("import express from 'express'; class AuthService {} function login() {} router.post('/login', login);");
  assert.ok(structure.functions.includes('login'));
  assert.ok(structure.classes.includes('AuthService'));
  assert.ok(structure.imports.includes('express'));
  assert.ok(structure.apiRoutes.includes('POST /login'));
});

test('rewrites focused research questions with relevant concepts', () => {
  const result = rewriteResearchQuery('How does login authentication work?');
  assert.ok(result.concepts.includes('JWT'));
  assert.ok(result.concepts.includes('auth middleware'));
  assert.ok(!result.concepts.includes('unrelated technology'));
});

test('routes simple facts to quick mode categories', () => {
  assert.equal(classify('What database does this use?'), 'metadata');
  assert.equal(classify('How do I install and run it?'), 'setup');
  assert.equal(classify('Explain the architecture deeply'), 'deep');
});
