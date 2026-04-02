import axios from 'axios';

export class NotificationService {
  private static TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  private static TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  static async sendTelegramMessage(message: string) {
    if (!this.TELEGRAM_BOT_TOKEN || !this.TELEGRAM_CHAT_ID) {
      console.warn('Telegram credentials missing. Skipping notification.');
      return;
    }

    const url = `https://api.telegram.org/bot${this.TELEGRAM_BOT_TOKEN}/sendMessage`;
    try {
      await axios.post(url, {
        chat_id: this.TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      });
      console.log('Telegram notification sent.');
    } catch (error) {
      console.error('Error sending Telegram notification:', error);
    }
  }

  static formatAnalysisReport(analysis: any[]): string {
    if (analysis.length === 0) return '<b>BIST Analiz Raporu:</b>\nBugün kriterlere uygun hisse bulunamadı.';

    const best = analysis[0];
    let msg = `<b>🚀 GÜNÜN EN YÜKSEK POTANSİYELLİ SEÇİMİ</b>\n\n`;
    
    msg += `<b>1. ${best.symbol} ve Kâr Beklentisi</b>\n`;
    msg += `   (a) Beklenen Kâr: <b>%${best.potentialProfit.toFixed(1)}</b>\n`;
    msg += `       Vade: <b>${best.duration}</b>\n`;
    msg += `   (b) Sebepleri: ${best.reasoning.join(' ')}\n\n`;
    
    msg += `<b>2. Olasılık ve Detaylı Analiz</b>\n`;
    msg += `   (a) Gerçekleşme İhtimali: <b>%${best.probability}</b>\n`;
    msg += `   (b) Neden %${best.probability}?: Bu olasılık; Teknik Skor (${best.technicalScore}/400), Hacim Gücü (${best.volumeScore}/200) ve Temel Analiz (${best.fundamentalScore}/200) verilerinin Render sunucumuzdaki Aşil algoritmasıyla harmanlanması sonucu hesaplanmıştır. Özellikle ${best.reasoning[0]} durumu bu yüksek ihtimalin ana nedenidir.\n\n`;

    msg += `━━━━━━━━━━━━━━━━\n`;
    msg += `💰 Giriş: ${best.currentPrice.toFixed(2)} ₺\n`;
    msg += `🎯 Hedef: ${best.targets.target1.toFixed(2)} ₺\n`;
    msg += `🛑 Stop: ${best.targets.stopLoss.toFixed(2)} ₺\n`;
    msg += `━━━━━━━━━━━━━━━━\n\n`;

    if (analysis.length > 1) {
      msg += `<b>🔍 Diğer Yüksek İhtimalli Hisseler:</b>\n`;
      analysis.slice(1, 4).forEach((s: any, i: number) => {
        msg += `${i + 2}. ${s.symbol} - Beklenti: %${s.potentialProfit.toFixed(1)} (Olasılık: %${s.probability})\n`;
      });
    }

    return msg;
  }

  static formatMorningReminder(best: any): string {
    if (!best) return '<b>Günaydın!</b>\nBugün için seçili hisse bulunamadı.';

    let msg = `<b>☀️ GÜNAYDIN! BORSA İSTANBUL AÇILIŞ ÖNCESİ HATIRLATMA</b>\n\n`;
    msg += `🚀 <b>Günün Favorisi: ${best.symbol}</b>\n`;
    msg += `📈 Beklenen Kâr: %${best.potentialProfit.toFixed(1)}\n`;
    msg += `✅ Olasılık: %${best.probability}\n`;
    msg += `━━━━━━━━━━━━━━━━\n`;
    msg += `💰 Giriş Fiyatı: ~${best.currentPrice.toFixed(2)} ₺\n`;
    msg += `🎯 Hedef 1: ${best.targets.target1.toFixed(2)} ₺\n`;
    msg += `🛑 Stop-Loss: ${best.targets.stopLoss.toFixed(2)} ₺\n\n`;
    
    msg += `✍️ <i>Bu seçim %${best.probability} olasılıkla ${best.duration.toLowerCase()} vadeli yükseliş sinyali vermektedir.</i>\n\n`;
    msg += `Bol kazançlar dilerim! 📈`;
    
    return msg;
  }

  static formatNewsUpdate(news: any[]): string {
    if (news.length === 0) return '';

    let msg = `<b>📰 SON DAKİKA HABER AKIŞI</b>\n\n`;
    news.forEach((n, i) => {
      msg += `${i + 1}. <b>${n.title}</b>\n`;
      msg += `🔗 <a href="${n.link}">Haberi Oku</a>\n\n`;
    });
    
    return msg;
  }
}
