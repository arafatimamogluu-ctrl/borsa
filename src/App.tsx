import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Settings, 
  HardHat, 
  Zap, 
  Thermometer, 
  ClipboardCheck, 
  Users, 
  Clock, 
  Phone, 
  Mail, 
  MapPin, 
  ChevronRight,
  Menu,
  X,
  FileText,
  AlertTriangle,
  FilePlus,
  LogIn,
  LogOut,
  LayoutDashboard,
  PlusCircle,
  History,
  Smartphone,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ReportWizard } from './components/ReportWizard';
import { StockDashboard } from './components/StockDashboard';

const App: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [view, setView] = useState<'landing' | 'login' | 'dashboard' | 'wizard' | 'stock'>('landing');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{name: string} | null>(null);
  const [savedReports, setSavedReports] = useState<any[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('periyodik_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
      setView('dashboard');
    }
    
    const reports = JSON.parse(localStorage.getItem('periyodik_reports') || '[]');
    setSavedReports(reports);
  }, [view]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const userData = { name: 'Denetim Uzmanı' };
    localStorage.setItem('periyodik_user', JSON.stringify(userData));
    setUser(userData);
    setIsLoggedIn(true);
    setView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('periyodik_user');
    setIsLoggedIn(false);
    setUser(null);
    setView('landing');
  };

  const services = [
    {
      title: 'Kaldırma İletme Ekipmanları',
      description: 'Vinç, forklift, lift, platform ve sapanların periyodik kontrolleri.',
      icon: <Settings className="w-8 h-8 text-primary-600" />
    },
    {
      title: 'Basınçlı Kaplar',
      description: 'Kompresör, hava tankı, kazan ve otoklavların güvenli çalışma kontrolleri.',
      icon: <Zap className="w-8 h-8 text-primary-600" />
    },
    {
      title: 'Elektriksel Ölçümler',
      description: 'Topraklama, paratoner, iç tesisat ve pano kontrolleri.',
      icon: <HardHat className="w-8 h-8 text-primary-600" />
    },
    {
      title: 'İş Makineleri',
      description: 'Ekskavatör, loder, dozer ve diğer iş makinelerinin teknik muayeneleri.',
      icon: <AlertTriangle className="w-8 h-8 text-primary-600" />
    },
    {
      title: 'Yangın Tesisatı',
      description: 'Yangın söndürme sistemleri, pompalar ve hortumların periyodik testi.',
      icon: <Thermometer className="w-8 h-8 text-primary-600" />
    },
    {
      title: 'Havalandırma Tesisatı',
      description: 'Klima, havalandırma ve toz emme sistemlerinin verimlilik ölçümleri.',
      icon: <ClipboardCheck className="w-8 h-8 text-primary-600" />
    }
  ];

  if (view === 'wizard') {
    return <ReportWizard onBack={() => setView(isLoggedIn ? 'dashboard' : 'landing')} />;
  }

  if (view === 'stock') {
    return (
      <>
        <nav className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('landing')}>
                <ShieldCheck className="w-8 h-8 text-primary-600" />
                <span className="text-xl font-bold text-gray-900">PERİYODİK</span>
              </div>
              <button 
                onClick={() => setView(isLoggedIn ? 'dashboard' : 'landing')}
                className="text-gray-600 hover:text-primary-600 font-medium"
              >
                Geri Dön
              </button>
            </div>
          </div>
        </nav>
        <StockDashboard />
      </>
    );
  }

  if (view === 'login') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-100"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mb-4">
              <ShieldCheck className="w-10 h-10 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Sisteme Giriş Yap</h1>
            <p className="text-slate-500">Raporlama Paneline Erişin</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Kullanıcı Adı</label>
              <input type="text" defaultValue="admin" className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Şifre</label>
              <input type="password" defaultValue="123456" className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <button type="submit" className="w-full bg-primary-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-primary-700 transition-all shadow-lg flex items-center justify-center gap-2">
              <LogIn className="w-5 h-5" /> Giriş Yap
            </button>
          </form>
          <button onClick={() => setView('landing')} className="w-full mt-4 text-slate-500 font-medium hover:text-primary-600 text-center">Ana Sayfaya Dön</button>
        </motion.div>
      </div>
    );
  }

  if (view === 'dashboard') {
    return (
      <div className="min-h-screen bg-slate-50">
        <nav className="bg-white border-b border-slate-200 px-4 py-4 flex justify-between items-center sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-primary-600" />
            <span className="font-bold text-slate-900 hidden sm:inline">RAPOR<span className="text-primary-600">PANELİ</span></span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-600 hidden md:inline">Hoş geldin, {user?.name}</span>
            <button 
              onClick={() => setView('wizard')}
              className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              <PlusCircle className="w-5 h-5" />
              Yeni Rapor
            </button>
            <button 
              onClick={() => setView('stock')}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <TrendingUp className="w-5 h-5" />
              Hisse Analiz
            </button>
            <button onClick={handleLogout} className="text-red-500 p-2 hover:bg-red-50 rounded-lg transition-all">
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </nav>
        
        <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              onClick={() => setView('wizard')}
              className="bg-primary-600 p-8 rounded-3xl text-white shadow-lg cursor-pointer flex flex-col justify-between aspect-video md:aspect-auto"
            >
              <PlusCircle className="w-12 h-12 mb-4" />
              <div>
                <h2 className="text-2xl font-bold mb-2">Yeni Rapor Oluştur</h2>
                <p className="text-primary-100 text-sm">Hızlıca denetim kaydı başlatın</p>
              </div>
            </motion.div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <History className="w-12 h-12 text-slate-400 mb-4" />
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Geçmiş Raporlar</h2>
                <p className="text-slate-500 text-sm">Tamamlanmış denetimleri inceleyin</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <Smartphone className="w-12 h-12 text-slate-400 mb-4" />
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Mobil Senkronizasyon</h2>
                <p className="text-slate-500 text-sm">Telefonda çevrimdışı kullanım aktif</p>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Son İşlemler</h3>
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
              {savedReports.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {savedReports.map((report) => (
                    <div key={report.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                          <FileText className="w-6 h-6 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{report.type} - {report.marka}</p>
                          <p className="text-sm text-slate-500">Seri No: {report.seriNo} | Tarih: {report.date}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500">
                  Henüz kayıtlı bir rapor bulunmuyor. Yeni bir rapor oluşturarak başlayın.
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-10 h-10 text-primary-600" />
              <span className="text-2xl font-bold text-slate-900 tracking-tight">PERİYODİK<span className="text-primary-600">KONTROL</span></span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#home" className="text-slate-600 hover:text-primary-600 font-medium transition-colors">Ana Sayfa</a>
              <a href="#services" className="text-slate-600 hover:text-primary-600 font-medium transition-colors">Hizmetlerimiz</a>
              <a href="#about" className="text-slate-600 hover:text-primary-600 font-medium transition-colors">Hakkımızda</a>
              <button 
                onClick={() => setView('login')}
                className="bg-primary-600 text-white px-6 py-2 rounded-full font-medium hover:bg-primary-700 transition-all shadow-md flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" /> Giriş Yap
              </button>
            </div>

            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2">
                {isMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t"
            >
              <div className="px-4 py-6 space-y-4">
                <a href="#home" className="block text-slate-600 font-medium">Ana Sayfa</a>
                <a href="#services" className="block text-slate-600 font-medium">Hizmetlerimiz</a>
                <a href="#about" className="block text-slate-600 font-medium">Hakkımızda</a>
                <button 
                  onClick={() => setView('login')}
                  className="w-full block bg-primary-600 text-white px-6 py-2 rounded-lg text-center font-medium"
                >
                  Giriş Yap
                </button>
                <button 
                  onClick={() => setView('stock')}
                  className="w-full mt-2 flex items-center justify-center gap-2 text-primary-600 hover:bg-primary-50 px-6 py-2 rounded-lg font-medium transition-colors border border-primary-100"
                >
                  <TrendingUp className="w-5 h-5" />
                  Borsa Analiz
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 right-0 -z-10 w-1/2 h-full bg-primary-50/50 rounded-bl-[100px] hidden lg:block"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl lg:text-6xl font-extrabold text-slate-900 leading-tight">
                İş Güvenliğinde <br />
                <span className="text-primary-600">Dijital Raporlama</span> <br />
                Sistemi
              </h1>
              <p className="mt-6 text-lg text-slate-600 max-w-xl">
                Sahada anında rapor oluşturun, fotoğraflarınızı yükleyin ve yasal mevzuata uygun belgelerinizi saniyeler içinde indirin.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <button 
                  onClick={() => setView('login')}
                  className="bg-primary-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-primary-700 transition-all shadow-lg flex items-center gap-2"
                >
                  Sisteme Giriş Yap <ChevronRight className="w-5 h-5" />
                </button>
                <button className="border-2 border-slate-200 text-slate-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all">
                  Nasıl Çalışır?
                </button>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-square bg-gradient-to-tr from-primary-600 to-primary-400 rounded-3xl overflow-hidden shadow-2xl relative">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute top-10 right-10 bg-white/20 backdrop-blur-md p-6 rounded-2xl border border-white/30">
                  <Smartphone className="text-white w-10 h-10 mb-2" />
                  <p className="text-white font-bold text-xl">Mobil Uyumlu</p>
                  <p className="text-white/80 text-sm">Sahadan veri girişi</p>
                </div>
                <div className="absolute bottom-10 left-10 bg-white p-6 rounded-2xl shadow-xl">
                  <FileText className="w-8 h-8 text-primary-600 mb-2" />
                  <p className="text-slate-900 font-bold">PDF Raporlama</p>
                  <p className="text-slate-500 text-sm">Resmi formatta çıktı</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-base font-bold text-primary-600 tracking-wider uppercase">Sistem Özellikleri</h2>
            <p className="mt-2 text-3xl lg:text-4xl font-extrabold text-slate-900">
              Neden Dijital Raporlama?
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all border border-slate-100"
              >
                <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mb-6">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{service.title}</h3>
                <p className="text-slate-600 leading-relaxed">
                  {service.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <ShieldCheck className="w-8 h-8 text-primary-400" />
            <span className="text-xl font-bold">PERİYODİK<span className="text-primary-400">KONTROL</span></span>
          </div>
          <p className="text-slate-400 text-sm">© 2026 Tüm Hakları Saklıdır. Dijital Denetim Sistemi.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
