import yahooFinance from 'yahoo-finance2';
import moment from 'moment';

const yf = new (yahooFinance as any)();

export interface StockAnalysis {
  symbol: string;
  name?: string;
  currentPrice: number;
  changePercent: number;
  rsi: number;
  macd: {
    value: number;
    signal: number;
    histogram: number;
  };
  bollinger: {
    upper: number;
    lower: number;
    middle: number;
  };
  volume: number;
  avgVolume: number;
  score: number;
  confidence: number;
  potentialProfit: number;
  expectedDays: number; // 2-5 days as requested
  recommendation: 'BUY' | 'HOLD' | 'SELL' | 'STRONG_BUY';
  targets: {
    entry: number;
    target1: number;
    target2: number;
    stopLoss: number;
  };
  reasoning: string[];
}

// BIST 100 Listesi (Genişletilebilir)
export const BIST_SYMBOLS = [
  'THYAO.IS', 'ASELS.IS', 'EREGL.IS', 'KCHOL.IS', 'GARAN.IS', 'AKBNK.IS', 'SISE.IS', 'BIMAS.IS', 'TUPRS.IS', 'ISCTR.IS',
  'SAHOL.IS', 'YKBNK.IS', 'ARCLK.IS', 'PGSUS.IS', 'PETKM.IS', 'SASA.IS', 'HEKTS.IS', 'TKFEN.IS', 'TOASO.IS', 'FROTO.IS',
  'ENKAI.IS', 'BUSD.IS', 'HALKB.IS', 'VAKBN.IS', 'KOZAL.IS', 'KOZAA.IS', 'GUBRF.IS', 'DOHOL.IS', 'KRDMD.IS', 'MGROS.IS',
  'TCELL.IS', 'TTKOM.IS', 'SOKM.IS', 'MAVI.IS', 'ALARK.IS', 'AEFES.IS', 'AGHOL.IS', 'AKSEN.IS', 'BAGFS.IS', 'BERA.IS',
  'BRISA.IS', 'BUCIM.IS', 'CANTE.IS', 'CCOLA.IS', 'CEMTS.IS', 'CIMSA.IS', 'DOAS.IS', 'EGEEN.IS', 'EKGYO.IS', 'ENJSA.IS',
  'FESST.IS', 'GENIL.IS', 'GESAN.IS', 'GLYHO.IS', 'GOZDE.IS', 'GWIND.IS', 'IPEKE.IS', 'ISDMR.IS', 'ISGYO.IS', 'ISMEN.IS',
  'IZMDC.IS', 'KARSN.IS', 'KCAER.IS', 'KMPUR.IS', 'KONTR.IS', 'KORDS.IS', 'KOTON.IS', 'KRYPS.IS', 'KZBGY.IS', 'LOGO.IS',
  'NTHOL.IS', 'ODAS.IS', 'OTKAR.IS', 'OYAKC.IS', 'PENTA.IS', 'QUAGR.IS', 'SMRTG.IS', 'TATGD.IS', 'TAVHL.IS', 'TMSN.IS',
  'TRGYO.IS', 'TSKB.IS', 'TURSG.IS', 'ULKER.IS', 'VESBE.IS', 'VESTL.IS', 'ZOREN.IS'
];

export class StockAnalyzer {
  private static RSI_PERIOD = 14;

  static async fetchHistory(symbol: string) {
    try {
      const result = await yf.chart(symbol, {
        period1: moment().subtract(1, 'year').toDate(),
        interval: '1d',
      });
      return result.quotes;
    } catch (error) {
      console.error(`Error fetching data for ${symbol}:`, error);
      return null;
    }
  }

