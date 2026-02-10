
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CertificateService, CertificateType } from '../../../core/services/certificate.service';

@Component({
  selector: 'app-certificate-preview-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    MatDialogModule, 
    MatButtonModule, 
    MatIconModule, 
    MatProgressSpinnerModule
  ],
  template: `
    <div class="certificate-preview-container h-full flex flex-col">
      <div
        class="dialog-header flex justify-between items-center p-4 border-b z-10 bg-background text-on-background"
      >
        <h2 mat-dialog-title class="m-0">Certificate Preview</h2>
        <button mat-icon-button mat-dialog-close>
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div
        class="dialog-content flex-1 p-4 flex items-center justify-center overflow-hidden"
      >
        <div
          class="certificate-frame w-full h-full flex items-center justify-center"
        >
          @if (isLoading()) {
          <div class="flex items-center justify-center">
            <mat-spinner diameter="50"></mat-spinner>
          </div>
          } @else if (previewImageUrl()) {
          <img
            [src]="previewImageUrl()"
            alt="Certificate Preview"
            class="certificate-preview max-w-full max-h-full object-contain"
            style="transform: scale(0.8); transform-origin: center center;"
          />
          } @else {
          <div
            class="certificate-preview"
            [innerHTML]="sanitizedHtml"
            style="transform: scale(0.8); transform-origin: center center; max-width: 100%; max-height: 100%;"
          ></div>
          }
        </div>
      </div>

      <div
        class="dialog-actions flex justify-center gap-4 p-4 border-t z-10 bg-background text-on-background"
      >
        <button
          mat-raised-button
          color="primary"
          (click)="printCertificate()"
          [disabled]="isLoading()"
        >
          @if(isLoading()) {
          <mat-spinner diameter="20"></mat-spinner>
          } @else {
          <mat-icon>print</mat-icon>
          } Print
        </button>
        <button
          mat-raised-button
          color="accent"
          (click)="
            data.certificateType === CertificateType.PRE_MARITAL
              ? downloadCertificateForAbroad()
              : downloadImage()
          "
          [disabled]="isLoading()"
        >
          @if(isLoading()) {
          <mat-spinner diameter="20"></mat-spinner>
          } @else {
          <mat-icon>download</mat-icon>
          } Download Image
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .certificate-preview-container {
        background: #f5f5f5;
        transition: background-color 0.3s ease;
      }

      .dialog-header,
      .dialog-actions {
        background: #ffffff;
        color: #000000;
        border-color: #e0e0e0;
        transition: all 0.3s ease;
      }

      .certificate-frame {
        background: #f5f5f5;
        padding: 20px;
        transition: background-color 0.3s ease;
      }

      .certificate-preview {
        background: white;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        border-radius: 8px;
        overflow: visible;
        transition: box-shadow 0.3s ease;
      }

      /* Dark theme adjustments - using :host-context for better theme detection */
      :host-context(.theme-dark) .certificate-preview-container {
        background: #2c2c2c !important;
      }

      :host-context(.theme-dark) .dialog-header,
      :host-context(.theme-dark) .dialog-actions {
        background: #1e1e1e !important;
        color: #ffffff !important;
        border-color: #404040 !important;
      }

      :host-context(.theme-dark) .certificate-frame {
        background: #2c2c2c !important;
      }

      :host-context(.theme-dark) .certificate-preview {
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4) !important;
        border: 1px solid #404040 !important;
      }

      /* Alternative selector using data-theme attribute */
      :host-context([data-theme='dark']) .certificate-preview-container {
        background: #2c2c2c !important;
      }

      :host-context([data-theme='dark']) .dialog-header,
      :host-context([data-theme='dark']) .dialog-actions {
        background: #1e1e1e !important;
        color: #ffffff !important;
        border-color: #404040 !important;
      }

      :host-context([data-theme='dark']) .certificate-frame {
        background: #2c2c2c !important;
      }

      :host-context([data-theme='dark']) .certificate-preview {
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4) !important;
        border: 1px solid #404040 !important;
      }

      /* Full screen dialog overrides */
      :host ::ng-deep .full-screen-dialog .mat-mdc-dialog-container {
        max-width: 100vw !important;
        max-height: 100vh !important;
        height: 100vh !important;
        width: 100vw !important;
        border-radius: 0 !important;
        padding: 0 !important;
        background: #ffffff;
        transition: background-color 0.3s ease;
      }

      :host-context(.theme-dark)
        ::ng-deep
        .full-screen-dialog
        .mat-mdc-dialog-container {
        background: #1e1e1e !important;
      }

      :host-context([data-theme='dark'])
        ::ng-deep
        .full-screen-dialog
        .mat-mdc-dialog-container {
        background: #1e1e1e !important;
      }

      /* Theme-aware border colors */
      :host ::ng-deep .border-b {
        border-color: #e0e0e0 !important;
      }

      :host ::ng-deep .border-t {
        border-color: #e0e0e0 !important;
      }

      :host-context(.theme-dark) ::ng-deep .border-b,
      :host-context(.theme-dark) ::ng-deep .border-t {
        border-color: #404040 !important;
      }

      :host-context([data-theme='dark']) ::ng-deep .border-b,
      :host-context([data-theme='dark']) ::ng-deep .border-t {
        border-color: #404040 !important;
      }
    `,
  ]
})
export class CertificatePreviewDialog implements OnInit {
  dialogRef = inject<MatDialogRef<CertificatePreviewDialog>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);
  private readonly certificateService = inject(CertificateService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly sanitizer = inject(DomSanitizer);

  isLoading = signal(false);
  previewImageUrl = signal<string>('');
  protected readonly CertificateType = CertificateType;

  ngOnInit() {
    this.generatePreviewImage();
  }

  async generatePreviewImage(): Promise<void> {
    try {
      this.isLoading.set(true);
      const imageUrl = await this.certificateService.generateCertificateImage(
        this.data.htmlContent,
        true
      );
      this.previewImageUrl.set(imageUrl);
    } catch (error) {
      console.error('Error generating preview image:', error);
      // Fallback to HTML if image generation fails
      this.previewImageUrl.set('');
    } finally {
      this.isLoading.set(false);
    }
  }

  get sanitizedHtml(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.data.htmlContent);
  }

  async printCertificate(): Promise<void> {
    try {
      this.isLoading.set(true);
      await this.certificateService.printCertificate(this.data.htmlContent);
    } catch (error) {
      console.error('Error printing certificate:', error);
      this.snackBar.open(
        'Failed to print certificate. Please check if popups are allowed.',
        'OK',
        {
          duration: 3000,
        }
      );
    } finally {
      this.isLoading.set(false);
    }
  }

  async downloadImage(): Promise<void> {
    try {
      this.isLoading.set(true);
      await this.certificateService.downloadCertificateAsImage(
        this.data.certificateData,
        CertificateType.PRE_CONFIRMATION
      );
      this.snackBar.open('Certificate downloaded successfully!', 'OK', {
        duration: 2000,
      });
    } catch (error) {
      console.error('Error downloading certificate:', error);
      this.snackBar.open(
        'Failed to download certificate. Please try again.',
        'OK',
        {
          duration: 3000,
        }
      );
    } finally {
      this.isLoading.set(false);
    }
  }

  async downloadCertificateForAbroad(): Promise<void> {
    try {
      this.isLoading.set(true);
      await this.certificateService.downloadCertificateAsImage(
        this.data.certificateData,
        CertificateType.PRE_MARITAL
      );
      this.snackBar.open('Pre-marital certificate downloaded successfully!', 'OK', {
        duration: 2000,
      });
    } catch (error) {
      console.error('Error downloading pre-marital certificate:', error);
      this.snackBar.open(
        'Failed to download certificate. Please try again.',
        'OK',
        {
          duration: 3000,
        }
      );
    } finally {
      this.isLoading.set(false);
    }
  }
}
