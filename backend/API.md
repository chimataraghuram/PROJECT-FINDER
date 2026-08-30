# PROJECT-FINDER API

The API is an Express service backed by MongoDB. Repository content is treated as untrusted input.

## Authentication

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me` — bearer token required
- `GET /api/auth/verify-email/:token`
- `POST /api/auth/resend-verification`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password/:token`

## Discovery and intelligence

- `GET /api/search?q=...` — existing GitHub/platform search
- `GET /api/query/understand?q=...` — structured intent extraction
- `GET /api/deep-search?q=...` — lexical evidence search
- `GET /api/deep-search/chunks?q=...` — semantic chunk retrieval
- `GET /api/deep-search/hybrid?q=...` — lexical/semantic fusion
- `GET /api/repositories/:owner/:repo/intelligence`
- `GET /api/repositories/code-search?q=...` — requires `GITHUB_TOKEN`
- `POST /api/ingest/:owner/:repo` — synchronous ingestion
- `POST /api/jobs/ingest/:owner/:repo` — asynchronous ingestion
- `GET /api/jobs/:jobId`

## AI and workspace

- `POST /api/rag/answer` — grounded answer with citations
- `POST /api/rag/stream` — SSE grounded answer with progress and token events
- `POST /api/quick-research/answer` — deterministic fast factual answers
- `GET /api/analysis/:repositoryId`
- `POST /api/analysis/compare`
- `GET /api/recommendations`
- `GET|POST /api/research`
- `POST /api/research/:sessionId/messages`
- `GET|POST /api/workspace/collections`
- `GET|PUT /api/workspace/notes`
- `GET|POST /api/workspace/search-history`

## Integrations and operations

- `GET /api/mcp/tools`
- `POST /api/mcp/call`
- `GET|POST /api/evaluations`
- `GET /health`

## Retrieval pipeline

```text
Query understanding
→ repository ingestion
→ evidence chunks
→ lexical retrieval
→ semantic baseline
→ hybrid fusion
→ grounded answer/citations
```

The current semantic provider is a deterministic local baseline. Production embeddings can replace it through `services/semanticSearch.js` without changing the API contract.
