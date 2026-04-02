import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import { StockAnalyzer, StockAnalysis } from './analyzer.js';
import { NotificationService } from './notification.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

let lastAnalysisResults: StockAnalysis[] = [];
const RESULTS_FILE = path.join(__dirname, '../data/last_analysis.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, '../data'))) {
  fs.mkdirSync(path.join(__dirname, '../data'));
}

// Load last results from file if exists
if (fs.existsSync(RESULTS_FILE)) {
  lastAnalysisResults = JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf-8'));
}

const runDailyAnalysis = async () => {
  console.log('Running daily analysis at 18:30...');
  try {
    const results = await StockAnalyzer.analyzeAll();
    lastAnalysisResults = results;
    fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
    
    // Send notification
    const reportMsg = NotificationService.formatAnalysisReport(results);
    await NotificationService.sendTelegramMessage(reportMsg);
    
    console.log('Analysis complete. Best stocks:', results.slice(0, 5).map(s => s.symbol));
  } catch (error) {
    console.error('Error during daily analysis:', error);
  }
};

// Schedule analysis for 18:30 (Turkey Time - assuming server time is UTC or configured correctly)
// 18:30 TRT is 15:30 UTC. Adjust based on server time.
cron.schedule('30 18 * * 1-5', runDailyAnalysis); // Mon-Fri at 18:30

app.get('/api/analysis', (req, res) => {
  res.json(lastAnalysisResults);
});

app.get('/api/analysis/top', (req, res) => {
  res.json(lastAnalysisResults.slice(0, 10));
});

app.post('/api/analyze-now', async (req, res) => {
  await runDailyAnalysis();
  res.json({ message: 'Analysis triggered manually.', results: lastAnalysisResults.slice(0, 5) });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
