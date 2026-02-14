import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    signal
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
    FormArray,
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
    MAT_DIALOG_DATA,
    MatDialog,
    MatDialogModule,
    MatDialogRef,
} from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
    catchError,
    map,
    of,
    switchMap
} from 'rxjs';
import { ParticipantOutsideKeralaDto, PremaritalOutsideKeralaRegisterDto } from '../../../api/api-main-app/models';
import { TimeZoneOption } from '../../../api/api-main-app/models/time-zone-option';
import { CsiMkdPremaritalAppBeService as ApiService } from '../../../api/api-main-app/services';
import {
    CertificateService,
    CertificateType,
} from '../../core/services/certificate.service';
import {
    ChurchDataService,
} from '../../core/services/church-data.service';
import { FileUploadService } from '../../core/services/file-upload.service';
import { CertificatePreviewDialog } from '../../shared/components/certificate-preview-dialog/certificate-preview-dialog';

@Component({
  selector: 'app-abroad-premarital-list',
  standalone: true,
  templateUrl: './abroad-premarital-list.html',
  styleUrl: './abroad-premarital-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatTooltipModule,
    MatDialogModule,
  ],
})
export class AbroadPremaritalListComponent {
  private readonly dialog = inject(MatDialog);
  private readonly api = inject(ApiService);
  private readonly churchDataService = inject(ChurchDataService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly certificateService = inject(CertificateService);

  protected readonly totalCount = signal(0);
  protected readonly searchTermInput = signal<string>('');
  protected readonly searchTerm = signal<string>('');
  protected readonly unapprovedOnly = signal<boolean>(false);
  protected readonly pageIndex = signal<number>(0);
  protected readonly pageSize = signal<number>(10);
  private readonly filterTrigger = signal(0);
  protected readonly isLoading = signal<boolean>(false);
  readonly isApproving = signal<number | null>(null);
  readonly isDeleting = signal<number | null>(null);
  readonly printedParticipants = signal<Set<string>>(new Set());
  readonly lastClickedId = signal<number | null>(null);
  expandedElement: any = null;

  protected readonly churchData = toSignal(this.churchDataService.churchData$, {
    initialValue: null,
  });

  // Fetch registrations from API
  private readonly registrations$ = toObservable(
    computed(() => [
      this.filterTrigger(),
      this.pageIndex(),
      this.pageSize(),
      this.searchTerm(),
      this.unapprovedOnly(),
    ])
  ).pipe(
    switchMap(
      ([_, pageIndex, pageSize, searchTerm, unapproved]) => {
        this.isLoading.set(true);
        
        // Call the API to get all abroad registrations
        return this.api.apiPremaritalregisterOutsideKeralaGet().pipe(
          map((response: any) => {
            console.log('Raw API Response:', response);
            console.log('Response type:', typeof response);
            
            // Parse response if it's a string
            const data = typeof response === 'string' ? JSON.parse(response) : response;
            console.log('Parsed data:', data);
            
            // Handle array response
            let items = Array.isArray(data) ? data : (data?.items || []);
            console.log('Items extracted:', items);
            console.log('Items count:', items.length);
            
            // Apply client-side filtering for search
            if (searchTerm && typeof searchTerm === 'string') {
              const term = searchTerm.toLowerCase();
              items = items.filter((item: any) => {
                const participantNames = item.participants?.map((p: any) => p.name?.toLowerCase()).join(' ') || '';
                const churchName = this.getChurchNameById(item.churchId).toLowerCase();
                const priestName = (item.priestName || '').toLowerCase();
                
                return participantNames.includes(term) || 
                       churchName.includes(term) || 
                       priestName.includes(term);
              });
            }
            
            // Apply client-side filtering for unapproved only
            if (unapproved) {
              items = items.filter((item: any) => !item.paymentStatus);
            }
            
            // Set total count before pagination
            this.totalCount.set(items.length);
            console.log('Total count after filters:', items.length);
            
            // Apply client-side pagination
            const start = Number(pageIndex) * Number(pageSize);
            const paginatedItems = items.slice(start, start + Number(pageSize));
            
            this.isLoading.set(false);
            return paginatedItems;
          }),
          catchError((err) => {
            console.error('Error loading abroad registrations:', err);
            this.isLoading.set(false);
            this.totalCount.set(0);
            return of([]);
          })
        );
      }
    )
  );

  protected readonly registrations = toSignal(this.registrations$, {
    initialValue: [],
  });
  readonly tableData = computed(() => this.registrations());



  searchRegistrations() {
    this.searchTerm.set(this.searchTermInput().trim());
    this.pageIndex.set(0);
  }

  clearFilters() {
    this.searchTermInput.set('');
    this.unapprovedOnly.set(false);
    this.searchRegistrations();
  }

  onPageChange(event: any) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  toggle(reg: any) {
    this.expandedElement = this.isExpanded(reg) ? null : reg;
    this.lastClickedId.set(reg.id);
  }

  isExpanded(reg: any) {
    return this.expandedElement === reg;
  }

  getChurchNameById(churchId: number | null): string {
    if (!churchId) return 'N/A';
    const data = this.churchData();
    if (!data || !Array.isArray(data.churches)) return 'Unknown Church';
    const church = data.churches.find((c: any) => c.id === churchId);
    return church?.name || 'Unknown Church';
  }

  approvePayment(reg: any): void {
    // TODO: Implement payment approval for abroad registrations
    this.snackBar.open('Payment approval not yet implemented', 'Close', {
      duration: 3000,
    });
  }

  editRegistration(reg: any): void {
    console.log('editRegistration method triggered');
    console.log('Registration data:', reg);
    console.log('Church data available:', !!this.churchData());
    
    try {
      const dialogRef = this.dialog.open(EditAbroadRegistrationDialogComponent, {
        width: '600px',
        data: { registration: reg, churchData: this.churchData() },
      });
      console.log('Dialog open call executed');

      dialogRef.afterOpened().subscribe(() => {
        console.log('Dialog successfully opened in UI');
      });

      dialogRef.afterClosed().subscribe((result) => {
        console.log('Dialog closed with result:', result);
        if (result) {
          this.filterTrigger.set(this.filterTrigger() + 1);
          this.snackBar.open('Registration updated successfully', 'Close', {
            duration: 3000,
          });
        }
      });
    } catch (error) {
      console.error('Error attempting to open dialog:', error);
    }
  }

  deleteRegistration(reg: any): void {
    const participantNames = this.formatParticipants(reg.participants);
    const confirmed = confirm(`Are you sure you want to delete the registration for ${participantNames}?`);
    
    if (confirmed) {
      this.isDeleting.set(reg.id);
      
      this.api.apiPremaritalregisterOutsideKeralaIdDelete({ id: reg.id.toString() })
        .subscribe({
          next: () => {
            this.isDeleting.set(null);
            this.snackBar.open('Registration deleted successfully', 'Close', {
              duration: 3000,
            });
            // Refresh the list
            this.filterTrigger.set(this.filterTrigger() + 1);
          },
          error: (err) => {
            this.isDeleting.set(null);
            console.error('Delete failed', err);
            this.snackBar.open('Failed to delete registration. Please try again.', 'Close', {
              duration: 3000,
            });
          },
        });
    }
  }

  formatParticipants(participants: any[]): string {
    if (!participants || participants.length === 0) return 'N/A';
    return participants.map((p: any) => p.name).join(', ');
  }

  formatDate(date: string | Date | null, timezone?: string): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    
    // Format in IST
    const istOptions: Intl.DateTimeFormatOptions = { 
      timeZone: 'Asia/Kolkata', 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    };
    const istDate = d.toLocaleDateString('en-GB', istOptions);
    
    if (!timezone || timezone === 'Asia/Kolkata') {
      return `${istDate}`;
    }

    // Format in Local Timezone
    try {
      const localOptions: Intl.DateTimeFormatOptions = { 
        timeZone: timezone, 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      };
      const localDate = d.toLocaleDateString('en-GB', localOptions);
      return `${localDate}`;
    } catch (e) {
      return `${istDate}`;
    }
  }

