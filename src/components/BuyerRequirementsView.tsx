import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  ShieldCheck, 
  Star, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  Phone, 
  Building2, 
  X, 
  Sparkles,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { BuyerRequirement, LanguageCode, QualityGrade } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { api } from '../services/api';

interface BuyerRequirementsViewProps {
  currentLang: LanguageCode;
  onInitiateOrder: (req: BuyerRequirement) => void;
}

export const BuyerRequirementsView: React.FC<BuyerRequirementsViewProps> = ({
  currentLang,
  onInitiateOrder,
}) => {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const [requirements, setRequirements] = useState<BuyerRequirement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [selectedBuyerType, setSelectedBuyerType] = useState('All');
  const [selectedCommodity, setSelectedCommodity] = useState('All');
  const [selectedState, setSelectedState] = useState('All');

  // New Requirement Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBuyerName, setNewBuyerName] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newBuyerType, setNewBuyerType] = useState<BuyerRequirement['buyerType']>('quick_commerce');
  const [newCommodity, setNewCommodity] = useState('Wheat (गेहूं / கோதுமை)');
  const [newRequiredGrade, setNewRequiredGrade] = useState<QualityGrade>('A');
  const [newQuantity, setNewQuantity] = useState(200);
  const [newPrice, setNewPrice] = useState(2650);
  const [newCity, setNewCity] = useState('Indore');
  const [newState, setNewState] = useState('Madhya Pradesh');
  const [newPhone, setNewPhone] = useState('+91 98234 11223');
  const [newQualitySpecs, setNewQualitySpecs] = useState('Moisture < 12%, Foreign matter < 0.5%');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRequirements = async () => {
    setIsLoading(true);
    try {
      const res = await api.getBuyerRequirements({
        buyerType: selectedBuyerType !== 'All' ? selectedBuyerType : undefined,
        commodity: selectedCommodity !== 'All' ? selectedCommodity : undefined,
        state: selectedState !== 'All' ? selectedState : undefined,
      });
      setRequirements(res.data);
    } catch (err) {
      console.error('Error loading buyer requirements:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequirements();
  }, [selectedBuyerType, selectedCommodity, selectedState]);

  const handleCreateRequirement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany || !newBuyerName) return;

    setIsSubmitting(true);
    try {
      await api.postBuyerRequirement({
        buyerId: `b-${Date.now()}`,
        buyerName: newBuyerName,
        companyOrOrg: newCompany,
        buyerType: newBuyerType,
        isVerified: true,
        kycDocType: 'GST',
        commodity: newCommodity,
        variety: 'Standard Commercial Grade',
        requiredGrade: newRequiredGrade,
        minQuantityQuintals: 10,
        maxQuantityQuintals: newQuantity,
        maxMoistureAllowed: 12,
        offeredPricePerQuintal: newPrice,
        deliveryLocation: {
          city: newCity,
          district: newCity,
          state: newState,
          pincode: '452001',
        },
        paymentTerms: 'T+1 Escrow',
        paymentReliabilityScore: 98,
        rating: 4.8,
        reviewsCount: 1,
        neededByDate: 'Within 7 Days',
        transportPreference: 'Platform Kisan Rail / Rural Carrier',
        notes: newQualitySpecs,
        contactPhone: newPhone,
      });

      setIsModalOpen(false);
      fetchRequirements();
    } catch (err) {
      console.error('Failed to create buyer requirement:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const buyerTypes = ['All', 'retailer', 'processor', 'exporter', 'kirana', 'institutional'];
  const states = ['All', 'Madhya Pradesh', 'Punjab', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Delhi NCR', 'Gujarat'];

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-emerald-950 rounded-2xl p-5 sm:p-6 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 px-3 py-0.5 rounded-full text-xs font-bold border border-emerald-400/30">
            <Users className="w-3.5 h-3.5" />
            <span>Verified Institutional & Retail Buyers</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {t.buyersDemand} & Direct Purchase Orders
          </h1>
          <p className="text-xs sm:text-sm text-stone-300">
            Browse verified institutional bulk demand from JioMart, Blinkit, ITC, Haldirams, and export houses with T+1 bank escrow guarantees.
          </p>
        </div>

        <button
          id="btn-post-requirement"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Post Buy Requirement</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Buyer Type */}
          <div>
            <select
              value={selectedBuyerType}
              onChange={(e) => setSelectedBuyerType(e.target.value)}
              className="bg-stone-50 border border-stone-300 text-stone-800 text-xs font-semibold rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="All">All Buyer Types</option>
              <option value="retailer">🛒 Retailer (Quick-Commerce / Supermarket)</option>
              <option value="processor">🏭 Food Processor / Mill</option>
              <option value="exporter">🚢 Exporter / Global Trader</option>
              <option value="kirana">🏪 Kirana Association / Retail</option>
              <option value="institutional">🏢 Institutional / Co-op</option>
            </select>
          </div>

          {/* Location State */}
          <div>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="bg-stone-50 border border-stone-300 text-stone-800 text-xs font-semibold rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="All">All Delivery States</option>
              {states.slice(1).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={fetchRequirements}
          className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Demand Feed</span>
        </button>
      </div>

      {/* Buyer Requirements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {requirements.map((req) => (
          <div
            key={req.id}
            className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                  {req.buyerType}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  {req.rating} ({req.reviewsCount})
                </span>
              </div>

              <div>
                <h3 className="font-black text-base text-stone-900 leading-tight">
                  {req.companyOrOrg}
                </h3>
                <p className="text-xs text-stone-500">
                  Buyer Lead: <strong className="text-stone-700">{req.buyerName}</strong>
                </p>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-950">{req.commodity}</span>
                  <span className="text-[11px] font-extrabold text-emerald-800 bg-white px-2 py-0.5 rounded-md border border-emerald-300">
                    Grade {req.requiredGrade}
                  </span>
                </div>
                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <span className="text-[10px] text-stone-500 uppercase font-semibold">Offered Bid</span>
                    <div className="text-lg font-black text-emerald-900">
                      ₹{req.offeredPricePerQuintal.toLocaleString('en-IN')} <span className="text-xs font-normal">/ Qtl</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-stone-500 uppercase font-semibold">Required Volume</span>
                    <div className="text-sm font-extrabold text-stone-900">
                      {req.maxQuantityQuintals.toLocaleString()} Qtl
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1 text-xs text-stone-600">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span>Delivery: {req.deliveryLocation.city}, {req.deliveryLocation.state}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-stone-800">{req.paymentTerms}</span>
                </div>
                {req.notes && (
                  <div className="bg-stone-50 p-2 rounded-lg text-[11px] text-stone-600 border border-stone-200">
                    Specs: {req.notes}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => onInitiateOrder(req)}
              className="w-full bg-stone-900 hover:bg-emerald-800 text-white font-bold text-xs py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <span>Accept & Create Digital Contract</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Post Buyer Requirement Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
            
            <div className="bg-stone-950 text-white px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base">Post Procurement Requirement</h3>
                <p className="text-xs text-stone-400">Reach 50,000+ verified farmers and FPOs directly</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRequirement} className="p-5 space-y-3.5 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Company / Organization</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. JioMart Wholesale"
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Procurement Officer Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={newBuyerName}
                    onChange={(e) => setNewBuyerName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Buyer Category</label>
                  <select
                    value={newBuyerType}
                    onChange={(e: any) => setNewBuyerType(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="retailer">Retailer / Supermarket</option>
                    <option value="processor">Food Processor</option>
                    <option value="exporter">Exporter</option>
                    <option value="kirana">Kirana / Local Retail</option>
                    <option value="institutional">Institutional / Co-op</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Commodity</label>
                  <select
                    value={newCommodity}
                    onChange={(e) => setNewCommodity(e.target.value)}
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
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Grade</label>
                  <select
                    value={newRequiredGrade}
                    onChange={(e: any) => setNewRequiredGrade(e.target.value)}
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
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Offer (₹/Qtl)</label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Delivery City</label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Delivery State</label>
                  <input
                    type="text"
                    value={newState}
                    onChange={(e) => setNewState(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Quality Specifications</label>
                <textarea
                  rows={2}
                  value={newQualitySpecs}
                  onChange={(e) => setNewQualitySpecs(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs py-3 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'Posting...' : 'Publish Buyer Requirement'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
