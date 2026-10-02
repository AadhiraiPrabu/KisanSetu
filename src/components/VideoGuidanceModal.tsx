import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  X, 
  CheckCircle2, 
  Sparkles, 
  TrendingUp, 
  Truck, 
  ShieldCheck, 
  Users, 
  Sprout,
  ArrowRight
} from 'lucide-react';
import { LanguageCode } from '../types';
import { LANGUAGES, TRANSLATIONS } from '../data/translations';
import { speechService } from '../services/speech';

interface VideoGuidanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: LanguageCode;
  onSelectTab: (tab: string) => void;
}

interface VideoChapter {
  id: number;
  title: Record<LanguageCode, string>;
  timeCode: string;
  narration: Record<LanguageCode, string>;
  visualScene: {
    heading: string;
    subheading: string;
    icon: any;
    color: string;
    highlights: string[];
    stat: string;
  };
  targetTab: string;
}

const CHAPTERS: VideoChapter[] = [
  {
    id: 1,
    timeCode: '0:00 - 0:45',
    title: {
      en: '1. Checking Live Mandi Prices & 7-Day AI Price Forecast',
      hi: '1. लाइव मंडी भाव देखना और 7-दिन का AI मूल्य पूर्वानुमान',
      ta: '1. நேரலை மண்டி விலை மற்றும் 7 நாள் AI கணிப்பை அறிவது',
      te: '1. లైవ్ మార్కెట్ ధరలు మరియు 7 రోజుల AI అంచనా చూడటం',
      kn: '1. ಲೈವ್ ಮಂಡಿ ದರಗಳು ಮತ್ತು 7 ದಿನಗಳ AI ಮುನ್ಸೂಚನೆ ತಿಳಿಯುವುದು',
      mr: '1. थेट बाजारभाव व 7 दिवसांचा AI भाव अंदाज पाहणे',
      bn: '1. লাইভ মাণ্ডি দর ও ৭ দিনের AI পূর্বাভাস দেখা',
      pa: '1. ਲਾਈਵ ਮੰਡੀ ਭਾਅ ਅਤੇ 7 ਦਿਨਾਂ ਦਾ AI ਅੰਦਾਜ਼ਾ ਦੇਖਣਾ',
      gu: '1. લાઈવ માર્કેટ યાર્ડ ભાવ અને 7 દિવસનો AI અંદાજ જોવો',
    },
    narration: {
      en: 'Welcome to KisanSetu. First, open the Mandi Live Prices dashboard. Look at the 7-day price trajectory and the Best Selling Window recommendation to decide whether to sell today or hold for higher profits.',
      hi: 'किसान सेतु में आपका स्वागत है। सबसे पहले लाइव मंडी भाव खोलें। 7 दिन का भाव चार्ट और सर्वोत्तम बिक्री समय देखें ताकि आप सही समय पर अधिक दाम पा सकें।',
      ta: 'கிசான் சேதுவுக்கு நல்வரவு. முதலில் நேரலை மண்டி விலைகளைப் பாருங்கள். சிறந்த விற்பனை நேரப் பரிந்துரையைப் பார்த்து முடிவெடுக்கவும்.',
      te: 'కిసాన్ సేతుకు స్వాగతం. ముందుగా లైవ్ మార్కెట్ ధరలను చూడండి. 7 రోజుల ట్రెండ్‌ను పరిశీలించి సరైన సమయంలో విక్రయించండి.',
      kn: 'ಕಿಸಾನ್ ಸೇತುಗೆ ಸುಸ್ವಾಗತ. ಮೊದಲು ಲೈವ್ ಮಂಡಿ ದರಗಳನ್ನು ನೋಡಿ. ಬೆಲೆ ಏರಿಕೆಯ ಮುನ್ಸೂಚನೆ ನೋಡಿ ಸೂಕ್ತ ನಿರ್ಧಾರ ತೆಗೆದುಕೊಳ್ಳಿ.',
      mr: 'किसान सेतूमध्ये आपले स्वागत आहे. प्रथम थेट बाजारभाव तपासा. ७ दिवसांचा कल पाहून योग्य वेळी विक्री करा.',
      bn: 'কিষাণ সেতুতে স্বাগতম। প্রথমে লাইভ মাণ্ডি দর দেখুন। ৭ দিনের ট্রেন্ড দেখে সঠিক সময়ে ফসল বিক্রি করুন।',
      pa: 'ਕਿਸਾਨ ਸੇਤੂ ਵਿੱਚ ਤੁਹਾਡਾ ਸਵਾਗਤ ਹੈ। ਸਭ ਤੋਂ ਪਹਿਲਾਂ ਮੰਡੀ ਭਾਅ ਦੇਖੋ ਅਤੇ 7 ਦਿਨਾਂ ਦੇ ਅੰਦਾਜ਼ੇ ਮੁਤਾਬਕ ਸਹੀ ਫੈਸਲਾ ਲਓ।',
      gu: 'કિસાન સેતુમાં સ્વાગત છે. પહેલા લાઈવ માર્કેટ યાર્ડ ભાવ જુઓ. 7 દિવસના અંદાજ મુજબ યોગ્ય નિર્ણય લો.',
    },
    visualScene: {
      heading: 'Live Mandi Intelligence Layer',
      subheading: 'Aggregating AGMARKNET & e-NAM mandis with ML price forecasting',
      icon: TrendingUp,
      color: 'from-emerald-700 to-teal-800',
      highlights: [
        'Real-time modal & maximum prices across Punjab, MP, TN, Maharashtra',
        'Machine Learning Price Trend (Rising / Falling / Glut alert)',
        'Recommended Selling Window to maximize farmer realization',
      ],
      stat: '+3.6% Modal Price Uptrend This Week',
    },
    targetTab: 'mandi',
  },
  {
    id: 2,
    timeCode: '0:45 - 1:30',
    title: {
      en: '2. Smart Matchmaker: Zero Middleman Commission Math',
      hi: '2. स्मार्ट मैचमेकर: शून्य बिचौलिया दलाली और शुद्ध मुनाफा',
      ta: '2. ஸ்மார்ட் மேட்ச்மேக்கர்: இடைத்தரகர் இல்லாத கூடுதல் லாபம்',
      te: '2. స్మార్ట్ మ్యాచింగ్: మధ్యవర్తుల కమీషన్ లేకుండా అదనపు లాభం',
      kn: '2. ಸ್ಮಾರ್ಟ್ ಹೊಂದಾಣಿಕೆ: ಮಧ್ಯವರ್ತಿ ಕಮಿಷನ್ ರಹಿತ ನಿವ್ವಳ ಲಾಭ',
      mr: '2. स्मार्ट जुळणी: दलाली मुक्त अतिरिक्त नफा गणित',
      bn: '2. স্মার্ট ম্যাচমেকার: দালালহীন বাড়তি লাভের হিসাব',
      pa: '2. ਸਮਾਰਟ ਮੇਲ: ਵਿਚੋਲਿਆਂ ਬਿਨਾਂ ਵੱਧ ਮੁਨਾਫੇ ਦੀ ਗਣਨਾ',
      gu: '2. સ્માર્ટ મેળવણી: દલાલી વગર વધારાનો નફો ગણવો',
    },
    narration: {
      en: 'In the Smart Match tab, enter your harvest quantity. KisanSetu calculates your gross sale value, subtracts freight, and demonstrates the 4.5% commission saved from middlemen—giving you up to 24% higher net profit.',
      hi: 'स्मार्ट मैच टैब में अपनी फसल और मात्रा डालें। किसान सेतु मंडी दलाली के 4.5% पैसे बचाकर सीधे खरीदारों से 24% तक अधिक शुद्ध मुनाफा जोड़ता है।',
      ta: 'ஸ்மார்ட் மேட்ச் பகுதியில் உங்கள் விளைச்சல் அளவை உள்ளிடவும். இடைத்தரகர் கமிஷனை சேமித்து 24% கூடுதல் லாபம் பெற உதவுகிறது.',
      te: 'స్మార్ట్ మ్యాచ్‌లో మీ పంట వివరాలు నమోదు చేయండి. మధ్యవర్తుల ఖర్చులు ఆదా చేసి 24% ఎక్కువ లాభం పొందండి.',
      kn: 'ಸ್ಮಾರ್ಟ್ ಮ್ಯಾಚ್‌ನಲ್ಲಿ ನಿಮ್ಮ ಬೆಳೆ ವಿವರ ಹಾಕಿ. ಶೇಕಡಾ 24 ರಷ್ಟು ಹೆಚ್ಚಿನ ನಿವ್ವಳ ಲಾಭ ಪಡೆಯಿರಿ.',
      mr: 'स्मार्ट मॅचमध्ये आपले पीक प्रमाण टाका. दलाली वाचवून २४% जास्त नफा मिळवा.',
      bn: 'স্মার্ট ম্যাচে ফসলের তথ্য দিন। ২৪% পর্যন্ত বেশি লাভ অর্জন করুন।',
      pa: 'ਸਮਾਰਟ ਮੈਚ ਵਿੱਚ ਆਪਣੀ ਫ਼ਸਲ ਦਰਜ ਕਰੋ ਅਤੇ 24% ਵੱਧ ਮੁਨਾਫਾ ਪਾਓ।',
      gu: 'સ્માર્ટ મેચમાં પાકની વિગત નાખો અને 24% વધુ નફો મેળવો.',
    },
    visualScene: {
      heading: 'Multi-Constraint Match Engine',
      subheading: 'OR-Tools optimization matching quality, distance, & trust',
      icon: Sparkles,
      color: 'from-amber-600 to-orange-700',
      highlights: [
        'Gross realization comparison: Local Mandi vs Direct Verified Buyer',
        'Middleman Brokerage (4.5%) and Mandi Cess (1.5%) completely eliminated',
        'Direct connection to JioMart, Blinkit, ITC, and Organic Exporters',
      ],
      stat: '₹140 - ₹320 / Quintal Extra Net Gain',
    },
    targetTab: 'match',
  },
  {
    id: 3,
    timeCode: '1:30 - 2:15',
    title: {
      en: '3. Booking Subsidized Kisan Rail & Rural Transporters',
      hi: '3. 50% सब्सिडी वाली किसान रेल व राधेमीणा वाहन बुकिंग',
      ta: '3. 50% மானியத்துடன் கூடிய கிசான் ரயில் & வாகன முன்பதிவு',
      te: '3. 50% సబ్సిడీ కిసాన్ రైలు & గ్రామీణ వాహనాల బుకింగ్',
      kn: '3. 50% ಸಬ್ಸಿಡಿಯೊಂದಿಗೆ ಕಿಸಾನ್ ರೈಲು ಮತ್ತು ವಾಹನ ಬುಕಿಂಗ್',
      mr: '3. ५०% अनुदानाची किसान रेल व स्थानिक वाहतूक बुकिंग',
      bn: '3. ৫০% ভরতুকিযুক্ত কিষাণ রেল ও পরিবহন বুকিং',
      pa: '3. 50% ਸਬਸਿਡੀ ਵਾਲੀ ਕਿਸਾਨ ਰੇਲ ਤੇ ਵਾਹਨ ਬੁਕਿੰਗ',
      gu: '3. 50% સબસિડીવાળી કિસાન રેલ અને વાહન બુકિંગ',
    },
    narration: {
      en: 'Need to transport your produce? Use our Logistics tab. Choose Indian Railways Kisan Rail for long distance with 50% freight subsidy, or Radheemena trucks for direct farm gate pickup.',
      hi: 'माल भेजने के लिए परिवहन टैब चुनें। लंबी दूरी के लिए 50% मालभाड़ा सब्सिडी वाली किसान रेल चुनें, या खेत से सीधे पिकअप के लिए राधेमीणा ट्रक बुक करें।',
      ta: 'விளைபொருளை அனுப்ப போக்குவரத்து பகுதியைத் தேர்ந்தெடுக்கவும். 50% கட்டண மானியத்துடன் கூடிய கிசான் ரயில் அல்லது கிராமப்புற வாகனங்களை முன்பதிவு செய்யுங்கள்.',
      te: 'రవాణా కోసం లాజిస్టిక్స్ ట్యాబ్ ఉపయోగించండి. 50% సబ్సిడీ గల కిసాన్ రైలు లేదా గ్రామీణ ట్రక్కులను ఎంచుకోండి.',
      kn: 'ಸಾರಿಗೆಗಾಗಿ ಲಾಜಿಸ್ಟಿಕ್ಸ್ ಆಯ್ಕೆಮಾಡಿ. 50% ರಿಯಾಯಿತಿ ಕಿಸಾನ್ ರೈಲು ಅಥವಾ ಸ್ಥಳೀಯ ಟ್ರಕ್‌ಗಳನ್ನು ಬುಕ್ ಮಾಡಿ.',
      mr: 'वाहतुकीसाठी किसान रेल किंवा ग्रामीण ट्रक्स निवडा. ५०% भाडे अनुदानाचा लाभ घ्या.',
      bn: 'পরিবহনের জন্য কিষাণ রেল বা গ্রামীণ ট্রাক বেছে নিন এবং ৫০% ভরতুকি পান।',
      pa: 'ਮਾਲ ਢੁਆਈ ਲਈ 50% ਸਬਸਿਡੀ ਵਾਲੀ ਕਿਸਾਨ ਰੇਲ ਜਾਂ ਟਰੱਕ ਬੁੱਕ ਕਰੋ।',
      gu: 'પરિવહન માટે 50% સબસિડીવાળી કિસાન રેલ કે સ્થાનિક ટ્રક પસંદ કરો.',
    },
    visualScene: {
      heading: 'Integrated Farm-to-Buyer Logistics',
      subheading: 'Subsidized Indian Railways & rural carrier linkages',
      icon: Truck,
      color: 'from-blue-700 to-indigo-800',
      highlights: [
        'Kisan Rail Express with 50% Ministry of Food Processing freight subsidy',
        'Direct Farm-Gate loading to prevent multi-handling loss',
        'Reefer cold chain (+4°C) for perishable tomatoes and bananas',
      ],
      stat: '50% Freight Cost Subsidy via Kisan Rail',
    },
    targetTab: 'logistics',
  },
  {
    id: 4,
    timeCode: '2:15 - 3:00',
    title: {
      en: '4. T+1 Escrow Guaranteed Payments & Dispute Resolution',
      hi: '4. T+1 एस्क्रो सुरक्षित भुगतान और विवाद निवारण सुरक्षा',
      ta: '4. T+1 எஸ்க்ரோ பாதுகாப்பான வங்கி பணம் & குறைதீர்ப்பு முறை',
      te: '4. T+1 ఎస్క్రో సురక్షిత చెల్లింపు & వివాద పరిష్కారం',
      kn: '4. T+1 ಎಸ್ಕ್ರೊ ಸುರಕ್ಷಿತ ಬ್ಯಾಂಕ್ ಪಾವತಿ & ವಿವಾದ ಪರಿಹಾರ',
      mr: '4. T+1 एस्क्रो सुरक्षित रक्कम व तक्रार निवारण व्यवस्था',
      bn: '4. T+1 এসক্রো সুরক্ষিত ব্যাংক পেমেন্ট ও সমাধান',
      pa: '4. T+1 ਐਸਕਰੋ ਸੁਰੱਖਿਅਤ ਭੁਗਤਾਨ ਤੇ ਸ਼ਿਕਾਇਤ ਨਿਵਾਰਨ',
      gu: '4. T+1 એસ્ક્રો સુરક્ષિત બેંક ચુકવણી અને ફરિયાદ નિવારણ',
    },
    narration: {
      en: 'Never worry about default or delayed payment. The buyer deposits 100% of the funds in KisanSetu Escrow before you dispatch. Once quality is verified at delivery, funds transfer directly to your bank account within 24 hours.',
      hi: 'पैसा डूबने का कोई डर नहीं। माल रवाना करने से पहले खरीदार की रकम एस्क्रो में जमा होती है। डिलीवरी पर गुणवत्ता चेक होते ही 24 घंटे में पैसा आपके बैंक खाते में!',
      ta: 'பணம் வராமல் போகுமோ என்ற பயம் வேண்டாம். பணம் எஸ்க்ரோவில் டெபாசிட் ஆன பிறகே சரக்கு அனுப்பப்படும். டெலிவரியான 24 மணி நேரத்தில் வங்கிக்கு வரும்.',
      te: 'డబ్బు రాదనే భయం లేదు. సరుకు పంపక ముందే డబ్బు ఎస్క్రోలో భద్రంగా ఉంటుంది. డెలివరీ తర్వాత 24 గంటల్లో మీ ఖాతాలో జమవుతుంది.',
      kn: 'ಹಣ ಬರುವುದಿಲ್ಲ ಎಂಬ ಭಯವಿಲ್ಲ. ಸಾಗಣೆಗೆ ಮುನ್ನವೇ ಹಣ ಎಸ್ಕ್ರೊದಲ್ಲಿ ಸುರಕ್ಷಿತ. ಡೆಲಿವರಿ ಆದ 24 ಗಂಟೆಯಲ್ಲಿ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ!',
      mr: 'पैसे बुडण्याची भीती नाही. माल पाठवण्यापूर्वी रक्कम एस्क्रोमध्ये जमा होते. २४ तासांत थेट बँकेत!',
      bn: 'টাকা আটকে যাওয়ার ভয় নেই। মাল পাঠানোর আগেই টাকা এসক্রোতে জমা থাকে। ২৪ ঘণ্টায় ব্যাংকে পৌঁছে যায়!',
      pa: 'ਪੈਸੇ ਨਾ ਮਿਲਣ ਦਾ ਕੋਈ ਡਰ ਨਹੀਂ। ਮਾਲ ਭੇਜਣ ਤੋਂ ਪਹਿਲਾਂ ਰਕਮ ਐਸਕਰੋ ਵਿੱਚ ਹੁੰਦੀ ਹੈ। 24 ਘੰਟਿਆਂ ਵਿੱਚ ਬੈਂਕ ਖਾਤੇ ਵਿੱਚ!',
      gu: 'પૈસા અટવાઈ જવાનો કોઈ ડર નથી. માલ મોકલતા પહેલા રકમ એસ્ક્રોમાં જમા થાય છે. 24 કલાકમાં સીધા બેંકમાં!',
    },
    visualScene: {
      heading: 'Guaranteed Escrow Protection',
      subheading: 'RBI-regulated T+1 digital escrow settlement & mediation',
      icon: ShieldCheck,
      color: 'from-emerald-800 to-teal-900',
      highlights: [
        'Buyer funds locked in Escrow before farm-gate dispatch',
        'Automated T+1 bank settlement upon digital weighbridge slip',
        '24x7 Grievance resolution desk with photo evidence arbitration',
      ],
      stat: '99.8% On-Time Settlement Reliability',
    },
    targetTab: 'orders',
  },
];

