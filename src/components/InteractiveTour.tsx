import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Volume2, 
  VolumeX, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Sparkles, 
  X, 
  ArrowRight,
  TrendingUp,
  SlidersHorizontal,
  Truck,
  ShieldCheck
} from 'lucide-react';
import { LanguageCode } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { speechService } from '../services/speech';

interface InteractiveTourProps {
  currentLang: LanguageCode;
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
}

interface StepItem {
  id: number;
  title: Record<LanguageCode, string>;
  description: Record<LanguageCode, string>;
  targetTab: string;
  badge: string;
  actionText: Record<LanguageCode, string>;
}

const TOUR_STEPS: StepItem[] = [
  {
    id: 1,
    badge: 'Step 1 • मंडी भाव व AI अनुमान',
    targetTab: 'mandi',
    title: {
      en: 'Level 1: Explore Live Mandi Prices & AI Forecast',
      hi: 'लेवल 1: लाइव मंडी भाव देखें और 7 दिन का AI अनुमान जानें',
      ta: 'நிலை 1: நேரலை மண்டி விலைகள் மற்றும் AI கணிப்பை ஆராயுங்கள்',
      te: 'లెవల్ 1: లైవ్ మార్కెట్ ధరలు & AI అంచనాలను చూడండి',
      kn: 'ಹಂತ 1: ಲೈವ್ ಮಂಡಿ ದರಗಳು ಮತ್ತು AI ಮುನ್ಸೂಚನೆ ಪರಿಶೀಲಿಸಿ',
      mr: 'लेव्हल 1: थेट बाजारभाव व 7 दिवसांचा AI अंदाज तपासा',
      bn: 'লেভেল 1: লাইভ মাণ্ডি দর এবং 7 দিনের AI পূর্বাভাস দেখুন',
      pa: 'ਲੈਵਲ 1: ਲਾਈਵ ਮੰਡੀ ਭਾਅ ਅਤੇ 7 ਦਿਨਾਂ ਦਾ AI ਅੰਦਾਜ਼ਾ ਜਾਣੋ',
      gu: 'લેવલ 1: લાઈવ માર્કેટ યાર્ડ ભાવ અને AI અંદાજ જુઓ',
    },
    description: {
      en: 'Check today’s arrival volumes and modal prices across India. The AI forecast tells you whether prices will rise or if you should sell within 48 hours to avoid glut.',
      hi: 'देश भर की मंडियों में आज की आवक और मॉडल भाव देखें। AI मॉडल बताता है कि भाव बढ़ेंगे या आपको 48 घंटे में बेच देना चाहिए।',
      ta: 'இந்தியா முழுவதும் இன்றைய வரத்து மற்றும் விலைகளை சரிபார்க்கவும். விலை உயருமா அல்லது உடனே விற்க வேண்டுமா என்று AI வழிகாட்டுகிறது.',
      te: 'దేశవ్యాప్తంగా నేటి రాక మరియు మోడల్ ధరలను తనిఖీ చేయండి. ధరలు పెరుగుతాయా లేదా ఇప్పుడే విక్రయించాలా అని AI మీకు చెబుతుంది.',
      kn: 'ದೇಶಾದ್ಯಂತ ಇಂದಿನ ಒಳಹರಿವು ಮತ್ತು ದರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ. ದರಗಳು ಹೆಚ್ಚಾಗುತ್ತವೆಯೇ ಅಥವಾ ಮಾರಾಟ ಮಾಡಬೇಕೇ ಎಂದು AI ಹೇಳುತ್ತದೆ.',
      mr: 'देशभरातील बाजार समित्यांमधील आवक व भाव पहा. AI मॉडेल सांगते की भाव वाढणार आहेत की लगेच विक्री करावी.',
      bn: 'সারা দেশের মাণ্ডি দর ও আমদানি দেখুন। দাম বাড়বে নাকি বিক্রি করে দেওয়া উচিত তা AI আপনাকে জানাবে।',
      pa: 'ਦੇਸ਼ ਭਰ ਦੀਆਂ ਮੰਡੀਆਂ ਦੇ ਭਾਅ ਦੇਖੋ। AI ਮਾਡਲ ਦੱਸਦਾ ਹੈ ਕਿ ਭਾਅ ਵਧਣਗੇ ਜਾਂ ਤੁਰੰਤ ਵੇਚਣਾ ਬਿਹਤਰ ਹੈ।',
      gu: 'સમગ્ર દેશના માર્કેટ યાર્ડ ભાવ જુઓ. AI જણાવે છે કે ભાવ વધશે કે તુરંત વેચાણ કરવું લાભદાયક રહેશે.',
    },
    actionText: {
      en: 'View Live Mandis',
      hi: 'लाइव मंडियां देखें',
      ta: 'மண்டிகளைப் பார்',
      te: 'మార్కెట్లు చూడండి',
      kn: 'ಮಂಡಿಗಳನ್ನು ನೋಡಿ',
      mr: 'बाजार पहा',
      bn: 'মাণ্ডি দেখুন',
      pa: 'ਮੰਡੀਆਂ ਦੇਖੋ',
      gu: 'માર્કેટ યાર્ડ જુઓ',
    },
  },
  {
    id: 2,
    badge: 'Step 2 • स्मार्ट मैच व शून्य दलाली',
    targetTab: 'match',
    title: {
      en: 'Level 2: Run Smart Matchmaker & Net Profit Optimizer',
      hi: 'लेवल 2: स्मार्ट मिलान चलाएं और बिचौलिया-मुक्त अतिरिक्त मुनाफा देखें',
      ta: 'நிலை 2: ஸ்மார்ட் பொருத்தம் மற்றும் கூடுதல் லாப கால்குலேட்டர்',
      te: 'లెవల్ 2: స్మార్ట్ మ్యాచింగ్ ద్వారా మధ్యవర్తులు లేని లాభాన్ని లెక్కించండి',
      kn: 'ಹಂತ 2: ಸ್ಮಾರ್ಟ್ ಮ್ಯಾಚಿಂಗ್ ಮತ್ತು ಮಧ್ಯವರ್ತಿ ರಹಿತ ಲಾಭ ಲೆಕ್ಕಾಚಾರ',
      mr: 'लेव्हल 2: स्मार्ट जुळणी करा आणि दलाली वाचवून जास्तीचा नफा मिळवा',
      bn: 'লেভেল 2: স্মার্ট ম্যাচিং করে দালালহীন বাড়তি লাভ হিসাব করুন',
      pa: 'ਲੈਵਲ 2: ਸਮਾਰਟ ਮੇਲ ਨਾਲ ਵਿਚੋਲਿਆਂ ਬਿਨਾਂ ਵੱਧ ਮੁਨਾਫਾ ਜਾਣੋ',
      gu: 'લેવલ 2: સ્માર્ટ મેળવણી કરીને દલાલી મુક્ત વધારાનો નફો ગણો',
    },
    description: {
      en: 'Enter your harvest quantity and grade. Our multi-constraint engine compares your local mandi against direct buyers (JioMart, Blinkit, ITC) with ₹0 middleman cut!',
      hi: 'अपनी फसल और मात्रा दर्ज करें। हमारा इंजन स्थानीय मंडी के मुकाबले सीधे खरीदारों (JioMart, Blinkit, ITC) के शुद्ध मुनाफे की तुलना करता है।',
      ta: 'உங்கள் பயிர் விவரங்களை உள்ளிடவும். இடைத்தரகர் கமிஷன் இல்லாமல் நேரடி வாங்குபவர்களின் லாபத்தை ஒப்பிடுகிறது.',
      te: 'మీ పంట పరిమాణం నమోదు చేయండి. లోకల్ మార్కెట్ కంటే ప్రత్యక్ష కొనుగోలుదారుల ద్వారా ఎంత లాభం వస్తుందో చూడండి.',
      kn: 'ನಿಮ್ಮ ಬೆಳೆ ಪ್ರಮಾಣ ನಮೂದಿಸಿ. ಸ್ಥಳೀಯ ಮಂಡಿಗಿಂತ ನೇರ ಖರೀದಿದಾರರಿಂದ ಬರುವ ಹೆಚ್ಚಿನ ಲಾಭವನ್ನು ಪರಿಶೀಲಿಸಿ.',
      mr: 'आपले पीक व प्रमाण टाका. स्थानिक बाजारापेक्षा थेट खरेदीदारांकडून मिळणाऱ्या शुद्ध नफ्याची तुलना पहा.',
      bn: 'আপনার ফসলের পরিমাণ লিখুন। স্থানীয় মাণ্ডির তুলনায় সরাসরি ক্রেতাদের থেকে বাড়তি লাভ দেখুন।',
      pa: 'ਆਪਣੀ ਫ਼ਸਲ ਤੇ ਮਾਤਰਾ ਦਰਜ ਕਰੋ। ਸਥਾਨਕ ਮੰਡੀ ਨਾਲੋਂ ਸਿੱਧੇ ਖਰੀਦਦਾਰਾਂ ਤੋਂ ਵੱਧ ਮੁਨਾਫਾ ਦੇਖੋ।',
      gu: 'તમારો પાક અને જથ્થો દાખલ કરો. સ્થાનિક માર્કેટ યાર્ડ કરતા સીધા ખરીદદારો પાસેથી મળતા નફાની સરખામણી જુઓ.',
    },
    actionText: {
      en: 'Test Match Optimizer',
      hi: 'स्मार्ट मैच चलाएं',
      ta: 'பொருத்தம் பார்',
      te: 'మ్యాచింగ్ చూడండి',
      kn: 'ಮ್ಯಾಚಿಂಗ್ ಪರೀಕ್ಷಿಸಿ',
      mr: 'मॅचिंग करा',
      bn: 'ম্যাচ পরীক্ষা করুন',
      pa: 'ਮੈਚ ਪਰਖੋ',
      gu: 'મેળવણી ચકાસો',
    },
  },
  {
    id: 3,
    badge: 'Step 3 • खरीदारों की मांग',
    targetTab: 'buyers',
    title: {
      en: 'Level 3: Browse Verified Buyer Demands & Direct Contracts',
      hi: 'लेवल 3: सत्यापित खरीदारों की मांग देखें और सीधे जुड़ें',
      ta: 'நிலை 3: சரிபார்க்கப்பட்ட வாங்குபவர்களின் தேவைகளைப் பார்த்து இணைக்கவும்',
      te: 'లెవల్ 3: ధృవీకరించబడిన కొనుగోలుదారుల అవసరాలను చూసి నేరుగా కనెక్ట్ అవ్వండి',
      kn: 'ಹಂತ 3: ಪರಿಶೀಲಿಸಿದ ಖರೀದಿದಾರರ ಬೇಡಿಕೆಗಳನ್ನು ನೋಡಿ ಮತ್ತು ಸಂಪರ್ಕಿಸಿ',
      mr: 'लेव्हल 3: सत्यापित खरेदीदारांच्या मागण्या पहा आणि थेट करार करा',
      bn: 'লেভেল 3: যাচাইকৃত ক্রেতাদের চাহিদা দেখুন এবং সরাসরি যুক্ত হন',
      pa: 'ਲੈਵਲ 3: ਤਸਦੀਕਸ਼ੁਦਾ ਖਰੀਦਦਾਰਾਂ ਦੀਆਂ ਮੰਗਾਂ ਦੇਖੋ ਅਤੇ ਸਿੱਧਾ ਜੁੜੋ',
      gu: 'લેવલ 3: પ્રમાણિત ખરીદદારોની માંગ જુઓ અને સીધા સંપર્ક કરો',
    },
    description: {
      en: 'View bulk requirements from retail chains, institutional processors, and family cooperatives with transparent pricing, quality specs, and payment ratings.',
      hi: 'किराना दुकानों, फूड प्रोसेसर, एक्सपोर्टर और उपभोक्ता सोसायटियों की मांग देखें जहाँ भाव और पेमेंट शर्तें स्पष्ट हैं।',
      ta: 'சில்லறை கடைகள், உணவு ஆலைகள் மற்றும் குடும்ப குழுக்களின் கொள்முதல் தேவைகளை வெளிப்படையான விலையில் காண்க.',
      te: 'రిటైલ షాపులు, ప్రాసెసింగ్ కంపెనీలు మరియు కుటుంబ సొసైటీల కొనుగోలు డిమాండ్ చూడండి.',
      kn: 'ರೀಟೇಲ್ ಅಂಗಡಿಗಳು ಮತ್ತು ಆಹಾರ ಸಂಸ್ಕರಣಾ ಕಂಪನಿಗಳ ಸಗಟು ಬೇಡಿಕೆಗಳನ್ನು ನೋಡಿ.',
      mr: 'किराणा दुकाने, प्रक्रिया उद्योग व ग्राहक सोसायट्यांच्या थेट खरेदी मागण्या तपासा.',
      bn: 'খুচরা দোকান ও খাদ্য প্রক্রিয়াকরণ সংস্থাগুলির পাইকারি চাহিদা দেখুন।',
      pa: 'ਰਿਟੇਲ ਦੁਕਾਨਾਂ ਅਤੇ ਫੂਡ ਪ੍ਰੋਸੈਸਰਾਂ ਦੀਆਂ ਸਿੱਧੀਆਂ ਮੰਗਾਂ ਦੇਖੋ।',
      gu: 'રિટેલ દુકાનો અને ફૂડ પ્રોસેસિંગ કંપનીઓની સીધી ખરીદ માંગ જુઓ.',
    },
    actionText: {
      en: 'Explore Buyer Demands',
      hi: 'खरीदार मांग देखें',
      ta: 'தேவைகளை பார்',
      te: 'డిమాండ్లు చూడండి',
      kn: 'ಬೇಡಿಕೆಗಳನ್ನು ನೋಡಿ',
      mr: 'मागण्या पहा',
      bn: 'চাহিদা দেখুন',
      pa: 'ਮੰਗਾਂ ਦੇਖੋ',
      gu: 'માંગ જુઓ',
    },
  },
  {
    id: 4,
    badge: 'Step 4 • किसान रेल व परिवहन',
    targetTab: 'logistics',
    title: {
      en: 'Level 4: Book Subsidized Kisan Rail & Rural Transport',
      hi: 'लेवल 4: 50% सब्सिडी वाली किसान रेल व ग्रामीण वाहन बुक करें',
      ta: 'நிலை 4: 50% மானியத்துடன் கூடிய கிசான் ரயில் & வாகன முன்பதிவு',
      te: 'లెవల్ 4: 50% సబ్సిడీ గల కిసాన్ రైలు & రవాణా వాహనాలు బుక్ చేయండి',
      kn: 'ಹಂತ 4: 50% ಸಬ್ಸಿಡಿಯೊಂದಿಗೆ ಕಿಸಾನ್ ರೈಲು ಮತ್ತು ಗ್ರಾಮೀಣ ವಾಹನ ಬುಕ್ ಮಾಡಿ',
      mr: 'लेव्हल 4: 50% अनुदानाची किसान रेल व स्थानिक वाहतूक बुक करा',
      bn: 'লেভেল 4: ৫০% ভরতুকিযুক্ত কিষাণ রেল ও পরিবহন বুক করুন',
      pa: 'ਲੈਵਲ 4: 50% ਸਬਸਿਡੀ ਵਾਲੀ ਕਿਸਾਨ ਰੇਲ ਤੇ ਟਰਾਂਸਪੋਰਟ ਬੁੱਕ ਕਰੋ',
      gu: 'લેવલ 4: 50% સબસિડીવાળી કિસાન રેલ અને સ્થાનિક વાહન બુક કરો',
    },
    description: {
      en: 'Connect to Indian Railways Kisan Rail parcel coaches (50% freight subsidy) and Radheemena rural farm-gate pickups to prevent post-harvest spoilage.',
      hi: 'भारतीय रेलवे किसान रेल पार्सल (50% मालभाड़ा सब्सिडी) और राधेमीणा ग्रामीण ट्रकों से सीधे खेत से माल उठवाएं।',
      ta: 'இந்திய ரயில்வேயின் கிசான் ரயில் (50% கட்டண மானியம்) மற்றும் கிராமப்புற வாகனங்கள் மூலம் உங்கள் விளைச்சலை அனுப்புங்கள்.',
      te: 'రైల్వే కిసాన్ రైలు (50% సబ్సిడీ) మరియు గ్రామీణ వాహనాల ద్వారా పంటను సురક્ષితంగా రవాణా చేయండి.',
      kn: 'ರೈಲ್ವೆ ಕಿಸಾನ್ ರೈಲು (50% ರಿಯಾಯಿತಿ) ಮತ್ತು ಗ್ರಾಮೀಣ ವಾಹನಗಳ ಮೂಲಕ ನೇರ ಸಾಗಣೆ ವ್ಯವಸ್ಥೆ.',
      mr: 'भारतीय रेल्वे किसान रेल (५०% अनुदान) आणि ग्रामीण वाहनांद्वारे शेतातून थेट माल वाहतूक करा.',
      bn: 'ভারতীয় রেলের কিষাণ রেল ও গ্রামীণ পরিবহনের মাধ্যমে সরাসরি ফার্ম থেকে মাল পাঠান।',
      pa: 'ਰੇਲਵੇ ਕਿਸਾਨ ਰੇਲ (50% ਸਬਸਿਡੀ) ਰਾਹੀਂ ਸਿੱਧਾ ਖੇਤ ਵਿੱਚੋਂ ਮਾਲ ਢੁਆਈ ਕਰੋ।',
      gu: 'ભારતીય રેલ્વે કિસાન રેલ (50% સબસિડી) અને ગ્રામીણ વાહનો દ્વારા ખેતરમાંથી સીધું પરિવહન મેળવો.',
    },
    actionText: {
      en: 'View Transport Options',
      hi: 'परिवहन विकल्प देखें',
      ta: 'போக்குவரத்தை பார்',
      te: 'రవాణా చూడండి',
      kn: 'ಸಾರಿಗೆ ನೋಡಿ',
      mr: 'वाहतूक पहा',
      bn: 'পরিবহন দেখুন',
      pa: 'ਟਰਾਂਸਪੋਰਟ ਦੇਖੋ',
      gu: 'પરિવહન જુઓ',
    },
  },
  {
    id: 5,
    badge: 'Step 5 • एस्क्रो सुरक्षित भुगतान',
    targetTab: 'orders',
    title: {
      en: 'Level 5: Master T+1 Escrow Guaranteed Payments & Disputes',
      hi: 'लेवल 5: T+1 एस्क्रो सुरक्षित भुगतान और निवारण प्रणाली समझें',
      ta: 'நிலை 5: T+1 எஸ்க்ரோ பாதுகாப்பான பணம் மற்றும் குறைதீர்ப்பு வழிமுறை',
      te: 'లెవల్ 5: T+1 ఎస్క్రో సురక్షిత చెల్లింపు మరియు ఫిర్యాదుల పరిష్కారం',
      kn: 'ಹಂತ 5: T+1 ಎಸ್ಕ್ರೊ ಸುರಕ್ಷಿತ ಪಾವತಿ ಮತ್ತು ಕುಂದುಕೊರತೆ ವ್ಯವಸ್ಥೆ',
      mr: 'लेव्हल 5: T+1 एस्क्रो सुरक्षित रक्कम आणि तक्रार निवारण यंत्रणा',
      bn: 'লেভেল 5: T+1 এসক্রো সুরক্ষিত পেমেন্ট এবং অভিযোগ সমাধান ব্যবস্থা',
      pa: 'ਲੈਵਲ 5: T+1 ਐਸਕਰੋ ਸੁਰੱਖਿਅਤ ਭੁਗਤਾਨ ਅਤੇ ਸ਼ਿਕਾਇਤ ਨਿਵਾਰਨ',
      gu: 'લેવલ 5: T+1 એસ્ક્રો સુરક્ષિત ચુકવણી અને ફરિયાદ નિવારણ વ્યવસ્થા',
    },
    description: {
      en: 'Buyer funds are locked in KisanSetu bank escrow BEFORE dispatch. Once quality grading is confirmed at delivery, payment is auto-released to your bank in 24 hours!',
      hi: 'माल भेजने से पहले खरीदार की रकम एस्क्रो खाते में जमा होती है। डिलीवरी पर ग्रेडिंग जांच होते ही 24 घंटे में पैसा आपके खाते में!',
      ta: 'விளைபொருளை அனுப்பும் முன்பே பணம் எஸ்க்ரோவில் டெபாசிட் செய்யப்படுகிறது. டெலிவரி முடிந்தவுடன் 24 மணி நேரத்தில் வங்கிக்கு வரும்!',
      te: 'సరుకు పంపే ముందే డబ్బు ఎస్క్రోలో లాక్ అవుతుంది. డెలివరీ నాణ్యత ధృవీకరించిన 24 గంటల్లో మీ ఖాతాలో జమవుతుంది!',
      kn: 'ಸಾಗಣೆ ಮಾಡುವ ಮುನ್ನವೇ ಹಣ ಎಸ್ಕ್ರೊದಲ್ಲಿ ಭದ್ರವಾಗಿರುತ್ತದೆ. ಡೆಲಿವರಿ ಆದ 24 ಗಂಟೆಗಳಲ್ಲಿ ಹಣ ಖಾತೆಗೆ ಜಮೆ!',
      mr: 'माल पाठवण्यापूर्वी रक्कम एस्क्रो खात्यात सुरक्षित ठेवली जाते. डिलिव्हरी होताच २४ तासांत पैसे थेट खात्यात!',
      bn: 'মাল পাঠানোর আগেই টাকা এসক্রোতে জমা হয়। ডেলিভারি হওয়ার ২৪ ঘণ্টার মধ্যে ব্যাংক অ্যাকাউন্টে টাকা চলে আসে!',
      pa: 'ਮਾਲ ਭੇਜਣ ਤੋਂ ਪਹਿਲਾਂ ਰਕਮ ਐਸਕਰੋ ਖਾਤੇ ਵਿੱਚ ਜਮ੍ਹਾਂ ਹੁੰਦੀ ਹੈ। ਡਿਲੀਵਰੀ ਪਿੱਛੋਂ 24 ਘੰਟਿਆਂ ਵਿੱਚ ਪੈਸੇ ਤੁਹਾਡੇ ਖਾਤੇ ਵਿੱਚ!',
      gu: 'માલ મોકલતા પહેલા રકમ એસ્ક્રો ખાતામાં જમા થાય છે. ડિલિવરી થતા જ 24 કલાકમાં પૈસા સીધા બેંક ખાતામાં!',
    },
    actionText: {
      en: 'Check Escrow Orders',
      hi: 'एस्क्रो सौदे देखें',
      ta: 'எஸ்க்ரோ ஆர்டர்கள் பார்',
      te: 'ఎస్క్రో ఆర్డర్లు చూడండి',
      kn: 'ಆದೇಶಗಳನ್ನು ನೋಡಿ',
      mr: 'व्यवहार पहा',
      bn: 'অর্ডার দেখুন',
      pa: 'ਆਰਡਰ ਦੇਖੋ',
      gu: 'સોદા જુઓ',
    },
  },
];

