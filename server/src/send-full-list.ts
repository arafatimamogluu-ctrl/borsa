import PDFDocument from 'pdfkit';
import fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';

// BIST Tüm Hisseler Listesi (Yaklaşık 570+ Hisse)
const ALL_BIST_SYMBOLS = [
  "A1CAP.IS", "A1YEN.IS", "ACSEL.IS", "ADEL.IS", "ADESE.IS", "ADGYO.IS", "AEFES.IS", "AFYON.IS", "AGESA.IS", "AGHOL.IS",
  "AGROT.IS", "AGYO.IS", "AHGAZ.IS", "AHSGY", "AKBNK.IS", "AKCNS.IS", "AKENR.IS", "AKFGY.IS", "AKFIS.IS", "AKFYE.IS",
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
  "ULKER.IS", "ULUFA.IS", "ULUSE.IS", "ULUYO.IS", "UNLU.IS", "USAK.IS", "UŞAK.IS", "UTPYA.IS", "UZERB.IS", "VAKBN.IS",
  "VAKFN.IS", "VAKKO.IS", "VANGD.IS", "VBTYZ.IS", "VERTU.IS", "VERUS.IS", "VESBE.IS", "VESTL.IS", "VKFYO.IS", "VKGYO.IS",
  "VKING.IS", "YAPRK.IS", "YAYLA.IS", "YBTAS.IS", "YEOTK.IS", "YESIL.IS", "YGGYO.IS", "YGYO.IS", "YIGIT.IS", "YKBNK.IS",
  "YKSLN.IS", "YONGA.IS", "YOTAS.IS", "YUNSA.IS", "YYAPI.IS", "YYLGD.IS", "ZEDUR.IS", "ZOREN.IS", "ZRGYO.IS"
];

const TELEGRAM_BOT_TOKEN = '8639900213:AAEDTPbPVSQFfGnPkCH_xbYfYeMVinDdwtQ';
const TELEGRAM_CHAT_ID = '5710869209';

const createAndSendPDF = async () => {
  const doc = new PDFDocument();
  const filePath = './BIST_Tum_Hisse_Listesi.pdf';
  const stream = fs.createWriteStream(filePath);

  doc.pipe(stream);

  doc.fontSize(22).text('BORSA ISTANBUL TUM HISSE LISTESI', { align: 'center' });
  doc.moveDown();
  doc.fontSize(16).text(`Toplam Sirket Sayisi: ${ALL_BIST_SYMBOLS.length}`, { align: 'left' });
  doc.moveDown();
  doc.fontSize(12).text('Bu listedeki tum hisseler artik sisteminiz tarafindan 7/24 analiz edilmektedir.', { align: 'left' });
  doc.moveDown(2);

  // Sütunlu yazdırma
  let listText = '';
  ALL_BIST_SYMBOLS.forEach((symbol, index) => {
    listText += `${symbol.padEnd(12)}`;
    if ((index + 1) % 5 === 0) {
      doc.fontSize(9).font('Courier').text(listText);
      listText = '';
    }
  });
  if (listText) doc.fontSize(9).font('Courier').text(listText);

  doc.end();

  stream.on('finish', async () => {
    console.log('Tüm liste PDF oluşturuldu, Telegram\'a gönderiliyor...');
    
    const formData = new FormData();
    formData.append('chat_id', TELEGRAM_CHAT_ID);
    formData.append('document', fs.createReadStream(filePath));
    formData.append('caption', `📊 Borsa İstanbul'da işlem gören toplam ${ALL_BIST_SYMBOLS.length} hissenin tam listesi ektedir. Bu hisselerin tamamı artık sistemine tanımlandı.`);

    try {
      await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument`, formData, {
        headers: formData.getHeaders()
      });
      console.log('Tüm liste PDF başarıyla gönderildi!');
      fs.unlinkSync(filePath);
    } catch (error) {
      console.error('PDF gönderilirken hata oluştu:', error.message);
    }
  });
};

createAndSendPDF();
