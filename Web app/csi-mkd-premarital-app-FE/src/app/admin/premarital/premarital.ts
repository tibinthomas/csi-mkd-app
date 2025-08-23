import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  computed,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, switchMap, firstValueFrom } from 'rxjs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  MatFormField,
  MatFormFieldModule,
  MatLabel,
} from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CsiMkdPremaritalAppBeService as ApiService } from '../../../api/api-main-app/services';
import { SessionDataService } from '../../core/services/session-data.service';
import { CertificateService } from '../../core/services/certificate.service';
import { UpdatePremaritalRegisterDto } from '../../../api/api-main-app/models/update-premarital-register-dto';

@Component({
  selector: 'app-premarital-list',
  templateUrl: './premarital.html',
  styleUrl: './premarital.scss',

  changeDetection: ChangeDetectionStrategy.OnPush,

  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    FormsModule,
    MatFormField,
    MatLabel,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    NgOptimizedImage,
    MatPaginatorModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatCardModule,
    MatTooltipModule,
  ],
  animations: [
    trigger('detailExpand', [
      state(
        'collapsed',
        style({ height: '0px', minHeight: '0', display: 'none' })
      ),
      state('expanded', style({ height: '*', display: 'block' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class PremaritalComponent {
  private readonly dialog = inject(MatDialog);
  private readonly api = inject(ApiService);
  private readonly sessionDataService = inject(SessionDataService);
  private readonly certificateService = inject(CertificateService);

  protected readonly selectedReg = signal<any | null>(null);
  protected readonly showAllDetails = signal(false);
  protected readonly totalCount = signal(0);
  // This one is bound to the input box
  protected readonly searchTermInput = signal<string>('');

  // This is used in the actual API request (only updated on search click)
  protected readonly searchTerm = signal<string>('');
  protected readonly unapprovedOnly = signal<boolean>(false);
  protected readonly activeSessionOnly = signal<boolean>(false);
  protected readonly pageIndex = signal<number>(0);
  protected readonly pageSize = signal<number>(10);
  private readonly filterTrigger = signal(0);
  protected readonly isLoading = signal<boolean>(false);
  // Store selected year
  readonly selectedYear = signal<number | null>(new Date().getFullYear());
  // Store selected session
  readonly selectedSession = signal<string | null>(null);
  private lastSelectedYear: number | null = null;
  readonly isApproving = signal<number | null>(null);
  readonly isDeleting = signal<number | null>(null);
  readonly isEditing = signal<number | null>(null);
  private _snackBar = inject(MatSnackBar);

  baseApiUrl = API_ROOT_URL_MAIN_APP;
  expandedElement: any = null;
  disableSelect = new FormControl(false);

  private readonly registrations$ = toObservable(
    computed(() => [
      this.filterTrigger(),
      this.pageIndex(),
      this.pageSize(),
      this.searchTerm(),
      this.unapprovedOnly(),
      this.activeSessionOnly(),
      this.selectedYear(),
      this.selectedSession(),
    ])
  ).pipe(
    switchMap(
      ([
        _,
        pageIndex,
        pageSize,
        searchTerm,
        unapproved,
        activeSession,
        selectedYear,
        selectedSession,
      ]) => {
        // If selectedYear changed, reset selectedSession to null before calling API
        if (selectedSession !== null && this.shouldResetSession(selectedYear)) {
          this.selectedSession.set(null);
          selectedSession = null;
        }
        this.isLoading.set(true); // start spinner
        return this.api
          .apiPremaritalregisterFilterGet({
            Page: (pageIndex as number) + 1,
            PageSize: pageSize as number,
            Search: searchTerm as string,
            UnapprovedOnly: unapproved as boolean,
            ActiveSessionOnly: activeSession as boolean,
            SessionYear: selectedYear as number,
            SessionName: selectedSession as string,
          })
          .pipe(
            map((response: any) => {
              const data =
                typeof response === 'string' ? JSON.parse(response) : response;
              this.totalCount.set(data.totalCount || 0);
              this.isLoading.set(false); // stop spinner
              return (data.items ?? []).map((item: any) => ({
                ...item,
                ChurchActivities: JSON.parse(item.ChurchActivitiesJson ?? '{}'),
              }));
            }),
            catchError((err) => {
              console.error('Error loading filtered data:', err);
              this.isLoading.set(false); // also stop on error
              return of([]);
            })
          );
      }
    )
  );

  private shouldResetSession(newYear: any): boolean {
    if (this.lastSelectedYear !== null && this.lastSelectedYear !== newYear) {
      this.lastSelectedYear = newYear;
      return true;
    }
    this.lastSelectedYear = newYear;
    return false;
  }

  protected readonly registrations = toSignal(this.registrations$, {
    initialValue: [],
  });

  protected readonly sessionList = toSignal(this.sessionDataService.sessions$, {
    initialValue: [],
  });

  readonly sessionYears = computed(() => [
    ...new Set(
      this.sessionList().map((session: any) =>
        new Date(session.StartDate).getFullYear()
      )
    ),
  ]);

  readonly filteredSessionsByYear = computed(() => {
    const filtered = this.selectedYear()
      ? this.sessionList().filter(
          (session: any) =>
            new Date(session.StartDate).getFullYear() === this.selectedYear()
        )
      : this.sessionList();

    const uniqueSessionNames = new Set(filtered.map((s: any) => s.SessionName));
    return [
      ...Array.from(uniqueSessionNames).map((name) => ({ SessionName: name })),
    ];
  });

  searchRegistrations() {
    this.searchTerm.set(this.searchTermInput().trim());
    this.pageIndex.set(0); // Reset pagination
  }

  clearFilters() {
    this.searchTermInput.set('');
    this.unapprovedOnly.set(false);
    this.activeSessionOnly.set(false);
    this.searchRegistrations();
  }

  onPageChange(event: any) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  /** Toggles the expanded state of an element. */
  toggle(reg: any) {
    this.expandedElement = this.isExpanded(reg) ? null : reg;
  }

  isExpanded(reg: any) {
    return this.expandedElement === reg;
  }

  hasActivities(activities: any): boolean {
    return (
      activities?.ChoirMember ||
      activities?.SsTeacher ||
      activities?.YouthFellowship ||
      (activities?.Other && activities.Other.trim() !== '')
    );
  }

  getSelectedActivities(activities: any): string[] {
    const labels: { [key: string]: string } = {
      ChoirMember: 'Choir Member',
      SsTeacher: 'Sunday School Teacher',
      YouthFellowship: 'Youth Fellowship',
      Other: activities.Other,
    };

    const selected: string[] = [];

    for (const key in labels) {
      if (activities?.[key]) selected.push(labels[key]);
    }

    if (activities?.other?.trim()) {
      selected.push(activities.other);
    }

    return selected;
  }

  approvePayment(reg: any): void {
    const dialogRef = this.dialog.open(ConfirmationDialog);

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.isApproving.set(reg.Id);

        const updated = {
          ...reg,
          PaymentStatus: !reg.PaymentStatus,
        };
        this.api
          .apiPremaritalregisterIdPaymentstatusPut({
            id: reg.Id,
            body: updated,
          })
          .subscribe({
            next: () => {
              reg.PaymentStatus = !reg.PaymentStatus;
              this.isApproving.set(null);

              this.filterTrigger.set(this.filterTrigger() + 1); // triggers new data from API
            },
            error: (err) => {
              this.isApproving.set(null);

              console.error('Payment update failed', err);
              alert('Failed to update payment status. Please try again.');
            },
          });
      }
    });
  }

  deleteRegistration(reg: any): void {
    const dialogRef = this.dialog.open(DeleteConfirmationDialog, {
      data: { name: `${reg.FirstName} ${reg.LastName}` },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.isDeleting.set(reg.Id);

        this.api
          .apiPremaritalregisterIdDelete({ id: reg.Id.toString() })
          .subscribe({
            next: () => {
              this.isDeleting.set(null);
              this._snackBar.open(
                'Registration deleted successfully',
                'Close',
                { duration: 3000 }
              );
              this.filterTrigger.set(this.filterTrigger() + 1);
            },
            error: (err) => {
              this.isDeleting.set(null);
              console.error('Delete failed', err);
              this._snackBar.open(
                'Failed to delete registration. Please try again.',
                'Close',
                { duration: 3000 }
              );
            },
          });
      }
    });
  }

  editRegistration(reg: any): void {
    const dialogRef = this.dialog.open(EditRegistrationDialog, {
      data: { registration: { ...reg } },
      width: '800px',
      maxWidth: '90vw',
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.isEditing.set(reg.Id);

        // Transform form data to match UpdatePremaritalRegisterDto
        const updateData: UpdatePremaritalRegisterDto = {
          firstName: result.firstName,
          lastName: result.lastName,
          sex: result.sex,
          age: result.age,
          fatherName: result.fatherName,
          occupation: result.occupation,
          education: result.education,
          address: result.address,
          churchName: result.churchName,
          email: result.email,
          phone: result.phone,
          fianceName: result.fianceName || null,
          choirMember: result.choirMember || false,
          ssTeacher: result.ssTeacher || false,
          youthFellowship: result.youthFellowship || false,
          other: result.other || null,
          // Keep existing values that are not editable in the form
          dateOfMarriage: reg.DateOfMarriage || null,
          days: reg.Days || null,
          declaration: reg.Declaration || true,
          paymentStatus: reg.PaymentStatus || false,
          sessionId: reg.SessionId || 0,
        };

        this.api
          .apiPremaritalregisterIdPut({
            id: reg.Id.toString(),
            body: updateData,
          })
          .subscribe({
            next: () => {
              this.isEditing.set(null);
              this._snackBar.open(
                'Registration updated successfully',
                'Close',
                { duration: 3000 }
              );
              this.filterTrigger.set(this.filterTrigger() + 1);
            },
            error: (err) => {
              this.isEditing.set(null);
              console.error('Update failed', err);
              this._snackBar.open(
                'Failed to update registration. Please try again.',
                'Close',
                { duration: 3000 }
              );
            },
          });
      }
    });
  }

  async downloadAsPDF(): Promise<void> {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    });

    doc.setFontSize(16);
    doc.text('Premarital Registrations Report', 40, 40);

    const data = this.registrations();
    if (data.length) {
      for (let index = 0; index < data.length; index++) {
        const reg = data[index];
        const yOffset = 60 + index * 180;

        if (yOffset > doc.internal.pageSize.height - 200) {
          doc.addPage();
        }

        const baseY = doc.lastAutoTable
          ? doc.lastAutoTable.finalY + 20
          : yOffset;

        autoTable(doc, {
          startY: baseY,
          head: [['Field', 'Value']],
          body: [
            ['Full Name', `${reg.FirstName} ${reg.LastName}`],
            ['Sex', reg.Sex],
            ['Age', reg.Age],
            ['Email', reg.Email],
            ['Phone', reg.Phone],
            ['Father Name', reg.FatherName],
            ['Address', reg.Address],
            ['Education', reg.Education],
            ['Occupation', reg.Occupation],
            ['Church', reg.ChurchName],
            ['Fiancé Name', reg.FianceName],
            ['Session Name', reg.SessionName],
            ['Session Days', reg.Days],
            [
              'Date of Marriage',
              new Date(reg.DateOfMarriage).toLocaleDateString(),
            ],
            [
              'Church Activities',
              this.getSelectedActivities(reg.ChurchActivities).join(', ') ||
                'None',
            ],
            ['Payment Status', reg.PaymentStatus ? 'Received' : 'Pending'],
            ['Vicar Letter', reg.VicarLetterUrl ? reg.VicarLetterUrl : 'N/A'],
          ],
          styles: {
            fontSize: 10,
            cellPadding: 4,
          },
          theme: 'grid',
          headStyles: {
            fillColor: [63, 81, 181],
            textColor: 255,
          },
          margin: { left: 40, right: 40 },
        });

        // Add photo image (if exists)
        if (reg.PhotoUrl) {
          try {
            const imageData = await this.getBase64ImageFromUrl(reg.PhotoUrl);
            doc.addImage(imageData, 'JPEG', 400, baseY + 20, 100, 100);
          } catch (e) {
            console.warn('Could not load image', e);
          }
        }
      }

      doc.save('premarital-registrations-full.pdf');
    }
  }

  handleDownload(): void {
    if (this.registrations().length) {
      this.downloadAsPDF();
    } else {
      this._snackBar.open('There are no registrations to download', 'OK');
    }
  }

  private async getBase64ImageFromUrl(imageUrl: string): Promise<string> {
    const res = await fetch(imageUrl);
    const blob = await res.blob();

    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject('Image conversion failed');
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    filterValue.trim().toLowerCase();
    this.searchTerm.set(filterValue);
  }

  clearFilter() {
    this.searchTerm.set('');
  }

  async generateCertificate(reg: any): Promise<void> {
    try {
      let sessionStartDate: Date | undefined;
      let sessionEndDate: Date | undefined;
      let sessionDates: Date[] = [];

      // Use the SessionId to get session details from API
      if (reg.SessionId) {
        try {
          console.log('Fetching session with ID:', reg.SessionId);
          const sessionResponse = await firstValueFrom(
            this.api.apiSessionconfigIdGet({ id: reg.SessionId })
          );
          console.log('Session API response:', sessionResponse);

          if (sessionResponse?.startDate && sessionResponse?.endDate) {
            sessionStartDate = new Date(sessionResponse.startDate);
            sessionEndDate = new Date(sessionResponse.endDate);

            console.log('Parsed session dates:', {
              sessionStartDate,
              sessionEndDate,
            });

            // Generate all dates between start and end
            const current = new Date(sessionStartDate);
            while (current <= sessionEndDate) {
              sessionDates.push(new Date(current));
              current.setDate(current.getDate() + 1);
            }

            console.log('Generated session dates array:', sessionDates);
          } else {
            console.log('Session response missing dates:', {
              hasStartDate: !!sessionResponse?.startDate,
              hasEndDate: !!sessionResponse?.endDate,
            });
          }
        } catch (apiError) {
          console.warn('Failed to fetch session details:', apiError);
        }
      } else {
        console.log('No SessionId found in registration:', reg);
      }

      // Fallback to reg.Days if session API call failed
      if (sessionDates.length === 0) {
        sessionDates =
          reg.Days && Array.isArray(reg.Days) && reg.Days.length > 0
            ? reg.Days.map((day: string) => new Date(day))
            : [new Date()];
      }

      const certificateData = {
        name: `${reg.FirstName} ${reg.LastName}`,
        completionDate: reg.DateOfMarriage
          ? new Date(reg.DateOfMarriage)
          : new Date(),
        sessionName: reg.SessionName,
        churchName: reg.ChurchName || 'Unknown Church',
        dates: sessionDates,
        programDuration: `${sessionDates.length} Day${
          sessionDates.length > 1 ? 's' : ''
        }`,
        sessionStartDate,
        sessionEndDate,
      };

      console.log('Generating certificate for:', certificateData);

      const htmlContent = await this.certificateService.previewCertificate(
        certificateData
      );

      console.log('Generated HTML content length:', htmlContent.length);

      this.openCertificatePreview(htmlContent, certificateData);
    } catch (error) {
      console.error('Error generating certificate:', error);
      this._snackBar.open(`Failed to generate certificate: ${error}`, 'OK', {
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
          <div
            class="certificate-preview"
            [innerHTML]="sanitizedHtml"
            style="transform: scale(0.8); transform-origin: center center; max-width: 100%; max-height: 100%;"
          ></div>
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
        <button mat-button mat-dialog-close [disabled]="isLoading()">
          Cancel
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      /* Light theme (default) */
      .certificate-preview-container {
        height: 100vh;
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
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
})
export class CertificatePreviewDialog {
  dialogRef = inject<MatDialogRef<CertificatePreviewDialog>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);
  private readonly certificateService = inject(CertificateService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly sanitizer = inject(DomSanitizer);

  isLoading = signal(false);

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
        this.data.certificateData
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

@Component({
  selector: 'confirmation-dialog',
  template: `
    <h2 mat-dialog-title>Confirm Approval</h2>
    <mat-dialog-content
      >Are you sure you want to approve this payment?</mat-dialog-content
    >
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close(false)">Cancel</button>
      <button mat-raised-button color="primary" (click)="dialogRef.close(true)">
        Approve
      </button>
    </mat-dialog-actions>
  `,
  imports: [MatDialogModule, MatButtonModule],
})
export class ConfirmationDialog {
  dialogRef = inject<MatDialogRef<ConfirmationDialog>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);

  onNoClick(): void {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'delete-confirmation-dialog',
  template: `
    <h2 mat-dialog-title>Confirm Deletion</h2>
    <mat-dialog-content>
      Are you sure you want to delete the registration for
      <strong>{{ data.name }}</strong
      >? <br /><br />
      <span class="text-red-600">This action cannot be undone.</span>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close(false)">Cancel</button>
      <button mat-raised-button color="warn" (click)="dialogRef.close(true)">
        Delete
      </button>
    </mat-dialog-actions>
  `,
  imports: [MatDialogModule, MatButtonModule],
})
export class DeleteConfirmationDialog {
  dialogRef = inject<MatDialogRef<DeleteConfirmationDialog>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);

  onNoClick(): void {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'edit-registration-dialog',
  template: `
    <h2 mat-dialog-title>Edit Registration</h2>
    <form [formGroup]="editForm" (ngSubmit)="onSubmit()">
      <mat-dialog-content class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <mat-form-field appearance="fill">
            <mat-label>First Name</mat-label>
            <input matInput formControlName="firstName" required />
            <mat-error>First Name is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="fill">
            <mat-label>Last Name</mat-label>
            <input matInput formControlName="lastName" required />
            <mat-error>Last Name is required</mat-error>
          </mat-form-field>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <mat-form-field appearance="fill">
            <mat-label>Sex</mat-label>
            <mat-select formControlName="sex" required>
              <mat-option value="Male">Male</mat-option>
              <mat-option value="Female">Female</mat-option>
            </mat-select>
            <mat-error>Sex is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="fill">
            <mat-label>Age</mat-label>
            <input
              matInput
              type="number"
              formControlName="age"
              required
              min="1"
              max="120"
            />
            <mat-error>Age is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="fill">
            <mat-label>Father's Name</mat-label>
            <input matInput formControlName="fatherName" required />
            <mat-error>Father's Name is required</mat-error>
          </mat-form-field>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <mat-form-field appearance="fill">
            <mat-label>Occupation</mat-label>
            <input matInput formControlName="occupation" />
          </mat-form-field>

          <mat-form-field appearance="fill">
            <mat-label>Education</mat-label>
            <input matInput formControlName="education" required />
            <mat-error>Education is required</mat-error>
          </mat-form-field>
        </div>

        <mat-form-field appearance="fill" class="w-full">
          <mat-label>Address</mat-label>
          <textarea
            matInput
            formControlName="address"
            rows="3"
            required
          ></textarea>
          <mat-error>Address is required</mat-error>
        </mat-form-field>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <mat-form-field appearance="fill">
            <mat-label>Church Name</mat-label>
            <input matInput formControlName="churchName" required />
            <mat-error>Church Name is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="fill">
            <mat-label>Email</mat-label>
            <input matInput type="email" formControlName="email" required />
            <mat-error>Valid email is required</mat-error>
          </mat-form-field>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <mat-form-field appearance="fill">
            <mat-label>Phone</mat-label>
            <input matInput formControlName="phone" required />
            <mat-error>Phone is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="fill">
            <mat-label>Fiancé/Fiancée Name</mat-label>
            <input matInput formControlName="fianceName" />
          </mat-form-field>
        </div>

        <div class="flex flex-wrap gap-4">
          <mat-checkbox formControlName="choirMember"
            >Choir Member</mat-checkbox
          >
          <mat-checkbox formControlName="ssTeacher">S.S. Teacher</mat-checkbox>
          <mat-checkbox formControlName="youthFellowship"
            >Youth Fellowship</mat-checkbox
          >
        </div>

        <mat-form-field appearance="fill" class="w-full">
          <mat-label>Other Activities</mat-label>
          <input matInput formControlName="other" />
        </mat-form-field>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="dialogRef.close()">
          Cancel
        </button>
        <button
          mat-raised-button
          color="primary"
          type="submit"
          [disabled]="editForm.invalid"
        >
          Update
        </button>
      </mat-dialog-actions>
    </form>
  `,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    CommonModule,
  ],
})
export class EditRegistrationDialog {
  dialogRef = inject<MatDialogRef<EditRegistrationDialog>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);
  private fb = inject(FormBuilder);

  editForm: FormGroup;

  constructor() {
    const reg = this.data.registration;
    this.editForm = this.fb.group({
      firstName: [reg.FirstName || '', Validators.required],
      lastName: [reg.LastName || '', Validators.required],
      sex: [reg.Sex || '', Validators.required],
      age: [
        reg.Age || '',
        [Validators.required, Validators.min(1), Validators.max(120)],
      ],
      fatherName: [reg.FatherName || '', Validators.required],
      occupation: [reg.Occupation || ''],
      education: [reg.Education || '', Validators.required],
      address: [reg.Address || '', Validators.required],
      churchName: [reg.ChurchName || '', Validators.required],
      email: [reg.Email || '', [Validators.required, Validators.email]],
      phone: [reg.Phone || '', Validators.required],
      fianceName: [reg.FianceName || ''],
      choirMember: [reg.ChoirMember || false],
      ssTeacher: [reg.SsTeacher || false],
      youthFellowship: [reg.YouthFellowship || false],
      other: [reg.Other || ''],
    });
  }

  onSubmit(): void {
    if (this.editForm.valid) {
      this.dialogRef.close(this.editForm.value);
    }
  }
}
