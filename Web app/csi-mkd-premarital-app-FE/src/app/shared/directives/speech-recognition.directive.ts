import {
  Directive,
  ElementRef,
  inject,
  AfterViewInit,
  OnDestroy,
  Renderer2,
  ViewContainerRef,
  ComponentRef
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { SpeechRecognitionButtonComponent } from '../components/speech-recognition-button/speech-recognition-button';
import { getFeatureFlags } from '../../config/feature-flags';

@Directive({
  selector: 'textarea[appSpeechRecognition], mat-form-field textarea[appSpeechRecognition]'
})
export class SpeechRecognitionDirective implements AfterViewInit, OnDestroy {
  private elementRef = inject(ElementRef);
  private renderer = inject(Renderer2);
  private viewContainer = inject(ViewContainerRef);
  private ngControl = inject(NgControl, { optional: true });

  private buttonComponent: ComponentRef<SpeechRecognitionButtonComponent> | null = null;
  private wrapper: HTMLElement | null = null;
  private originalParent: HTMLElement | null = null;
  private originalNextSibling: Node | null = null;

  ngAfterViewInit(): void {
    // Only setup speech recognition if the feature is enabled
    const featureFlags = getFeatureFlags();
    if (featureFlags.enableVoiceInput) {
      this.setupSpeechRecognition();
    }
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  private setupSpeechRecognition(): void {
    const textarea = this.elementRef.nativeElement as HTMLTextAreaElement;
    
    // Find the mat-form-field container or create a wrapper
    const matFormField = textarea.closest('mat-form-field');
    
    if (matFormField) {
      this.setupWithMatFormField(matFormField, textarea);
    } else {
      this.setupWithWrapper(textarea);
    }
  }

  private setupWithMatFormField(matFormField: Element, textarea: HTMLTextAreaElement): void {
    // For mat-form-field, add the button to the suffix
    const suffixContainer = matFormField.querySelector('mat-form-field .mat-mdc-form-field-icon-suffix') ||
                           matFormField.querySelector('.mat-mdc-form-field-icon-suffix');
    
    if (suffixContainer) {
      this.createSpeechButton(suffixContainer as HTMLElement, textarea);
    } else {
      // Create suffix container if it doesn't exist
      const fieldWrapper = matFormField.querySelector('.mat-mdc-form-field-infix') ||
                           matFormField.querySelector('.mdc-text-field');
      
      if (fieldWrapper) {
        const suffix = this.renderer.createElement('div');
        this.renderer.addClass(suffix, 'mat-mdc-form-field-icon-suffix');
        this.renderer.setStyle(suffix, 'display', 'flex');
        this.renderer.setStyle(suffix, 'align-items', 'center');
        this.renderer.setStyle(suffix, 'padding-right', '8px');
        
        this.renderer.appendChild(fieldWrapper, suffix);
        this.createSpeechButton(suffix, textarea);
      }
    }
  }

  private setupWithWrapper(textarea: HTMLTextAreaElement): void {
    // Store original position
    this.originalParent = textarea.parentElement;
    this.originalNextSibling = textarea.nextSibling;

    // Create wrapper
    this.wrapper = this.renderer.createElement('div');
    this.renderer.addClass(this.wrapper, 'speech-recognition-wrapper');
    this.renderer.setStyle(this.wrapper, 'position', 'relative');
    this.renderer.setStyle(this.wrapper, 'display', 'inline-block');
    this.renderer.setStyle(this.wrapper, 'width', '100%');

    // Insert wrapper and move textarea
    if (this.originalParent) {
      this.renderer.insertBefore(this.originalParent, this.wrapper, this.originalNextSibling);
      this.renderer.appendChild(this.wrapper, textarea);
      
      // Create button container
      const buttonContainer = this.renderer.createElement('div');
      this.renderer.addClass(buttonContainer, 'speech-button-container');
      this.renderer.setStyle(buttonContainer, 'position', 'absolute');
      this.renderer.setStyle(buttonContainer, 'top', '8px');
      this.renderer.setStyle(buttonContainer, 'right', '8px');
      this.renderer.setStyle(buttonContainer, 'z-index', '10');
      
      this.renderer.appendChild(this.wrapper, buttonContainer);
      this.createSpeechButton(buttonContainer, textarea);
      
      // Adjust textarea padding to make room for button
      this.renderer.setStyle(textarea, 'padding-right', '48px');
    }
  }

  private createSpeechButton(container: HTMLElement, textarea: HTMLTextAreaElement): void {
    // Create the component
    this.buttonComponent = this.viewContainer.createComponent(SpeechRecognitionButtonComponent);
    
    // Set up event handlers
    this.buttonComponent.instance.transcriptChange.subscribe((transcript: string) => {
      this.insertTranscript(textarea, transcript);
    });

    this.buttonComponent.instance.recordingStateChange.subscribe((isRecording: boolean) => {
      if (isRecording) {
        this.renderer.addClass(textarea, 'speech-recording');
      } else {
        this.renderer.removeClass(textarea, 'speech-recording');
      }
    });

    // Add the component's element to the container
    this.renderer.appendChild(container, this.buttonComponent.location.nativeElement);
  }

  private insertTranscript(textarea: HTMLTextAreaElement, transcript: string): void {
    if (!transcript.trim()) return;

    const currentValue = textarea.value;
    const cursorPos = textarea.selectionStart || textarea.value.length;
    
    // Insert transcript at cursor position or append
    const newValue = currentValue.slice(0, cursorPos) + 
                    (currentValue && !currentValue.endsWith(' ') && cursorPos > 0 ? ' ' : '') +
                    transcript + 
                    currentValue.slice(cursorPos);
    
    // Update the value
    textarea.value = newValue;
    
    // Update Angular form control if available
    if (this.ngControl?.control) {
      this.ngControl.control.setValue(newValue);
      this.ngControl.control.markAsTouched();
    }
    
    // Dispatch input event for change detection
    const inputEvent = new Event('input', { bubbles: true });
    textarea.dispatchEvent(inputEvent);
    
    // Set cursor position after the inserted text
    const newCursorPos = cursorPos + transcript.length + (currentValue && !currentValue.endsWith(' ') && cursorPos > 0 ? 1 : 0);
    textarea.setSelectionRange(newCursorPos, newCursorPos);
    
    // Focus the textarea
    textarea.focus();
  }

  private cleanup(): void {
    if (this.buttonComponent) {
      this.buttonComponent.destroy();
      this.buttonComponent = null;
    }

    // Restore original DOM structure if we created a wrapper
    if (this.wrapper && this.originalParent && this.originalNextSibling) {
      const textarea = this.elementRef.nativeElement;
      this.renderer.removeStyle(textarea, 'padding-right');
      this.renderer.insertBefore(this.originalParent, textarea, this.originalNextSibling);
      this.renderer.removeChild(this.originalParent, this.wrapper);
    }
  }
}