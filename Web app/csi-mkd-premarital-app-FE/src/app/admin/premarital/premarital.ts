import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  computed,
  OnInit,
} from '@angular/core';
import { FileUploadService } from '../../core/services/file-upload.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  catchError,
  map,
  of,
  switchMap,
  firstValueFrom,
  forkJoin,
  Observable,
} from 'rxjs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DatePipe, NgOptimizedImage } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
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
import {
  MatNativeDateModule,
  provideNativeDateAdapter,
} from '@angular/material/core';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CsiMkdPremaritalAppBeService as ApiService } from '../../../api/api-main-app/services';
import { QuestionAnswersService } from '../../../api/api-main-app/services/question-answers.service';
import { SessionsFallbackService } from '../../core/services/sessions-fallback.service';
import { SessionDataService } from '../../core/services/session-data.service';
import { CertificateService, CertificateType } from '../../core/services/certificate.service';
import { CertificatePreviewDialog } from '../../shared/components/certificate-preview-dialog/certificate-preview-dialog';
import { UpdatePremaritalRegisterDto } from '../../../api/api-main-app/models/update-premarital-register-dto';
import { PaymentStatusUpdateDto } from '../../../api/api-main-app/models/payment-status-update-dto';
import {
  ChurchDataService,
  ChurchWithDetails,
} from '../../core/services/church-data.service';
import { emailDomainValidator } from '../../core/validators/email-domain.validator';
import classListData from '../../feedback-questions/feedback/class-list.json';
import {
  FeedbackModalComponent,
  type FeedbackModalData,
} from './feedback-modal.component';
import {
  QuestionsModalComponent,
  type QuestionsModalData,
} from './questions-modal.component';
import { ExportPhoneModalComponent } from './export-phone-modal.component';
import { ExportNameChurchModalComponent } from './export-name-church-modal.component';

@Component({
  selector: 'app-premarital-list',
  templateUrl: './premarital.html',
  styleUrl: './premarital.scss',

  changeDetection: ChangeDetectionStrategy.OnPush,

  imports: [
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
    MatDatepickerModule,
    MatNativeDateModule,
    MatRadioModule,
    MatCardModule,
    MatTooltipModule,
    MatDialogModule,
    DatePipe
],
})
export class PremaritalComponent {
  [x: string]: any;
  private readonly dialog = inject(MatDialog);
  private readonly api = inject(ApiService);
  private readonly questionAnswersService = inject(QuestionAnswersService);
  private readonly sessionDataService = inject(SessionDataService);
  private readonly certificateService = inject(CertificateService);
  private readonly sessionsFallbackService = inject(SessionsFallbackService);
  private readonly churchDataService = inject(ChurchDataService);
  private fileUploadService = inject(FileUploadService);

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
  readonly isLoadingFeedback = signal<number | null>(null);
  readonly isLoadingQuestionAnswer = signal<number | null>(null);

  readonly lastClickedId = signal<number | null>(null);
  readonly printedRegistrations = signal<Set<any>>(new Set());

  // Status caches for performance
  protected readonly questionAnswerStatusCache = signal<Map<string, boolean>>(
    new Map()
  );
  protected readonly feedbackStatusCache = signal<
    Map<string, { completed: number; total: number }>
  >(new Map());

  private _snackBar = inject(MatSnackBar);

