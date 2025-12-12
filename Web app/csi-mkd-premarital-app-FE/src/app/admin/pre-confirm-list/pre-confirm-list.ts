import { DatePipe } from '@angular/common';
import { Component, OnInit, signal, inject } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  MatDialog,
  MatDialogModule,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { CsiMkdPremaritalAppBeService } from '../../../api/api-main-app/services';
import { ConfirmationRegisterDto } from '../../../api/api-main-app/models';
import {
  CertificateService,
  CertificateType,
} from '../../core/services/certificate.service';
import { SessionsFallbackService } from '../../core/services/sessions-fallback.service';
import { firstValueFrom } from 'rxjs';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PageEvent, MatPaginatorModule } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ChurchDataService } from '../../core/services/church-data.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { ParticipantDto } from '../../../api/api-main-app/models';
import { EditPreConfirmDialogComponent } from './edit-pre-confirm-dialog.component';

@Component({
  selector: 'app-pre-confirm-list',
  templateUrl: './pre-confirm-list.html',
  styleUrls: ['./pre-confirm-list.scss'],
  standalone: true,
  imports: [
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatDividerModule,
    MatCardModule,
    DatePipe,
    MatTooltipModule
],
  providers: [DatePipe],
})
export class PreConfirmList implements OnInit {
  registrations = signal<ConfirmationRegisterDto[]>([]);
  isLoading = signal(false);
  totalRegistrations = signal(0);
  pageIndex = signal(0);
  pageSize = signal(10);
  searchTermInput = signal('');
  expanded = new Set<string>();
  expandedAll = false;
  protected readonly totalCount = signal(0);
  protected readonly minDate = new Date();
  readonly lastClickedId = signal<number | null>(null);
  readonly printedParticipants = signal<Set<string>>(new Set());

  private api = inject(CsiMkdPremaritalAppBeService);
  private snackBar = inject(MatSnackBar);
  private datePipe = inject(DatePipe);
  private dialog = inject(MatDialog);
  private readonly churchDataService = inject(ChurchDataService);
  private readonly certificateService = inject(CertificateService);
  private readonly sessionsFallbackService = inject(SessionsFallbackService);

  protected readonly churchData = toSignal(this.churchDataService.churchData$, {
    initialValue: null,
  });

  ngOnInit() {
    this.loadRegistrations();
  }

  loadRegistrations() {
    this.isLoading.set(true);
    this.api
      .apiConfirmationregisterFilterGet({
        page: this.pageIndex() + 1,
        pageSize: this.pageSize(),
        search: this.searchTermInput(),
      })
      .subscribe({
        next: (responseJson: any) => {
          const response =
            typeof responseJson === 'string'
              ? JSON.parse(responseJson)
              : responseJson;
          console.log(response);
          this.registrations.set(response);
          this.totalCount.set(response.length || 0);
          this.totalRegistrations.set(response.totalCount);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.snackBar.open('Failed to load registrations', 'Close', {
            duration: 3000,
          });
        },
      });
  }

  searchRegistrations() {
    this.pageIndex.set(0);
    this.loadRegistrations();
  }

  clearFilters() {
    this.searchTermInput.set('');
    this.pageIndex.set(0);
    this.loadRegistrations();
  }

  onPageChange(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadRegistrations();
  }
  displayedColumns = [
    'ChurchName',
    'PriestName',
    'ConfirmationDate',
    'CounsellingDate',
    'ParticipantsCount',
    'Actions',
    'expand',
  ];

