import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { InteractiveTour } from './components/InteractiveTour';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { VideoGuidanceModal } from './components/VideoGuidanceModal';
import { LanguageEntryModal } from './components/LanguageEntryModal';
import { GpsLiveTracking } from './components/GpsLiveTracking';
import { MandiPriceExplorer } from './components/MandiPriceExplorer';
import { MatchOptimizer } from './components/MatchOptimizer';
import { BuyerRequirementsView } from './components/BuyerRequirementsView';
import { FarmerLotListing } from './components/FarmerLotListing';
import { LogisticsHub } from './components/LogisticsHub';
import { OrdersAndEscrow } from './components/OrdersAndEscrow';
import { GrievancePortal } from './components/GrievancePortal';

import { LanguageCode, UserRole, CommodityPrice, BuyerRequirement, FarmerLot, MatchRecommendation } from './types';
import { TRANSLATIONS } from './data/translations';
import { 
  Sprout, 
  Mic, 
  HelpCircle, 
  TrendingUp, 
  Sparkles, 
  Users, 
  Truck, 
  ShieldCheck, 
  AlertCircle,
  Volume2,
  Radio,
  Languages
} from 'lucide-react';
import { speechService } from './services/speech';

export default function App() {
  const [currentLang, setCurrentLang] = useState<LanguageCode>('en');
  const [currentRole, setCurrentRole] = useState<UserRole>('farmer');
  const [activeTab, setActiveTab] = useState<string>('mandi');
  
  // Modals & Interactive Tour
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isGameTourActive, setIsGameTourActive] = useState(true);

  // Cross-component Context States
  const [selectedCommodityForMatch, setSelectedCommodityForMatch] = useState<CommodityPrice | null>(null);
  const [grievanceTargetOrderId, setGrievanceTargetOrderId] = useState<string | null>(null);

  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  const handleLanguageSelect = (lang: LanguageCode) => {
    setCurrentLang(lang);
    setIsLanguageModalOpen(false);
  };

  const handleSelectCommodityForMatch = (commodity: CommodityPrice) => {
    setSelectedCommodityForMatch(commodity);
    setActiveTab('match');
  };

  const handleLotSelect = (lot: FarmerLot) => {
    // Set match input from harvest lot
    setActiveTab('match');
  };

  const handleConnectBuyer = (buyer: BuyerRequirement, calculation: MatchRecommendation) => {
    // Navigate to Orders & Escrow to see generated order
    setActiveTab('orders');
  };

  const handleInitiateOrderFromBuyer = (req: BuyerRequirement) => {
    setActiveTab('orders');
  };

  const handleOpenGrievanceFromOrder = (orderId: string) => {
    setGrievanceTargetOrderId(orderId);
    setActiveTab('grievance');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-200">
      
      {/* Top Main Navigation Bar */}
      <Navbar
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
        onOpenVideoTour={() => setIsVideoModalOpen(true)}
        onToggleGameTour={() => setIsGameTourActive(!isGameTourActive)}
        onOpenLanguageEntryModal={() => setIsLanguageModalOpen(true)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isGameTourActive={isGameTourActive}
      />

      {/* Game-like Step-by-Step Guidance Banner */}
      <InteractiveTour
        currentLang={currentLang}
        isOpen={isGameTourActive}
        onClose={() => setIsGameTourActive(false)}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {activeTab === 'mandi' && (
          <MandiPriceExplorer
            currentLang={currentLang}
            onSelectCommodityForMatch={handleSelectCommodityForMatch}
            onOpenVoiceAssistant={() => setIsVoiceModalOpen(true)}
          />
        )}

        {activeTab === 'match' && (
          <MatchOptimizer
            currentLang={currentLang}
            initialCommodity={selectedCommodityForMatch}
            onConnectBuyer={handleConnectBuyer}
          />
        )}

        {activeTab === 'buyers' && (
          <BuyerRequirementsView
            currentLang={currentLang}
            onInitiateOrder={handleInitiateOrderFromBuyer}
          />
        )}

        {activeTab === 'lots' && (
          <FarmerLotListing
            currentLang={currentLang}
            onLotSelect={handleLotSelect}
          />
        )}

        {activeTab === 'gps' && (
          <GpsLiveTracking
            language={currentLang}
            onNavigateToOrder={() => setActiveTab('orders')}
          />
        )}

        {activeTab === 'logistics' && (
          <LogisticsHub
            currentLang={currentLang}
            onNavigateToGps={() => setActiveTab('gps')}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersAndEscrow
            currentLang={currentLang}
            onOpenGrievance={handleOpenGrievanceFromOrder}
          />
        )}

        {activeTab === 'grievance' && (
          <GrievancePortal
            currentLang={currentLang}
            presetOrderId={grievanceTargetOrderId}
          />
        )}
      </main>

      {/* Floating Action Button for Voice AI & Language */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2">
        <button
          id="fab-language-selector"
          onClick={() => setIsLanguageModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs shadow-md border border-slate-200 transition-all cursor-pointer hover:scale-105"
          title="Change / Listen Language"
        >
          <Languages className="w-4 h-4 text-emerald-600" />
          <span className="hidden sm:inline">भाषा / Language</span>
        </button>

        <button
          id="fab-voice-assistant"
          onClick={() => setIsVoiceModalOpen(true)}
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-lg hover:shadow-xl transition-all cursor-pointer hover:scale-105 active:scale-95 border border-slate-700"
        >
          <Mic className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="hidden sm:inline">{t.voiceAssistant}</span>
        </button>
      </div>

      {/* Mandatory / Guided Initial Language Selection Modal */}
      <LanguageEntryModal
        isOpen={isLanguageModalOpen}
        currentLanguage={currentLang}
        onSelectLanguage={handleLanguageSelect}
        onClose={() => setIsLanguageModalOpen(false)}
        isInitialPrompt={true}
      />

      {/* Modals */}
      <VoiceAssistantModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
      />

      <VideoGuidanceModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        currentLang={currentLang}
        onSelectTab={(tab) => setActiveTab(tab)}
      />

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
              <div className="w-3.5 h-3.5 border-2 border-white rounded-xs rotate-45" />
            </div>
            <span className="font-extrabold text-slate-200">{t.appName}</span>
            <span className="text-slate-400">• Farmer-Centric Intelligence Layer over AGMARKNET & e-NAM</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Zero Middleman Brokerage</span>
            <span>•</span>
            <span>T+1 Bank Escrow</span>
            <span>•</span>
            <span>Live GPS Telemetry</span>
            <span>•</span>
            <span>50% Kisan Rail Subsidy</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

