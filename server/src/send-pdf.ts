import PDFDocument from 'pdfkit';
import fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';
import { BIST_SYMBOLS } from './analyzer.js';

const TELEGRAM_BOT_TOKEN = '8639900213:AAEDTPbPVSQFfGnPkCH_xbYfYeMVinDdwtQ';
const TELEGRAM_CHAT_ID = '5710869209';

const createAndSendPDF = async () => {
  const doc = new PDFDocument();
  const filePath = './Hisse_Listesi.pdf';
  const stream = fs.createWriteStream(filePath);

  doc.pipe(stream);

  doc.fontSize(20).text('BIST Analiz Sistemi Hisse Listesi', { align: 'center' });
  doc.moveDown();
  doc.fontSize(14).text(`Toplam Analiz Edilen Hisse Sayisi: ${BIST_SYMBOLS.length}`, { align: 'left' });
  doc.moveDown();

  doc.fontSize(12).text('Hisse Listesi:', { underline: true });
  doc.moveDown();

  // Gruplandırarak yazdır (3 sütun)
  let listText = '';
  BIST_SYMBOLS.forEach((symbol, index) => {
    listText += `${symbol.padEnd(12)}`;
    if ((index + 1) % 4 === 0) {
      doc.fontSize(10).text(listText);
      listText = '';
    }
  });
  if (listText) doc.fontSize(10).text(listText);

  doc.end();

  stream.on('finish', async () => {
    console.log('PDF oluşturuldu, Telegram\'a gönderiliyor...');
    
    const formData = new FormData();
    formData.append('chat_id', TELEGRAM_CHAT_ID);
    formData.append('document', fs.createReadStream(filePath));
    formData.append('caption', `📊 Toplam ${BIST_SYMBOLS.length} adet hisse analiz listesi ektedir.`);

    try {
      await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument`, formData, {
        headers: formData.getHeaders()
      });
      console.log('PDF başarıyla gönderildi!');
      fs.unlinkSync(filePath); // Dosyayı sil
    } catch (error) {
      console.error('PDF gönderilirken hata oluştu:', error.message);
    }
  });
};

createAndSendPDF();
