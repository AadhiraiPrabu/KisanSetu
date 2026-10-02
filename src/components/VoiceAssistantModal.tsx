import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  RefreshCw,
  Languages,
  HelpCircle,
  TrendingUp,
  Truck,
  ShieldCheck
} from 'lucide-react';
import { LanguageCode } from '../types';
import { LANGUAGES, TRANSLATIONS } from '../data/translations';
import { speechService } from '../services/speech';
import { api } from '../services/api';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isAudioPlayable?: boolean;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  currentLang,
  onLanguageChange,
}) => {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const langConfig = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  // Pre-seed greeting message in chosen language
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greetingMap: Record<LanguageCode, string> = {
        en: "Namaste Kisan! I am your AI Agri Market Assistant. Speak or type your question about mandi prices, price forecasts, buyer matching, or Kisan Rail logistics.",
        hi: "नमस्ते किसान भाई! मैं आपका AI कृषि बाजार सहायक हूँ। मंडी भाव, 7 दिन का भाव अनुमान, सीधे खरीदार मिलान या किसान रेल के बारे में बोलकर या लिखकर पूछें।",
        ta: "வணக்கம் உழவரே! நான் உங்கள் AI சந்தை உதவியாளர். மண்டி விலைகள், 7 நாள் விலை கணிப்பு அல்லது நேரடி வாங்குபவர் பற்றி பேசிக் கேட்கலாம்.",
        te: "నమస్కారం రైతు సోదరా! నేను మీ AI మార్కెట్ అసిస్టెంట్. మార్కెట్ ధరలు, ధరల అంచనాలు లేదా రవాణా గురించి మాట్లాడి తెలుసుకోండి.",
        kn: "ನಮಸ್ಕಾರ ರೈತ ಮಿತ್ರರೇ! ನಾನು ನಿಮ್ಮ AI ಮಾರುಕಟ್ಟೆ ಸಹಾಯಕ. ಮಂಡಿ ದರಗಳು, ಬೆಲೆ ಮುನ್ಸೂಚನೆ ಅಥವಾ ಸಾರಿಗೆ ಬಗ್ಗೆ ಮಾತನಾಡಿ ಕೇಳಿ.",
        mr: "नमस्कार शेतकरी बंधूंनो! मी आपला AI कृषी बाजार सहाय्यक आहे. बाजारभाव, भावाचा अंदाज, थेट खरेदीदार किंवा किसान रेल बद्दल विचारा.",
        bn: "নমস্কার কৃষক বন্ধু! আমি আপনার AI কৃষি বাজার সহায়ক। মাণ্ডি দর, মূল্য পূর্বাভাস বা পরিবহন নিয়ে প্রশ্ন করুন।",
        pa: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਕਿਸਾਨ ਵੀਰੋ! ਮੈਂ ਤੁਹਾਡਾ AI ਖੇਤੀ ਮੰਡੀ ਸਹਾਇਕ ਹਾਂ। ਮੰਡੀ ਭਾਅ, ਰੁਝਾਨ ਜਾਂ ਸਿੱਧੀ ਖਰੀਦ ਬਾਰੇ ਬੋਲ ਕੇ ਪੁੱਛੋ।",
        gu: "નમસ્તે ખેડૂત મિત્રો! હું તમારો AI કૃષિ બજાર સહાયક છું. માર્કેટ યાર્ડ ભાવ, ભાવ અંદાજ કે પરિવહન વિશે બોલીને પૂછો.",
      };

      const initMsg: ChatMessage = {
        id: 'msg-init',
        sender: 'assistant',
        text: greetingMap[currentLang] || greetingMap.en,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAudioPlayable: true,
      };
      setMessages([initMsg]);
    }
  }, [isOpen, currentLang]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleStartVoice = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
      return;
    }

    setTranscript('');
    setIsListening(true);
    speechService.stopSpeaking();
    setIsPlayingAudio(false);

    speechService.startListening(
      currentLang,
      (resultText) => {
        setIsListening(false);
        setTranscript(resultText);
        handleSendMessage(resultText);
      },
      (error) => {
        console.warn('Voice recognition error:', error);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setTranscript('');
    setIsLoading(true);

    try {
      const response = await api.queryAIAdvisor(query, currentLang);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAudioPlayable: true,
      };
      setMessages((prev) => [...prev, aiMsg]);

      // Automatically speak the response in regional voice
      playAudio(response.reply);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'Unable to reach advisory engine at this moment. Please check network connection.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const playAudio = (text: string) => {
    speechService.stopSpeaking();
    setIsPlayingAudio(true);
    speechService.speak(text, currentLang, () => {
      setIsPlayingAudio(false);
    });
  };

  const stopAudio = () => {
    speechService.stopSpeaking();
    setIsPlayingAudio(false);
  };

  const samplePrompts: Record<LanguageCode, string[]> = {
    en: [
      "What is the wheat price in Khanna Mandi and 7-day forecast?",
      "How can I book Indian Railways Kisan Rail for 50 quintals?",
      "How much do I save with 0% middleman escrow vs local mandi?",
      "What are the moisture requirements for Basmati Grade A+?",
    ],
    hi: [
      "खन्ना मंडी में गेहूं का आज का भाव और 7 दिन का अनुमान क्या है?",
      "50 क्विंटल माल के लिए 50% सब्सिडी वाली किसान रेल कैसे बुक करें?",
      "स्थानीय मंडी की तुलना में बिचौलिया दलाली शून्य होने से कितना बचेगा?",
      "बासमती धान ग्रेड A+ के लिए नमी की सही मात्रा क्या है?",
    ],
    ta: [
      "ஈரோடு சந்தையில் மஞ்சள் விலை மற்றும் 7 நாள் கணிப்பு என்ன?",
      "கிசான் ரயில் 50% மானியத்தில் முன்பதிவு செய்வது எப்படி?",
      "இடைத்தரகர் இல்லாமல் நேரடி விற்பனையில் எவ்வளவு லாபம் கிடைக்கும்?",
    ],
    te: [
      "కోలార్ మార్కెట్‌లో టమాటా ధర మరియు 7 రోజుల అంచనా ఏమిటి?",
      "కిసాన్ రైలు 50% సబ్సిడీని ఎలా ఉపయోగించుకోవాలి?",
      "మధ్యవర్తులు లేకుండా విక్రయిస్తే ఎంత లాభం వస్తుంది?",
    ],
    kn: [
      "ಕೋಲಾರ ಮಂಡಿಯಲ್ಲಿ ಟೊಮೆಟೊ ದರ ಮತ್ತು ಮುಂದಿನ ವಾರದ ಮುನ್ಸೂಚನೆ ಏನು?",
      "ಕಿಸಾನ್ ರೈಲು ಸಾರಿಗೆಯನ್ನು ಹೇಗೆ ಬುಕ್ ಮಾಡುವುದು?",
      "ನೇರ ಖರೀದಿದಾರರಿಂದ ಎಷ್ಟು ಹೆಚ್ಚುವರಿ ಲಾಭ ಸಿಗುತ್ತದೆ?",
    ],
    mr: [
      "लासलगाव बाजार समितीत कांद्याचा भाव व पुढील कल काय आहे?",
      "किसान रेल ५०% मालवाहतूक अनुदान कसे मिळवावे?",
      "दलाली शून्य झाल्यामुळे शेतकऱ्याला किती जास्तीचा नफा मिळतो?",
    ],
    bn: [
      "আজকের গমের মাণ্ডি দর এবং ৭ দিনের পূর্বাভাস কী?",
      "কিষাণ রেল কীভাবে বুক করব?",
      "সরাসরি বিক্রয়ে দালাল ছাড়া কতটা বাড়তি লাভ হবে?",
    ],
    pa: [
      "ਖੰਨਾ ਮੰਡੀ ਵਿੱਚ ਕਣਕ ਦਾ ਅੱਜ ਦਾ ਭਾਅ ਅਤੇ 7 ਦਿਨਾਂ ਦਾ ਅੰਦਾਜ਼ਾ ਕੀ ਹੈ?",
      "ਕਿਸਾਨ ਰੇਲ 50% ਸਬਸਿਡੀ ਵਾਲੀ ਬੁਕਿੰਗ ਕਿਵੇਂ ਕਰੀਏ?",
      "ਵਿਚੋਲਿਆਂ ਬਿਨਾਂ ਸਿੱਧੇ ਸੌਦੇ ਵਿੱਚ ਕਿੰਨਾ ਵੱਧ ਮੁਨਾਫਾ ਹੋਵੇਗਾ?",
    ],
    gu: [
      "રાજકોટ માર્કેટ યાર્ડમાં કપાસનો આજનો ભાવ અને આગામી અંદાજ શું છે?",
      "કિસાન રેલ 50% સબસિડીનું બુકિંગ કેવી રીતે કરવું?",
      "દલાલી વગર સીધા વેચાણમાં કેટલો ફાયદો થાય?",
    ],
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/75 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col h-[88vh] max-h-[720px]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-emerald-200">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">{t.voiceAssistant}</h3>
                <span className="text-[10px] font-bold bg-emerald-400 text-stone-950 px-2 py-0.2 rounded-full uppercase tracking-wider">
                  AI Powered
                </span>
              </div>
              <p className="text-xs text-emerald-100 flex items-center gap-1.5">
                <span>{langConfig.native} ({langConfig.label})</span>
                <span>•</span>
                <span>Voice & Text Ready</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switch within Modal */}
            <select
              value={currentLang}
              onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
              className="bg-emerald-900/60 hover:bg-emerald-900 text-xs font-semibold text-emerald-100 border border-emerald-500/40 rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} className="text-stone-900 bg-white">
                  {l.native}
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                speechService.stopSpeaking();
                speechService.stopListening();
                onClose();
              }}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat History Box */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-stone-50/70">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-emerald-700 text-white rounded-tr-none'
                    : 'bg-white text-stone-800 border border-stone-200 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-line leading-relaxed">{msg.text}</div>
                
                <div className="flex items-center justify-between gap-3 mt-2 pt-1 border-t border-stone-200/40 text-[11px] opacity-80">
                  <span>{msg.timestamp}</span>
                  {msg.sender === 'assistant' && (
                    <button
                      onClick={() => playAudio(msg.text)}
                      className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-900 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Speak</span>
                    </button>
                  )}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-stone-800 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-stone-200 rounded-2xl rounded-tl-none px-4 py-3 text-sm text-stone-600 shadow-xs flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                <span>Analyzing mandi prices & formulating advice in {langConfig.native}...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick Sample Questions */}
        <div className="px-4 py-2 bg-stone-100 border-t border-stone-200 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-600" />
            Suggested:
          </span>
          {(samplePrompts[currentLang] || samplePrompts.en).map((promptText, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(promptText)}
              className="text-xs font-medium text-stone-700 bg-white hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-stone-300 px-3 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer shrink-0"
            >
              {promptText}
            </button>
          ))}
        </div>

        {/* Voice & Input Footer */}
        <div className="p-3.5 bg-white border-t border-stone-200 space-y-2">
          {/* Animated Voice Banner when listening */}
          {isListening && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center justify-between text-rose-800 animate-pulse">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-rose-600 animate-ping" />
                <span className="text-xs font-bold">{t.listening} ({langConfig.native})</span>
              </div>
              <button
                onClick={handleStartVoice}
                className="text-xs font-bold text-rose-700 hover:text-rose-900 bg-white px-2.5 py-1 rounded-md border border-rose-300 cursor-pointer"
              >
                {t.stopListening}
              </button>
            </div>
          )}

          {isPlayingAudio && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1.5 flex items-center justify-between text-emerald-900 text-xs">
              <div className="flex items-center gap-2 font-semibold">
                <Volume2 className="w-4 h-4 text-emerald-700 animate-bounce" />
                <span>Speaking regional response...</span>
              </div>
              <button
                onClick={stopAudio}
                className="text-xs font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
              >
                Stop
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            {/* Big Voice Button */}
            <button
              id="voice-mic-trigger-btn"
              onClick={handleStartVoice}
              className={`flex items-center justify-center w-11 h-11 rounded-xl font-bold transition-all shadow-md cursor-pointer shrink-0 ${
                isListening
                  ? 'bg-rose-600 text-white animate-bounce ring-4 ring-rose-200'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white hover:scale-105'
              }`}
              title={isListening ? t.stopListening : t.voiceAssistant}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Text Input */}
            <div className="relative flex-1">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={t.speakPrompt}
                className="w-full bg-stone-100 hover:bg-stone-50 focus:bg-white text-stone-900 text-sm font-medium border border-stone-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all placeholder:text-stone-400"
              />
            </div>

            {/* Send Button */}
            <button
              id="voice-send-btn"
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isLoading}
              className="flex items-center justify-center w-11 h-11 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-40 disabled:hover:bg-stone-900 text-white transition-all cursor-pointer shrink-0 shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] text-center text-stone-500">
            Powered by Gemini AI Multilingual Agricultural Reasoning & e-NAM / AGMARKNET Data
          </p>
        </div>

      </div>
    </div>
  );
};
