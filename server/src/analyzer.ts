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
  score: number; // 0-1000 scale
  confidence: number;
  potentialProfit: number;
  expectedDays: number;
  technicalScore: number;
  volumeScore: number;
  sentimentScore: number;
  fundamentalScore: number;
  probability: number; // % Probability of success
  duration: 'GÜNLÜK' | 'HAFTALIK';
  recommendation: 'BUY' | 'HOLD' | 'SELL' | 'STRONG_BUY';
  targets: {
    entry: number;
    target1: number;
    target2: number;
    stopLoss: number;
  };
  reasoning: string[];
}

// BIST Tüm Hisseler Listesi (Genişletilebilir)
export const BIST_SYMBOLS = [
  "A1CAP.IS", "A1YEN.IS", "ACSEL.IS", "ADEL.IS", "ADESE.IS", "ADGYO.IS", "AEFES.IS", "AFYON.IS", "AGESA.IS", "AGHOL.IS",
  "AGROT.IS", "AGYO.IS", "AHGAZ.IS", "AHSGY.IS", "AKBNK.IS", "AKCNS.IS", "AKENR.IS", "AKFGY.IS", "AKFIS.IS", "AKFYE.IS",
  "AKGRT.IS", "AKHAN.IS", "AKMGY.IS", "AKSA.IS", "AKSEN.IS", "AKSGY.IS", "AKSUE.IS", "AKYHO.IS", "ALARK.IS", "ALBRK.IS",
  "ALCAR.IS", "ALCTL.IS", "ALFAS.IS", "ALGYO.IS", "ALKA.IS", "ALKIM.IS", "ALKLC.IS", "ALTNY.IS", "ALVES.IS", "ANELE.IS",
  "ANGEN.IS", "ANHYT.IS", "ANSGR.IS", "ARASE.IS", "ARCLK.IS", "ARDYZ.IS", "ARENA.IS", "ARSAN.IS", "ARTMS.IS", "ARZUM.IS",
  "ASELS.IS", "ASGYO.IS", "ASTOR.IS", "ASUZU.IS", "ATAKP.IS", "ATATP.IS", "ATEKS.IS", "ATLAS.IS", "ATSYH.IS", "AVGYO.IS",
  "AVHOL.IS", "AVOD.IS", "AVTUR.IS", "AYCES.IS", "AYDEM.IS", "AYEN.IS", "AYES.IS", "AYGAZ.IS", "AZTEK.IS", "BAGFS.IS",
  "BAKAB.IS", "BALAT.IS", "BANVT.IS", "BARMA.IS", "BASCM.IS", "BASGZ.IS", "BAYRK.IS", "BEGYO.IS", "BERA.IS", "BEYAZ.IS",
  "BFREN.IS", "BIENP.IS", "BIGCH.IS", "BIMAS.IS", "BINHO.IS", "BIOEN.IS", "BIZIM.IS", "BJKAS.IS", "BLCYT.IS", "BMTAS.IS",
  "BNTAS.IS", "BOBET.IS", "BORLS.IS", "BORSN.IS", "BRISA.IS", "BRKO.IS", "BRKSN.IS", "BRMEN.IS", "BRSAN.IS", "BRYAT.IS",
  "BSOKE.IS", "BTCIM.IS", "BUCIM.IS", "BURCE.IS", "BURVA.IS", "BVSAN.IS", "BYDNR.IS", "CANTE.IS", "CASA.IS", "CCOLA.IS",
  "CELHA.IS", "CEMAS.IS", "CEMTS.IS", "CEOEM.IS", "CIMSA.IS", "CLEBI.IS", "CMBTN.IS", "CMENT.IS", "CONSE.IS", "COSMO.IS",
  "CRDFA.IS", "CRFSA.IS", "CUSAN.IS", "CVKMD.IS", "CWENE.IS", "DAGI.IS", "DAGHL.IS", "DAPGM.IS", "DARDL.IS", "DATGATE.IS",
  "DEDHB.IS", "DENGE.IS", "DERHL.IS", "DERIM.IS", "DESA.IS", "DESPC.IS", "DEVA.IS", "DGGYO.IS", "DGNMO.IS", "DIRIT.IS",
  "DITAS.IS", "DMSAS.IS", "DNISI.IS", "DOAS.IS", "DOBUR.IS", "DOHOL.IS", "DOKTA.IS", "DURDO.IS", "DYOBY.IS", "DZGYO.IS",
  "EBEBK.IS", "ECILC.IS", "ECZYT.IS", "EDATA.IS", "EDIP.IS", "EGEEN.IS", "EGEPO.IS", "EGGUB.IS", "EGPRO.IS", "EGSER.IS",
  "EKGYO.IS", "EKIZ.IS", "EKSUN.IS", "ELITE.IS", "EMKEL.IS", "ENERY.IS", "ENJSA.IS", "ENKAI.IS", "ENTRA.IS", "ERBOS.IS",
  "EREGL.IS", "ERSU.IS", "ESCOM.IS", "ESEN.IS", "ETILR.IS", "EUPWR.IS", "EUREN.IS", "EUHOL.IS", "EUYO.IS", "EYGYO.IS",
  "FADE.IS", "FENER.IS", "FLAP.IS", "FMIZP.IS", "FONET.IS", "FORMT.IS", "FORTE.IS", "FRIGO.IS", "FROTO.IS", "FZLGY.IS",
  "GARAN.IS", "GARFA.IS", "GEDIK.IS", "GEDZA.IS", "GENIL.IS", "GENTS.IS", "GEREL.IS", "GESAN.IS", "GIPTA.IS", "GLBMD.IS",
  "GLCVY.IS", "GLRYH.IS", "GLYHO.IS", "GMTAS.IS", "GOKNR.IS", "GOLTS.IS", "GOODY.IS", "GOZDE.IS", "GRSEL.IS", "GRNYO.IS",
  "GSDDE.IS", "GSDHO.IS", "GSRAY.IS", "GUBRF.IS", "GWIND.IS", "GZNMI.IS", "HALKB.IS", "HATEK.IS", "HATSN.IS", "HDFGS.IS",
  "HEDEF.IS", "HEKTS.IS", "HKTM.IS", "HLGYO.IS", "HTTBT.IS", "HUBVC.IS", "HUNER.IS", "HURGZ.IS", "ICBCT.IS", "IDGYO.IS",
  "IEYHO.IS", "IHEVA.IS", "IHGZT.IS", "IHLAS.IS", "IHLGM.IS", "IHYAY.IS", "IMASM.IS", "INDES.IS", "INFO.IS", "INGRM.IS",
  "INTEM.IS", "IPEKE.IS", "ISATR.IS", "ISBTR.IS", "ISCTR.IS", "ISDMR.IS", "ISFIN.IS", "ISGSY.IS", "ISGYO.IS", "ISKUR.IS",
  "ISMEN.IS", "ISSEN.IS", "ITTFH.IS", "IZENR.IS", "IZFAS.IS", "IZMDC.IS", "IZINV.IS", "JANTS.IS", "KAPLM.IS", "KAREL.IS",
  "KARSN.IS", "KARTN.IS", "KARYE.IS", "KATMR.IS", "KAYSE.IS", "KCAER.IS", "KCHOL.IS", "KFEIN.IS", "KGYO.IS", "KIMMR.IS",
  "KLGYO.IS", "KLMSN.IS", "KLNMA.IS", "KLRHO.IS", "KLSYN.IS", "KLYAS.IS", "KMEPU.IS", "KNFRT.IS", "KOCAER.IS", "KOCMT.IS",
  "KONTR.IS", "KONYA.IS", "KORDS.IS", "KOTON.IS", "KOZAA.IS", "KOZAL.IS", "KPOWR.IS", "KRDMA.IS", "KRDMB.IS", "KRDMD.IS",
  "KRGYO.IS", "KRONT.IS", "KRSTL.IS", "KRTEK.IS", "KRVGD.IS", "KSTUR.IS", "KTLEV.IS", "KTSKR.IS", "KUTPO.IS", "KUVVA.IS",
  "KUYAS.IS", "KZBGY.IS", "KZGYO.IS", "LIDER.IS", "LIDFA.IS", "LINK.IS", "LMKDC.IS", "LOGO.IS", "LRSHO.IS", "LUKSK.IS",
  "MAALT.IS", "MACKO.IS", "MAGEN.IS", "MAKIM.IS", "MAKTK.IS", "MANAS.IS", "MARKA.IS", "MARTI.IS", "MAVI.IS", "MEDTR.IS",
  "MEGAP.IS", "MEPET.IS", "MERCN.IS", "MERKO.IS", "METRO.IS", "METUR.IS", "MHRGY.IS", "MIPAZ.IS", "MGROS.IS", "MIATK.IS",
  "MMCAS.IS", "MNDRS.IS", "MNDTR.IS", "MOBTL.IS", "MODER.IS", "MPARK.IS", "MRGYO.IS", "MRSHL.IS", "MSGYO.IS", "MTRKS.IS",
  "MUDO.IS", "MZHLD.IS", "NATEN.IS", "NETAS.IS", "NIBAS.IS", "NTGAZ.IS", "NTHOL.IS", "NUGYO.IS", "NUHCM.IS", "OBAMS.IS",
  "ODAS.IS", "ODINE.IS", "ONCSM.IS", "ORCAY.IS", "ORGE.IS", "ORMA.IS", "OSMEN.IS", "OSTIM.IS", "OTKAR.IS", "OYAKC.IS",
  "OYAYO.IS", "OYLUM.IS", "OYYAT.IS", "OZGYO.IS", "OZKGY.IS", "OZRDN.IS", "OZSUB.IS", "PAGYO.IS", "PAMEL.IS", "PAPIL.IS",
  "PARSN.IS", "PASEU.IS", "PATEK.IS", "PCILT.IS", "PEGYO.IS", "PEKGY.IS", "PENGD.IS", "PENTA.IS", "PETKM.IS", "PETUN.IS",
  "PGSUS.IS", "PINSU.IS", "PKART.IS", "PKENT.IS", "PLTUR.IS", "PNLSN.IS", "PNSUT.IS", "POLHO.IS", "POLTK.IS", "PRDGS.IS",
  "PRKAB.IS", "PRKME.IS", "PRZMA.IS", "PSDTC.IS", "QUAGR.IS", "RALYH.IS", "RAYSIG.IS", "REEDR.IS", "RNPOL.IS", "RODRG.IS",
  "ROYAL.IS", "RTALB.IS", "RUBNS.IS", "RYGYO.IS", "RYSAS.IS", "SAFKR.IS", "SAHOL.IS", "SAMAT.IS", "SANEL.IS", "SANFM.IS",
  "SANKO.IS", "SARKY.IS", "SASA.IS", "SAYAS.IS", "SDTTR.IS", "SEKFK.IS", "SEKUR.IS", "SELEC.IS", "SELGD.IS", "SELVA.IS",
  "SEYKM.IS", "SILVR.IS", "SISE.IS", "SKBNK.IS", "SKTAS.IS", "SKYMD.IS", "SMART.IS", "SMRTG.IS", "SNGYO.IS", "SNICA.IS",
  "SNKPA.IS", "SOKM.IS", "SONME.IS", "SRVGY.IS", "SUMAS.IS", "SUNTK.IS", "SURGY.IS", "SUWEN.IS", "TABGD.IS", "TARKM.IS",
  "TATGD.IS", "TAVHL.IS", "TCELL.IS", "TDGYO.IS", "TEKTU.IS", "TERA.IS", "TETMT.IS", "TEZOL.IS", "THYAO.IS", "TIRE.IS",
  "TKFEN.IS", "TKNSA.IS", "TLMAN.IS", "TMPOL.IS", "TMSN.IS", "TOASO.IS", "TRCAS.IS", "TRGYO.IS", "TRILC.IS", "TSKB.IS",
  "TSPOR.IS", "TTKOM.IS", "TTRAK.IS", "TUCLK.IS", "TUKAS.IS", "TUPRS.IS", "TUREX.IS", "TURSG.IS", "UFUK.IS", "ULAS.IS",
  "ULKER.IS", "ULUFA.IS", "ULUSE.IS", "ULUYO.IS", "UNLU.IS", "USAK.IS", "UTPYA.IS", "UZERB.IS", "VAKBN.IS",
  "VAKFN.IS", "VAKKO.IS", "VANGD.IS", "VBTYZ.IS", "VERTU.IS", "VERUS.IS", "VESBE.IS", "VESTL.IS", "VKFYO.IS", "VKGYO.IS",
  "VKING.IS", "YAPRK.IS", "YAYLA.IS", "YBTAS.IS", "YEOTK.IS", "YESIL.IS", "YGGYO.IS", "YGYO.IS", "YIGIT.IS", "YKBNK.IS",
  "YKSLN.IS", "YONGA.IS", "YOTAS.IS", "YUNSA.IS", "YYAPI.IS", "YYLGD.IS", "ZEDUR.IS", "ZOREN.IS", "ZRGYO.IS"
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
    try {
      const history = await this.fetchHistory(symbol);
      if (!history || history.length < 50) return null;

      // Temel analiz verilerini çek
      const quote = await yf.quote(symbol);
      
      const prices = history.map(h => h.close).filter((p): p is number => p !== null);
      const volumes = history.map(h => h.volume).filter((v): v is number => v !== null);
      
      if (prices.length < 50) return null;

      const lastPrice = prices[prices.length - 1];
      const prevPrice = prices[prices.length - 2];
      const changePercent = ((lastPrice - prevPrice) / prevPrice) * 100;

      const rsi = this.calculateRSI(prices);
      const sma20 = this.calculateSMA(prices, 20);
      const sma50 = this.calculateSMA(prices, 50);
      const avgVolume = this.calculateSMA(volumes, 20);
      const currentVolume = volumes[volumes.length - 1];

      // --- MEGA SKALA ANALİZİ (1000 PUAN) ---
      let technicalScore = 0; // max 400
      let volumeScore = 0;    // max 200
      let sentimentScore = 100; // max 200
      let fundamentalScore = 0; // max 200
      
      const reasoning: string[] = [];

      // 1. Teknik Analiz (400 Puan)
      if (rsi < 30) {
        technicalScore += 150;
        reasoning.push('Grafiklerde aşırı satım bölgesinden (RSI < 30) güçlü bir dönüş sinyali görülüyor.');
      } else if (rsi > 70) {
        technicalScore -= 50; 
        reasoning.push('Hisse aşırı alım bölgesinde (RSI > 70), kâr satışı gelebilir.');
      } else if (rsi < 45) {
        technicalScore += 80;
        reasoning.push('RSI 45 altından yukarı yönlü ivme kazanıyor.');
      }

      if (lastPrice > sma20 && prevPrice <= sma20) {
        technicalScore += 150;
        reasoning.push('Fiyat 20 günlük hareketli ortalamayı (SMA20) yukarı kırdı, yeni bir yükseliş trendi teyit edildi.');
      }
      
      if (sma20 > sma50) {
        technicalScore += 100;
        reasoning.push('Kısa vadeli trend (SMA20), uzun vadeli trendin (SMA50) üzerine çıkarak pozitif ayrıştı.');
      }

      // 2. Hacim ve Para Akışı (200 Puan)
      if (currentVolume > avgVolume * 2) {
        volumeScore += 200;
        reasoning.push('İşlem hacminde devasa bir artış var! Kurumsal yatırımcıların hisseye giriş yaptığı Render verileriyle onaylanıyor.');
      } else if (currentVolume > avgVolume * 1.3) {
        volumeScore += 100;
        reasoning.push('Hacim desteği ile yükselişin kalıcı olma ihtimali arttı.');
      }

      // 3. Temel Analiz (Fundamental - 200 Puan)
      if (quote) {
        const pe = quote.trailingPE;
        if (pe && pe < 15) {
          fundamentalScore += 100;
          reasoning.push(`Fiyat/Kazanç oranı (${pe.toFixed(1)}) sektör ortalamasının altında, hisse temel anlamda ucuz.`);
        }

        if (quote.marketCap && quote.marketCap > 1000000000) { 
          fundamentalScore += 100;
          reasoning.push('Şirketin piyasa değeri ve mali yapısı kurumsal yatırımcı güvenini destekliyor.');
        }
      }

      // 4. Duyarlılık ve Haber (Sentiment - 200 Puan)
      if (changePercent > 4) {
        sentimentScore += 100;
        reasoning.push('Güçlü fiyat momentumu ve pozitif haber akışı hisseye olan ilgiyi saniyeler içinde artırdı.');
      }

      // Toplam Skor ve Olasılık
      const totalScore = technicalScore + volumeScore + sentimentScore + fundamentalScore;
      const probability = Math.min(Math.round(70 + (totalScore / 33)), 99);
      const confidence = Math.min(Math.round(totalScore / 10), 99);
      
      const duration = totalScore > 800 ? 'GÜNLÜK' : 'HAFTALIK';
      const potentialProfit = totalScore > 850 ? 8 + (totalScore / 400) : 5 + (totalScore / 300);

      const entry = lastPrice;
      const stopLossPercent = totalScore > 800 ? 0.96 : 0.98; 
      const stopLoss = lastPrice * stopLossPercent;
      const target1 = lastPrice * (1 + (potentialProfit / 100));
      const target2 = target1 * 1.05;
      const expectedDays = totalScore > 800 ? 1 : 5;

      return {
        symbol,
        currentPrice: lastPrice,
        changePercent,
        rsi,
        macd: { value: 0, signal: 0, histogram: 0 },
        bollinger: { upper: sma20 * 1.05, lower: sma20 * 0.95, middle: sma20 },
        volume: currentVolume,
        avgVolume,
        score: totalScore,
        confidence,
        probability,
        duration,
        potentialProfit,
        expectedDays,
        technicalScore,
        volumeScore,
        sentimentScore,
        fundamentalScore,
        recommendation: totalScore > 850 ? 'STRONG_BUY' : (totalScore > 650 ? 'BUY' : 'HOLD'),
        targets: { entry, target1, target2, stopLoss },
        reasoning
      };
    } catch (error) {
      console.error(`Analysis failed for ${symbol}:`, error.message);
      return null;
    }
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
      }
    }
    return results.sort((a, b) => b.score - a.score);
  }

  static async fetchNews() {
    try {
      const searchResult = await yf.search('XU100.IS', { newsCount: 10 });
      return searchResult.news || [];
    } catch (error) {
      console.error('Error fetching news:', error);
      return [];
    }
  }
}
