import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import analyzeRouter from './routes/analyze.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend development server
app.use(cors({
  origin: '*', // Allow all origins for local testing, can be restricted if needed
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// API Routes
app.use('/api', analyzeRouter);

// Serve static assets from frontend build
const buildPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(buildPath));

// For any route not matched by API, serve index.html (supports React Router / SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred on the server.'
  });
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;

