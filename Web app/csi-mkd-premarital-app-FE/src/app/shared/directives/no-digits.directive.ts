import { Directive, ElementRef, HostListener, inject } from '@angular/core';

@Directive({
  selector: '[appNoDigits]',
  standalone: true,
})
export class NoDigitsDirective {
  private readonly elementRef = inject<ElementRef<HTMLInputElement>>(ElementRef);

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    const allowedKeys = [
      'Backspace',
      'Delete',
      'Tab',
      'Escape',
      'Enter',
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End',
    ];

    const isModifierCombo = event.ctrlKey || event.metaKey;
    if (isModifierCombo) {
      // Allow common shortcuts like copy, paste, select all, undo, redo
      return;
    }

    if (allowedKeys.includes(event.key)) {
      return;
    }

    if (/^[0-9]$/.test(event.key)) {
      event.preventDefault();
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    const clipboardData = event.clipboardData || (window as any).clipboardData;
    const pastedText: string = clipboardData?.getData('text') ?? '';
    const sanitized = pastedText.replace(/[0-9]/g, '');
    if (sanitized !== pastedText) {
      event.preventDefault();
      this.insertTextAtCursor(sanitized);
    }
  }

  @HostListener('input')
  onInput(): void {
    const input = this.elementRef.nativeElement;
    const currentValue = input.value ?? '';
    const sanitized = currentValue.replace(/[0-9]/g, '');
    if (sanitized !== currentValue) {
      const selectionStart = input.selectionStart ?? sanitized.length;
      const selectionEnd = input.selectionEnd ?? sanitized.length;
      input.value = sanitized;
      // Restore cursor position as best as possible
      try {
        input.setSelectionRange(selectionStart, selectionEnd);
      } catch {
        /* ignore */
      }
      const event = new Event('input', { bubbles: true });
      input.dispatchEvent(event);
    }
  }

  private insertTextAtCursor(text: string): void {
    const input = this.elementRef.nativeElement;
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    const value = input.value ?? '';
    const newValue = value.substring(0, start) + text + value.substring(end);
    input.value = newValue;
    const cursor = start + text.length;
    try {
      input.setSelectionRange(cursor, cursor);
    } catch {
      /* ignore */
    }
    const event = new Event('input', { bubbles: true });
    input.dispatchEvent(event);
  }
}


