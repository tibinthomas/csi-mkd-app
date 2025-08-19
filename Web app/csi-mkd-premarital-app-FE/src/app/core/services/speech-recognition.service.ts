import { Injectable, signal, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

// Extend Window interface to include SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export interface SpeechRecognitionState {
  isSupported: boolean;
  isListening: boolean;
  hasPermission: boolean | null;
  error: string | null;
  transcript: string;
  browserInfo: {
    name: string;
    isSupported: boolean;
    supportMessage: string;
  };
  deviceInfo: {
    isMobile: boolean;
    isTablet: boolean;
    hasTouch: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class SpeechRecognitionService {
  private document = inject(DOCUMENT);
  private recognition: any = null;
  
  // State signals
  public readonly state = signal<SpeechRecognitionState>({
    isSupported: this.isSpeechRecognitionSupported(),
    isListening: false,
    hasPermission: null,
    error: null,
    transcript: '',
    browserInfo: this.getBrowserInfo(),
    deviceInfo: this.getDeviceInfo()
  });

  constructor() {
    this.initializeSpeechRecognition();
  }

  private isSpeechRecognitionSupported(): boolean {
    const window = this.document.defaultView || globalThis;
    return !!(
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition
    );
  }

  private initializeSpeechRecognition(): void {
    if (!this.state().isSupported) return;

    const window = this.document.defaultView || globalThis;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;
    
    // Auto-detect language or use default
    this.recognition.lang = this.getLanguage();

    this.setupEventListeners();
  }

  private getLanguage(): string {
    // Check for Malayalam or English based on current locale
    const lang = this.document.documentElement.lang || navigator.language;
    
    // Support for Malayalam and English
    if (lang.startsWith('ml')) {
      return 'ml-IN'; // Malayalam (India)
    }
    return 'en-US'; // Default to English
  }

  private setupEventListeners(): void {
    if (!this.recognition) return;

    this.recognition.onstart = () => {
      this.updateState({ 
        isListening: true, 
        error: null,
        transcript: ''
      });
    };

    this.recognition.onresult = (event: any) => {
      let transcript = '';
      let isFinal = false;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        transcript += result[0].transcript;
        if (result.isFinal) {
          isFinal = true;
        }
      }

      this.updateState({ transcript });
    };

    this.recognition.onend = () => {
      this.updateState({ 
        isListening: false 
      });
    };

    this.recognition.onerror = (event: any) => {
      let errorMessage = 'Speech recognition error occurred';
      
      switch (event.error) {
        case 'not-allowed':
          errorMessage = 'Microphone access denied. Please allow microphone access to use speech recognition.';
          this.updateState({ hasPermission: false });
          break;
        case 'no-speech':
          errorMessage = 'No speech was detected. Please try again.';
          break;
        case 'audio-capture':
          errorMessage = 'No microphone was found. Please check your microphone connection.';
          break;
        case 'network':
          errorMessage = 'Network error occurred. Please check your internet connection.';
          break;
        case 'aborted':
          errorMessage = 'Speech recognition was aborted.';
          break;
        case 'language-not-supported':
          errorMessage = 'Language not supported. Switching to English.';
          this.recognition.lang = 'en-US';
          break;
      }

      this.updateState({ 
        isListening: false,
        error: errorMessage 
      });
    };
  }

  private updateState(partialState: Partial<SpeechRecognitionState>): void {
    this.state.update(current => ({ ...current, ...partialState }));
  }

  public async startListening(): Promise<void> {
    if (!this.state().isSupported) {
      this.updateState({ 
        error: 'Speech recognition is not supported in this browser.' 
      });
      return;
    }

    if (this.state().isListening) {
      return;
    }

    // Request microphone permission
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      this.updateState({ hasPermission: true, error: null });
    } catch (error) {
      this.updateState({ 
        hasPermission: false,
        error: 'Microphone access is required for speech recognition.' 
      });
      return;
    }

    try {
      this.recognition.start();
    } catch (error) {
      this.updateState({ 
        error: 'Failed to start speech recognition. Please try again.' 
      });
    }
  }

  public stopListening(): void {
    if (this.recognition && this.state().isListening) {
      this.recognition.stop();
    }
  }

  public clearError(): void {
    this.updateState({ error: null });
  }

  public clearTranscript(): void {
    this.updateState({ transcript: '' });
  }

  public setLanguage(language: string): void {
    if (this.recognition) {
      this.recognition.lang = language;
    }
  }

  private getBrowserInfo(): { name: string; isSupported: boolean; supportMessage: string } {
    const window = this.document.defaultView || globalThis;
    const userAgent = navigator.userAgent.toLowerCase();
    
    let browserName = 'Unknown Browser';
    let supportMessage = '';
    let isSupported = false;

    if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
      browserName = 'Chrome';
      isSupported = true;
      supportMessage = 'Chrome fully supports speech recognition.';
    } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
      browserName = 'Safari';
      isSupported = !!(window as any).webkitSpeechRecognition;
      supportMessage = isSupported 
        ? 'Safari supports speech recognition with webkit prefix.'
        : 'Speech recognition requires Safari 14.1+ and permission settings.';
    } else if (userAgent.includes('firefox')) {
      browserName = 'Firefox';
      isSupported = false;
      supportMessage = 'Firefox does not currently support speech recognition. Try Chrome or Safari.';
    } else if (userAgent.includes('edg')) {
      browserName = 'Edge';
      isSupported = true;
      supportMessage = 'Microsoft Edge supports speech recognition.';
    } else if (userAgent.includes('opera')) {
      browserName = 'Opera';
      isSupported = !!(window as any).webkitSpeechRecognition || !!(window as any).SpeechRecognition;
      supportMessage = isSupported 
        ? 'Opera supports speech recognition.'
        : 'Speech recognition may not be available in this Opera version.';
    }

    return {
      name: browserName,
      isSupported: isSupported && this.isSpeechRecognitionSupported(),
      supportMessage
    };
  }

  private getDeviceInfo(): { isMobile: boolean; isTablet: boolean; hasTouch: boolean } {
    const window = this.document.defaultView || globalThis;
    const userAgent = navigator.userAgent.toLowerCase();
    
    const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent) ||
                          (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
    
    const isTabletDevice = /ipad|android(?!.*mobile)|tablet/i.test(userAgent) ||
                          (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && window.screen.width >= 768);
    
    const hasTouch = 'ontouchstart' in window || (navigator.maxTouchPoints > 0);

    return {
      isMobile: Boolean(isMobileDevice && !isTabletDevice),
      isTablet: Boolean(isTabletDevice),
      hasTouch: Boolean(hasTouch)
    };
  }

  public getSupportGuidance(): string {
    const state = this.state();
    
    if (state.isSupported) {
      if (state.deviceInfo.isMobile || state.deviceInfo.isTablet) {
        return 'Tap the microphone and speak clearly. Make sure you\'re in a quiet environment.';
      }
      return 'Click the microphone and speak clearly into your device\'s microphone.';
    }

    const { browserInfo, deviceInfo } = state;
    
    if (browserInfo.name === 'Firefox') {
      return `Speech recognition is not supported in Firefox. Please switch to Chrome${deviceInfo.isMobile ? ' for Android' : ''} or Safari${deviceInfo.isMobile ? ' for iOS' : ''}.`;
    }
    
    if (browserInfo.name === 'Safari') {
      return 'Speech recognition requires Safari 14.1+ and microphone permissions. Check Settings > Safari > Microphone.';
    }
    
    return `Speech recognition is not available in ${browserInfo.name}. Please use Chrome, Safari, or Microsoft Edge for the best experience.`;
  }
}