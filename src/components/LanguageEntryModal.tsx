import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Check, Globe, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { LanguageCode } from '../types';
import { LANGUAGES, REGIONAL_WELCOME_VOICE_SCRIPTS, TRANSLATIONS } from '../data/translations';
import { speechService } from '../services/speech';

interface LanguageEntryModalProps {
  isOpen: boolean;
  currentLanguage: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
  onClose?: () => void;
  isInitialPrompt?: boolean;
}

export const LanguageEntryModal: React.FC<LanguageEntryModalProps> = ({
  isOpen,
  currentLanguage,
  onSelectLanguage,
  onClose,
  isInitialPrompt = false,
}) => {
  const [selected, setSelected] = useState<LanguageCode>(currentLanguage);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [hasPromptedInitialVoice, setHasPromptedInitialVoice] = useState<boolean>(false);

  useEffect(() => {
    setSelected(currentLanguage);
  }, [currentLanguage]);

  // Voice announcement on modal appearance
  useEffect(() => {
    if (isOpen && !hasPromptedInitialVoice) {
      setHasPromptedInitialVoice(true);
      const script = REGIONAL_WELCOME_VOICE_SCRIPTS[currentLanguage] || REGIONAL_WELCOME_VOICE_SCRIPTS.hi;
      setIsPlayingAudio(true);
      speechService.speak(script.prompt, currentLanguage, () => {
        setIsPlayingAudio(false);
      });
    }
  }, [isOpen, currentLanguage, hasPromptedInitialVoice]);

  if (!isOpen) return null;

  const handlePreviewVoice = (langCode: LanguageCode, e: React.MouseEvent) => {
    e.stopPropagation();
    speechService.stop();
    setIsPlayingAudio(true);
    const script = REGIONAL_WELCOME_VOICE_SCRIPTS[langCode];
    speechService.speak(script.prompt + '. ' + script.text.slice(0, 70), langCode, () => {
      setIsPlayingAudio(false);
    });
  };

  const handleLanguageClick = (langCode: LanguageCode) => {
    setSelected(langCode);
    speechService.stop();
    setIsPlayingAudio(true);
    const script = REGIONAL_WELCOME_VOICE_SCRIPTS[langCode];
    speechService.speak(script.text, langCode, () => {
      setIsPlayingAudio(false);
    });
  };

  const handleConfirm = () => {
    speechService.stop();
    onSelectLanguage(selected);
    if (onClose) onClose();
  };

  const t = TRANSLATIONS[selected];
  const activeScript = REGIONAL_WELCOME_VOICE_SCRIPTS[selected];

  return (
    <div
      id="language-entry-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto animate-fadeIn"
    >
      <div
        id="language-entry-card"
        className="w-full max-w-2xl bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden flex flex-col my-auto transition-all"
      >
        {/* Header with Geometric Balance styling */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 relative overflow-hidden border-b border-slate-800">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold tracking-wider text-emerald-400 uppercase">
                  {isInitialPrompt ? 'Language Preferences' : 'Choose Interface Language'}
                </span>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Select Your Language / अपनी भाषा चुनें
                </h2>
              </div>
            </div>

            <button
              id="btn-toggle-voice-preview"
              onClick={(e) => handlePreviewVoice(selected, e)}
              className={`p-3 rounded-xl border transition-all flex items-center gap-2 text-sm font-medium ${
                isPlayingAudio
                  ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/30 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title="Speak Welcome in Selected Language"
            >
              {isPlayingAudio ? <Volume2 className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
              <span className="hidden sm:inline">
                {isPlayingAudio ? 'Speaking...' : 'Listen Audio Guide'}
              </span>
            </button>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
            KisanSetu supports real-time Mandi market rates, direct buyer trade links, audio voice navigation, and live GPS tracking in English and your regional language.
          </p>

          {/* Active preview banner */}
          <div className="mt-4 p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300">
              <span className="font-semibold text-white">{LANGUAGES.find((l) => l.code === selected)?.native}:</span>{' '}
              {activeScript.text}
            </div>
          </div>
        </div>

        {/* Language Grid */}
        <div className="p-6 sm:p-8 bg-slate-50">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 mb-6">
            {LANGUAGES.map((lang) => {
              const isCurrent = selected === lang.code;
              return (
                <button
                  key={lang.code}
                  id={`btn-lang-choice-${lang.code}`}
                  onClick={() => handleLanguageClick(lang.code)}
                  className={`relative p-4 rounded-xl text-left border transition-all flex flex-col justify-between group ${
                    isCurrent
                      ? 'bg-emerald-50 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                      {lang.code}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handlePreviewVoice(lang.code, e)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        isCurrent
                          ? 'bg-emerald-500 text-white border-emerald-400'
                          : 'bg-slate-50 hover:bg-emerald-50 text-slate-500 hover:text-emerald-700 border-slate-200'
                      }`}
                      title={`Listen ${lang.native}`}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <div className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {lang.native}
                    </div>
                    <div className="text-xs text-slate-500">{lang.label}</div>
                  </div>

                  {isCurrent && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Guarantee Badges */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200 text-xs text-slate-600 mb-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>100% बिचौलिया-मुक्त सीधी बिक्री (Zero Brokerage)</span>
            </div>
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-indigo-600" />
              <span>Voice commands & Audio guides in all 9 Indian languages</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3">
            {!isInitialPrompt && onClose && (
              <button
                id="btn-cancel-language-modal"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium text-sm transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              id="btn-confirm-language-selection"
              onClick={handleConfirm}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all flex items-center gap-2"
            >
              <span>{t.stepGuideDone} (Continue in {LANGUAGES.find((l) => l.code === selected)?.native})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
