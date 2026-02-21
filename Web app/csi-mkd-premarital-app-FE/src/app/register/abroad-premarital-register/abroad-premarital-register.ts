import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  ViewChild,
  computed,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormArray,
} from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { Dialog } from '../../shared/dialog-popup/dialog-popup';
import { AnimateOnScrollDirective } from '../../shared/directives/animate-on-scroll.directive';
import { NoDigitsDirective } from '../../shared/directives/no-digits.directive';

import { FileUploadService } from '../../core/services/file-upload.service';
import { InformedConsentComponent } from '../../shared/informed-consent/informed-consent';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxCaptchaModule } from 'ngx-captcha';
import { ThemeService } from '../../core/services/theme.service';
import { CsiMkdPremaritalAppBeService as ApiService } from '../../../api/api-main-app/services';
import {
  ChurchDataService,
  ChurchWithDetails,
} from '../../core/services/church-data.service';

import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { dateRangeValidator } from '../../core/validators/date-range.validator';
import Shepherd from 'shepherd.js';
import { TimeZoneOption } from '../../../api/api-main-app/models/time-zone-option';

@Component({
  selector: 'app-abroad-premarital-register',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatRadioModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatIcon,
    AnimateOnScrollDirective,
    NgxCaptchaModule,
    MatTooltipModule,
    NoDigitsDirective,
  ],
  templateUrl: './abroad-premarital-register.html',
  styleUrl: './abroad-premarital-register.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AbroadPremaritalRegister {
  private readonly fb = inject(FormBuilder);
  readonly dialog = inject(MatDialog);
  private router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly api = inject(ApiService);
  private readonly fileUploadService = inject(FileUploadService);
  private readonly themeService = inject(ThemeService);
  private readonly churchDataService = inject(ChurchDataService);

  private readonly snackBar = inject(MatSnackBar);

  // CAPTCHA bypass feature - valid for 1 hour with special URL
  protected readonly captchaBypassEnabled = signal(false);
  private readonly BYPASS_VALIDITY_MS = 60 * 60 * 1000; // 1 hour in milliseconds

  protected readonly form: FormGroup;
  // File upload signals
  protected readonly vicarLetterFile = signal<File | null>(null);
  protected readonly vicarLetterPreviewUrl = signal<string | null>(null);
  protected readonly successMessage = signal('');
  protected readonly errorMessage = signal('');
  protected readonly isSubmitting = signal(false);
  protected readonly formSubmitted = signal(false);
  protected readonly vicarLetterError = signal('');

  protected readonly minDate = new Date().toISOString().split('T')[0];

  // protected siteKey: string = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'; //test site key
  protected siteKey: string = '6LeODJ0rAAAAAM09ftjENEAG5A9CkDQiL1wa3199';
  protected recaptchaTheme = computed(() =>
    this.themeService.isDark() ? 'dark' : 'light'
  );

  @ViewChild('letterInput') letterInput!: ElementRef<HTMLInputElement>;
  @ViewChild('formEl') formEl!: ElementRef<HTMLFormElement>;
  selectedSessionId = signal<number | null>(null);

  // Church data signals
  protected readonly locations = toSignal(this.churchDataService.getAllLocations(), { initialValue: [] });
  protected readonly filteredLocations = computed(() => {
    const list = this.locations();
    return list.filter(loc => loc.includes('Outside Kerala') || loc.includes('Abroad'));
  });
  protected readonly availableChurches = signal<ChurchWithDetails[]>([]);
  protected readonly selectedChurch = signal<ChurchWithDetails | null>(null);

  // Timezone signals
  protected readonly timezones = signal<{ name: string; label: string }[]>([]);
  protected readonly selectedTimezone = signal<string>(Intl.DateTimeFormat().resolvedOptions().timeZone);

  private tour: any | null = null;

  constructor() {
    const navState = this.router.currentNavigation()?.extras.state;
    if (navState?.['selectedSessionId']) {
      this.selectedSessionId.set(navState['selectedSessionId']);
    }

    this.form = this.fb.group({
      churchMembership: ['abroad-candidate', Validators.required],
      churchDistrict: ['', Validators.required], // Now used for Outside Kerala / Abroad
      manualChurchName: [{ value: '', disabled: true }, Validators.required], 
      priestName: ['', [
        Validators.required, 
        Validators.minLength(3),
        Validators.maxLength(100),
        Validators.pattern(/^[a-zA-Z\s.]*$/)
      ]],
      sessionStartDate: ['', Validators.required],
      sessionEndDate: ['', Validators.required],
      declaration: [false, Validators.requiredTrue],
      recaptcha: ['', Validators.required],
      timezone: [this.selectedTimezone(), Validators.required],
      participants: this.fb.array([this.createParticipant()]),
    }, { validators: dateRangeValidator('sessionStartDate', 'sessionEndDate') });

    // Simplified logic: Just ensure manualChurchName is required
    this.form.get('manualChurchName')?.setValidators([Validators.required]);
    this.form.get('churchDistrict')?.setValidators([Validators.required]); // For "Outside Kerala" vs "Abroad"
  }

  get participants(): FormArray {
    return this.form.get('participants') as FormArray;
  }

  createParticipant(): FormGroup {
    return this.fb.group({
      name: ['', [
        Validators.required, 
        Validators.minLength(3),
        Validators.maxLength(100),
        Validators.pattern(/^[a-zA-Z\s.]*$/)
      ]],
    });
  }

  addParticipant(): void {
    this.participants.push(this.createParticipant());
  }

  removeParticipant(index: number): void {
    if (this.participants.length > 1) {
      this.participants.removeAt(index);
    }
  }


  // LocalStorage key for saving form progress
  private readonly storageKey = 'abroadPremaritalRegistrationForm';

  // Save form data and files to localStorage
  protected saveForm(): void {
    const data = this.form.getRawValue();
    const file = this.vicarLetterFile();

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        localStorage.setItem(this.storageKey, JSON.stringify({
          ...data,
          vicarLetterBase64: base64,
          vicarLetterName: file.name,
          vicarLetterType: file.type
        }));
        this.snackBar.open($localize`Form data and file saved locally.`, $localize`Close`, { duration: 3000 });
      };
      reader.readAsDataURL(file);
    } else {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      this.snackBar.open($localize`Form data saved locally.`, $localize`Close`, { duration: 3000 });
    }
  }

  // Load saved form data and files from localStorage
  protected loadForm(showAlert = false): void {
    const savedData = localStorage.getItem(this.storageKey);
    if (savedData) {
      const formData = JSON.parse(savedData);

      // Restore participants array
      if (formData.participants && Array.isArray(formData.participants)) {
        this.participants.clear();
        formData.participants.forEach((p: any) => {
          const group = this.createParticipant();
          group.patchValue(p);
          this.participants.push(group);
        });
      }

      // Patch all form data
      this.form.patchValue(formData);

      // Handle dependent dropdown for church
      if (formData.churchDistrict) {
        this.form.get('manualChurchName')?.enable();
        this.churchDataService
          .getChurchesByLocationAndSearch(formData.churchDistrict)
          .subscribe({
            next: (churches) => {
              this.availableChurches.set(churches);
              this.form.get('manualChurchName')?.setValue(formData.manualChurchName);
              this.form.get('priestName')?.setValue(formData.priestName);
              // Set the internal selectedChurch signal so it's not null on submission
              this.onChurchChange(formData.manualChurchName);
              
              // Sync selectedTimezone signal with patched form value
              if (formData.timezone) {
                this.selectedTimezone.set(formData.timezone);
              }
            },
            error: (err) => {
              console.error('Error loading churches:', err);
              this.availableChurches.set([]);
            },
          });
      }

      // Restore saved file if present
      if (formData.vicarLetterBase64 && formData.vicarLetterName && formData.vicarLetterType) {
        fetch(formData.vicarLetterBase64)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], formData.vicarLetterName, { type: formData.vicarLetterType });
            this.vicarLetterFile.set(file);
            this.vicarLetterPreviewUrl.set(URL.createObjectURL(file));
          })
          .catch(err => console.error('Error restoring saved file:', err));
      }

      if (showAlert) {
        this.snackBar.open($localize`Form data loaded from local storage.`, $localize`Close`, { duration: 3000 });
      }
    } else {
      if (showAlert) {
        this.snackBar.open($localize`No saved data found.`, $localize`Close`, { duration: 3000 });
      }
    }
  }

  // Clear saved form data from localStorage and reset form
  protected clearForm(): void {
    localStorage.removeItem(this.storageKey);
    this.form.reset();
    this.participants.clear();
    this.addParticipant(); // Ensure at least one participant is present
    
    // Revoke object URLs
    if (this.vicarLetterPreviewUrl()) {
      URL.revokeObjectURL(this.vicarLetterPreviewUrl()!);
    }

    this.vicarLetterFile.set(null);
    this.vicarLetterPreviewUrl.set(null);
    this.vicarLetterError.set('');
    this.selectedChurch.set(null);
    this.availableChurches.set([]);
    this.formSubmitted.set(false);
  }

  // Clear localStorage after successful submission
  private clearLocalStorage(): void {
    localStorage.removeItem(this.storageKey);
  }

  hasPendingChanges = (): boolean => {
    return this.form.dirty;
  };

  ngOnInit() {
    this.loadForm(false); // Load any saved form data on init (without alert)

    
    // Ensure membership is set to abroad-candidate if not loaded
    if (!this.form.get('churchMembership')?.value) {
       this.form.patchValue({ churchMembership: 'abroad-candidate' });
    }
    
    // Set manualValidators based on logic (the subscription triggers on patchValue? No, usually not unless emitEvent: true which is default)
    // But patchValue might not trigger if value is same? 
    // Let's force update validity
    this.form.get('churchMembership')?.updateValueAndValidity();

    if (this.selectedSessionId()) {
      this.form.patchValue({ sessionId: this.selectedSessionId() });
    }
    window.addEventListener('beforeunload', this.beforeUnloadHandler);

    // Check for CAPTCHA bypass query parameter
    this.checkCaptchaBypass();

    // Initialize list of timezones
    this.initTimezones();
  }

  private initTimezones(): void {
    try {
      const now = new Date();
      // IST offset in minutes (UTC+05:30 = +330 minutes)
      const IST_OFFSET_MINUTES = 330;
      
      // Use the Enum values directly, but filter out UTC
      const tzList = Object.values(TimeZoneOption)
        .filter(iana => iana !== 'UTC') // Remove UTC option
        .map(iana => {
          try {
            // Get the UTC offset for this timezone
            const formatter = new Intl.DateTimeFormat('en-US', {
              timeZone: iana,
              timeZoneName: 'shortOffset'
            });
            const parts = formatter.formatToParts(now);
            const offsetStr = parts.find(p => p.type === 'timeZoneName')?.value || '';
            
            // Parse the offset (e.g., "GMT+5:30" or "GMT-5")
            const match = offsetStr.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
            let tzOffsetMinutes = 0;
            if (match) {
              const sign = match[1] === '+' ? 1 : -1;
              const hours = parseInt(match[2], 10);
              const minutes = parseInt(match[3] || '0', 10);
              tzOffsetMinutes = sign * (hours * 60 + minutes);
            }
            
            // Calculate offset relative to IST
            const diffFromIST = tzOffsetMinutes - IST_OFFSET_MINUTES;
            
            // Format the IST offset
            let istOffsetLabel: string;
            if (diffFromIST === 0) {
              istOffsetLabel = 'IST';
            } else {
              const sign = diffFromIST >= 0 ? '+' : '-';
              const absDiff = Math.abs(diffFromIST);
              const hours = Math.floor(absDiff / 60);
              const mins = absDiff % 60;
              if (mins === 0) {
                istOffsetLabel = `IST${sign}${hours}`;
              } else {
                istOffsetLabel = `IST${sign}${hours}:${mins.toString().padStart(2, '0')}`;
              }
            }
            
            return { name: iana, label: `${iana} (${istOffsetLabel})` };
          } catch {
            return { name: iana, label: iana };
          }
        });

      // Sort alphabetically by name (IANA identifier)
      tzList.sort((a, b) => a.name.localeCompare(b.name));
      this.timezones.set(tzList);
    } catch (e) {
      console.warn('Timezone initialization failed', e);
      // Fallback - also filter out UTC
      const fallbackList = Object.values(TimeZoneOption)
        .filter(tz => tz !== 'UTC')
        .map(tz => ({ name: tz, label: tz }));
      this.timezones.set(fallbackList);
    }
  }

  /**
   * Check for time-limited CAPTCHA bypass URL
   * URL format: ?bypass=<base64_encoded_timestamp>
   * Valid only for 1 hour from the timestamp
   */
  private checkCaptchaBypass(): void {
    const bypassParam = this.route.snapshot.queryParamMap.get('bypass');
    if (!bypassParam) return;

    try {
      // Decode base64 timestamp
      const decodedTimestamp = atob(bypassParam);
      const bypassTimestamp = parseInt(decodedTimestamp, 10);
      
      if (isNaN(bypassTimestamp)) {
        console.warn('Invalid bypass token format');
        return;
      }

      const now = Date.now();
      const age = now - bypassTimestamp;

      // Check if the bypass token is valid (within 1 hour)
      if (age >= 0 && age <= this.BYPASS_VALIDITY_MS) {
        this.captchaBypassEnabled.set(true);
        
        // Remove reCAPTCHA validator
        this.form.get('recaptcha')?.clearValidators();
        this.form.get('recaptcha')?.updateValueAndValidity();
        
        // Calculate remaining time
        const remainingMinutes = Math.round((this.BYPASS_VALIDITY_MS - age) / 60000);
        
        this.snackBar.open(
          $localize`CAPTCHA verification bypassed. Valid for ${remainingMinutes} more minutes.`,
          $localize`OK`,
          { duration: 5000 }
        );
      } else {
        this.snackBar.open(
          $localize`Bypass link has expired. Please complete CAPTCHA verification.`,
          $localize`Close`,
          { duration: 5000 }
        );
      }
    } catch (error) {
      console.warn('Failed to parse bypass token:', error);
    }
  }

  private beforeUnloadHandler = (event: BeforeUnloadEvent) => {
    // Block navigation if form has pending changes OR if submission is in progress
    if (this.hasPendingChanges() || this.isSubmitting()) {
      event.preventDefault();
      event.returnValue = '';
    }
  };



  onFileChange(event: Event, type: 'vicarLetter') {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0] || null;

    if (type === 'vicarLetter') {
      if (this.vicarLetterPreviewUrl()) {
        URL.revokeObjectURL(this.vicarLetterPreviewUrl()!);
        this.vicarLetterPreviewUrl.set(null);
      }

      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
      ];

      if (file && !allowedTypes.includes(file.type)) {
        this.vicarLetterError.set('Allowed types: PDF, DOC, DOCX, JPG, PNG');
        this.vicarLetterFile.set(null);
      } else if (file && file.size > 2 * 1024 * 1024) {
        this.vicarLetterError.set('File too large. Max size is 2MB.');
        this.vicarLetterFile.set(null);
      } else {
        this.vicarLetterFile.set(file);
        this.vicarLetterError.set('');
        if (file) {
            const url = URL.createObjectURL(file);
            this.vicarLetterPreviewUrl.set(url);
          }
      }
    }
  }
  showSuccessModal = signal(false);
  showErrorModal = signal(false);

  closeModal() {
    this.showSuccessModal.set(false);
    this.showErrorModal.set(false);
  }

  isInvalid(name: string): boolean {
    const control = this.form.get(name);
    return !!(control && control.invalid && this.formSubmitted());
  }

  handleSuccess(response: string): void {
    this.form.get('recaptcha')?.setValue(response);
  }



  preventInvalidKeys(event: KeyboardEvent) {
    const invalidKeys = ['e', 'E', '+', '-'];
    if (invalidKeys.includes(event.key)) {
      event.preventDefault();
    }
  }

  onSubmit() {
    this.formSubmitted.set(true);

    // Prevent submission while async validators are still running
    if (this.form.pending) {
      return;
    }

    if (this.form.invalid || this.vicarLetterError() || !this.vicarLetterFile()) {
      if (!this.vicarLetterFile()) {
        this.vicarLetterError.set($localize`Vicar’s letter is required.`);
      }
      this.form.markAllAsTouched();
      this.focusFirstInvalidControl();
      return;
    }

    const raw = this.form.value;
    
    const participants = this.participants.value;
    this.isSubmitting.set(true);

    const letter = this.vicarLetterFile()!;

    const body: any = {
      churchId: this.selectedChurch()?.id || null,
      participants: participants.map((p: any) => ({ name: p.name })),
      sessionStartDate: raw.sessionStartDate ? this.toIsoStringPreservingLocal(raw.sessionStartDate) : '',
      sessionEndDate: raw.sessionEndDate ? this.toIsoStringPreservingLocal(raw.sessionEndDate) : '',
      priestName: raw.priestName || '',
      timeZone: raw.timezone,
    };

    this.api.apiPremaritalregisterOutsideKeralaPost({ body }).subscribe({
      next: (response: any) => {
        // Handle response which might be string or object depending on generator config
        // Many endpoints return JSON strings that need parsing
        let registerId: string | undefined;
        try {
          registerId = typeof response === 'string' ? JSON.parse(response).id : response?.id;
        } catch (e) {
          console.warn('Failed to parse registration response', e);
          registerId = (response as any)?.id;
        }

        if (!registerId) {
          console.error('Registration ID not found in response', response);
          this.errorMessage.set('Registration failed: Response ID missing.');
          this.showErrorModal.set(true);
          this.isSubmitting.set(false);
          return;
        }

        // Only upload vicar letter
        this.api.apiAzureuploadGenerateSasGet({
          fileName: `premarital-outside-kerala/${registerId}/vicarletter/${letter.name}`,
          contentType: letter.type,
        }).pipe(
          switchMap((letterSasUrl) =>
            this.fileUploadService.uploadFileToAzure(letter, letterSasUrl!)
          ),
          switchMap((letterUrl) => {
            const fileBody = {
              registrationId: registerId!,
              vicarLetterUrl: letterUrl,
            };

            return this.api.apiPremaritalregisterOutsideKeralaFilesRegistrationIdPost({
              registrationId: registerId!,
              body: fileBody,
            });
          })
        ).subscribe({
          next: () => {
            this.isSubmitting.set(false);
            this.successMessage.set('Registration submitted successfully!');
            const dialogRef = this.dialog.open(Dialog, {
              disableClose: true,
              data: {
                title: $localize`Abroad Premarital Registration Complete`,
                messages: [$localize`Your premarital registration is successfully completed.`],
              },
            });
            dialogRef.afterClosed().subscribe(() => {
              this.clearLocalStorage();
              this.form.reset();
              window.history.back();
            });
          },
          error: (err) => {
            console.error('File upload or registration update failed:', err);
            // Rollback registration
            this.api.apiPremaritalregisterIdDelete({ id: registerId! }).subscribe({
              next: () => console.warn(`Rolled back registration ${registerId}`),
              error: (rollbackErr) => console.error('Rollback failed', rollbackErr),
            });

            this.dialog.open(Dialog, {
              disableClose: true,
              data: {
                title: $localize`Registration Failed`,
                messages: [
                  $localize`We couldn’t complete your registration because file upload failed.`,
                  $localize`Please try again after some time.`,
                ],
              },
            });
            this.isSubmitting.set(false);
          }
        });
      },
      error: (err) => {
        console.error('Registration save failed:', err);
        this.errorMessage.set('Registration failed. Please try again.');
        this.isSubmitting.set(false);
      },
    });
  }


  toIsoStringPreservingLocal(dateInput: string | Date): string {
    const date = new Date(dateInput);
    const pad = (n: number) => (n < 10 ? '0' + n : n);
    return (
      date.getFullYear() +
      '-' +
      pad(date.getMonth() + 1) +
      '-' +
      pad(date.getDate()) +
      'T' +
      pad(date.getHours()) +
      ':' +
      pad(date.getMinutes()) +
      ':' +
      pad(date.getSeconds())
    );
  }

  protected readonly currentTimezoneDisplay = computed(() => {
    const tz = this.form?.get('timezone')?.value || this.selectedTimezone();
    const found = this.timezones().find(t => t.name === tz);
    return found ? found.label : tz;
  });

  protected readonly timezoneDisplay: string = $localize`DD/MM/YYYY | Time Zone: ${this.currentTimezoneDisplay()}`;

  onDistrictChange(district: string): void {
    this.form.patchValue({ manualChurchName: '', priestName: '' }); // Reset church selection
    this.selectedChurch.set(null); // Reset selected church

    // Auto-select timezone based on the district
    if (district) {
      // For "Outside Kerala (Within India)", use IST
      if (district.toLowerCase().includes('outside kerala') || district.toLowerCase().includes('within india')) {
        const istTimezone = 'Asia/Kolkata';
        this.form.patchValue({ timezone: istTimezone });
        this.selectedTimezone.set(istTimezone);
      } 
      // For "Abroad (Outside India)", use the browser's timezone as default
      else if (district.toLowerCase().includes('abroad') || district.toLowerCase().includes('outside india')) {
        const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        this.form.patchValue({ timezone: browserTimezone });
        this.selectedTimezone.set(browserTimezone);
      }
    }

    if (district) {
      this.form.get('manualChurchName')?.enable(); // Enable church name field
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
      this.form.get('manualChurchName')?.disable(); // Disable church name field
      this.availableChurches.set([]);
    }
  }

  onChurchChange(churchId: number): void {
    const church = this.availableChurches().find((c) => c.id === churchId);
    this.selectedChurch.set(church || null);
  }

  private focusFirstInvalidControl(): void {
    try {
      const formElement = this.formEl?.nativeElement;
      if (!formElement) return;
      const firstInvalid = formElement.querySelector(
        'input.ng-invalid, textarea.ng-invalid, select.ng-invalid, mat-select.ng-invalid'
      ) as HTMLElement | null;
      if (firstInvalid) {
        if (typeof (firstInvalid as any).focus === 'function') {
          (firstInvalid as HTMLElement).focus({ preventScroll: false });
        } else {
          firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    } catch {
      // no-op
    }
  }
}


