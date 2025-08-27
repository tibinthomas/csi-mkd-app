import { 
  Component, 
  input, 
  output, 
  inject, 
  signal, 
  effect,
  computed,
  ChangeDetectionStrategy,
  OnDestroy
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SpeechRecognitionService } from '../../../core/services/speech-recognition.service';
import { getFeatureFlags } from '../../../config/feature-flags';

@Component({
  selector: 'app-speech-recognition-button',
  template: `
    @if (isVoiceInputEnabled()) {
      <div class="sr-button-container">
        <button
        mat-icon-button
        type="button"
        [disabled]="isDisabled()"
        [class]="buttonClasses()"
        (click)="toggleRecording()"
        [matTooltip]="tooltipText()"
        matTooltipPosition="above"
        [matTooltipDisabled]="isMobileOrTablet()"
        aria-label="Speech to text input"
      >
        <mat-icon [class]="iconClasses()">{{ currentIcon() }}</mat-icon>
      </button>
      
      <!-- Mobile/Tablet instruction tooltip -->
      @if (isMobileOrTablet() && showInstructions()) {
        <div class="sr-mobile-instruction" [class.sr-mobile-instruction-visible]="showMobileTooltip()">
          {{ getMobileInstructionText() }}
        </div>
      }
      
      <!-- Error message -->
      @if (speechService.state().error && speechService.state().isSupported) {
        <div class="sr-error-message">
          {{ speechService.state().error }}
        </div>
      }
      
      <!-- Unsupported browser message -->
      @if (!speechService.state().isSupported) {
        <div class="sr-unsupported-message">
          <div class="sr-unsupported-icon">
            <mat-icon>info</mat-icon>
          </div>
          <div class="sr-unsupported-text">
            <div class="sr-unsupported-title">Speech recognition not available</div>
            <div class="sr-unsupported-description">{{ speechService.getSupportGuidance() }}</div>
          </div>
        </div>
      }
      
      <!-- Recording status for mobile -->
      @if (speechService.state().isListening && isMobileOrTablet()) {
        <div class="sr-recording-status">
          <mat-icon class="sr-recording-icon">mic</mat-icon>
          <span>Listening... Tap to stop</span>
        </div>
      }
      </div>
    }
  `,
  styles: [`
    .sr-button-container {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .sr-button {
      position: relative;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border-radius: 50%;
      width: 44px;
      height: 44px;
      min-width: 44px;
      min-height: 44px;
    }

    /* Mobile/Tablet optimizations */
    @media (max-width: 768px) {
      .sr-button {
        width: 48px;
        height: 48px;
        min-width: 48px;
        min-height: 48px;
      }
    }

    .sr-button:hover:not(:disabled) {
      transform: scale(1.1);
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }

    .sr-button-idle {
      background-color: var(--md-sys-color-surface-container);
      color: var(--md-sys-color-on-surface-variant);
    }

    .sr-button-idle:hover:not(:disabled) {
      background-color: var(--md-sys-color-primary-container);
      color: var(--md-sys-color-on-primary-container);
    }

    .sr-button-recording {
      background: linear-gradient(45deg, #f44336, #ff5722);
      color: white;
      animation: pulse 1.5s infinite;
    }

    .sr-button-unsupported {
      background-color: var(--md-sys-color-surface-variant);
      color: var(--md-sys-color-on-surface-variant);
      opacity: 0.6;
    }

    .sr-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .sr-icon {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      font-size: 22px;
      width: 22px;
      height: 22px;
    }

    /* Mobile/Tablet icon size */
    @media (max-width: 768px) {
      .sr-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
    }

    .sr-icon-recording {
      animation: recording-pulse 1s infinite alternate;
    }

    /* Mobile instruction tooltip */
    .sr-mobile-instruction {
      position: absolute;
      top: -45px;
      left: 50%;
      transform: translateX(-50%);
      background-color: var(--md-sys-color-inverse-surface);
      color: var(--md-sys-color-inverse-on-surface);
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 12px;
      white-space: nowrap;
      z-index: 1000;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
      max-width: 200px;
      white-space: normal;
      text-align: center;
    }

    .sr-mobile-instruction-visible {
      opacity: 1;
    }

    /* Recording status for mobile */
    .sr-recording-status {
      position: absolute;
      top: -40px;
      left: 50%;
      transform: translateX(-50%);
      background-color: var(--md-sys-color-primary);
      color: var(--md-sys-color-on-primary);
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 6px;
      z-index: 1000;
      animation: fade-in 0.3s ease;
    }

    .sr-recording-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      animation: recording-pulse 1s infinite alternate;
    }

    /* Error message */
    .sr-error-message {
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      background-color: var(--md-sys-color-error-container);
      color: var(--md-sys-color-on-error-container);
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 12px;
      z-index: 1000;
      margin-top: 4px;
      max-width: 250px;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }

    /* Unsupported browser message */
    .sr-unsupported-message {
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      background-color: var(--md-sys-color-surface-container-highest);
      color: var(--md-sys-color-on-surface);
      padding: 12px;
      border-radius: 12px;
      font-size: 12px;
      z-index: 1000;
      margin-top: 8px;
      max-width: 280px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      border: 1px solid var(--md-sys-color-outline-variant);
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }

    .sr-unsupported-icon {
      flex-shrink: 0;
      color: var(--md-sys-color-primary);
    }

    .sr-unsupported-text {
      flex: 1;
    }

    .sr-unsupported-title {
      font-weight: 500;
      margin-bottom: 4px;
      color: var(--md-sys-color-on-surface);
    }

    .sr-unsupported-description {
      font-size: 11px;
      color: var(--md-sys-color-on-surface-variant);
      line-height: 1.4;
    }

    /* Animations */
    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.7);
      }
      70% {
        box-shadow: 0 0 0 10px rgba(244, 67, 54, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(244, 67, 54, 0);
      }
    }

    @keyframes recording-pulse {
      0% {
        transform: scale(1);
      }
      100% {
        transform: scale(1.1);
      }
    }

    @keyframes fade-in {
      0% {
        opacity: 0;
        transform: translateX(-50%) translateY(-10px);
      }
      100% {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
    }

    /* Accessibility improvements */
    @media (prefers-reduced-motion: reduce) {
      .sr-button,
      .sr-icon,
      .sr-button-recording,
      .sr-icon-recording,
      .sr-recording-icon,
      .sr-recording-status {
        animation: none;
      }

      .sr-button:hover:not(:disabled) {
        transform: none;
      }
    }

    /* High contrast mode */
    @media (forced-colors: active) {
      .sr-button {
        border: 1px solid ButtonText;
      }
      
      .sr-button-recording {
        background: Highlight;
        color: HighlightText;
      }

      .sr-unsupported-message {
        border: 2px solid ButtonText;
      }
    }

    /* Touch device optimizations */
    @media (pointer: coarse) {
      .sr-button {
        width: 48px;
        height: 48px;
        min-width: 48px;
        min-height: 48px;
      }

      .sr-button:hover {
        transform: none;
      }

      .sr-button:active {
        transform: scale(0.95);
      }
    }
  `],
  imports: [MatIconModule, MatButtonModule, MatTooltipModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpeechRecognitionButtonComponent implements OnDestroy {
  // Inputs
  isDisabled = input<boolean>(false);
  size = input<'small' | 'medium' | 'large'>('medium');

  // Outputs  
  transcriptChange = output<string>();
  recordingStateChange = output<boolean>();

  // Services
  protected speechService = inject(SpeechRecognitionService);

  // Feature flags
  protected isVoiceInputEnabled = computed(() => getFeatureFlags().enableVoiceInput);

  // Internal state
  private hasTranscript = signal<boolean>(false);
  private showMobileInstructions = signal<boolean>(false);
  private mobileInstructionTimer: number | null = null;

  constructor() {
    // Watch for transcript changes and emit them
    effect(() => {
      const transcript = this.speechService.state().transcript;
      if (transcript && !this.hasTranscript()) {
        this.hasTranscript.set(true);
      }
      
      if (transcript !== '') {
        this.transcriptChange.emit(transcript);
      }
    });

    // Watch for recording state changes
    effect(() => {
      const isListening = this.speechService.state().isListening;
      this.recordingStateChange.emit(isListening);
    });
  }

  protected currentIcon(): string {
    const state = this.speechService.state();
    
    if (!state.isSupported) {
      return 'mic_off';
    }
    
    if (state.isListening) {
      return 'mic';
    }
    
    if (state.hasPermission === false) {
      return 'mic_off';
    }
    
    if (state.error) {
      return 'error';
    }
    
    return 'mic_none';
  }

  protected isMobileOrTablet(): boolean {
    const deviceInfo = this.speechService.state().deviceInfo;
    return deviceInfo.isMobile || deviceInfo.isTablet || deviceInfo.hasTouch;
  }

  protected showInstructions(): boolean {
    const state = this.speechService.state();
    return state.isSupported && !state.isListening;
  }

  protected showMobileTooltip(): boolean {
    return this.showMobileInstructions();
  }

  protected getMobileInstructionText(): string {
    const state = this.speechService.state();
    
    if (!state.isSupported) {
      return state.browserInfo.supportMessage;
    }
    
    if (state.hasPermission === false) {
      return 'Allow microphone access to use voice input';
    }
    
    return this.speechService.getSupportGuidance();
  }

  protected iconClasses(): string {
    const state = this.speechService.state();
    let classes = 'sr-icon';
    
    if (state.isListening) {
      classes += ' sr-icon-recording';
    }
    
    return classes;
  }

  protected buttonClasses(): string {
    const state = this.speechService.state();
    let classes = 'sr-button';
    
    if (!state.isSupported) {
      classes += ' sr-button-unsupported';
    } else if (state.isListening) {
      classes += ' sr-button-recording';
    } else if (state.error) {
      classes += ' sr-button-error';
    } else {
      classes += ' sr-button-idle';
    }
    
    // Size classes
    switch (this.size()) {
      case 'small':
        classes += ' sr-button-small';
        break;
      case 'large':
        classes += ' sr-button-large';
        break;
      default:
        classes += ' sr-button-medium';
    }
    
    return classes;
  }

  protected tooltipText(): string {
    const state = this.speechService.state();
    
    if (!state.isSupported) {
      return `Speech recognition not supported in ${state.browserInfo.name}`;
    }
    
    if (state.hasPermission === false) {
      return 'Microphone access denied. Click to retry.';
    }
    
    if (state.isListening) {
      return this.isMobileOrTablet() ? 'Tap to stop recording' : 'Click to stop recording';
    }
    
    if (state.error) {
      return 'Click to retry';
    }
    
    return this.isMobileOrTablet() 
      ? 'Tap and speak to convert speech to text'
      : 'Click and speak to convert speech to text';
  }

  protected async toggleRecording(): Promise<void> {
    const state = this.speechService.state();
    
    // Don't allow action if not supported
    if (!state.isSupported) {
      this.showMobileInstructionTemporary();
      return;
    }
    
    if (state.error) {
      this.speechService.clearError();
      return;
    }
    
    if (state.isListening) {
      this.speechService.stopListening();
    } else {
      // Show mobile instruction briefly when starting
      if (this.isMobileOrTablet()) {
        this.showMobileInstructionTemporary();
      }
      
      this.speechService.clearTranscript();
      this.hasTranscript.set(false);
      await this.speechService.startListening();
    }
  }

  private showMobileInstructionTemporary(): void {
    if (!this.isMobileOrTablet()) return;
    
    // Clear existing timer
    if (this.mobileInstructionTimer) {
      clearTimeout(this.mobileInstructionTimer);
    }
    
    // Show instruction
    this.showMobileInstructions.set(true);
    
    // Hide after 3 seconds
    this.mobileInstructionTimer = setTimeout(() => {
      this.showMobileInstructions.set(false);
      this.mobileInstructionTimer = null;
    }, 3000);
  }

  ngOnDestroy(): void {
    if (this.mobileInstructionTimer) {
      clearTimeout(this.mobileInstructionTimer);
    }
  }
}