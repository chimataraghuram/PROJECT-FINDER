import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import workspaceRoutes from './routes/workspaceRoutes.js';
import repositoryRoutes from './routes/repositoryRoutes.js';
import ingestionRoutes from './routes/ingestionRoutes.js';
import deepSearchRoutes from './routes/deepSearchRoutes.js';
import queryRoutes from './routes/queryRoutes.js';
import ragRoutes from './routes/ragRoutes.js';
import analysisRoutes from './routes/analysisRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';
import researchRoutes from './routes/researchRoutes.js';
import evaluationRoutes from './routes/evaluationRoutes.js';
import mcpRoutes from './routes/mcpRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import quickResearchRoutes from './routes/quickResearchRoutes.js';
import { rateLimit } from './middleware/rateLimit.js';
import { requestLogger } from './middleware/requestLogger.js';
import { redisHealth } from './config/redis.js';

dotenv.config();
if (process.env.NODE_ENV === 'production' && (!process.env.MONGODB_URI || !process.env.FIREBASE_SERVICE_ACCOUNT_JSON)) {
  throw new Error('Production startup requires MONGODB_URI and FIREBASE_SERVICE_ACCOUNT_JSON');
}
connectDB().catch(error => { console.error('Database startup failed:', error.message); process.exitCode = 1; });

const app = express();

app.disable('x-powered-by');

const allowedOrigins = (process.env.FRONTEND_ORIGINS || 'http://localhost:5173,https://chimataraghuram.github.io')
  .split(',').map(origin => origin.trim()).filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '256kb' }));
app.use(requestLogger);
app.use(rateLimit({ windowMs: 60_000, max: Number(process.env.RATE_LIMIT_PER_MINUTE) || 120 }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', projectRoutes);
app.use('/api/workspace', workspaceRoutes);
app.use('/api/repositories', repositoryRoutes);
app.use('/api/ingest', ingestionRoutes);
app.use('/api/deep-search', deepSearchRoutes);
app.use('/api/query', queryRoutes);
app.use('/api/rag', ragRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/research', researchRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/mcp', mcpRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/quick-research', quickResearchRoutes);

app.get('/', (req, res) => {
  res.json({ service: 'project-finder-api', status: 'ok' });
});

app.get('/health', async (req, res) => res.json({ status: 'ok', uptime: process.uptime(), redis: await redisHealth(), timestamp: new Date().toISOString() }));

app.use((error, req, res, next) => {
  console.error('Unhandled API error:', error);
  if (res.headersSent) return next(error);
  res.status(error.status || 500).json({ message: 'Unexpected server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
