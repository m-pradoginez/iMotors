import express from 'express';
import * as dotenv from 'dotenv';
import { recommendationController } from './recommendations/recommendationController';
import { testConnection } from './db/connection';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// Health check
app.get('/health', async (req, res) => {
  const isDbConnected = await testConnection();
  res.json({
    status: 'ok',
    database: isDbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Recommendations route
app.post('/api/recommendations', (req, res) => recommendationController.postRecommendations(req, res));

// Start server
app.listen(port, () => {
  console.log(`iMotors API listening at http://localhost:${port}`);
  testConnection();
});
