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
    let msg = `<b>🚀 GÜNÜN SEÇİMİ: ${best.symbol}</b>\n\n`;
    msg += `💰 Fiyat: ${best.currentPrice.toFixed(2)} ₺\n`;
    msg += `📈 Potansiyel: %${best.potentialProfit.toFixed(1)}\n`;
    msg += `🎯 Hedef 1: ${best.targets.target1.toFixed(2)} ₺\n`;
    msg += `🛑 Stop-Loss: ${best.targets.stopLoss.toFixed(2)} ₺\n`;
    msg += `⏱️ Beklenti: ${best.expectedDays} Gün\n`;
    msg += `✅ Güven: %${best.confidence}\n\n`;
    msg += `<b>Neden Seçildi?</b>\n`;
    best.reasoning.forEach((r: string) => {
      msg += `- ${r}\n`;
    });

    if (analysis.length > 1) {
      msg += `\n<b>Diğer Takip Listesi:</b>\n`;
      analysis.slice(1, 4).forEach((s: any) => {
        msg += `• ${s.symbol} (%${s.potentialProfit.toFixed(1)} potansiyel)\n`;
      });
    }

    return msg;
  }
}
