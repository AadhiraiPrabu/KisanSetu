import { LanguageCode } from '../types';
import { LANGUAGES } from '../data/translations';

// Check browser speech recognition support
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export class RegionalSpeechService {
  private recognition: any = null;
  private isListening: boolean = false;

  constructor() {
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
    }
  }

  public isSupported(): boolean {
    return !!SpeechRecognition;
  }

  public startListening(
    langCode: LanguageCode,
    onResult: (text: string) => void,
    onError: (err: any) => void,
    onEnd: () => void
  ) {
    if (!this.recognition) {
      onError(new Error('Speech recognition not supported in this browser.'));
      return;
    }

    try {
      const langConfig = LANGUAGES.find((l) => l.code === langCode);
      this.recognition.lang = langConfig?.speechLocale || 'hi-IN';

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
      };

      this.recognition.onerror = (event: any) => {
        console.warn('Speech recognition event error:', event.error);
        onError(event.error);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        onEnd();
      };

      this.recognition.start();
      this.isListening = true;
    } catch (e) {
      this.isListening = false;
      onError(e);
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
      this.isListening = false;
    }
  }

  public stopSpeaking() {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        // ignore
      }
    }
  }

  public stop() {
    this.stopListening();
    this.stopSpeaking();
  }

  public speak(text: string, langCode: LanguageCode, onEnd?: () => void) {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported');
      if (onEnd) onEnd();
      return;
    }

    try {
      window.speechSynthesis.cancel(); // cancel previous utterances

      const cleanText = text.replace(/[*_#`[\]()]/g, ' ').slice(0, 400); // speak up to 400 chars cleanly
      const utterance = new SpeechSynthesisUtterance(cleanText);

      const langConfig = LANGUAGES.find((l) => l.code === langCode);
      const targetLocale = langConfig?.speechLocale || 'hi-IN';
      utterance.lang = targetLocale;
      utterance.rate = 0.92; // Slightly measured rate for clear agricultural clarity
      utterance.pitch = 1.0;

      // Find matching regional voice if available
      const voices = window.speechSynthesis.getVoices();
      const matchedVoice = voices.find((v) => v.lang.toLowerCase().startsWith(targetLocale.slice(0, 2).toLowerCase()));
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.onend = () => {
        if (onEnd) onEnd();
      };

      utterance.onerror = (e) => {
        console.warn('TTS playback issue:', e);
        if (onEnd) onEnd();
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Error in TTS:', e);
      if (onEnd) onEnd();
    }
  }
}

export const speechService = new RegionalSpeechService();
