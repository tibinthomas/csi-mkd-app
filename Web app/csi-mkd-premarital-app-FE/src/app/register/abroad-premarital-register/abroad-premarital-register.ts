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
    InformedConsentComponent,
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
  protected readonly informedConsentTouched = signal(false);
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
      priestName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s.]*$/)]],
      sessionStartDate: ['', Validators.required],
      sessionEndDate: ['', Validators.required],
      declaration: [false, Validators.requiredTrue],
      informedConsent: [false, Validators.requiredTrue],
      recaptcha: ['', Validators.required],
      timezone: [this.selectedTimezone(), Validators.required],
      participants: this.fb.array([this.createParticipant()]),
    });

    // Simplified logic: Just ensure manualChurchName is required
    this.form.get('manualChurchName')?.setValidators([Validators.required]);
    this.form.get('churchDistrict')?.setValidators([Validators.required]); // For "Outside Kerala" vs "Abroad"
  }

  get participants(): FormArray {
    return this.form.get('participants') as FormArray;
  }

  createParticipant(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s.]*$/)]],
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

  // Save form data to localStorage
  protected saveForm(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.form.getRawValue()));
    this.snackBar.open($localize`Form data saved locally.`, $localize`Close`, { duration: 3000 });
  }

  // Load saved form data from localStorage
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
        this.onDistrictChange(formData.churchDistrict);
        // Wait for churches to load or patch manually if needed
        this.form.get('manualChurchName')?.setValue(formData.manualChurchName);
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
      // Use the Enum values directly
      const tzList = Object.values(TimeZoneOption).map(iana => {
        try {
          const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: iana,
            timeZoneName: 'shortOffset'
          });
          const parts = formatter.formatToParts(now);
          const offset = parts.find(p => p.type === 'timeZoneName')?.value || '';
          return { name: iana, label: `${iana} (${offset})` };
        } catch {
          return { name: iana, label: iana };
        }
      });

      // Sort alphabetically by name (IANA identifier)
      tzList.sort((a, b) => a.name.localeCompare(b.name));
      this.timezones.set(tzList);
    } catch (e) {
      console.warn('Timezone initialization failed', e);
      // Fallback
      const fallbackList = Object.values(TimeZoneOption).map(tz => ({ name: tz, label: tz }));
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
    if (name === 'informedConsent') {
      return !!(control && control.invalid && this.formSubmitted());
    }
    return !!(control && control.invalid && this.formSubmitted());
  }

  handleSuccess(response: string): void {
    this.form.get('recaptcha')?.setValue(response);
  }

  onInformedConsentChange(agreed: boolean): void {
    this.informedConsentTouched.set(true);
    this.form.get('informedConsent')?.setValue(agreed);
  }

  preventInvalidKeys(event: KeyboardEvent) {
    const invalidKeys = ['e', 'E', '+', '-'];
    if (invalidKeys.includes(event.key)) {
      event.preventDefault();
    }
  }

  onSubmit() {
    this.formSubmitted.set(true);

    // Auto-save form data to localStorage before attempting submission
    localStorage.setItem(this.storageKey, JSON.stringify(this.form.getRawValue()));

    // Prevent submission while async validators are still running
    if (this.form.pending) {
      return;
    }

    if (this.form.invalid || this.vicarLetterError()) {
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
      sessionStartDate: raw.sessionStartDate ? this.toUtcIsoString(raw.sessionStartDate, raw.timezone) : '',
      sessionEndDate: raw.sessionEndDate ? this.toUtcIsoString(raw.sessionEndDate, raw.timezone) : '',
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
                extraMessage: $localize`A confirmation email has been sent to your registered email address.`,
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

  toUtcIsoString(dateInput: string | Date, timezone?: string): string {
    const date = new Date(dateInput);
    if (!timezone) return date.toISOString();

    try {
      // Calculate the difference between UTC and target timezone for this specific date
      // to handle DST correctly
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric', month: 'numeric', day: 'numeric',
        hour: 'numeric', minute: 'numeric', second: 'numeric',
        hour12: false
      });
      
      const parts = formatter.formatToParts(date);
      const tzMap: { [key: string]: number } = {};
      parts.forEach(p => { if (p.type !== 'literal') tzMap[p.type] = parseInt(p.value, 10); });
      
      // Create a "local" UTC date that has the same components as the formatted date
      const tzDate = Date.UTC(tzMap['year'], tzMap['month'] - 1, tzMap['day'], tzMap['hour'] % 24, tzMap['minute'], tzMap['second']);
      const localDate = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
      
      const offset = tzDate - localDate;
      
      // Adjust the original date
      const result = new Date(date.getTime() - offset);
      return result.toISOString();
    } catch (e) {
      console.warn('Timezone conversion failed, falling back to local ISO', e);
      return date.toISOString();
    }
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