export const VideoGuidanceModal: React.FC<VideoGuidanceModalProps> = ({
  isOpen,
  onClose,
  currentLang,
  onSelectTab,
}) => {
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioActive, setIsAudioActive] = useState(false);

  const chapter = CHAPTERS[activeChapterIndex];
  const langConfig = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  const handlePlayChapterAudio = () => {
    const textToSpeak = `${chapter.title[currentLang] || chapter.title.en}. ${chapter.narration[currentLang] || chapter.narration.en}`;
    setIsAudioActive(true);
    speechService.speak(textToSpeak, currentLang, () => {
      setIsAudioActive(false);
    });
  };

  const handleStopAudio = () => {
    speechService.stopSpeaking();
    setIsAudioActive(false);
  };

  const handleNextChapter = () => {
    handleStopAudio();
    if (activeChapterIndex < CHAPTERS.length - 1) {
      setActiveChapterIndex(activeChapterIndex + 1);
    } else {
      setActiveChapterIndex(0);
    }
  };

  const handleGoToFeature = () => {
    handleStopAudio();
    onSelectTab(chapter.targetTab);
    onClose();
  };

  if (!isOpen) return null;

  const SceneIcon = chapter.visualScene.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/80 backdrop-blur-xs animate-in fade-in">
      <div className="bg-stone-900 text-white w-full max-w-4xl rounded-2xl shadow-2xl border border-stone-700 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-stone-950 px-5 py-3 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
              ▶
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white">
                KisanSetu Interactive Video & Audio Guide
              </h3>
              <p className="text-xs text-stone-400">
                Language: <span className="text-emerald-400 font-semibold">{langConfig.native} ({langConfig.label})</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              handleStopAudio();
              onClose();
            }}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Simulation Canvas */}
        <div className="relative bg-black aspect-video max-h-[380px] w-full flex items-center justify-center overflow-hidden">
          
          {/* Animated Background Gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${chapter.visualScene.color} opacity-90 transition-all duration-700`} />

          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]" />

          {/* Active Visual Scene Graphic */}
          <div className="relative z-10 p-6 sm:p-8 max-w-2xl text-center space-y-4">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-xs font-bold text-emerald-300">
              <SceneIcon className="w-4 h-4" />
              <span>Chapter {chapter.id} of {CHAPTERS.length} • {chapter.timeCode}</span>
            </div>

            <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              {chapter.visualScene.heading}
            </h2>

            <p className="text-xs sm:text-sm text-stone-200 max-w-lg mx-auto">
              {chapter.visualScene.subheading}
            </p>

            {/* Feature Bullets inside Video Frame */}
            <div className="bg-black/30 backdrop-blur-md border border-white/15 rounded-xl p-3.5 text-left text-xs space-y-1.5 max-w-md mx-auto">
              {chapter.visualScene.highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-2 text-stone-100">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{h}</span>
                </div>
              ))}
            </div>

            {/* Stat Pill */}
            <div className="inline-block bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 px-3.5 py-1 rounded-full text-xs font-extrabold">
              ★ {chapter.visualScene.stat}
            </div>

          </div>

          {/* Video Controls Bar Overlay */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 flex items-center justify-between z-20">
            <div className="flex items-center gap-3">
              <button
                id="video-play-narration-btn"
                onClick={isAudioActive ? handleStopAudio : handlePlayChapterAudio}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                {isAudioActive ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span>{isAudioActive ? 'Stop Regional Audio' : `Play Voiceover (${langConfig.native})`}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleNextChapter}
                className="text-xs font-bold text-stone-300 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Next Chapter →
              </button>
              <button
                id="video-jump-tab-btn"
                onClick={handleGoToFeature}
                className="flex items-center gap-1.5 text-xs font-bold text-stone-900 bg-amber-400 hover:bg-amber-300 px-3 py-1.5 rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                <span>Try This Feature</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

        {/* Chapter Selection Playlist */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 overflow-y-auto max-h-[220px]">
          <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
            Step-by-Step Tutorial Chapters:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {CHAPTERS.map((ch, idx) => {
              const isCurrent = idx === activeChapterIndex;
              return (
                <button
                  key={ch.id}
                  onClick={() => {
                    handleStopAudio();
                    setActiveChapterIndex(idx);
                  }}
                  className={`flex items-start gap-2.5 p-2.5 rounded-xl text-left transition-all cursor-pointer border ${
                    isCurrent
                      ? 'bg-emerald-950/70 border-emerald-500 text-white'
                      : 'bg-stone-900/60 hover:bg-stone-900 border-stone-800 text-stone-300'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                    isCurrent ? 'bg-emerald-600 text-white' : 'bg-stone-800 text-stone-400'
                  }`}>
                    {ch.id}
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold line-clamp-1">
                      {ch.title[currentLang] || ch.title.en}
                    </p>
                    <p className="text-[11px] text-stone-400 line-clamp-2">
                      {ch.narration[currentLang] || ch.narration.en}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
