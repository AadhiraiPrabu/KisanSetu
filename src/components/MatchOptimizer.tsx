import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  TrendingUp, 
  ShieldCheck, 
  Truck, 
  DollarSign, 
  Percent, 
  CheckCircle2, 
  Star, 
  ChevronRight,
  Phone,
  RefreshCw,
  Building2,
  Lock,
  Layers
} from 'lucide-react';
import { LanguageCode, MatchRecommendation, QualityGrade, CommodityPrice, BuyerRequirement } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { api } from '../services/api';
import confetti from 'canvas-confetti';

interface MatchOptimizerProps {
  currentLang: LanguageCode;
  initialCommodity?: CommodityPrice | null;
  onConnectBuyer: (buyer: BuyerRequirement, calculation: MatchRecommendation) => void;
}

export const MatchOptimizer: React.FC<MatchOptimizerProps> = ({
  currentLang,
  initialCommodity,
  onConnectBuyer,
}) => {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  // Form State
  const [commodity, setCommodity] = useState(initialCommodity?.commodity || 'Wheat (गेहूं / கோதுமை)');
  const [quantityQuintals, setQuantityQuintals] = useState<number>(100);
  const [qualityGrade, setQualityGrade] = useState<QualityGrade>('A+');
  const [farmerState, setFarmerState] = useState(initialCommodity?.state || 'Madhya Pradesh');
  const [farmerDistrict, setFarmerDistrict] = useState(initialCommodity?.district || 'Hoshangabad');
  const [expectedPrice, setExpectedPrice] = useState<number>(initialCommodity?.modalPrice || 2600);

  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<MatchRecommendation[]>([]);
  const [localMandiGross, setLocalMandiGross] = useState<number>(2580);
  const [localMandiNet, setLocalMandiNet] = useState<number>(2385);

  const handleRunOptimization = async () => {
    setIsLoading(true);
    try {
      const res = await api.optimizeMatch({
        commodity,
        quantityQuintals,
        qualityGrade,
        farmerState,
        farmerDistrict,
        expectedPrice,
      });

      setRecommendations(res.recommendations);
      setLocalMandiGross(res.localMandiGrossModal);
      setLocalMandiNet(res.localMandiNetRealization);

      // Trigger celebratory confetti on high gain match
      if (res.recommendations.length > 0 && res.recommendations[0].gainOverMandiPercentage > 10) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      }
    } catch (err) {
      console.error('Error optimizing match:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleRunOptimization();
  }, [initialCommodity]);

  const topMatch = recommendations[0];

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-emerald-800 to-emerald-900 rounded-2xl p-5 sm:p-6 text-white shadow-lg">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 bg-black/25 text-amber-300 px-3 py-1 rounded-full text-xs font-bold border border-amber-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>OR-Tools Multi-Constraint Optimization Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {t.smartMatching} & Realization Calculator
            </h1>
            <p className="text-xs sm:text-sm text-teal-100 leading-relaxed">
              Calculates your net farm-gate profit by matching quality specifications, transport feasibility, and eliminating 4.5% middleman brokerage fees.
            </p>
          </div>

          <div className="bg-emerald-950/70 border border-emerald-400/40 p-4 rounded-xl text-center shrink-0">
            <div className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
              Average Farmer Boost
            </div>
            <div className="text-2xl font-black text-amber-300">
              +18% to +32%
            </div>
            <div className="text-[10px] text-emerald-200">
              vs Local APMC Mandi Cash Sale
            </div>
          </div>
        </div>
      </div>

      {/* Input Parameters Form Card */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
        <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-600" />
          Enter Your Harvest Parameters
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          
          {/* Commodity */}
          <div>
            <label className="text-xs font-bold text-stone-600 block mb-1">Commodity</label>
            <select
              value={commodity}
              onChange={(e) => setCommodity(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-xs font-semibold text-stone-900 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="Wheat (गेहूं / கோதுமை)">Wheat (गेहूं / கோதுமை)</option>
              <option value="Basmati Paddy (बासमती धान / பாஸ்மதி)">Basmati Paddy (बासमती धान / பாஸ்மதி)</option>
              <option value="Red Onion (प्याज / வெங்காயம்)">Red Onion (प्याज / வெங்காயம்)</option>
              <option value="Tomato (टमाटर / தக்காளி)">Tomato (टमाटर / தக்காளி)</option>
              <option value="Soybean (सोयाबीन / சோயாபீன்)">Soybean (सोयाबीन / சோயாபீன்)</option>
              <option value="Turmeric (हल्दी / மஞ்சள்)">Turmeric (हल्दी / மஞ்சள்)</option>
              <option value="Mustard Seed (सरसों / கடுகு)">Mustard Seed (सरसों / கடுகு)</option>
              <option value="Cotton (कपास / பருத்தி)">Cotton (कपास / பருத்தி)</option>
            </select>
          </div>

          {/* Quantity in Quintals */}
          <div>
            <label className="text-xs font-bold text-stone-600 block mb-1">Quantity (Quintals)</label>
            <input
              type="number"
              min={5}
              max={5000}
              value={quantityQuintals}
              onChange={(e) => setQuantityQuintals(Number(e.target.value))}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-xs font-semibold text-stone-900 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Quality Grade */}
          <div>
            <label className="text-xs font-bold text-stone-600 block mb-1">Quality Grade</label>
            <select
              value={qualityGrade}
              onChange={(e) => setQualityGrade(e.target.value as QualityGrade)}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-xs font-semibold text-stone-900 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="A+">Grade A+ (Premium / Export)</option>
              <option value="A">Grade A (Standard FAQ)</option>
              <option value="B">Grade B (Average Table)</option>
              <option value="Organic">Organic Certified</option>
              <option value="Export">Export Standard</option>
            </select>
          </div>

          {/* Location State */}
          <div>
            <label className="text-xs font-bold text-stone-600 block mb-1">Your State</label>
            <select
              value={farmerState}
              onChange={(e) => setFarmerState(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-xs font-semibold text-stone-900 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Punjab">Punjab</option>
              <option value="Haryana">Haryana</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Rajasthan">Rajasthan</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
            </select>
          </div>

          {/* Run Action Button */}
          <div className="flex items-end">
            <button
              id="btn-recalculate-match"
              onClick={handleRunOptimization}
              disabled={isLoading}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs p-2.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Calculate Matches</span>
            </button>
          </div>

        </div>
      </div>

      {/* Net Realization Comparison Hero Card */}
      {topMatch && (
        <div className="bg-white rounded-2xl border-2 border-emerald-500 p-5 sm:p-6 shadow-md relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            
            {/* Left: Direct Buyer Match Details */}
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="bg-emerald-100 text-emerald-800 text-[11px] font-extrabold px-2.5 py-0.5 rounded-md">
                  ★ TOP RECOMMENDED MATCH ({topMatch.matchScore}% Optimization Fit)
                </span>
                <span className="text-xs text-stone-500 font-medium">
                  {topMatch.buyerRequirement.buyerType.toUpperCase()} BUYER
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-stone-900">
                {topMatch.buyerRequirement.companyOrOrg}
              </h2>
              <p className="text-xs sm:text-sm text-stone-600">
                Buyer: <strong className="text-stone-900">{topMatch.buyerRequirement.buyerName}</strong> • Delivery: {topMatch.buyerRequirement.deliveryLocation.city}, {topMatch.buyerRequirement.deliveryLocation.state} ({topMatch.transportDistanceKm} km)
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-stone-700">
                <span className="inline-flex items-center gap-1 bg-stone-100 px-2.5 py-1 rounded-lg">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  {topMatch.buyerRequirement.paymentTerms}
                </span>
                <span className="inline-flex items-center gap-1 bg-stone-100 px-2.5 py-1 rounded-lg">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  {topMatch.buyerRequirement.rating} ({topMatch.buyerRequirement.reviewsCount} reviews)
                </span>
                <span className="inline-flex items-center gap-1 bg-stone-100 px-2.5 py-1 rounded-lg">
                  <Truck className="w-3.5 h-3.5 text-blue-600" />
                  {topMatch.suggestedTransportMode}
                </span>
              </div>
            </div>

            {/* Right: Price Math Breakdown vs Mandi */}
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 sm:p-5 w-full lg:w-auto shrink-0 space-y-3 min-w-[320px]">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200 text-xs">
                <span className="text-stone-500">Local Mandi Net Rate:</span>
                <span className="font-bold text-stone-700">₹{localMandiNet.toLocaleString()} / Qtl</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-stone-200 text-xs">
                <span className="text-stone-500">Direct Buyer Bid:</span>
                <span className="font-extrabold text-emerald-700">₹{topMatch.buyerRequirement.offeredPricePerQuintal.toLocaleString()} / Qtl</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-stone-200 text-xs">
                <span className="text-stone-500">Estimated Freight ({topMatch.transportDistanceKm} km):</span>
                <span className="text-rose-600 font-semibold">- ₹{Math.round(topMatch.estimatedTransportCost / quantityQuintals)} / Qtl</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-stone-200 text-xs text-emerald-800 font-bold bg-emerald-50 p-2 rounded-lg">
                <span>0% Brokerage & Cess Saved:</span>
                <span>+ ₹{Math.round(topMatch.mandiMiddlemanSavings / quantityQuintals)} / Qtl</span>
              </div>

              <div className="pt-1 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold text-stone-500 uppercase">Your Net Realization</div>
                  <div className="text-xl font-black text-emerald-800">
                    ₹{topMatch.netRealizationPerQuintal.toLocaleString()} <span className="text-xs text-stone-500 font-normal">/ Qtl</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] font-bold text-emerald-700 uppercase">Total Net Earnings</div>
                  <div className="text-xl font-black text-emerald-900">
                    ₹{topMatch.totalNetRealization.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              <div className="bg-amber-100 text-amber-900 px-3 py-1.5 rounded-xl text-xs font-extrabold text-center">
                ★ Extra +{topMatch.gainOverMandiPercentage}% Net Income over Local Mandi!
              </div>

              <button
                id="btn-connect-top-buyer"
                onClick={() => onConnectBuyer(topMatch.buyerRequirement, topMatch)}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-98"
              >
                <span>Accept Offer & Lock Escrow</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Additional Matches List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider px-1">
          Other Verified Buyer Matches ({recommendations.slice(1).length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.slice(1).map((rec, idx) => (
            <div
              key={rec.buyerRequirement.id}
              className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs hover:border-emerald-400 transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                    {rec.buyerRequirement.buyerType} • Match: {rec.matchScore}%
                  </span>
                  <div className="text-xs font-extrabold text-emerald-700">
                    +{rec.gainOverMandiPercentage}% vs Mandi
                  </div>
                </div>

                <h4 className="font-extrabold text-sm text-stone-900 mt-1.5">
                  {rec.buyerRequirement.companyOrOrg}
                </h4>
                <p className="text-xs text-stone-500 mt-0.5">
                  {rec.buyerRequirement.deliveryLocation.city}, {rec.buyerRequirement.deliveryLocation.state} • Grade {rec.buyerRequirement.requiredGrade}
                </p>
              </div>

              <div className="bg-stone-50 p-2.5 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-stone-400 text-[10px] block">Offered Rate</span>
                  <strong className="text-emerald-800 text-sm">₹{rec.buyerRequirement.offeredPricePerQuintal}/Qtl</strong>
                </div>
                <div>
                  <span className="text-stone-400 text-[10px] block">Net Realization</span>
                  <strong className="text-stone-900 text-sm">₹{rec.netRealizationPerQuintal}/Qtl</strong>
                </div>
                <div>
                  <span className="text-stone-400 text-[10px] block">Payment Terms</span>
                  <span className="text-stone-700 font-semibold">{rec.buyerRequirement.paymentTerms}</span>
                </div>
              </div>

              <button
                onClick={() => onConnectBuyer(rec.buyerRequirement, rec)}
                className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Connect with Buyer</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