  getParticipantKey(regId: any, participant: ParticipantOutsideKeralaDto): string {
    if (participant.name) return participant.name;
    // Fallback composite key
    return `${regId}_${participant.name}`;
  }
  

  isPrinted(participant: ParticipantOutsideKeralaDto, reg: PremaritalOutsideKeralaRegisterDto): boolean {
    const key = this.getParticipantKey((reg as any).id, participant);
    return this.printedParticipants().has(key);
  }
  
  resetPrintStatus(participant: ParticipantOutsideKeralaDto, reg: PremaritalOutsideKeralaRegisterDto): void {
    const key = this.getParticipantKey((reg as any).id, participant);
    this.printedParticipants.update(set => {
      const newSet = new Set(set);
      newSet.delete(key);
      return newSet;
    });
  }

  async generateCertificate(
    participant: ParticipantOutsideKeralaDto,
    registration: PremaritalOutsideKeralaRegisterDto
  ): Promise<void> {
    try {
      let sessionStartDate: Date | undefined;
      let sessionEndDate: Date | undefined;
      let sessionDates: Date[] = [];

      if (registration.sessionStartDate) {
        sessionDates.push(new Date(registration.sessionStartDate));
      }

      const certificateData = {
        name: `${participant.name}`,
        completionDate: new Date(),
        sessionName: 'Premarital Counseling',
        churchName:
          this.getChurchNameById(registration.churchId ?? null) || 'Unknown Church',
        priestName: registration.priestName,
        dates: sessionDates,
        programDuration: `1 Day`,
        sessionStartDate,
        sessionEndDate,
      };

      const htmlContent = await this.certificateService.previewCertificate(
        certificateData,
        CertificateType.PRE_MARITAL
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
}

interface EditAbroadRegistrationData {
  registration: any;
  churchData: any;
}

@Component({
  selector: 'edit-abroad-registration-dialog',
  template: `
    <h2 mat-dialog-title i18n>Edit Registration</h2>
    <form [formGroup]="editForm" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <div class="flex flex-col gap-4 pt-2">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <mat-form-field appearance="fill" class="w-full">
              <mat-label i18n>Location/District</mat-label>
              <input matInput formControlName="churchDistrict" readonly>
            </mat-form-field>

            <mat-form-field appearance="fill" class="w-full">
              <mat-label i18n>Church Name</mat-label>
              <input matInput formControlName="manualChurchName" readonly>
            </mat-form-field>
          </div>

          <mat-form-field appearance="fill" class="w-full">
            <mat-label i18n>Priest Name</mat-label>
            <input matInput formControlName="priestName">
          </mat-form-field>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <mat-form-field appearance="fill" class="w-full">
              <mat-label i18n>Session Start Date</mat-label>
              <input matInput [matDatepicker]="startPicker" formControlName="sessionStartDate" (click)="startPicker.open()">
              <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
              <mat-datepicker #startPicker></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="fill" class="w-full">
              <mat-label i18n>Session End Date</mat-label>
              <input matInput [matDatepicker]="endPicker" formControlName="sessionEndDate" (click)="endPicker.open()">
              <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
              <mat-datepicker #endPicker></mat-datepicker>
            </mat-form-field>
          </div>

          <mat-form-field appearance="fill" class="w-full">
            <mat-label i18n>Timezone</mat-label>
            <mat-select formControlName="timezone">
              @for (tz of timeZoneOptions; track tz) {
                <mat-option [value]="tz">{{ tz }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <!-- Vicar Letter Section -->
          <div class="border rounded-lg p-4 bg-surface-container-low">
            <h4 class="text-sm font-semibold mb-3 flex items-center gap-2">
              <mat-icon class="text-base h-4 w-4">description</mat-icon>
              <span i18n>Vicar Letter</span>
            </h4>
            
            <div class="flex flex-col gap-3">
              @if (editForm.get('vicarLetterUrl')?.value) {
                <div class="flex items-center gap-2 text-sm">
                  <span class="text-on-surface-variant" i18n>Current:</span>
                  <a [href]="editForm.get('vicarLetterUrl')?.value" target="_blank" class="text-primary hover:underline flex items-center gap-1">
                    <span i18n>View current letter</span>
                    <mat-icon class="text-xs h-3 w-3">open_in_new</mat-icon>
                  </a>
                </div>
              }
              
              <div class="flex flex-col gap-2">
                <label class="text-xs text-on-surface-variant px-1" i18n>Upload New Letter (Optional)</label>
                <input type="file" (change)="onFileSelected($event)" accept=".pdf,.jpg,.jpeg,.png"
                       class="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-container file:text-on-primary-container hover:file:bg-primary-container-high cursor-pointer" />
                @if (vicarLetterFile()) {
                  <div class="text-xs text-primary flex items-center gap-1 mt-1">
                    <mat-icon class="text-xs h-3 w-3">check_circle</mat-icon>
                    <span>{{ vicarLetterFile()?.name }} selected</span>
                  </div>
                }
              </div>
            </div>
          </div>

          <h3 class="text-lg font-medium" i18n>Participants</h3>
          <div formArrayName="participants" class="space-y-2">
            @for (p of participants.controls; track p; let i = $index) {
              <div [formGroupName]="i" class="flex gap-2 items-center">
                <mat-form-field appearance="fill" class="flex-grow pt-2">
                  <mat-label i18n>Participant Name</mat-label>
                  <input matInput formControlName="name">
                </mat-form-field>
                <button type="button" mat-icon-button color="warn" (click)="removeParticipant(i)" [disabled]="participants.length === 1">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            }
          </div>
          <button type="button" mat-stroked-button color="primary" (click)="addParticipant()">
            <mat-icon>add</mat-icon> <span i18n>Add Participant</span>
          </button>
        </div>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="dialogRef.close()">Cancel</button>
        <button mat-flat-button color="primary" type="submit" [disabled]="editForm.invalid || isSaving()">
          @if (isSaving()) {
            <mat-spinner diameter="18" class="mr-2"></mat-spinner>
            <span i18n>Saving...</span>
          } @else {
            <span i18n>Update</span>
          }
        </button>
      </mat-dialog-actions>
    </form>
  `,
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  providers: [provideNativeDateAdapter()],
})
export class EditAbroadRegistrationDialogComponent {
  private readonly fb = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<EditAbroadRegistrationDialogComponent>);
  readonly data = inject<EditAbroadRegistrationData>(MAT_DIALOG_DATA);
  private readonly api = inject(ApiService);
  private readonly churchDataService = inject(ChurchDataService);
  private readonly fileUploadService = inject(FileUploadService);
  private readonly snackBar = inject(MatSnackBar);

  editForm: FormGroup;
  isSaving = signal(false);
  vicarLetterFile = signal<File | null>(null);
  timeZoneOptions = Object.values(TimeZoneOption);
  deletedParticipantIds: string[] = [];

  constructor() {
    console.log('EditAbroadRegistrationDialogComponent constructor starting');
    
    const reg = this.data.registration;
    const churchData = this.data.churchData;

    const churchDetails = this.churchDataService.getChurchDetailsById(reg?.churchId, churchData);

    this.editForm = this.fb.group({
      churchDistrict: [{ value: churchDetails?.locationName || reg?.churchDistrict || '', disabled: true }, Validators.required],
      manualChurchName: [{ value: churchDetails?.name || reg?.manualChurchName || '', disabled: true }, Validators.required],
      priestName: [reg?.priestName || '', Validators.required],
      sessionStartDate: [reg?.sessionStartDate ? new Date(reg.sessionStartDate) : null, Validators.required],
      sessionEndDate: [reg?.sessionEndDate ? new Date(reg.sessionEndDate) : null, Validators.required],
      timezone: [reg?.timeZone || 'Asia/Kolkata', Validators.required],
      vicarLetterUrl: [reg?.premaritalOutsideKeralaDocument?.vicarLetterUrl || ''],
      participants: this.fb.array([])
    });

    if (reg?.participants) {
      const sortedParticipants = [...reg.participants].sort((a: any, b: any) => (b.id || 0) - (a.id || 0));
      sortedParticipants.forEach((p: any) => {
        this.participants.push(this.fb.group({
          id: [p.id],
          name: [p.name || '', Validators.required]
        }));
      });
    }
  }

  get participants(): FormArray {
    return this.editForm.get('participants') as FormArray;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.vicarLetterFile.set(file);
    }
  }

  addParticipant() {
    this.participants.push(this.fb.group({
      id: [null],
      name: ['', Validators.required]
    }));
  }

  removeParticipant(index: number) {
    if (this.participants.length > 1) {
      const participant = this.participants.at(index);
      const id = participant.get('id')?.value;
      if (id) {
        this.deletedParticipantIds.push(id);
      }
      this.participants.removeAt(index);
    }
  }

  onSubmit() {
    if (this.editForm.invalid) return;

    this.isSaving.set(true);
    const formValue = this.editForm.getRawValue();
    
    const reg = this.data.registration;
    const updateDto: any = {
      churchId: reg.churchId,
      participants: formValue.participants.map((p: any) => ({
        id: p.id,
        name: p.name
      })),
      priestName: formValue.priestName,
      sessionStartDate: formValue.sessionStartDate ? formValue.sessionStartDate.toISOString() : null,
      sessionEndDate: formValue.sessionEndDate ? formValue.sessionEndDate.toISOString() : null,
      timeZone: formValue.timezone,
      deletedParticipantIds: this.deletedParticipantIds
    };

    this.api.apiPremaritalregisterOutsideKeralaIdPut({
      id: reg.id.toString(),
      body: updateDto
    }).pipe(
      switchMap(() => {
        const file = this.vicarLetterFile();
        if (!file) return of(null);

        return this.api.apiAzureuploadGenerateSasGet({
          fileName: `abroad/${reg.id}/vicarletter/${file.name}`,
          contentType: file.type
        }).pipe(
          switchMap((sasUrl) => this.fileUploadService.uploadFileToAzure(file, sasUrl!)),
          switchMap((vicarLetterUrl) => {
            return this.api.apiPremaritalregisterOutsideKeralaFilesRegistrationIdPost({
              registrationId: reg.id.toString(),
              body: {
                registrationId: reg.id.toString(),
                vicarLetterUrl: vicarLetterUrl
              }
            });
          })
        );
      })
    ).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.snackBar.open('Registration updated successfully', 'Close', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Update failed', err);
        this.isSaving.set(false);
        this.snackBar.open('Failed to update registration', 'Close', { duration: 3000 });
      }
    });
  }
}
