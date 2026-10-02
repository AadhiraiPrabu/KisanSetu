import React, { useState } from 'react';
import { 
  Sprout, 
  Languages, 
  Mic, 
  HelpCircle, 
  UserCheck, 
  ShieldCheck, 
  Menu, 
  X,
  Sparkles,
  TrendingUp,
  Truck,
  FileText,
  Users,
  AlertCircle,
  Radio,
  Navigation,
  Volume2
} from 'lucide-react';
import { LanguageCode, UserRole } from '../types';
import { LANGUAGES, TRANSLATIONS } from '../data/translations';

interface NavbarProps {
  currentLang: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onOpenVoiceModal: () => void;
  onOpenVideoTour: () => void;
  onToggleGameTour: () => void;
  onOpenLanguageEntryModal?: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  isGameTourActive: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLang,
  onLanguageChange,
  currentRole,
  onRoleChange,
  onOpenVoiceModal,
  onOpenVideoTour,
  onToggleGameTour,
  onOpenLanguageEntryModal,
  activeTab,
  onTabChange,
  isGameTourActive,
}) => {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  const navItems = [
    { id: 'mandi', label: t.mandiPrices, icon: TrendingUp },
    { id: 'match', label: t.smartMatching, icon: Sparkles },
    { id: 'buyers', label: t.buyersDemand, icon: Users },
    { id: 'lots', label: t.postLot, icon: Sprout },
    { id: 'gps', label: t.gpsTracking, icon: Radio, isLive: true },
    { id: 'logistics', label: t.logistics, icon: Truck },
    { id: 'orders', label: t.ordersEscrow, icon: ShieldCheck },
    { id: 'grievance', label: t.grievances, icon: AlertCircle },
  ];

  const currentLangObj = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Banner: Verification & Subsidies alert */}
      <div className="bg-slate-900 text-slate-200 px-4 py-1.5 text-xs border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium">
            <span className="inline-flex items-center gap-1 bg-emerald-950/60 text-emerald-400 px-2.5 py-0.5 rounded-md border border-emerald-500/30 text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              {t.zeroMiddleman}
            </span>
            <span className="hidden sm:inline text-slate-300">
              • Kisan Rail 50% freight subsidy active • Direct T+1 Escrow bank settlements
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              id="nav-how-to-use-btn"
              onClick={onOpenVideoTour}
              className="inline-flex items-center gap-1 text-slate-300 hover:text-emerald-400 font-medium transition-colors cursor-pointer text-[11px]"
            >
              <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.howToUse}</span>
            </button>
            <button
              id="nav-game-guide-btn"
              onClick={onToggleGameTour}
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md font-bold text-[11px] transition-all cursor-pointer border ${
                isGameTourActive 
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-xs' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              <span>🎮 {t.guidedTour}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => onTabChange('mandi')} 
              className="flex items-center gap-2.5 text-left cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs group-hover:bg-emerald-500 transition-colors">
                <div className="w-5 h-5 border-2 border-white rounded-xs rotate-45 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-xs" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {t.appName}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                    Live Mandi
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden md:block leading-none mt-0.5">
                  Direct Agri-Trade & Price Intelligence
                </p>
              </div>
            </button>
          </div>

          {/* Center: Voice Search Action Button */}
          <div className="hidden lg:flex items-center">
            <button
              id="nav-voice-assistant-btn"
              onClick={onOpenVoiceModal}
              className="flex items-center gap-2.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs shadow-xs hover:shadow-sm transition-all cursor-pointer active:scale-98 border border-slate-800"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <Mic className="w-4 h-4 text-emerald-400" />
              <span className="font-bold">{t.voiceAssistant}</span>
              <span className="text-[11px] text-emerald-300 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded-md">
                {currentLangObj.native}
              </span>
            </button>
          </div>

          {/* Right Controls: Role Switcher & Language Selector */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Voice Button */}
            <button
              onClick={onOpenVoiceModal}
              className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-600 text-white shadow-xs"
              title={t.voiceAssistant}
            >
              <Mic className="w-4 h-4" />
            </button>

            {/* Role Switcher */}
            <div className="relative">
              <select
                id="nav-role-select"
                value={currentRole}
                onChange={(e) => onRoleChange(e.target.value as UserRole)}
                className="text-xs font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer transition-colors"
              >
                <option value="farmer">🧑‍🌾 {t.roleFarmer}</option>
                <option value="fpo">🏢 {t.roleFpo}</option>
                <option value="buyer">🛒 {t.roleBuyer}</option>
                <option value="logistics">🚛 {t.roleLogistics}</option>
              </select>
            </div>

            {/* Language Dropdown */}
            <div className="relative">
              <button
                id="nav-lang-btn"
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="flex items-center gap-1.5 text-xs font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer"
              >
                <Languages className="w-3.5 h-3.5 text-emerald-600" />
                <span>{currentLangObj.native}</span>
              </button>

              {isLangDropdownOpen && (
                <div 
                  className="absolute right-0 mt-1.5 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2"
                  onClick={() => setIsLangDropdownOpen(false)}
                >
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1 flex items-center justify-between">
                    <span>{t.selectLanguage}</span>
                  </div>
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      id={`btn-dropdown-lang-${lang.code}`}
                      onClick={() => onLanguageChange(lang.code)}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-emerald-50 transition-colors cursor-pointer ${
                        currentLang === lang.code ? 'font-bold text-emerald-700 bg-emerald-50/60' : 'text-slate-700'
                      }`}
                    >
                      <span>{lang.native}</span>
                      <span className="text-[11px] text-slate-400">{lang.label}</span>
                    </button>
                  ))}
                  {onOpenLanguageEntryModal && (
                    <div className="pt-1 mt-1 border-t border-slate-100">
                      <button
                        onClick={onOpenLanguageEntryModal}
                        className="w-full text-left px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 flex items-center gap-1.5"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Voice Preview & Guide</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Primary Desktop Navigation Bar */}
        <nav className="hidden md:flex items-center gap-1 py-1.5 overflow-x-auto no-scrollbar border-t border-slate-100">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`tab-${item.id}`}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer relative ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.isLive && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.isLive && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase">
                    Live GPS
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
