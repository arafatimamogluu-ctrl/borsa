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

const runMorningReminder = async () => {
  console.log('Running morning reminder...');
  try {
    if (lastAnalysisResults.length > 0) {
      const topPick = lastAnalysisResults[0];
      const reminderMsg = NotificationService.formatMorningReminder(topPick);
      await NotificationService.sendTelegramMessage(reminderMsg);
    }
  } catch (error) {
    console.error('Error during morning reminder:', error);
  }
};

const runNewsUpdate = async () => {
  console.log('Running news update...');
  try {
    const news = await StockAnalyzer.fetchNews();
    if (news && news.length > 0) {
      const newsMsg = NotificationService.formatNewsUpdate(news);
      if (newsMsg) {
        await NotificationService.sendTelegramMessage(newsMsg);
      }
    }
  } catch (error) {
    console.error('Error during news update:', error);
  }
};

const runRealTimeMonitor = async () => {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours() + 3; // TRT adjustment if server is UTC

  // Sadece Borsa İstanbul açıkken çalış (Hafta içi 10:00 - 18:15 TRT)
  if (day >= 1 && day <= 5 && hour >= 10 && hour <= 18) {
    console.log('Running high-frequency monitor...');
    try {
      // Tüm hisseleri taramak yerine sadece hacim ve fiyatı değişenleri hızlıca kontrol et
      // Not: Yahoo Finance hızı nedeniyle burada 560 hisseyi tek tek taramak yerine 
      // en popüler 100 hisseyi veya son analizdeki top listesini taramak daha mantıklı.
      // Ancak kullanıcının isteği üzerine tam tarama yapılacaksa daha uzun aralık seçilmeli.
      const topSymbols = BIST_SYMBOLS.slice(0, 100); // Şimdilik ilk 100 ile başlayalım
      
      for (const symbol of topSymbols) {
        const analysis = await StockAnalyzer.analyzeStock(symbol);
        if (analysis && analysis.score > 900) { // Sadece aşırı güvenli olanlar
          const alertMsg = `<b>🚨 ANLIK FIRSAT SİNYALİ (AŞİL TESPİTİ)</b>\n\n` + 
                          NotificationService.formatAnalysisReport([analysis]);
          await NotificationService.sendTelegramMessage(alertMsg);
          console.log(`Real-time alert sent for ${symbol}`);
        }
      }
    } catch (error) {
      console.error('Error during real-time monitor:', error);
    }
  }
};

// Schedule analysis for 18:30 (Turkey Time)
// 18:30 TRT is 15:30 UTC
cron.schedule('30 18 * * 1-5', runDailyAnalysis); // Mon-Fri at 18:30 TRT

// Schedule morning reminder for 09:15 (Turkey Time)
// 09:15 TRT is 06:15 UTC
cron.schedule('15 9 * * 1-5', runMorningReminder); // Mon-Fri at 09:15 TRT

// Schedule news update for every 30 minutes during market hours
cron.schedule('*/30 10-18 * * 1-5', runNewsUpdate); 

// Schedule high-frequency monitor for every 15 minutes during market hours
cron.schedule('*/15 10-18 * * 1-5', runRealTimeMonitor);

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