  openEditDialog(reg: any): void {
    const dialogRef = this.dialog.open(EditPreConfirmDialogComponent, {
      width: '500px',
      data: { reg, isEdit: true },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadRegistrations();
      }
    });
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(EditPreConfirmDialogComponent, {
      width: '500px',
      data: { reg: {}, isEdit: false },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadRegistrations();
      }
    });
  }
  expandedRow = signal<any | null>(null);

  toggleRow = (row: any) => {
    this.expandedRow.set(this.expandedRow() === row ? null : row);
    this.lastClickedId.set(row.id);
  };

  expandedElement = signal<any | null>(null);

  isExpanded(reg: any) {
    return this.expandedRow() === reg;
  }

  handleDownloadCSV() {
    const items = this.registrations();
    if (!items || items.length === 0) {
      this.snackBar.open('No data available to download.', 'Close', {
        duration: 3000,
      });
      return;
    }

    const headers = [
      'Church Name',
      'Priest Name',
      'Confirmation Date',
      'Counselling Date',
      'Participants Count',
      'Participants',
    ];

    const rows = items.map((reg: any) => {
      const participants = (reg.participants || [])
        .map((p: any) => `${p.name} (Age: ${p.age})`)
        .join('; ');
      return [
        this.getChurchNameById(reg.churchId),
        reg.priestName || '',
        reg.confirmationDate
          ? this.datePipe.transform(reg.confirmationDate, 'mediumDate')
          : '',
        reg.counsellingDate
          ? this.datePipe.transform(reg.counsellingDate, 'mediumDate')
          : '',
        reg.participants?.length || 0,
        `"${participants}"`, // Quotes to handle commas/semicolons
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pre-confirmation-registrations.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  handleDownload() {
    const items = this.registrations();

    if (!items || items.length === 0) {
      this.snackBar.open('No data available to download.', 'Close', {
        duration: 3000,
      });
      return;
    }

    const doc = new jsPDF();

    const headers = [
      [
        'Church Name',
        'Priest Name',
        'Confirmation Date',
        'Counselling Date',
        'Participants Count',
        'Participants',
      ],
    ];

    const data = items.map((reg: any) => {
      const participants = (reg.participants || [])
        .map((p: any) => `${p.name} (Age: ${p.age})`)
        .join('\n');
      return [
        this.getChurchNameById(reg.churchId),
        reg.priestName,
        reg.confirmationDate
          ? this.datePipe.transform(reg.confirmationDate, 'mediumDate')
          : '',
        reg.counsellingDate
          ? this.datePipe.transform(reg.counsellingDate, 'mediumDate')
          : '',
        reg.participants?.length || 0,
        participants,
      ];
    });

    doc.text('Pre-Confirmational Registrations', 14, 15);
    autoTable(doc, {
      startY: 20,
      head: headers,
      body: data,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [63, 81, 181] }, // Indigo header
      margin: { left: 14, right: 14 },
      columnStyles: {
        4: { cellWidth: 'wrap' }, // Allow participants column to wrap
      },
    });

    doc.save('pre-confirmation-registrations.pdf');
  }

  getChurchNameById(churchId: number | null | undefined): string {
    return this.churchDataService.getChurchNameById(
      churchId,
      this.churchData()
    );
  }

  async generateCertificate(
    participant: ParticipantDto,
    registration: ConfirmationRegisterDto
  ): Promise<void> {
    try {
      let sessionStartDate: Date | undefined;
      let sessionEndDate: Date | undefined;
      let sessionDates: Date[] = [];

      if (registration.counsellingDate) {
        sessionDates.push(new Date(registration.counsellingDate));
      }

      const certificateData = {
        name: `${participant.name}`,
        completionDate: new Date(),
        sessionName: 'Pre-Confirmation Counseling',
        churchName:
          this.getChurchNameById(registration.churchId) || 'Unknown Church',
        priestName: registration.priestName,
        dates: sessionDates,
        programDuration: `1 Day`,
        sessionStartDate,
        sessionEndDate,
      };

      const htmlContent = await this.certificateService.previewCertificate(
        certificateData,
        CertificateType.PRE_CONFIRMATION
      );

      this.openCertificatePreview(htmlContent, certificateData);
      
      // Mark as printed
      const key = this.getParticipantKey((registration as any).id, participant);
      this.printedParticipants.update(set => {
        const newSet = new Set(set);
        newSet.add(key);
        return newSet;
      });
      
    } catch (error) {
      console.error('Error generating certificate:', error);
      this.snackBar.open(`Failed to generate certificate: ${error}`, 'OK', {
        duration: 5000,
      });
    }
  }

  private openCertificatePreview(htmlContent: string, data: any): void {
    this.dialog.open(CertificatePreviewDialog, {
      data: { htmlContent, certificateData: data },
      width: '95vw',
      height: '95vh',
      maxWidth: '95vw',
      maxHeight: '95vh',
      panelClass: 'full-screen-dialog',
    });
  }

  deleteRegistration(reg: any): void {
    const dialogRef = this.dialog.open(DeleteConfirmationDialog);

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.isLoading.set(true);
        this.api.apiConfirmationregisterIdDelete({ id: reg.id }).subscribe({
          next: () => {
            this.isLoading.set(false);
            this.snackBar.open('Registration deleted successfully', 'OK', {
              duration: 3000,
            });
            this.loadRegistrations();
          },
          error: (err) => {
            this.isLoading.set(false);
            console.error('Deletion failed', err);
            this.snackBar.open(
              'Failed to delete registration. Please try again.',
              'OK',
              {
                duration: 3000,
              }
            );
          }
        });
    }
  });
}

getParticipantKey(regId: any, participant: ParticipantDto): string {
  if (participant.id) return participant.id;
  // Fallback composite key
  return `${regId}_${participant.name}`;
}

isPrinted(participant: ParticipantDto, reg: ConfirmationRegisterDto): boolean {
  const key = this.getParticipantKey((reg as any).id, participant);
  return this.printedParticipants().has(key);
}
}

@Component({
  selector: 'delete-confirmation-dialog',
  template: `
    <h2 mat-dialog-title>Confirm Deletion</h2>
    <mat-dialog-content>
      Are you sure you want to delete this registration?
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-flat-button color="warn" (click)="dialogRef.close(true)">
        Delete
      </button>
      <button mat-stroked-button (click)="dialogRef.close(false)">
        Cancel
      </button>
    </mat-dialog-actions>
  `,
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
})
export class DeleteConfirmationDialog {
  dialogRef = inject(MatDialogRef<DeleteConfirmationDialog>);
}

@Component({
  selector: 'certificate-preview-dialog',
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
          (click)="downloadImage()"
          [disabled]="isLoading()"
        >
          @if(isLoading()) {
          <mat-spinner diameter="20"></mat-spinner>
          } @else {
          <mat-icon>download</mat-icon>
          } Download
        </button>
        <button mat-stroked-button mat-dialog-close [disabled]="isLoading()">
          Cancel
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      /* Light theme (default) */
      .certificate-preview-container {
        height: 95vh;
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
  ],
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
],
})
export class CertificatePreviewDialog implements OnInit {
  dialogRef = inject<MatDialogRef<CertificatePreviewDialog>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);
  private readonly certificateService = inject(CertificateService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly sanitizer = inject(DomSanitizer);

  isLoading = signal(false);
  previewImageUrl = signal<string>('');

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
    console.log(
      'Sanitizing HTML content:',
      this.data.htmlContent.substring(0, 200) + '...'
    );
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
}
