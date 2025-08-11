import { Directive, ElementRef, HostListener, Input, inject } from '@angular/core';

@Directive({
  selector: '[appOnlyDigits]',
  standalone: true,
})
export class OnlyDigitsDirective {
  @Input() appOnlyDigitsMax?: number;

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

    if (event.ctrlKey || event.metaKey) return; // allow shortcuts
    if (allowedKeys.includes(event.key)) return;

    const isDigit = /^[0-9]$/.test(event.key);
    if (!isDigit) {
      event.preventDefault();
      return;
    }

    const input = this.elementRef.nativeElement;
    const max = this.appOnlyDigitsMax ?? Infinity;
    if (!isFinite(max)) return;

    const value = input.value ?? '';
    const selectionStart = input.selectionStart ?? value.length;
    const selectionEnd = input.selectionEnd ?? value.length;
    const currentDigits = value.replace(/\D/g, '');
    const newDigitsLength = currentDigits.length - (selectionEnd - selectionStart) + 1;
    if (newDigitsLength > max) {
      event.preventDefault();
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    const clipboardData = event.clipboardData || (window as any).clipboardData;
    const pasted = (clipboardData?.getData('text') ?? '').replace(/\D/g, '');
    const max = this.appOnlyDigitsMax ?? Infinity;
    const input = this.elementRef.nativeElement;
    const value = input.value ?? '';
    const selectionStart = input.selectionStart ?? value.length;
    const selectionEnd = input.selectionEnd ?? value.length;
    const currentDigits = value.replace(/\D/g, '');
    const currentDigitsLen = currentDigits.length - (selectionEnd - selectionStart);
    const remaining = Math.max(0, (isFinite(max) ? max : Infinity) - currentDigitsLen);
    const toInsert = pasted.slice(0, remaining);

    event.preventDefault();
    this.insertTextAtCursor(toInsert);
  }

  @HostListener('input')
  onInput(): void {
    const input = this.elementRef.nativeElement;
    const max = this.appOnlyDigitsMax ?? Infinity;
    const value = (input.value ?? '').replace(/\D/g, '');
    const truncated = isFinite(max) ? value.slice(0, max as number) : value;
    if (input.value !== truncated) {
      input.value = truncated;
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
    input.value = newValue.replace(/\D/g, '');
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


