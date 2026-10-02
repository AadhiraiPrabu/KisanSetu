import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  Sparkles, 
  Award, 
  ArrowUpRight, 
  RefreshCw, 
  ShieldCheck, 
  Mic, 
  ChevronRight,
  Info,
  SlidersHorizontal
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar 
} from 'recharts';
import { CommodityPrice, LanguageCode, QualityGrade } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { api } from '../services/api';

interface MandiPriceExplorerProps {
  currentLang: LanguageCode;
  onSelectCommodityForMatch: (commodity: CommodityPrice) => void;
  onOpenVoiceAssistant: () => void;
}

export const MandiPriceExplorer: React.FC<MandiPriceExplorerProps> = ({
  currentLang,
  onSelectCommodityForMatch,
  onOpenVoiceAssistant,
}) => {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const [prices, setPrices] = useState<CommodityPrice[]>([]);
  const [selectedCommodity, setSelectedCommodity] = useState<CommodityPrice | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedState, setSelectedState] = useState('All');
  const [selectedGrade, setSelectedGrade] = useState('All');
  const [selectedSeason, setSelectedSeason] = useState('All');

  const fetchPrices = async () => {
    setIsLoading(true);
    try {
      const res = await api.getMandiPrices({
        search: searchQuery || undefined,
        state: selectedState !== 'All' ? selectedState : undefined,
        grade: selectedGrade !== 'All' ? selectedGrade : undefined,
        season: selectedSeason !== 'All' ? selectedSeason : undefined,
      });
      setPrices(res.data);
      if (res.data.length > 0 && !selectedCommodity) {
        setSelectedCommodity(res.data[0]);
      } else if (res.data.length > 0 && selectedCommodity) {
        const found = res.data.find((p) => p.id === selectedCommodity.id);
        setSelectedCommodity(found || res.data[0]);
      }
    } catch (err) {
      console.error('Error fetching prices:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, [selectedState, selectedGrade, selectedSeason]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPrices();
  };

  // Unique lists for filter dropdowns
  const states = ['All', 'Punjab', 'Haryana', 'Madhya Pradesh', 'Gujarat', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh', 'Rajasthan'];
  const categories = ['All', 'Cereals', 'Oilseeds', 'Vegetables', 'Fruits', 'Spices', 'Cash Crops'];
  const grades: QualityGrade[] = ['A+', 'A', 'B', 'C', 'Organic', 'Export'];
  const seasons = ['All', 'Kharif', 'Rabi', 'Zaid', 'Year-round'];

  const filteredPrices = prices.filter((p) => {
    if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Market Intelligence Summary */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 rounded-2xl p-5 sm:p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 bg-emerald-950/40 text-emerald-200 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Real-Time Mandi Aggregator & ML Price Prediction</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {t.mandiPrices} & {t.priceTrends}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
              Transparent wholesale mandi prices across APMCs aggregated with machine learning 7-day price forecasts, arrival volumes, and direct farm-gate buyer net gain calculations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenVoiceAssistant}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95"
            >
              <Mic className="w-4 h-4 text-emerald-700" />
              <span>Speak to Check Mandi</span>
            </button>
            <button
              onClick={fetchPrices}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-900 text-white text-xs font-semibold border border-emerald-500/40 transition-colors cursor-pointer"
              title="Refresh prices"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-2.5">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full bg-stone-50 hover:bg-white focus:bg-white text-stone-900 text-xs sm:text-sm font-medium border border-stone-300 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            Search Mandis
          </button>
        </form>

        {/* Multi-Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-stone-100">
          
          {/* Category Filter */}
          <div>
            <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-stone-50 text-stone-800 text-xs font-semibold border border-stone-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* State Filter */}
          <div>
            <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
              {t.filterByState}
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full bg-stone-50 text-stone-800 text-xs font-semibold border border-stone-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              {states.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Quality Grade Filter */}
          <div>
            <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
              {t.filterByGrade}
            </label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full bg-stone-50 text-stone-800 text-xs font-semibold border border-stone-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="All">{t.allGrades}</option>
              {grades.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Season Filter */}
          <div>
            <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
              {t.filterBySeason}
            </label>
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="w-full bg-stone-50 text-stone-800 text-xs font-semibold border border-stone-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              {seasons.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Main Grid: Left Mandi List, Right Detailed Intelligence Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Commodity Price Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Live Mandis ({filteredPrices.length})
            </span>
            <span className="text-xs text-stone-400">Click to view forecast</span>
          </div>

          <div className="space-y-2.5 max-h-[720px] overflow-y-auto pr-1">
            {filteredPrices.map((item) => {
              const isSelected = selectedCommodity?.id === item.id;
              const isRising = item.priceChange > 0;
              const isFalling = item.priceChange < 0;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedCommodity(item)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50/80 border-emerald-600 shadow-md ring-1 ring-emerald-600/30'
                      : 'bg-white hover:bg-stone-50 border-stone-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-sm sm:text-base text-stone-900">
                          {item.commodity}
                        </h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200">
                          Grade {item.grade}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-stone-500 mt-1">
                        <span className="flex items-center gap-1 font-medium text-stone-700">
                          <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                          {item.mandi}, {item.state}
                        </span>
                        <span>•</span>
                        <span>{item.variety}</span>
                      </div>
                    </div>

                    {/* Price and Trend Badge */}
                    <div className="text-right shrink-0">
                      <div className="font-extrabold text-base sm:text-lg text-emerald-900">
                        ₹{item.modalPrice.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-stone-400 font-medium">per Quintal</div>
                      <div
                        className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded-md mt-1 ${
                          isRising
                            ? 'bg-emerald-100 text-emerald-800'
                            : isFalling
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {isRising && <TrendingUp className="w-3 h-3" />}
                        {isFalling && <TrendingDown className="w-3 h-3" />}
                        {!isRising && !isFalling && <Minus className="w-3 h-3" />}
                        <span>{item.priceChange > 0 ? `+${item.priceChange}%` : `${item.priceChange}%`}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-stone-200/60 flex items-center justify-between text-xs text-stone-600">
                    <span className="font-medium">
                      Arrivals: <strong className="text-stone-900">{item.arrivalsToday.toLocaleString()} Qtl</strong>
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                      Forecast: {item.forecastTrend.toUpperCase()}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}

            {filteredPrices.length === 0 && (
              <div className="bg-white rounded-2xl border border-dashed border-stone-300 p-8 text-center text-stone-500">
                <Info className="w-8 h-8 mx-auto text-stone-400 mb-2" />
                <p className="text-sm font-semibold">No mandis found matching selected filters.</p>
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSelectedState('All');
                    setSelectedGrade('All');
                    setSelectedSeason('All');
                    setSearchQuery('');
                    fetchPrices();
                  }}
                  className="mt-3 text-xs font-bold text-emerald-700 underline cursor-pointer"
                >
                  Reset all filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: In-depth Market Intelligence & Forecast Chart (7 cols) */}
        <div className="lg:col-span-7">
          {selectedCommodity ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-sm space-y-6">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {selectedCommodity.category} • {selectedCommodity.season} Crop
                    </span>
                    <span className="text-xs text-stone-400">{selectedCommodity.updatedAt}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 mt-1">
                    {selectedCommodity.commodity}
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-600 flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span>{selectedCommodity.mandi} (District {selectedCommodity.district}, {selectedCommodity.state})</span>
                  </p>
                </div>

                <div className="text-left sm:text-right bg-stone-50 p-3 rounded-xl border border-stone-200">
                  <div className="text-xs text-stone-500 font-medium">Current Modal Price</div>
                  <div className="text-2xl font-extrabold text-emerald-800">
                    ₹{selectedCommodity.modalPrice.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] text-stone-500">
                    Range: ₹{selectedCommodity.minPrice} - ₹{selectedCommodity.maxPrice}
                  </div>
                </div>
              </div>

              {/* AI Best Selling Window & Machine Learning Forecast Box */}
              <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>AI Machine Learning Sale Window Recommendation</span>
                  </div>
                  <span className="text-[11px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                    {selectedCommodity.confidenceScore}% Confidence
                  </span>
                </div>

                <div className="bg-white/90 backdrop-blur-xs rounded-xl p-3.5 border border-amber-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                      {t.bestSaleWindow}
                    </div>
                    <div className="text-sm font-extrabold text-stone-900">
                      {selectedCommodity.bestSellingWindow}
                    </div>
                  </div>

                  <div className="bg-emerald-50 text-emerald-900 border border-emerald-200 px-3.5 py-2 rounded-xl text-right shrink-0">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                      Predicted Next Week
                    </div>
                    <div className="text-base font-extrabold">
                      ₹{selectedCommodity.predictedPriceNextWeek.toLocaleString('en-IN')} / Qtl
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Trend Chart (Recharts) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    7-Day Price Trajectory & Volume (Quintals)
                  </h4>
                  <span className="text-[11px] text-stone-400">AGMARKNET Verified Feed</span>
                </div>

                <div className="h-64 w-full bg-stone-50 rounded-xl p-2 border border-stone-200">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={selectedCommodity.priceHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#78716c' }} />
                      <YAxis domain={['dataMin - 100', 'dataMax + 100']} tick={{ fontSize: 11, fill: '#78716c' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1c1917',
                          borderRadius: '8px',
                          border: 'none',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                        formatter={(val: any) => [`₹${val} / Qtl`, 'Modal Price']}
                      />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke="#059669"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#059669' }}
                        activeDot={{ r: 6, fill: '#047857' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Zero-Middleman Direct Trade Linkage Callout */}
              <div className="bg-stone-900 text-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-white/10 px-2 py-0.5 rounded-md">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>0% Middleman Brokerage</span>
                  </div>
                  <h4 className="font-extrabold text-base text-white">
                    Sell {selectedCommodity.commodity} to Direct Verified Buyers
                  </h4>
                  <p className="text-xs text-stone-300 max-w-md">
                    Skip 4.5% local mandi broker commission and get direct bids from retail chains, FMCG, and export houses.
                  </p>
                </div>

                <button
                  id="mandi-match-btn"
                  onClick={() => onSelectCommodityForMatch(selectedCommodity)}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-stone-950 font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer shrink-0 hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <span>Run Smart Matchmaker</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-stone-400">
              Select a commodity from the left to explore price forecasts.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
