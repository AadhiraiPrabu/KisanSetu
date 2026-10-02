import React, { useState, useEffect } from 'react';
import { 
  Sprout, 
  Plus, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  Tag, 
  CheckCircle2, 
  Sparkles, 
  X, 
  Phone, 
  Building2, 
  RefreshCw,
  Layers,
  ArrowRight
} from 'lucide-react';
import { FarmerLot, LanguageCode, QualityGrade } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { api } from '../services/api';

interface FarmerLotListingProps {
  currentLang: LanguageCode;
  onLotSelect: (lot: FarmerLot) => void;
}

export const FarmerLotListing: React.FC<FarmerLotListingProps> = ({
  currentLang,
  onLotSelect,
}) => {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const [lots, setLots] = useState<FarmerLot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Lot Form
  const [farmerName, setFarmerName] = useState('Rameshwar Patidar');
  const [isFpo, setIsFpo] = useState(false);
  const [fpoName, setFpoName] = useState('');
  const [phone, setPhone] = useState('+91 98930 44556');
  const [commodity, setCommodity] = useState('Wheat (गेहूं / கோதுமை)');
  const [variety, setVariety] = useState('Sharbati Premium Gold');
  const [quantity, setQuantity] = useState(120);
  const [expectedPrice, setExpectedPrice] = useState(2650);
  const [grade, setGrade] = useState<QualityGrade>('A+');
  const [moisture, setMoisture] = useState(10.8);
  const [village, setVillage] = useState('Pipariya');
  const [district, setDistrict] = useState('Hoshangabad');
  const [state, setState] = useState('Madhya Pradesh');
  const [storageType, setStorageType] = useState<'farm_gate' | 'warehouse' | 'cold_storage'>('farm_gate');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchLots = async () => {
    setIsLoading(true);
    try {
      const res = await api.getFarmerLots();
      setLots(res.data);
    } catch (err) {
      console.error('Error loading lots:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLots();
  }, []);

  const handleCreateLot = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await api.postFarmerLot({
        farmerId: `f-${Date.now()}`,
        farmerName,
        farmerPhone: phone,
        isPhoneVerified: true,
        village,
        district,
        state,
        commodity,
        variety,
        quantityQuintals: quantity,
        qualityGrade: grade,
        moisturePercentage: moisture,
        foreignMatterPercentage: 0.4,
        expectedPricePerQuintal: expectedPrice,
        minAcceptablePrice: expectedPrice - 150,
        harvestDate: new Date().toISOString().split('T')[0],
        availableFrom: 'Ready for Dispatch',
        storageType: storageType === 'warehouse' ? 'Warehouse' : storageType === 'cold_storage' ? 'Cold Storage' : 'Farm Gate',
        status: 'active',
        fpoAffiliated: isFpo ? fpoName : undefined,
      });

      setIsModalOpen(false);
      fetchLots();
    } catch (err) {
      console.error('Failed to post lot:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-stone-900 rounded-2xl p-5 sm:p-6 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 px-3 py-0.5 rounded-full text-xs font-bold border border-emerald-400/30">
            <Sprout className="w-3.5 h-3.5" />
            <span>Farm Gate Lot Aggregation & Grading</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {t.farmerLots} & Quality Lots
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100">
            List your harvest lot with verified moisture % and quality grading to receive instant bids from verified buyers with 0% brokerage.
          </p>
        </div>

        <button
          id="btn-open-create-lot"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold text-xs shadow-md transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Harvest Lot</span>
        </button>
      </div>

      {/* Lot Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {lots.map((lot) => (
          <div
            key={lot.id}
            className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs hover:border-emerald-400 transition-all flex flex-col justify-between space-y-3.5"
          >
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                  Lot ID: {lot.id.slice(0, 8)}
                </span>
                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                  lot.status === 'available'
                    ? 'bg-emerald-100 text-emerald-800'
                    : lot.status === 'matched'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-stone-100 text-stone-600'
                }`}>
                  ● {lot.status}
                </span>
              </div>

              <div>
                <h3 className="font-black text-base text-stone-900 leading-tight">
                  {lot.commodity}
                </h3>
                <p className="text-xs text-stone-500">{lot.variety}</p>
              </div>

              {/* Farmer & Location Info */}
              <div className="flex items-center justify-between text-xs text-stone-600 pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-stone-800">{lot.farmerName}</span>
                  {lot.isPhoneVerified && (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" title="Phone Verified" />
                  )}
                </div>
                <div className="flex items-center gap-1 text-stone-500">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{lot.district}, {lot.state}</span>
                </div>
              </div>

              {/* Quality & Quantity Card */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-stone-400 uppercase font-bold block">Grade & Moisture</span>
                  <strong className="text-stone-900 text-sm">
                    Grade {lot.qualityGrade} ({lot.moisturePercentage}% Moist)
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 uppercase font-bold block">Available Volume</span>
                  <strong className="text-emerald-800 text-sm">{lot.quantityQuintals} Quintals</strong>
                </div>
              </div>

              {/* Price & Storage */}
              <div className="flex items-center justify-between text-xs pt-1">
                <div>
                  <span className="text-[10px] text-stone-500 block">Reserve Price:</span>
                  <strong className="text-base font-black text-stone-900">
                    ₹{lot.expectedPricePerQuintal.toLocaleString('en-IN')} <span className="text-xs font-normal">/ Qtl</span>
                  </strong>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-stone-500 block">Storage:</span>
                  <span className="font-semibold text-stone-700 capitalize">
                    {lot.storageType.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onLotSelect(lot)}
              className="w-full bg-stone-900 hover:bg-emerald-800 text-white font-bold text-xs py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>Match Direct Buyers for this Lot</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Create Lot Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
            
            <div className="bg-emerald-800 text-white px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base">List Harvest Lot for Direct Sale</h3>
                <p className="text-xs text-emerald-100">Get bids without giving commission to middlemen</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-emerald-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLot} className="p-5 space-y-3.5 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Farmer / Contact Person</label>
                  <input
                    type="text"
                    required
                    value={farmerName}
                    onChange={(e) => setFarmerName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Phone Number (OTP Verified)</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                <input
                  type="checkbox"
                  id="fpo-check"
                  checked={isFpo}
                  onChange={(e) => setIsFpo(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="fpo-check" className="text-xs font-semibold text-stone-700 cursor-pointer">
                  This lot is aggregated by a Farmer Producer Org (FPO)
                </label>
              </div>

              {isFpo && (
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">FPO Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Narmada Valley Farmer Producer Co-op"
                    value={fpoName}
                    onChange={(e) => setFpoName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Commodity</label>
                  <select
                    value={commodity}
                    onChange={(e) => setCommodity(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Wheat (गेहूं / கோதுமை)">Wheat</option>
                    <option value="Basmati Paddy (बासमती धान / பாஸ்மதி)">Basmati Paddy</option>
                    <option value="Red Onion (प्याज / வெங்காயம்)">Red Onion</option>
                    <option value="Tomato (टमाटर / தக்காளி)">Tomato</option>
                    <option value="Soybean (सोयाबीन / சோயாபீன்)">Soybean</option>
                    <option value="Turmeric (हल्दी / மஞ்சள்)">Turmeric</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Variety</label>
                  <input
                    type="text"
                    value={variety}
                    onChange={(e) => setVariety(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Grade</label>
                  <select
                    value={grade}
                    onChange={(e: any) => setGrade(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="A+">Grade A+</option>
                    <option value="A">Grade A</option>
                    <option value="B">Grade B</option>
                    <option value="Organic">Organic</option>
                    <option value="Export">Export</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Quantity (Qtl)</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Moisture %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={moisture}
                    onChange={(e) => setMoisture(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Reserve Price (₹/Qtl)</label>
                  <input
                    type="number"
                    value={expectedPrice}
                    onChange={(e) => setExpectedPrice(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Storage Location</label>
                  <select
                    value={storageType}
                    onChange={(e: any) => setStorageType(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="farm_gate">At Farm Gate</option>
                    <option value="warehouse">WDRA Warehouse</option>
                    <option value="cold_storage">Cold Storage</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">District</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs py-3 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'Posting...' : 'Publish Harvest Lot'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