export const InteractiveTour: React.FC<InteractiveTourProps> = ({
  currentLang,
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const step = TOUR_STEPS[currentStepIndex];
  const totalSteps = TOUR_STEPS.length;
  const progressPercent = Math.round(((currentStepIndex + 1) / totalSteps) * 100);

  // Auto-speak on step change if desired
  const handleSpeakCurrentStep = () => {
    const textToSpeak = `${step.title[currentLang] || step.title.en}. ${step.description[currentLang] || step.description.en}`;
    setIsSpeaking(true);
    speechService.speak(textToSpeak, currentLang, () => {
      setIsSpeaking(false);
    });
  };

  const handleStopSpeaking = () => {
    speechService.stopSpeaking();
    setIsSpeaking(false);
  };

  const handleNext = () => {
    handleStopSpeaking();
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    handleStopSpeaking();
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleActionClick = () => {
    onNavigateTab(step.targetTab);
  };

  if (!isOpen) return null;

  return (
    <div className="bg-slate-900 text-white border-b border-slate-800 shadow-sm relative z-30 transition-all">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-3.5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          {/* Left: Step Trophy & Text */}
          <div className="flex items-start gap-3.5 flex-1">
            <div className="w-10 h-10 rounded-lg bg-slate-800 text-emerald-400 font-extrabold flex flex-col items-center justify-center shrink-0 border border-slate-700">
              <Trophy className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] font-mono leading-none mt-0.5 text-slate-300">{currentStepIndex + 1}/{totalSteps}</span>
            </div>

            <div className="space-y-1 text-white">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-950/80 text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-800/60">
                  {step.badge}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  Progress: {progressPercent}%
                </span>
              </div>
              <h3 className="font-extrabold text-sm sm:text-base text-white leading-tight">
                {step.title[currentLang] || step.title.en}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                {step.description[currentLang] || step.description.en}
              </p>
            </div>
          </div>

          {/* Right: Controls & Actions */}
          <div className="flex flex-wrap items-center gap-2 self-end md:self-center shrink-0">
            {/* Audio narration button */}
            <button
              id="tour-speak-btn"
              onClick={isSpeaking ? handleStopSpeaking : handleSpeakCurrentStep}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-xs cursor-pointer border ${
                isSpeaking 
                  ? 'bg-rose-950 text-rose-300 border-rose-800 animate-pulse' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{isSpeaking ? 'Stop Audio' : 'Play Voice Tip'}</span>
            </button>

            {/* Jump to specific tab action */}
            <button
              id="tour-action-btn"
              onClick={handleActionClick}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-slate-950 shadow-xs transition-all cursor-pointer"
            >
              <span>{step.actionText[currentLang] || step.actionText.en}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Prev & Next Controls */}
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
              <button
                disabled={currentStepIndex === 0}
                onClick={handlePrev}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold bg-slate-100 text-slate-900 hover:bg-white shadow-xs cursor-pointer"
              >
                <span>{currentStepIndex === totalSteps - 1 ? 'Finish' : 'Next'}</span>
                {currentStepIndex === totalSteps - 1 ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={() => {
                handleStopSpeaking();
                onClose();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close guide"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Mini progress ticks */}
        <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-center gap-2">
          {TOUR_STEPS.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => {
                handleStopSpeaking();
                setCurrentStepIndex(idx);
              }}
              className={`h-1 rounded-full transition-all cursor-pointer ${
                idx === currentStepIndex 
                  ? 'w-8 bg-emerald-500 shadow-xs' 
                  : idx < currentStepIndex 
                    ? 'w-4 bg-emerald-800' 
                    : 'w-4 bg-slate-700'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