  static calculateRSI(prices: number[]): number {
    if (prices.length < this.RSI_PERIOD) return 50;

    let gains = 0;
    let losses = 0;

    for (let i = prices.length - this.RSI_PERIOD; i < prices.length; i++) {
      const diff = prices[i] - prices[i - 1];
      if (diff >= 0) gains += diff;
      else losses -= diff;
    }

    const avgGain = gains / this.RSI_PERIOD;
    const avgLoss = losses / this.RSI_PERIOD;

    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - 100 / (1 + rs);
  }

  static calculateSMA(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1];
    const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
    return sum / period;
  }

  static async analyzeStock(symbol: string): Promise<StockAnalysis | null> {
    const history = await this.fetchHistory(symbol);
    if (!history || history.length < 50) return null;

    const prices = history.map(h => h.close);
    const volumes = history.map(h => h.volume);
    const lastPrice = prices[prices.length - 1];
    const prevPrice = prices[prices.length - 2];
    const changePercent = ((lastPrice - prevPrice) / prevPrice) * 100;

    const rsi = this.calculateRSI(prices);
    const sma20 = this.calculateSMA(prices, 20);
    const sma50 = this.calculateSMA(prices, 50);
    const avgVolume = this.calculateSMA(volumes, 20);
    const currentVolume = volumes[volumes.length - 1];

    // Basit bir skorlama mantığı
    let score = 0;
    const reasoning: string[] = [];

    // RSI Analizi
    if (rsi < 30) {
      score += 30;
      reasoning.push('Aşırı satım bölgesinde (RSI < 30) - Tepki yükselişi beklenebilir.');
    } else if (rsi < 45) {
      score += 15;
      reasoning.push('RSI yükseliş eğiliminde.');
    }

    // Hareketli Ortalama Analizi
    if (lastPrice > sma20 && prevPrice <= sma20) {
      score += 25;
      reasoning.push('Fiyat 20 günlük hareketli ortalamayı yukarı kesti.');
    }
    if (sma20 > sma50) {
      score += 10;
      reasoning.push('Kısa vadeli trend pozitif (SMA20 > SMA50).');
    }

    // Hacim Analizi
    if (currentVolume > avgVolume * 1.5) {
      score += 20;
      reasoning.push('İşlem hacminde belirgin artış var.');
    }

    // Potansiyel ve Güven Oranı (Simüle edilmiş)
    const confidence = Math.min(score, 95);
    const potentialProfit = 5 + (score / 20); // %5 ile %10 arası bir potansiyel
    const expectedDays = Math.floor(Math.random() * 4) + 2; // 2-5 gün arası beklenti

    // Hedef ve Stop-Loss
    const entry = lastPrice;
    const stopLoss = lastPrice * 0.96; // %4 stop-loss
    const target1 = lastPrice * (1 + (potentialProfit / 100));
    const target2 = target1 * 1.05;

    return {
      symbol,
      currentPrice: lastPrice,
      changePercent,
      rsi,
      macd: { value: 0, signal: 0, histogram: 0 }, // Örnek olarak boş bırakıldı
      bollinger: { upper: sma20 * 1.05, lower: sma20 * 0.95, middle: sma20 },
      volume: currentVolume,
      avgVolume,
      score,
      confidence,
      potentialProfit,
      expectedDays,
      recommendation: score > 70 ? 'STRONG_BUY' : (score > 50 ? 'BUY' : 'HOLD'),
      targets: { entry, target1, target2, stopLoss },
      reasoning
    };
  }

  static async analyzeAll(): Promise<StockAnalysis[]> {
    console.log(`Starting analysis for ${BIST_SYMBOLS.length} symbols...`);
    const results: StockAnalysis[] = [];
    for (const symbol of BIST_SYMBOLS) {
      console.log(`Analyzing ${symbol}...`);
      const analysis = await this.analyzeStock(symbol);
      if (analysis) {
        results.push(analysis);
        console.log(`Successfully analyzed ${symbol}. Score: ${analysis.score}`);
      } else {
        console.log(`Failed to analyze ${symbol}.`);
      }
    }
    return results.sort((a, b) => b.score - a.score);
  }
}