  protected readonly churchData = toSignal(this.churchDataService.churchData$, {
    initialValue: null,
  });

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
            page: (pageIndex as number) + 1,
            pageSize: pageSize as number,
            search: searchTerm as string,
            unapprovedOnly: unapproved as boolean,
            activeSessionOnly: activeSession as boolean,
            sessionYear: selectedYear as number,
            sessionName: selectedSession as string,
          })
          .pipe(
            map((response: any) => {
              const data =
                typeof response === 'string' ? JSON.parse(response) : response;
              this.totalCount.set(data.totalCount || 0);
              this.isLoading.set(false); // stop spinner
              return (data.items ?? []).map((item: any) => ({
                ...item,
                churchActivities: JSON.parse(item.churchActivitiesJson ?? '{}'),
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
        new Date(session.startDate).getFullYear()
      )
    ),
  ]);

  readonly filteredSessionsByYear = computed(() => {
    const filtered = this.selectedYear()
      ? this.sessionList().filter(
          (session: any) =>
            new Date(session.startDate).getFullYear() === this.selectedYear()
        )
      : this.sessionList();

    const uniqueSessionNames = new Set(filtered.map((s: any) => s.sessionName));
    return [
      ...Array.from(uniqueSessionNames).map((name) => ({ sessionName: name })),
    ].reverse();
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
    this.lastClickedId.set(reg.id);
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
        this.isApproving.set(reg.id);

        const paymentStatusUpdate: PaymentStatusUpdateDto = {
          paymentStatus: !reg.paymentStatus,
        };
        this.api
          .apiPremaritalregisterIdPaymentstatusPut({
            id: reg.id.toString(),
            body: paymentStatusUpdate,
          })
          .subscribe({
            next: () => {
              reg.paymentStatus = !reg.paymentStatus;
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
      data: { name: `${reg.firstName} ${reg.lastName}` },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.isDeleting.set(reg.id);

        this.api
          .apiPremaritalregisterIdDelete({ id: reg.id.toString() })
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
      if (!result) return;

      this.isEditing.set(reg.id);

      const updateData: UpdatePremaritalRegisterDto = {
        firstName: result.firstName,
        lastName: result.lastName,
        sex: result.sex,
        age: result.age,
        fatherName: result.fatherName,
        occupation: result.occupation,
        education: result.education,
        address: result.address,
        churchId: result.churchId,
        churchName: result.churchName,
        priestName: result.priestName,
        email: result.email,
        phone: result.phone,
        fianceName: result.fianceName || null,
        choirMember: result.ChoirMember || false,
        ssTeacher: result.SsTeacher || false,
        youthFellowship: result.YouthFellowship || false,
        other: result.Other || null,
        dateOfMarriage: result.dateOfMarriage
          ? new Date(result.dateOfMarriage).toISOString()
          : reg.dateOfMarriage || null,
        days: result.days ?? reg.days ?? null,
        declaration: result.declaration ?? true,
        paymentStatus: reg.paymentStatus ?? false,
        sessionId: result.sessionId ?? reg.sessionId ?? 0,
      };

      this.api
        // Step 1: Update registration info
        .apiPremaritalregisterIdPut({
          id: reg.id.toString(),
          body: updateData,
        })
        .pipe(
          // Step 2: Upload files if any
          switchMap(() => {
            const uploads: Observable<any>[] = [];

            if (result.photoFile) {
              uploads.push(
                this.api
                  .apiAzureuploadGenerateSasGet({
                    fileName: `premarital/${reg.id}/photo/${result.photoFile.name}`,
                    contentType: result.photoFile.type,
                  })
                  .pipe(
                    switchMap((sasUrl) =>
                      this.fileUploadService.uploadFileToAzure(
                        result.photoFile,
                        sasUrl!
                      )
                    ),
                    map((photoUrl) => ({ photoUrl }))
                  )
              );
            }

            if (result.vicarLetterFile) {
              uploads.push(
                this.api
                  .apiAzureuploadGenerateSasGet({
                    fileName: `premarital/${reg.id}/vicarletter/${result.vicarLetterFile.name}`,
                    contentType: result.vicarLetterFile.type,
                  })
                  .pipe(
                    switchMap((sasUrl) =>
                      this.fileUploadService.uploadFileToAzure(
                        result.vicarLetterFile,
                        sasUrl!
                      )
                    ),
                    map((vicarLetterUrl) => ({ vicarLetterUrl }))
                  )
              );
            }

            return uploads.length > 0 ? forkJoin(uploads) : of(null);
          }),
          // Step 3: Always upsert file URLs (backend handles new/update)
          switchMap((uploaded) => {
            if (!uploaded) return of(null);

            const fileBody: any = { registrationId: reg.id };
            uploaded.forEach((u) => Object.assign(fileBody, u));

            return this.api.apiPremaritalregisterFilesRegistrationIdPost({
              registrationId: reg.id.toString(),
              body: fileBody,
            });
          })
        )
        .subscribe({
          next: () => {
            this.isEditing.set(null);
            this._snackBar.open('Registration updated successfully', 'Close', {
              duration: 3000,
            });
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
    });
  }

  async downloadAsPDF(): Promise<void> {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    });

    const data = this.registrations();
    if (data.length) {
      for (let index = 0; index < data.length; index++) {
        const reg = data[index];

        // Add a new page for each user (except the first one)
        if (index > 0) {
          doc.addPage();
        }

        // Add header for each page
        doc.setFontSize(16);
        doc.text('Premarital Registration Details', 40, 40);

        // Add user counter
        doc.setFontSize(12);
        doc.text(`Registration ${index + 1} of ${data.length}`, 40, 60);

        // Start table at a fixed position on each page
        const startY = 80;

        autoTable(doc, {
          startY: startY,
          head: [['Field', 'Value', 'Photo']],
          body: [
            ['Full Name', `${reg.firstName} ${reg.lastName}`, ''],
            ['Sex', reg.sex, ''],
            ['Age', reg.age, ''],
            ['Email', reg.email, ''],
            ['Phone', reg.phone, ''],
            ['Father Name', reg.fatherName, ''],
            ['Address', reg.address, ''],
            ['Education', reg.education, ''],
            ['Occupation', reg.occupation, ''],
            ['Church', this.getChurchNameById(reg.churchId), ''],
            ['Priest Name', reg.priestName, ''],
            ['Fiancé Name', reg.fianceName, ''],
            ['Session Name', reg.sessionName, ''],
            ['Session Days', reg.days, ''],
            [
              'Date of Marriage',
              new Date(reg.dateOfMarriage).toLocaleDateString(),
              '',
            ],
            [
              'Church Activities',
              this.getSelectedActivities(reg.churchActivities).join(', ') ||
                'None',
              '',
            ],
            ['Payment Status', reg.paymentStatus ? 'Received' : 'Pending', ''],
            [
              'Vicar Letter',
              reg.vicarLetterUrl ? reg.vicarLetterUrl : 'N/A',
              '',
            ],
          ],
          styles: {
            fontSize: 10,
            cellPadding: 4,
          },
          columnStyles: {
            0: { cellWidth: 120 }, // Field column fixed width (wider)
            1: { cellWidth: 'auto' }, // Value column auto-width based on remaining space
            2: { cellWidth: 120 }, // Photo column fixed width
          },
          tableWidth: 'auto', // Auto-size entire table based on content
          theme: 'grid',
          headStyles: {
            fillColor: [63, 81, 181],
            textColor: 255,
          },
          margin: { left: 40, right: 40 }, // Normal margins since photo is now in table
        });

        // Add photo image (if exists) - positioned in the photo column
        if (reg.photoUrl) {
          try {
            const imageData = await this.getBase64ImageFromUrl(reg.photoUrl);
            // Calculate photo position within the photo column of the first row
            const tableX = 40; // Table left margin
            const fieldColumnWidth = 150;
            const valueColumnWidth =
              doc.internal.pageSize.width -
              tableX -
              40 -
              fieldColumnWidth -
              120; // Calculate value column width
            const photoColumnX =
              tableX + fieldColumnWidth + valueColumnWidth + 10; // Photo column X position with padding
            const photoY = startY + 25; // Y position within first row
            const photoWidth = 100;
            const photoHeight = 100;

            doc.addImage(
              imageData,
              'JPEG',
              photoColumnX,
              photoY,
              photoWidth,
              photoHeight
            );
          } catch (e) {
            console.warn(
              'Could not load image for user',
              reg.firstName,
              reg.lastName,
              e
            );
          }
        }

        // Add page footer with page number
        const pageHeight = doc.internal.pageSize.height;
        doc.setFontSize(8);
        doc.text(
          `Page ${index + 1} of ${
            data.length
          } - Generated on ${new Date().toLocaleDateString()}`,
          40,
          pageHeight - 20
        );
      }

      // Generate filename with session info
      const sessionName = this.selectedSession() || 'All-Sessions';
      const sessionYear = this.selectedYear() || 'All-Years';
      const sanitizedSessionName = sessionName.replace(/[^a-zA-Z0-9-_]/g, '-');
      const sanitizedSessionYear = sessionYear
        .toString()
        .replace(/[^a-zA-Z0-9-_]/g, '-');
      const filename = `premarital-registrations-${sanitizedSessionName}-${sanitizedSessionYear}.pdf`;

      doc.save(filename);
    }
  }

  handleDownload(): void {
    if (this.registrations().length) {
      this.downloadAsPDF();
    } else {
      this._snackBar.open('There are no registrations to download', 'OK');
    }
  }

  openExportNameChurchModal(): void {
    const dialogRef = this.dialog.open(ExportNameChurchModalComponent, {
      width: '500px',
      maxWidth: '90vw',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this._snackBar.open(
          'Name and church spreadsheet exported successfully',
          'Close',
          {
            duration: 3000,
          }
        );
      }
    });
  }

  openExportPhoneModal(): void {
    const dialogRef = this.dialog.open(ExportPhoneModalComponent, {
      width: '500px',
      maxWidth: '90vw',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this._snackBar.open('Phone numbers exported successfully', 'Close', {
          duration: 3000,
        });
      }
    });
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

  readonly isRehydrating = signal<string | null>(null);

  async requestFileRehydration(blobUrl: string): Promise<void> {
    this.isRehydrating.set(blobUrl);
    try {
      const response = await fetch(`${this.baseApiUrl}/api/azureupload/rehydrate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blobUrl }),
        credentials: 'include',
      });
      const data = await response.json();
      if (data.status === 'rehydration_started') {
        this._snackBar.open('Rehydration started. The file will be available within a few hours.', 'Close', { duration: 6000 });
      } else if (data.status === 'already_available') {
        this._snackBar.open('This file is already available. Try opening the link directly.', 'Close', { duration: 4000 });
      } else {
        this._snackBar.open('File not found in storage. It may have been deleted.', 'Close', { duration: 4000 });
      }
    } catch (err) {
      this._snackBar.open('Failed to request the file. Please try again.', 'Close', { duration: 4000 });
      console.error('Rehydration request failed', err);
    } finally {
      this.isRehydrating.set(null);
    }
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
      if (reg.sessionId) {
        try {
          const sessionResponse = await firstValueFrom(
            this.sessionsFallbackService.apiSessionconfigIdGet({
              id: reg.sessionId,
            })
          );

          if (sessionResponse?.startDate && sessionResponse?.endDate) {
            sessionStartDate = new Date(sessionResponse.startDate);
            sessionEndDate = new Date(sessionResponse.endDate);

            // Generate all dates between start and end
            const current = new Date(sessionStartDate);
            while (current <= sessionEndDate) {
              sessionDates.push(new Date(current));
              current.setDate(current.getDate() + 1);
            }
          } else {
          }
        } catch (apiError) {
          console.warn('Failed to fetch session details:', apiError);
        }
      } else {
      }

      // Fallback to reg.Days if session API call failed
      if (sessionDates.length === 0) {
        sessionDates =
          reg.Days && Array.isArray(reg.Days) && reg.Days.length > 0
            ? reg.Days.map((day: string) => new Date(day))
            : [new Date()];
      }

      const certificateData = {
        name: `${reg.firstName} ${reg.lastName}`,
        completionDate: reg.dateOfMarriage
          ? new Date(reg.dateOfMarriage)
          : new Date(),
        sessionName: reg.sessionName,
        churchName:
          this.getChurchNameById(reg.churchId) ||
          reg.churchName ||
          'Unknown Church',
        priestName: reg.priestName,
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
      
      // Mark as printed
      this.printedRegistrations.update(set => {
        const newSet = new Set(set);
        newSet.add(reg.id);
        return newSet;
      });

    } catch (error) {
      console.error('Error generating certificate:', error);
      this._snackBar.open(`Failed to generate certificate: ${error}`, 'OK', {
        duration: 5000,
      });
    }
  }

  private openCertificatePreview(htmlContent: string, data: any): void {
    this.dialog.open(CertificatePreviewDialog, {
      data: { 
        htmlContent, 
        certificateData: data,
        certificateType: CertificateType.PRE_MARITAL
      },
      width: '95vw',
      height: '95vh',
      maxWidth: '95vw',
      maxHeight: '95vh',
      panelClass: 'full-screen-dialog',
    });
  }

  getChurchNameById(churchId: number | null | undefined): string {
    return this.churchDataService.getChurchNameById(
      churchId,
      this.churchData()
    );
  }

  getFeedbackStatus(
    registrationId: string
  ): { completed: number; total: number } | null {
    return this.feedbackStatusCache().get(registrationId) || null;
  }

  getFeedbackStatusDisplay(registrationId: string): string {
    const status = this.getFeedbackStatus(registrationId);
    return status ? `${status.completed}/${status.total}` : '...';
  }

  viewFeedbackStatus(reg: any): void {
    const registrationId = reg.id.toString();

    // Don't fetch if already cached
    if (this.feedbackStatusCache().get(registrationId)) {
      return;
    }

    this.fetchFeedbackStatus(reg);
  }

  async viewFeedbackDetails(reg: any): Promise<void> {
    const registrationId = reg.id.toString();
    this.isLoadingFeedback.set(reg.id);

    try {
      // Fetch detailed feedback data from API - similar to feedback list
      const feedbacks = await firstValueFrom(
        this.api
          .apiCosmosFeedbackRegistrationRegistrationIdGet({
            registrationId: registrationId,
          })
          .pipe(
            catchError((err) => {
              console.error('Error fetching feedback data:', err);
              this._snackBar.open('Failed to load feedback details', 'Close', {
                duration: 3000,
              });
              return of([]);
            })
          )
      );

      // Check if feedback data exists and has feedbacks property
      if (!feedbacks.length || !feedbacks[0]?.feedbacks) {
        this._snackBar.open('No feedback data found for this user', 'Close', {
          duration: 3000,
        });
        return;
      }

      // Open dialog with feedback data using the new modal component
      this.dialog.open(FeedbackModalComponent, {
        maxWidth: '1600px',
        maxHeight: '95vh',
        panelClass: 'large-dialog',
        data: {
          user: reg,
          feedbackData: feedbacks[0],
          feedbacks: feedbacks[0].feedbacks,
        } as FeedbackModalData,
      });
    } catch (error) {
      console.error('Error loading feedback details:', error);
      this._snackBar.open('Error loading feedback details', 'Close', {
        duration: 3000,
      });
    } finally {
      this.isLoadingFeedback.set(null);
    }
  }

  refreshFeedbackStatus(reg: any): void {
    const registrationId = reg.id.toString();

    // Remove from cache to force refresh
    const newCache = new Map(this.feedbackStatusCache());
    newCache.delete(registrationId);
    this.feedbackStatusCache.set(newCache);

    this.fetchFeedbackStatus(reg);
  }

  private fetchFeedbackStatus(reg: any): void {
    const registrationId = reg.id.toString();

    this.isLoadingFeedback.set(reg.id);

    // Get total count from class list
    const totalFeedbacks = classListData.length;

    this.api
      .getFeedbackEntriesCountByRegistrationId({ registrationId })
      .subscribe({
        next: (response: any) => {
          const data =
            typeof response === 'string' ? JSON.parse(response) : response;
          const completedFeedbacks = data.count || 0;

          const newCache = new Map(this.feedbackStatusCache());
          newCache.set(registrationId, {
            completed: completedFeedbacks,
            total: totalFeedbacks,
          });
          this.feedbackStatusCache.set(newCache);
          this.isLoadingFeedback.set(null);
        },
        error: () => {
          const newCache = new Map(this.feedbackStatusCache());
          newCache.set(registrationId, { completed: 0, total: totalFeedbacks });
          this.feedbackStatusCache.set(newCache);
          this.isLoadingFeedback.set(null);
        },
      });
  }

  getQuestionAnswerStatusFromCache(registrationId: string): boolean | null {
    const cached = this.questionAnswerStatusCache().get(registrationId);
    return cached !== undefined ? cached : null;
  }

  viewQuestionAnswerStatus(reg: any): void {
    const registrationId = reg.id.toString();

    // Don't fetch if already cached
    if (this.questionAnswerStatusCache().get(registrationId) !== undefined) {
      return;
    }

    this.fetchQuestionAnswerStatus(reg);
  }

  refreshQuestionAnswerStatus(reg: any): void {
    const registrationId = reg.id.toString();

    // Remove from cache to force refresh
    const newCache = new Map(this.questionAnswerStatusCache());
    newCache.delete(registrationId);
    this.questionAnswerStatusCache.set(newCache);

    this.fetchQuestionAnswerStatus(reg);
  }

  private fetchQuestionAnswerStatus(reg: any): void {
    const registrationId = reg.id.toString();

    this.isLoadingQuestionAnswer.set(reg.id);

    this.questionAnswersService
      .getQuestionAnswersByRegistrationId({ registrationId })
      .subscribe({
        next: (response: any) => {
          // If response exists and has data, consider it completed
          const exists =
            response && (response.id || response.premaritalRegistrationId);
          const newCache = new Map(this.questionAnswerStatusCache());
          newCache.set(registrationId, exists);
          this.questionAnswerStatusCache.set(newCache);
          this.isLoadingQuestionAnswer.set(null);
        },
        error: () => {
          const newCache = new Map(this.questionAnswerStatusCache());
          newCache.set(registrationId, false);
          this.questionAnswerStatusCache.set(newCache);
          this.isLoadingQuestionAnswer.set(null);
        },
      });
  }

  async viewQuestionAnswerDetails(reg: any): Promise<void> {
    const registrationId = reg.id.toString();
    this.isLoadingQuestionAnswer.set(reg.id);

    try {
      // Fetch question answer data from API
      const questionAnswers = await firstValueFrom(
        this.questionAnswersService
          .getQuestionAnswersByRegistrationId({
            registrationId: registrationId,
          })
          .pipe(
            catchError((err) => {
              console.error('Error fetching question answer data:', err);
              return of(null);
            })
          )
      );

      // Check if question answers exist
      if (!questionAnswers) {
        this._snackBar.open(
          'No question answers found for this user',
          'Close',
          {
            duration: 3000,
          }
        );
        return;
      }

      // Open dialog with question answer data using the new modal component
      this.dialog.open(QuestionsModalComponent, {
        maxWidth: '1600px',
        maxHeight: '95vh',
        panelClass: 'large-dialog',
        data: {
          user: reg,
          questionAnswers: questionAnswers,
        } as QuestionsModalData,
      });
    } catch (error) {
      console.error('Error loading question answer details:', error);
    } finally {
      this.isLoadingQuestionAnswer.set(null);
    }
  }


  isPrinted(reg: any): boolean {
    return this.printedRegistrations().has(reg.id);
  }

  resetPrintStatus(reg: any): void {
    this.printedRegistrations.update(set => {
      const newSet = new Set(set);
      newSet.delete(reg.id);
      return newSet;
    });
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
      <button mat-flat-button color="primary" (click)="dialogRef.close(true)">
        Approve
      </button>
      <button mat-stroked-button (click)="dialogRef.close(false)">
        Cancel
      </button>
    </mat-dialog-actions>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
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
      <button mat-stroked-button (click)="dialogRef.close(false)">
        Cancel
      </button>
      <button mat-flat-button color="warn" (click)="dialogRef.close(true)">
        Delete
      </button>
    </mat-dialog-actions>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
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

        <mat-form-field appearance="fill" class="w-full">
          <mat-label>Father's Name</mat-label>
          <input matInput formControlName="fatherName" required />
          <mat-error>Father's Name is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="fill" class="w-full">
          <mat-label>Address</mat-label>
          <textarea
            matInput
            formControlName="address"
            rows="3"
            required
          ></textarea>
          @if (editForm.get('address')?.hasError('required')) {
            <mat-error>Address is required</mat-error>
          } @else if (editForm.get('address')?.hasError('maxlength')) {
            <mat-error>Address cannot exceed 250 characters</mat-error>
          } @else if (editForm.get('address')?.hasError('pattern')) {
            <mat-error>Address contains invalid characters</mat-error>
          }
        </mat-form-field>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <mat-form-field appearance="fill">
            <mat-label>Education</mat-label>
            <input matInput formControlName="education" required />
            <mat-error>Education is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="fill">
            <mat-label>Occupation</mat-label>
            <input matInput formControlName="occupation" required />
            <mat-error>Occupation is required</mat-error>
          </mat-form-field>
        </div>

        <div class="space-y-4">
          <h3 class="text-lg font-medium">Church Membership</h3>
          <mat-radio-group
            formControlName="churchMembership"
            class="flex flex-col space-y-2"
          >
            <mat-radio-button value="member">CSI Member</mat-radio-button>
            <mat-radio-button value="not-member"
              >Non-CSI Member</mat-radio-button
            >
          </mat-radio-group>
          @if (editForm.get('churchMembership')?.hasError('required') &&
          editForm.get('churchMembership')?.touched) {
          <mat-error>Please select church membership status</mat-error>
          }
        </div>

        @if (editForm.get('churchMembership')?.value === 'member') {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <mat-form-field appearance="fill">
            <mat-label>Clergy District</mat-label>
            <mat-select
              formControlName="churchDistrict"
              (selectionChange)="onDistrictChange($event.value)"
            >
              @for (location of allLocations(); track location) {
              <mat-option [value]="location">{{ location }}</mat-option>
              }
            </mat-select>
            <mat-error>Clergy District is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="fill">
            <mat-label>Church Name</mat-label>
            <mat-select
              formControlName="churchName"
              (selectionChange)="onChurchChange($event.value)"
            >
              @for (church of availableChurches(); track church.id) {
              <mat-option [value]="church.name">{{ church.name }}</mat-option>
              }
            </mat-select>
            <mat-error>Church Name is required</mat-error>
          </mat-form-field>
        </div>
        } @if (editForm.get('churchMembership')?.value === 'not-member') {
        <mat-form-field appearance="fill" class="w-full">
          <mat-label>Church Name</mat-label>
          <input matInput formControlName="manualChurchName" required />
          <mat-error>Church Name is required</mat-error>
        </mat-form-field>
        }

        <mat-form-field appearance="fill" class="w-full">
          <mat-label>Fiancé/Fiancée Name</mat-label>
          <input matInput formControlName="fianceName" />
        </mat-form-field>

        <mat-form-field appearance="fill" class="w-full">
          <mat-label>Date of Marriage</mat-label>
          <input
            matInput
            readonly
            [matDatepicker]="marriagePicker"
            formControlName="dateOfMarriage"
            [min]="minDate"
            (click)="marriagePicker.open()"
          />
          <mat-datepicker-toggle
            matSuffix
            [for]="marriagePicker"
          ></mat-datepicker-toggle>
          <mat-datepicker #marriagePicker></mat-datepicker>
        </mat-form-field>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <mat-form-field appearance="fill">
            <mat-label>Country Code</mat-label>
            <mat-select formControlName="countryCode">
              <mat-option value="+91">+91 (India)</mat-option>
              <mat-option value="+1">+1 (US/Canada)</mat-option>
              <mat-option value="+44">+44 (UK)</mat-option>
              <mat-option value="+971">+971 (UAE)</mat-option>
            </mat-select>
            <mat-error>Country Code is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="fill">
            <mat-label>Phone Number</mat-label>
            <input matInput formControlName="phone" required maxlength="10" />
            <mat-error>Valid 10-digit phone number is required</mat-error>
          </mat-form-field>
        </div>

        <mat-form-field appearance="fill" class="w-full">
          <mat-label>Email</mat-label>
          <input matInput type="email" formControlName="email" required />
          <mat-error>Valid email is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="fill" class="w-full">
          <mat-label>No.of days</mat-label>
          <mat-select formControlName="days">
            <mat-option value="1 Day (Only with the Bishop's permission)"
              >1 Day (Only with the Bishop's permission)</mat-option
            >
            <mat-option value="3 Days">3 Days</mat-option>
          </mat-select>
          <mat-error>Please select the number of days.</mat-error>
        </mat-form-field>

        <div class="space-y-4" formGroupName="churchActivities">
          <h3 class="text-lg font-medium">Church Activities</h3>
          <div class="flex flex-wrap gap-4">
            <mat-checkbox formControlName="choirMember"
              >Choir Member</mat-checkbox
            >
            <mat-checkbox formControlName="ssTeacher"
              >S.S. Teacher</mat-checkbox
            >
            <mat-checkbox formControlName="youthFellowship"
              >Youth Fellowship</mat-checkbox
            >
          </div>
          <mat-form-field appearance="fill" class="w-full">
            <mat-label>Other Activities</mat-label>
            <input matInput formControlName="other" />
          </mat-form-field>
        </div>

        <mat-form-field appearance="fill" class="w-full">
          <mat-label>Session</mat-label>
          <mat-select formControlName="sessionId">
            @for (session of sessionList(); track session.id) {
            <mat-option [value]="session.id">{{
              session.sessionName
            }}</mat-option>
            }
          </mat-select>
          <mat-error>Session is required</mat-error>
        </mat-form-field>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <h3 class="text-lg font-medium mb-2">Photo</h3>
            @if (data.registration.photoUrl) {
            <div class="mb-2">
              <a
                [href]="data.registration.photoUrl"
                target="_blank"
                class="text-blue-500 hover:underline"
                >View Current Photo</a
              >
            </div>
            }
            <button
              type="button"
              mat-stroked-button
              (click)="photoInput.click()"
            >
              <mat-icon>upload_file</mat-icon>
              <span>{{ photoFile ? 'Change' : 'Upload' }} Photo</span>
            </button>
            <input
              hidden
              #photoInput
              type="file"
              (change)="onPhotoFileSelected($event)"
              accept="image/*"
            />
            @if (photoFile) {
            <span class="ml-4 text-sm">{{ photoFile.name }}</span>
            }
          </div>

          <div>
            <h3 class="text-lg font-medium mb-2">Vicar's Letter</h3>
            @if (data.registration.vicarLetterUrl) {
            <div class="mb-2">
              <a
                [href]="data.registration.vicarLetterUrl"
                target="_blank"
                class="text-blue-500 hover:underline"
                >View Current Letter</a
              >
            </div>
            }
            <button
              type="button"
              mat-stroked-button
              (click)="vicarLetterInput.click()"
            >
              <mat-icon>upload_file</mat-icon>
              <span
                >{{ vicarLetterFile ? 'Change' : 'Upload' }} Vicar's
                Letter</span
              >
            </button>
            <input
              hidden
              #vicarLetterInput
              type="file"
              (change)="onVicarLetterFileSelected($event)"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            @if (vicarLetterFile) {
            <span class="ml-4 text-sm">{{ vicarLetterFile.name }}</span>
            }
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-stroked-button type="button" (click)="dialogRef.close()">
          Cancel
        </button>
        <button
          mat-flat-button
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
    MatRadioModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    MatIconModule
],
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [provideNativeDateAdapter()],
})
export class EditRegistrationDialog {
  dialogRef = inject<MatDialogRef<EditRegistrationDialog>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);
  private fb = inject(FormBuilder);
  private churchDataService = inject(ChurchDataService);
  private sessionsFallbackService = inject(SessionsFallbackService);

  editForm: FormGroup;
  photoFile: File | null = null;
  vicarLetterFile: File | null = null;
  protected readonly minDate = new Date();

  // Church data signals
  protected readonly selectedDistrict = signal<string>('');
  protected readonly availableChurches = signal<ChurchWithDetails[]>([]);
  protected readonly allLocations = toSignal(
    this.churchDataService.getAllLocations(),
    { initialValue: [] }
  );
  protected readonly selectedChurch = signal<ChurchWithDetails | null>(null);

  // Session data
  private readonly sessions$ = this.sessionsFallbackService
    .getAllSessions()
    .pipe(
      map((data: any) => {
        return data
          .map((session: any) => ({
            ...session,
            startDate: session.startDate,
            endDate: session.endDate,
          }))
          .sort((a: any, b: any) => {
            // Sort by startDate in ascending order
            return (
              new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
            );
          });
      }),
      catchError((err) => {
        console.error('Error loading sessions:', err);
        return of([]);
      })
    );

  protected readonly sessionList = toSignal(this.sessions$, {
    initialValue: [],
  });

  constructor() {
    const reg = this.data.registration;

    // Parse phone number to extract country code and phone
    const phoneMatch = reg.phone?.match(/^(\+\d+)(\d{10})$/);
    const countryCode = phoneMatch ? phoneMatch[1] : '+91';
    const phoneNumber = phoneMatch
      ? phoneMatch[2]
      : reg.phone?.replace(/^\+\d+/, '') || '';

    // Determine church membership based on churchId
    const churchMembership = reg.churchId ? 'member' : 'not-member';

    this.editForm = this.fb.group({
      firstName: [
        reg.firstName || '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
          Validators.pattern(/^[a-zA-Z\s.]*$/),
        ],
      ],
      lastName: [
        reg.lastName || '',
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(50),
          Validators.pattern(/^[a-zA-Z\s.]*$/),
        ],
      ],
      fatherName: [
        reg.fatherName || '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
          Validators.pattern(/^[a-zA-Z\s.]*$/),
        ],
      ],
      address: [
        reg.address || '',
        [
          Validators.required,
          Validators.maxLength(250),
          Validators.pattern(/^[a-zA-Z0-9\s,.\-\/()#:;'"&]*$/),
        ],
      ],
      sex: [reg.sex || '', Validators.required],
      age: [
        reg.age || '',
        [Validators.required, Validators.min(1), Validators.max(120)],
      ],
      education: [
        reg.education || '',
        [
          Validators.required,
          Validators.maxLength(100),
          Validators.pattern(/^[a-zA-Z\s.]*$/),
        ],
      ],
      occupation: [
        reg.occupation || '',
        [
          Validators.required,
          Validators.maxLength(100),
          Validators.pattern(/^[a-zA-Z\s.]*$/),
        ],
      ],
      churchMembership: [churchMembership, Validators.required],
      churchDistrict: [reg.churchDistrict || ''],
      churchName: [reg.churchName || ''],
      manualChurchName: [reg.churchName && !reg.churchId ? reg.churchName : ''],
      fianceName: [
        reg.fianceName || '',
        [Validators.maxLength(100), Validators.pattern(/^[a-zA-Z\s.]*$/)],
      ],
      dateOfMarriage: [
        reg.dateOfMarriage ? new Date(reg.dateOfMarriage) : null,
      ],
      countryCode: [countryCode, Validators.required],
      phone: [
        phoneNumber,
        [Validators.required, Validators.pattern(/^\d{10}$/)],
      ],
      email: [
        reg.email || '',
        [Validators.required, Validators.email, emailDomainValidator()],
      ],
      days: [reg.days || '', Validators.required],
      churchActivities: this.fb.group({
        choirMember: [reg.churchActivities?.ChoirMember || false],
        ssTeacher: [reg.churchActivities?.SsTeacher || false],
        youthFellowship: [reg.churchActivities?.YouthFellowship || false],
        other: [reg.churchActivities?.Other || ''],
      }),
      declaration: [true, Validators.requiredTrue],
      sessionId: [reg.sessionId || '', Validators.required],
    });

    // Set up church membership validation logic
    this.setupChurchMembershipValidation();

    // Initialize church data if user is a member
    if (churchMembership === 'member') {
      this.initializeChurchData(reg);
    }
  }

  private setupChurchMembershipValidation(): void {
    this.editForm
      .get('churchMembership')
      ?.valueChanges.subscribe((membership) => {
        if (membership === 'not-member') {
          this.editForm.patchValue({ churchDistrict: '', churchName: '' });
          this.editForm.get('churchDistrict')?.clearValidators();
          this.editForm.get('churchName')?.clearValidators();
          this.editForm
            .get('manualChurchName')
            ?.setValidators([Validators.required]);
        } else if (membership === 'member') {
          this.editForm.patchValue({ manualChurchName: '' });
          this.editForm
            .get('churchDistrict')
            ?.setValidators([Validators.required]);
          this.editForm.get('churchName')?.setValidators([Validators.required]);
          this.editForm.get('manualChurchName')?.clearValidators();
        }
        this.editForm.get('churchDistrict')?.updateValueAndValidity();
        this.editForm.get('churchName')?.updateValueAndValidity();
        this.editForm.get('manualChurchName')?.updateValueAndValidity();
      });
  }

  private initializeChurchData(reg: any): void {
    // If we have church data, try to find and set the district
    if (reg.churchId) {
      this.churchDataService.getAllLocations().subscribe((locations) => {
        // Find which district this church belongs to
        for (const location of locations) {
          this.churchDataService
            .getChurchesByLocationAndSearch(location)
            .subscribe((churches) => {
              const church = churches.find((c) => c.id === reg.churchId);
              if (church) {
                this.selectedDistrict.set(location);
                this.availableChurches.set(churches);
                this.selectedChurch.set(church);
                this.editForm.patchValue({
                  churchDistrict: location,
                  churchName: church.name,
                });
              }
            });
        }
      });
    }
  }

  onDistrictChange(district: string): void {
    this.selectedDistrict.set(district);
    this.editForm.patchValue({ churchName: '' });
    this.selectedChurch.set(null);

    if (district) {
      this.churchDataService
        .getChurchesByLocationAndSearch(district)
        .subscribe({
          next: (churches) => {
            this.availableChurches.set(churches);
          },
          error: (err) => {
            console.error('Error loading churches:', err);
            this.availableChurches.set([]);
          },
        });
    } else {
      this.availableChurches.set([]);
    }
  }

  onChurchChange(churchName: string): void {
    const church = this.availableChurches().find((c) => c.name === churchName);
    this.selectedChurch.set(church || null);
  }

  onPhotoFileSelected(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    const fileList: FileList | null = element.files;
    if (fileList && fileList.length > 0) {
      this.photoFile = fileList[0];
    }
  }

  onVicarLetterFileSelected(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    const fileList: FileList | null = element.files;
    if (fileList && fileList.length > 0) {
      this.vicarLetterFile = fileList[0];
    }
  }

  onSubmit(): void {
    if (!this.editForm.valid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const formValue = this.editForm.value;
    const phone = `${formValue.countryCode}${formValue.phone}`;

    const result = {
      ...formValue,
      phone,
      churchId:
        formValue.churchMembership === 'member'
          ? this.selectedChurch()?.id
          : null,
      priestName:
        formValue.churchMembership === 'member'
          ? this.selectedChurch()?.priestName
          : null,
      churchName:
        formValue.churchMembership === 'member'
          ? formValue.churchName
          : formValue.manualChurchName,
      dateOfMarriage: formValue.dateOfMarriage
        ? formValue.dateOfMarriage
        : null,
      ChoirMember: formValue.churchActivities?.choirMember || false,
      SsTeacher: formValue.churchActivities?.ssTeacher || false,
      YouthFellowship: formValue.churchActivities?.youthFellowship || false,
      Other: formValue.churchActivities?.other || '',
      // 👇 include files if changed
      photoFile: this.photoFile || null,
      vicarLetterFile: this.vicarLetterFile || null,
    };

    this.dialogRef.close(result);
  }
}
