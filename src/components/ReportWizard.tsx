import React, { useState, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Camera, 
  FileText, 
  Download, 
  CheckCircle2,
  Trash2,
  Plus,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import html2pdf from 'html2pdf.js';

interface Device {
  kodAd: string;
  seriNo: string;
  kalibrasyonTarihi: string;
}

interface ControlItem {
  no: number;
  tanim: string;
  sonuc: 'U' | 'UD' | 'NA';
}

interface ReportData {
  technicalSpecs: {
    marka: string;
    seriNo: string;
    azamiYukseklik: string;
    tipiModel: string;
    kaldirmaMekanizmasi: string;
    kontrolNedeni: string;
    imalTarihi: string;
    kabinOlculeri: string;
    kapasite: string;
    tseCe: string;
    sutunOlculeri: string;
    beyanKapasitesi: string;
  };
  devices: Device[];
  controls: ControlItem[];
  photos: string[];
}

const initialControls: ControlItem[] = [
  { no: 1, tanim: "Sicil kartı, bakım-onarım kayıtları", sonuc: 'U' },
  { no: 2, tanim: "Önceki kontrol raporunda belirtilen eksiklerin giderilmesi", sonuc: 'U' },
  { no: 3, tanim: "Sorumlu/yetkili personel eğitimi", sonuc: 'U' },
  { no: 4, tanim: "Uyarı ve kapasite levhaları, kullanma talimatları", sonuc: 'U' },
  { no: 5, tanim: "Çelik konstrüksiyon, platform, gövde şasi, vb. çatlak, deformasyon", sonuc: 'U' },
  { no: 6, tanim: "Elektrik pano, şalter, kablo, kaçak akım rölesi ve topraklama durumu", sonuc: 'U' },
  { no: 7, tanim: "Elektrik motoru, redüktör, yağ sızıntısı, balata durumu", sonuc: 'U' },
  { no: 8, tanim: "Kabin altı çarpma takozları durumu", sonuc: 'U' },
  { no: 9, tanim: "Kabin içi aydınlatma durumu", sonuc: 'U' },
  { no: 10, tanim: "Kabin altı çarpma takozları durumu (Tekrar)", sonuc: 'U' },
  { no: 11, tanim: "Kabin üstüne çıkış merdiveni, kabin üstü korkulukların durumu", sonuc: 'U' },
  { no: 12, tanim: "*Taşıyıcının zemin-bina bağlantısı", sonuc: 'U' },
  { no: 13, tanim: "*Taşıyıcı Konstrüksiyonu", sonuc: 'U' },
  { no: 14, tanim: "Kumanda ve pano durumu (tuşlar, yönler vb.)", sonuc: 'U' },
  { no: 15, tanim: "*Yüksüz olarak hareket ve fren kontrolü", sonuc: 'U' },
  { no: 16, tanim: "*Tahrik mekanizması", sonuc: 'U' },
  { no: 17, tanim: "*Kremayer ve pinyon dişlilerin durumu", sonuc: 'U' },
  { no: 18, tanim: "*Kabin kapıları ve kabin hareket sınırlarındaki kapı sviçleri", sonuc: 'U' },
  { no: 19, tanim: "*Hareket sınırlayıcılar (alt ve üst sviçler)", sonuc: 'U' },
  { no: 20, tanim: "Hareket esnasında ki kablo durumu", sonuc: 'U' },
  { no: 21, tanim: "*Aşırı yük emniyetinin çalışması: Px (1-1,2)", sonuc: 'U' },
  { no: 22, tanim: "*Emniyet sistemi deneyi (P) (Paraşüt Testi)", sonuc: 'U' },
  { no: 23, tanim: "*İşlevsel Test (P): Kaldırma, indirme vd. hareketleri", sonuc: 'U' },
  { no: 24, tanim: "*Yük testleri sonunda İnşaat Asansörü kontrolü", sonuc: 'U' },
  { no: 25, tanim: "*Kabin yük altında bekletilerek kaçak kontrolü", sonuc: 'U' },
];

export const ReportWizard: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<ReportData>({
    technicalSpecs: {
      marka: '', seriNo: '', azamiYukseklik: '', tipiModel: '',
      kaldirmaMekanizmasi: '', kontrolNedeni: '', imalTarihi: '',
      kabinOlculeri: '', kapasite: '', tseCe: '', sutunOlculeri: '',
      beyanKapasitesi: ''
    },
    devices: [{ kodAd: '', seriNo: '', kalibrasyonTarihi: '' }],
    controls: initialControls,
    photos: []
  });

  const reportRef = useRef<HTMLDivElement>(null);

  const nextStep = () => setStep(s => Math.min(s + 1, 5));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleTechChange = (field: keyof ReportData['technicalSpecs'], value: string) => {
    setData(prev => ({
      ...prev,
      technicalSpecs: { ...prev.technicalSpecs, [field]: value }
    }));
  };

  const handleDeviceChange = (index: number, field: keyof Device, value: string) => {
    const newDevices = [...data.devices];
    newDevices[index] = { ...newDevices[index], [field]: value };
    setData(prev => ({ ...prev, devices: newDevices }));
  };

  const addDevice = () => {
    setData(prev => ({
      ...prev,
      devices: [...prev.devices, { kodAd: '', seriNo: '', kalibrasyonTarihi: '' }]
    }));
  };

  const removeDevice = (index: number) => {
    setData(prev => ({
      ...prev,
      devices: prev.devices.filter((_, i) => i !== index)
    }));
  };

  const handleControlChange = (index: number, sonuc: 'U' | 'UD' | 'NA') => {
    const newControls = [...data.controls];
    newControls[index] = { ...newControls[index], sonuc };
    setData(prev => ({ ...prev, controls: newControls }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setData(prev => ({
            ...prev,
            photos: [...prev.photos, reader.result as string]
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removePhoto = (index: number) => {
    setData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const saveReport = () => {
    const savedReports = JSON.parse(localStorage.getItem('periyodik_reports') || '[]');
    const newReport = {
      id: Date.now(),
      date: new Date().toLocaleDateString('tr-TR'),
      marka: data.technicalSpecs.marka,
      seriNo: data.technicalSpecs.seriNo,
      type: 'İnşaat Asansörü'
    };
    localStorage.setItem('periyodik_reports', JSON.stringify([newReport, ...savedReports]));
  };

  const exportHTML = () => {
    saveReport();
    const element = reportRef.current;
    if (!element) return;
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Periyodik Kontrol Raporu</title>
          <style>
            body { font-family: sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #000; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #f2f2f2; }
            .header { text-align: center; margin-bottom: 30px; }
          </style>
        </head>
        <body>
          ${element.innerHTML}
        </body>
      </html>
    `;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapor-${data.technicalSpecs.seriNo || 'taslak'}.html`;
    a.click();
  };

  const exportPDF = () => {
    saveReport();
    const element = reportRef.current;
    if (!element) return;
    const opt = {
      margin: 10,
      filename: `rapor-${data.technicalSpecs.seriNo || 'taslak'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-6 sm:pt-20 pb-10">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-primary-600 transition-colors self-start">
            <ArrowLeft className="w-5 h-5" /> Geri Dön
          </button>
          <div className="flex gap-1 sm:gap-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div 
                key={i} 
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base transition-all ${
                  step === i ? 'bg-primary-600 text-white scale-110' : 
                  step > i ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500'
                }`}
              >
                {step > i ? <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" /> : i}
              </div>
            ))}
          </div>
        </div>

        {/* Form Steps */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-8 mb-8 border border-slate-100">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6 text-center sm:text-left">1. Teknik Özellikler</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Marka/Yapımcı', field: 'marka' },
                    { label: 'Seri No', field: 'seriNo' },
                    { label: 'Azami Yükseklik (m)', field: 'azamiYukseklik' },
                    { label: 'Tipi/Model', field: 'tipiModel' },
                    { label: 'Kaldırma Mekanizması', field: 'kaldirmaMekanizmasi' },
                    { label: 'Kontrol Nedeni', field: 'kontrolNedeni' },
                    { label: 'İmal Tarihi', field: 'imalTarihi' },
                    { label: 'Kabin Ölçüleri (E*B*Y-m)', field: 'kabinOlculeri' },
                    { label: 'Kapasite', field: 'kapasite' },
                    { label: 'TSE/CE', field: 'tseCe' },
                    { label: 'Sütun Ölçüleri (E*B*Y-m)', field: 'sutunOlculeri' },
                    { label: 'Beyan Kapasitesi (P)', field: 'beyanKapasitesi' },
                  ].map((item) => (
                    <div key={item.field}>
                      <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">{item.label}</label>
                      <input 
                        type="text" 
                        value={(data.technicalSpecs as any)[item.field]}
                        onChange={(e) => handleTechChange(item.field as any, e.target.value)}
                        className="w-full px-4 py-2 sm:py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900">2. Kullanılan Cihazlar</h2>
                  <button 
                    onClick={addDevice}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary-50 text-primary-600 px-4 py-3 rounded-xl font-bold hover:bg-primary-100 transition-all"
                  >
                    <Plus className="w-5 h-5" /> Cihaz Ekle
                  </button>
                </div>
                <div className="space-y-4">
                  {data.devices.map((device, idx) => (
                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 border border-slate-100 rounded-2xl relative bg-slate-50/50">
                      <button 
                        onClick={() => removeDevice(idx)}
                        className="absolute -top-2 -right-2 bg-white border border-red-100 text-red-600 p-1.5 rounded-full shadow-sm hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Cihaz Kodu / Adı</label>
                        <input 
                          type="text" 
                          value={device.kodAd}
                          onChange={(e) => handleDeviceChange(idx, 'kodAd', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none bg-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Seri No</label>
                        <input 
                          type="text" 
                          value={device.seriNo}
                          onChange={(e) => handleDeviceChange(idx, 'seriNo', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none bg-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Kalibrasyon Tarihi</label>
                        <input 
                          type="text" 
                          value={device.kalibrasyonTarihi}
                          onChange={(e) => handleDeviceChange(idx, 'kalibrasyonTarihi', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none bg-white text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6">3. Tespit ve Değerlendirmeler</h2>
                <div className="space-y-3 max-h-[50vh] sm:max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {data.controls.map((control, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-slate-50 bg-slate-50/30 rounded-xl gap-3">
                      <div className="flex gap-3 items-start">
                        <span className="font-bold text-primary-600 bg-primary-50 w-7 h-7 flex items-center justify-center rounded-lg text-xs flex-shrink-0">{control.no}</span>
                        <span className="text-sm text-slate-700 font-medium leading-tight pt-1">{control.tanim}</span>
                      </div>
                      <div className="flex gap-2 self-end sm:self-center">
                        {['U', 'UD', 'NA'].map((res) => (
                          <button
                            key={res}
                            onClick={() => handleControlChange(idx, res as any)}
                            className={`w-10 h-10 sm:w-12 sm:h-8 rounded-lg text-xs font-bold transition-all border ${
                              control.sonuc === res 
                                ? res === 'U' ? 'bg-green-500 text-white border-green-500' : res === 'UD' ? 'bg-red-500 text-white border-red-500' : 'bg-slate-500 text-white border-slate-500'
                                : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {res}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-[10px] sm:text-xs text-slate-400 text-center sm:text-left">U: Uygun, UD: Uygun Değil, NA: Özellik Yok</p>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div 
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6 text-center sm:text-left">4. Fotoğraflar</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6">
                  {data.photos.map((photo, idx) => (
                    <div key={idx} className="relative aspect-video rounded-xl overflow-hidden group shadow-sm">
                      <img src={photo} alt="Control" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => removePhoto(idx)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <label className="aspect-video border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-primary-300 transition-all bg-slate-50/50">
                    <Camera className="w-8 h-8 text-slate-400 mb-1" />
                    <span className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">Fotoğraf Çek / Ekle</span>
                    <input type="file" multiple accept="image/*" capture="environment" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div 
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center py-6 sm:py-10"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">Rapor Hazır!</h2>
                <p className="text-sm sm:text-base text-slate-600 mb-10 max-w-md mx-auto px-4">
                  Tüm bilgileri doldurdunuz. Raporu HTML veya PDF formatında indirebilir ve sisteme kaydedebilirsiniz.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4 px-4">
                  <button 
                    onClick={exportHTML}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border-2 border-primary-600 text-primary-600 px-8 py-4 rounded-2xl font-bold hover:bg-primary-50 transition-all shadow-md"
                  >
                    <Download className="w-5 h-5" /> HTML İndir
                  </button>
                  <button 
                    onClick={exportPDF}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-primary-700 transition-all shadow-lg"
                  >
                    <FileText className="w-5 h-5" /> PDF Kaydet/İndir
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        {step < 5 && (
          <div className="flex justify-between gap-4">
            <button 
              onClick={prevStep}
              disabled={step === 1}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold transition-all ${
                step === 1 ? 'opacity-0 cursor-default' : 'bg-white text-slate-600 hover:bg-slate-100 shadow-sm border border-slate-200'
              }`}
            >
              <ChevronLeft className="w-5 h-5" /> Geri
            </button>
            <button 
              onClick={nextStep}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary-600 text-white px-10 py-4 rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg"
            >
              {step === 4 ? 'Bitir' : 'İleri'} <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Hidden Report Template for Export */}
      <div className="hidden">
        <div ref={reportRef} id="report-template" style={{ width: '210mm', padding: '15mm', backgroundColor: 'white' }}>
          <div style={{ border: '2px solid #000', padding: '10px' }}>
            <h1 style={{ textAlign: 'center', fontSize: '18pt', marginBottom: '20px', textTransform: 'uppercase' }}>Periyodik Kontrol Raporu</h1>
            
            <h2 style={{ fontSize: '14pt', borderBottom: '1px solid #000', paddingBottom: '5px' }}>2. TEKNİK ÖZELLİKLER</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
              <tbody>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '5px', fontWeight: 'bold', width: '25%' }}>Marka/Yapımcı</td>
                  <td style={{ border: '1px solid #000', padding: '5px', width: '25%' }}>{data.technicalSpecs.marka}</td>
                  <td style={{ border: '1px solid #000', padding: '5px', fontWeight: 'bold', width: '25%' }}>Seri No</td>
                  <td style={{ border: '1px solid #000', padding: '5px', width: '25%' }}>{data.technicalSpecs.seriNo}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '5px', fontWeight: 'bold' }}>Tipi/Model</td>
                  <td style={{ border: '1px solid #000', padding: '5px' }}>{data.technicalSpecs.tipiModel}</td>
                  <td style={{ border: '1px solid #000', padding: '5px', fontWeight: 'bold' }}>Azami Yükseklik (m)</td>
                  <td style={{ border: '1px solid #000', padding: '5px' }}>{data.technicalSpecs.azamiYukseklik}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '5px', fontWeight: 'bold' }}>İmal Tarihi</td>
                  <td style={{ border: '1px solid #000', padding: '5px' }}>{data.technicalSpecs.imalTarihi}</td>
                  <td style={{ border: '1px solid #000', padding: '5px', fontWeight: 'bold' }}>Kapasite</td>
                  <td style={{ border: '1px solid #000', padding: '5px' }}>{data.technicalSpecs.kapasite}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '5px', fontWeight: 'bold' }}>Kabin Ölçüleri</td>
                  <td style={{ border: '1px solid #000', padding: '5px' }}>{data.technicalSpecs.kabinOlculeri}</td>
                  <td style={{ border: '1px solid #000', padding: '5px', fontWeight: 'bold' }}>Beyan Kapasitesi (P)</td>
                  <td style={{ border: '1px solid #000', padding: '5px' }}>{data.technicalSpecs.beyanKapasitesi}</td>
                </tr>
              </tbody>
            </table>

            <h2 style={{ fontSize: '14pt', borderBottom: '1px solid #000', paddingBottom: '5px' }}>KULLANILAN CİHAZLAR</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f2f2f2' }}>
                  <th style={{ border: '1px solid #000', padding: '5px' }}>Cihaz Kodu / Adı</th>
                  <th style={{ border: '1px solid #000', padding: '5px' }}>Seri No</th>
                  <th style={{ border: '1px solid #000', padding: '5px' }}>Kalibrasyon Tarihi</th>
                </tr>
              </thead>
              <tbody>
                {data.devices.map((d, i) => (
                  <tr key={i}>
                    <td style={{ border: '1px solid #000', padding: '5px' }}>{d.kodAd}</td>
                    <td style={{ border: '1px solid #000', padding: '5px' }}>{d.seriNo}</td>
                    <td style={{ border: '1px solid #000', padding: '5px' }}>{d.kalibrasyonTarihi}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h2 style={{ fontSize: '14pt', borderBottom: '1px solid #000', paddingBottom: '5px' }}>3. TESPİT VE DEĞERLENDİRMELER</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f2f2f2' }}>
                  <th style={{ border: '1px solid #000', padding: '5px', width: '10%' }}>No</th>
                  <th style={{ border: '1px solid #000', padding: '5px', width: '70%' }}>GENEL KONTROLLER</th>
                  <th style={{ border: '1px solid #000', padding: '5px', width: '20%' }}>Sonuç</th>
                </tr>
              </thead>
              <tbody>
                {data.controls.map((c, i) => (
                  <tr key={i}>
                    <td style={{ border: '1px solid #000', padding: '5px', textAlign: 'center' }}>{c.no}</td>
                    <td style={{ border: '1px solid #000', padding: '5px' }}>{c.tanim}</td>
                    <td style={{ border: '1px solid #000', padding: '5px', textAlign: 'center', fontWeight: 'bold' }}>{c.sonuc}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h2 style={{ fontSize: '14pt', borderBottom: '1px solid #000', paddingBottom: '5px' }}>FOTOĞRAFLAR</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {data.photos.map((p, i) => (
                <img key={i} src={p} alt="Control" style={{ width: '100%', border: '1px solid #000', marginBottom: '10px' }} />
              ))}
            </div>

            <div style={{ marginTop: '30px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px' }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: 'bold' }}>Kontrol Eden Mühendis</p>
                <div style={{ height: '60px' }}></div>
                <p>Ad Soyad / İmza</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: 'bold' }}>Firma Yetkilisi</p>
                <div style={{ height: '60px' }}></div>
                <p>Kaşe / İmza</p>
              </div>
            </div>

            <div style={{ marginTop: '20px', fontSize: '10pt', color: '#666', borderTop: '1px solid #eee', paddingTop: '10px' }}>
              Kısaltmalar: U: Uygun, UD: Uygun Değil, NA: Özellik Yok
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
