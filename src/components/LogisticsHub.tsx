import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Train, 
  Snowflake, 
  ShieldCheck, 
  MapPin, 
  Clock, 
  Star, 
  Phone, 
  ArrowRight, 
  CheckCircle2, 
  Percent,
  Calculator,
  X,
  Radio,
  Navigation
} from 'lucide-react';
import { LogisticsOption, LanguageCode } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { api } from '../services/api';

interface LogisticsHubProps {
  currentLang: LanguageCode;
  onNavigateToGps?: () => void;
}

export const LogisticsHub: React.FC<LogisticsHubProps> = ({ currentLang, onNavigateToGps }) => {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const [logisticsList, setLogisticsList] = useState<LogisticsOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Freight Calculator
  const [calcDistance, setCalcDistance] = useState<number>(320);
  const [calcWeight, setCalcWeight] = useState<number>(100);
  const [calcMode, setCalcMode] = useState<'train' | 'truck' | 'reefer'>('train');
  const [bookingSuccessModal, setBookingSuccessModal] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogistics = async () => {
      try {
        const res = await api.getLogisticsOptions();
        setLogisticsList(res.data);
      } catch (err) {
        console.error('Error fetching logistics:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogistics();
  }, []);

  // Freight calculation formula
  const baseRatePerKmQuintal = calcMode === 'train' ? 0.75 : calcMode === 'truck' ? 1.4 : 2.1;
  const rawFreight = calcDistance * calcWeight * baseRatePerKmQuintal;
  const subsidyPercent = calcMode === 'train' ? 50 : 0;
  const subsidyAmount = rawFreight * (subsidyPercent / 100);
  const netPayableFreight = rawFreight - subsidyAmount;
  const estHours = calcMode === 'train' ? Math.round(calcDistance / 55) + 4 : Math.round(calcDistance / 40);

  const handleBookLogistics = (providerName: string) => {
    setBookingSuccessModal(providerName);
  };

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-md border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 px-3 py-0.5 rounded-full text-xs font-bold border border-emerald-400/30">
              <Train className="w-3.5 h-3.5" />
              <span>Ministry of Food Processing 50% Kisan Rail Subsidy Enabled</span>
            </span>
            {onNavigateToGps && (
              <button
                id="btn-goto-gps-from-logistics"
                onClick={onNavigateToGps}
                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-0.5 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>{t.gpsTracking}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {t.logistics} & Farm-Gate Transport
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Book subsidized Indian Railways parcel wagons, Radheemena rural farm-gate pickups, and temperature-controlled cold reefers to eliminate perishable loss.
          </p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl text-center shrink-0">
          <div className="text-[11px] font-bold text-slate-400 uppercase">Kisan Rail Scheme</div>
          <div className="text-2xl font-black text-amber-300">50% OFF</div>
          <div className="text-[10px] text-slate-400">Standard Parcel Freight</div>
        </div>
      </div>

      {/* Interactive Freight & Subsidy Calculator */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-2">
          <Calculator className="w-4 h-4 text-blue-600" />
          Interactive Freight & Transit Estimator
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div>
            <label className="text-xs font-bold text-stone-600 block mb-1">Distance (km)</label>
            <input
              type="number"
              value={calcDistance}
              onChange={(e) => setCalcDistance(Number(e.target.value))}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-xs font-semibold text-stone-900 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-stone-600 block mb-1">Total Weight (Quintals)</label>
            <input
              type="number"
              value={calcWeight}
              onChange={(e) => setCalcWeight(Number(e.target.value))}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-xs font-semibold text-stone-900 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-stone-600 block mb-1">Transport Mode</label>
            <select
              value={calcMode}
              onChange={(e: any) => setCalcMode(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-xs font-semibold text-stone-900 focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="train">🚆 Kisan Rail (50% MOFPI Subsidy)</option>
              <option value="truck">🚛 Rural Mini Truck / Farm-Gate</option>
              <option value="reefer">❄️ Cold Chain Reefer (+4°C)</option>
            </select>
          </div>

          {/* Result Card */}
          <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3 flex flex-col justify-center">
            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-500">Gross Freight:</span>
              <span className="text-stone-700">₹{Math.round(rawFreight).toLocaleString('en-IN')}</span>
            </div>
            {subsidyAmount > 0 && (
              <div className="flex items-center justify-between text-xs text-emerald-700 font-bold">
                <span>50% Rail Subsidy:</span>
                <span>- ₹{Math.round(subsidyAmount).toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-xs pt-1 border-t border-blue-200 font-extrabold text-blue-950 mt-1">
              <span>Farmer Net Payable:</span>
              <span className="text-base text-blue-900">₹{Math.round(netPayableFreight).toLocaleString('en-IN')}</span>
            </div>
            <div className="text-[10px] text-stone-500 mt-0.5">Est. Transit: ~{estHours} hours</div>
          </div>
        </div>
      </div>

      {/* Logistics Providers Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {logisticsList.map((log) => {
          const isTrain = log.mode === 'train';
          const isReefer = log.mode === 'reefer';

          return (
            <div
              key={log.id}
              className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1 ${
                    isTrain
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : isReefer
                        ? 'bg-blue-100 text-blue-900 border border-blue-300'
                        : 'bg-stone-100 text-stone-800'
                  }`}>
                    {isTrain && <Train className="w-3 h-3" />}
                    {isReefer && <Snowflake className="w-3 h-3" />}
                    {!isTrain && !isReefer && <Truck className="w-3 h-3" />}
                    <span>{log.mode.toUpperCase()}</span>
                  </span>

                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    {log.rating}
                  </span>
                </div>

                <div>
                  <h3 className="font-black text-base text-stone-900 leading-tight">
                    {log.providerName}
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">{log.capacityTons} MT Capacity • {log.vehicleType}</p>
                </div>

                <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500">Rate per Km/Qtl:</span>
                    <strong className="text-stone-900">₹{log.ratePerKmPerQuintal}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500">Government Subsidy:</span>
                    <strong className="text-emerald-700">{log.subsidyPercentage}% Rebate</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500">Transit Duration:</span>
                    <span className="font-semibold text-stone-800">{log.transitDurationHours} hrs</span>
                  </div>
                  {log.temperatureControlled && (
                    <div className="text-[11px] text-blue-700 font-semibold flex items-center gap-1 pt-1 border-t border-stone-200">
                      <Snowflake className="w-3 h-3" />
                      <span>Cold Reefer Active (+4°C)</span>
                    </div>
                  )}
                </div>

                <div className="text-xs text-stone-600 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    <span>Route: {log.routesCovered.join(' ↔ ')}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-semibold text-stone-800">Transit Insurance Included</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleBookLogistics(log.providerName)}
                className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Book Transport Route</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Booking Success Modal */}
      {bookingSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 p-6 max-w-md w-full text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-stone-900">Logistics Booking Initiated</h3>
              <p className="text-xs text-stone-600 mt-1">
                Your transport request has been sent to <strong className="text-stone-900">{bookingSuccessModal}</strong>. The driver/station manager will contact your verified phone number with GPS pickup slot.
              </p>
            </div>

            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs text-stone-700 space-y-1 text-left">
              <div>• <strong>50% Subsidy Code:</strong> KISAN-RAIL-2026-SUB</div>
              <div>• <strong>Transit Insurance:</strong> Covered up to ₹5,00,000</div>
              <div>• <strong>Real-Time Tracking:</strong> Enabled via SMS Link</div>
            </div>

            <button
              onClick={() => setBookingSuccessModal(null)}
              className="w-full bg-stone-900 text-white font-bold text-xs py-2.5 rounded-xl hover:bg-stone-800 transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
