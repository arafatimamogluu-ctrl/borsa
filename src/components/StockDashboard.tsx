import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  Target, 
  Shield, 
  Clock, 
  BarChart3, 
  ArrowRight,
  RefreshCw,
  Search
} from 'lucide-react';
import { motion } from 'framer-motion';

interface StockAnalysis {
  symbol: string;
  currentPrice: number;
  changePercent: number;
  rsi: number;
  score: number;
  confidence: number;
  potentialProfit: number;
  expectedDays: number;
  recommendation: 'BUY' | 'HOLD' | 'SELL' | 'STRONG_BUY';
  targets: {
    entry: number;
    target1: number;
    target2: number;
    stopLoss: number;
  };
  reasoning: string[];
}

export const StockDashboard: React.FC = () => {
  const [results, setResults] = useState<StockAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchResults = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/analysis');
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error fetching analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeNow = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/analyze-now', { method: 'POST' });
      const data = await response.json();
      setResults(data.results);
    } catch (error) {
      console.error('Error triggering analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const filteredResults = results.filter(s => 
    s.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">BIST Hisse Analiz & Seçim Sistemi</h1>
            <p className="text-gray-600">Yapay zeka destekli teknik analiz ve günlük seçimler</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={fetchResults}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Yenile
            </button>
            <button 
              onClick={analyzeNow}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              <BarChart3 className="w-4 h-4" />
              Şimdi Analiz Et
            </button>
          </div>
        </header>

        {/* Search and Filter */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text"
            placeholder="Hisse kodu ara (örn: THYAO)..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading && results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-gray-600">Hisseler analiz ediliyor, lütfen bekleyin...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Best Pick - First item */}
            {filteredResults.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="lg:col-span-2 bg-gradient-to-br from-primary-900 to-primary-800 rounded-2xl p-8 text-white shadow-xl overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 p-6 opacity-10">
                  <TrendingUp className="w-48 h-48" />
                </div>
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="bg-primary-700/50 text-primary-100 px-3 py-1 rounded-full text-sm font-medium mb-2 inline-block">
                        GÜNÜN SEÇİMİ
                      </span>
                      <h2 className="text-5xl font-bold">{filteredResults[0].symbol}</h2>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-green-400">%{filteredResults[0].potentialProfit.toFixed(2)}</div>
                      <div className="text-sm text-primary-200">Tahmini Getiri</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white/10 rounded-xl p-4">
                      <div className="text-primary-200 text-sm mb-1">Güncel Fiyat</div>
                      <div className="text-2xl font-bold">{filteredResults[0].currentPrice.toFixed(2)} ₺</div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                      <div className="text-primary-200 text-sm mb-1">Güven Oranı</div>
                      <div className="text-2xl font-bold">%{filteredResults[0].confidence}</div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                      <div className="text-primary-200 text-sm mb-1">Hedef Süre</div>
                      <div className="text-2xl font-bold">{filteredResults[0].expectedDays} Gün</div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                      <div className="text-primary-200 text-sm mb-1">RSI Değeri</div>
                      <div className="text-2xl font-bold">{filteredResults[0].rsi.toFixed(1)}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Target className="w-5 h-5 text-green-400" />
                        İşlem Seviyeleri
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                          <span>Giriş Seviyesi:</span>
                          <span className="font-bold">{filteredResults[0].targets.entry.toFixed(2)} ₺</span>
                        </div>
                        <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg border-l-4 border-green-500">
                          <span>Hedef 1:</span>
                          <span className="font-bold text-green-400">{filteredResults[0].targets.target1.toFixed(2)} ₺</span>
                        </div>
                        <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg border-l-4 border-red-500">
                          <span>Stop-Loss:</span>
                          <span className="font-bold text-red-400">{filteredResults[0].targets.stopLoss.toFixed(2)} ₺</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-primary-200" />
                        Seçim Gerekçeleri
                      </h3>
                      <ul className="space-y-2">
                        {filteredResults[0].reasoning.map((r, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-primary-100">
                            <ArrowRight className="w-4 h-4 mt-0.5 shrink-0" />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* List of other stocks */}
            {filteredResults.slice(1).map((stock, index) => (
              <motion.div 
                key={stock.symbol}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{stock.symbol}</h3>
                    <div className={`text-sm font-medium ${stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary-600">%{stock.potentialProfit.toFixed(1)}</div>
                    <div className="text-xs text-gray-500">Potansiyel</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <div className="text-[10px] text-gray-500 uppercase">Fiyat</div>
                    <div className="text-sm font-bold">{stock.currentPrice.toFixed(2)}</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <div className="text-[10px] text-gray-500 uppercase">Güven</div>
                    <div className="text-sm font-bold">%{stock.confidence}</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <div className="text-[10px] text-gray-500 uppercase">Süre</div>
                    <div className="text-sm font-bold">{stock.expectedDays}G</div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs text-gray-600 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Stop: {stock.targets.stopLoss.toFixed(2)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    Hedef: {stock.targets.target1.toFixed(2)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
