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
import { MatDialogModule } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { Dialog } from '../../shared/dialog-popup/dialog-popup';
import { emailExistsValidatorFactory } from '../../core/validators/unique-email.validator';
import { emailDomainValidator } from '../../core/validators/email-domain.validator';
import { FileUploadService } from '../../core/services/file-upload.service';
import { NoDigitsDirective } from '../../shared/directives/no-digits.directive';
import { OnlyDigitsDirective } from '../../shared/directives/only-digits.directive';
import { SpeechRecognitionDirective } from '../../shared/directives/speech-recognition.directive';
import { InformedConsentComponent } from '../../shared/informed-consent/informed-consent';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxCaptchaModule } from 'ngx-captcha';
import { ThemeService } from '../../core/services/theme.service';
import { CsiMkdPremaritalAppBeService as ApiService } from '../../../api/api-main-app/services';
import {
  ChurchDataService,
  ChurchWithDetails,
} from '../../core/services/church-data.service';
import { SessionsFallbackService } from '../../core/services/sessions-fallback.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import Shepherd from 'shepherd.js';

@Component({
  selector: 'app-premarital-register',
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
    DatePipe,
    MatIcon,
    // AnimateOnScrollDirective,
    NgxCaptchaModule,
    NoDigitsDirective,
    OnlyDigitsDirective,
    SpeechRecognitionDirective,
    InformedConsentComponent,
    MatTooltipModule,
  ],
  templateUrl: './premarital-register.html',
  styleUrl: './premarital-register.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PremaritalRegister {
  private readonly fb = inject(FormBuilder);
  readonly dialog = inject(MatDialog);
  private router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly api = inject(ApiService);
  private readonly fileUploadService = inject(FileUploadService);
  private readonly themeService = inject(ThemeService);
  private readonly churchDataService = inject(ChurchDataService);
  private readonly sessionsFallbackService = inject(SessionsFallbackService);
  private readonly snackBar = inject(MatSnackBar);

  // CAPTCHA bypass feature - valid for 1 hour with special URL
  protected readonly captchaBypassEnabled = signal(false);
  private readonly BYPASS_VALIDITY_MS = 60 * 60 * 1000; // 1 hour in milliseconds

  protected readonly form: FormGroup;
  protected readonly photoFile = signal<File | null>(null);
  protected readonly vicarLetterFile = signal<File | null>(null);
  protected readonly photoPreviewUrl = signal<string | null>(null);
  protected readonly vicarLetterPreviewUrl = signal<string | null>(null);
  protected readonly successMessage = signal('');
  protected readonly errorMessage = signal('');
  protected readonly isSubmitting = signal(false);
  protected readonly formSubmitted = signal(false);
  protected readonly photoError = signal('');
  protected readonly vicarLetterError = signal('');
  protected readonly informedConsentTouched = signal(false);
  protected readonly minDate = new Date().toISOString().split('T')[0];

  // protected siteKey: string = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'; //test site key
  protected siteKey: string = '6LeODJ0rAAAAAM09ftjENEAG5A9CkDQiL1wa3199';
  protected recaptchaTheme = computed(() =>
    this.themeService.isDark() ? 'dark' : 'light'
  );

  @ViewChild('photoInput') photoInput!: ElementRef<HTMLInputElement>;
  @ViewChild('letterInput') letterInput!: ElementRef<HTMLInputElement>;
  @ViewChild('formEl') formEl!: ElementRef<HTMLFormElement>;
  selectedSessionId = signal<number | null>(null);

  // Church data signals
  protected readonly selectedDistrict = signal<string>('');
  protected readonly availableChurches = signal<ChurchWithDetails[]>([]);
  protected readonly allLocations = toSignal(
    this.churchDataService.getAllLocations(),
    { initialValue: [] }
  );
  protected readonly selectedChurch = signal<ChurchWithDetails | null>(null);

  private tour: any | null = null;

  constructor() {
    const navState = this.router.currentNavigation()?.extras.state;
    if (navState?.['selectedSessionId']) {
      this.selectedSessionId.set(navState['selectedSessionId']);
    }

    this.form = this.fb.group({
      firstName: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
          Validators.pattern(/^[a-zA-Z\s.]*$/),
        ],
      ],
      lastName: [
        '',
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(50),
          Validators.pattern(/^[a-zA-Z\s.]*$/),
        ],
      ],
      fatherName: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
          Validators.pattern(/^[a-zA-Z\s.]*$/),
        ],
      ],
      address: [
        '',
        [
          Validators.required,
          Validators.maxLength(350),
          Validators.pattern(/^[a-zA-Z0-9\s,.\-\/()#:;'"&]*$/),
        ],
      ],
      sex: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(1), Validators.max(120)]],
      education: [
        '',
        [
          Validators.required,
          Validators.maxLength(100),
          Validators.pattern(/^[a-zA-Z\s.]*$/),
        ],
      ],
      occupation: [
        '',
        [
          Validators.required,
          Validators.maxLength(100),
          Validators.pattern(/^[a-zA-Z\s.]*$/),
        ],
      ],
      churchMembership: ['', Validators.required],
      churchDistrict: ['', Validators.required],
      churchName: [{ value: '', disabled: true }, Validators.required],
      manualChurchName: [''],
      fianceName: [
        '',
        [Validators.maxLength(100), Validators.pattern(/^[a-zA-Z\s.]*$/)],
      ],
      dateOfMarriage: [''],
      countryCode: ['+91', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      email: [
        '',
        {
          validators: [
            Validators.required,
            Validators.email,
            emailDomainValidator(),
          ],
          asyncValidators: [
            emailExistsValidatorFactory((email) =>
              this.api.apiPremaritalregisterCheckEmailGet({ email })
            ),
          ],
          updateOn: 'blur',
        },
      ],
      days: ['', Validators.required],
      churchActivities: this.fb.group({
        choirMember: [false],
        ssTeacher: [false],
        youthFellowship: [false],
        other: [''],
      }),
      declaration: [false, Validators.requiredTrue],
      informedConsent: [false, Validators.requiredTrue],
      sessionId: ['', Validators.required],
      recaptcha: ['', Validators.required],
    });

    // Handle conditional validation based on churchMembership radio button
    this.form.get('churchMembership')?.valueChanges.subscribe((membership) => {
      if (membership === 'not-member') {
        // If not a member, clear and disable district/church fields, enable manual church name
        this.form.patchValue({ churchDistrict: '', churchName: '' });
        this.form.get('churchDistrict')?.clearValidators();
        this.form.get('churchName')?.clearValidators();
        this.form.get('manualChurchName')?.setValidators([Validators.required]);
      } else if (membership === 'member') {
        // If a member, restore district/church validation, clear manual church name
        this.form.patchValue({ manualChurchName: '' });
        this.form.get('churchDistrict')?.setValidators([Validators.required]);
        this.form.get('churchName')?.setValidators([Validators.required]);
        this.form.get('manualChurchName')?.clearValidators();
      }
      this.form.get('churchDistrict')?.updateValueAndValidity();
      this.form.get('churchName')?.updateValueAndValidity();
      this.form.get('manualChurchName')?.updateValueAndValidity();
    });
  }

  // LocalStorage key for saving form progress
  private readonly storageKey = 'premaritalRegistrationForm';

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

      // Temporarily remove validators to avoid issues with disabled fields
      this.form.get('churchName')?.clearValidators();
      this.form.get('churchName')?.updateValueAndValidity();

      // Patch all form data
      this.form.patchValue(formData);

      // Handle dependent dropdown for church (only for members)
      if (formData.churchMembership === 'member' && formData.churchDistrict) {
        this.selectedDistrict.set(formData.churchDistrict);
        this.form.get('churchName')?.enable();
        this.churchDataService
          .getChurchesByLocationAndSearch(formData.churchDistrict)
          .subscribe((churches) => {
            this.availableChurches.set(churches);
            this.form.get('churchName')?.setValue(formData.churchName);
            this.onChurchChange(formData.churchName);

            // Restore validators
            this.form.get('churchName')?.setValidators([Validators.required]);
            this.form.get('churchName')?.updateValueAndValidity();
          });
      } else {
        // Restore validators if no district
        this.form.get('churchName')?.setValidators([Validators.required]);
        this.form.get('churchName')?.updateValueAndValidity();
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
    
    // Revoke object URLs
    if (this.photoPreviewUrl()) {
      URL.revokeObjectURL(this.photoPreviewUrl()!);
    }
    if (this.vicarLetterPreviewUrl()) {
      URL.revokeObjectURL(this.vicarLetterPreviewUrl()!);
    }

    this.photoFile.set(null);
    this.vicarLetterFile.set(null);
    this.photoPreviewUrl.set(null);
    this.vicarLetterPreviewUrl.set(null);
    this.photoError.set('');
    this.vicarLetterError.set('');
    this.selectedChurch.set(null);
    this.selectedDistrict.set('');
    this.availableChurches.set([]);
    this.formSubmitted.set(false);
    this.snackBar.open($localize`Local form data cleared.`, $localize`Close`, { duration: 3000 });
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
    this.sessionList(); // load sessionList()
    if (this.selectedSessionId()) {
      this.form.patchValue({ sessionId: this.selectedSessionId() });
    }
    window.addEventListener('beforeunload', this.beforeUnloadHandler);

    // Check for CAPTCHA bypass query parameter
    this.checkCaptchaBypass();
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
        return of([]); // fallback to empty array
      })
    );

  protected readonly sessionList = toSignal(this.sessions$, {
    initialValue: [],
  });

  onFileChange(event: Event, type: 'photo' | 'vicarLetter') {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0] || null;
    if (type === 'photo') {
      if (this.photoPreviewUrl()) {
        URL.revokeObjectURL(this.photoPreviewUrl()!);
        this.photoPreviewUrl.set(null);
      }

      if (file && !file.type.startsWith('image/')) {
        this.photoError.set('Only image files are allowed.');
        this.photoFile.set(null);
      } else if (file && file.size > 2 * 1024 * 1024) {
        this.photoError.set('File too large. Max size is 2MB.');
        this.photoFile.set(null);
      } else {
        this.photoFile.set(file);
        this.photoError.set('');
        if (file) {
          const url = URL.createObjectURL(file);
          this.photoPreviewUrl.set(url);
        }
      }
    }
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

    if (!this.photoFile()) {
      this.photoError.set('Passport-size photo is required.');
    }

    if (!this.vicarLetterFile()) {
      this.vicarLetterError.set('Vicar’s letter is required.');
    }

    if (this.form.invalid || this.photoError() || this.vicarLetterError()) {
      this.form.markAllAsTouched();
      this.focusFirstInvalidControl();
      return;
    }

    const raw = this.form.value;
    this.isSubmitting.set(true);

    const photo = this.photoFile()!;
    const letter = this.vicarLetterFile()!;

    const body = {
      firstName: raw.firstName,
      lastName: raw.lastName,
      fatherName: raw.fatherName,
      address: raw.address,
      sex: raw.sex,
      age: Number(raw.age),
      education: raw.education,
      occupation: raw.occupation,
      churchId:
        raw.churchMembership === 'not-member'
          ? null
          : this.selectedChurch()?.id || null,
      priestName:
        raw.churchMembership === 'not-member'
          ? null
          : this.selectedChurch()?.priestName || null,
      churchName:
        raw.churchMembership === 'not-member'
          ? raw.manualChurchName
          : raw.churchName,
      fianceName: raw.fianceName || undefined,
      dateOfMarriage: raw.dateOfMarriage
        ? this.toUtcIsoString(raw.dateOfMarriage)
        : undefined,
      phone: `${raw.countryCode}${raw.phone}`,
      email: raw.email,
      days: raw.days,
      choirMember: raw.churchActivities?.choirMember || false,
      ssTeacher: raw.churchActivities?.ssTeacher || false,
      youthFellowship: raw.churchActivities?.youthFellowship || false,
      other: raw.churchActivities?.other || undefined,
      declaration: raw.declaration,
      sessionId: Number(raw.sessionId),
      paymentStatus: false,
      // Use special bypass token when CAPTCHA bypass is enabled
      recaptchaToken: this.captchaBypassEnabled() ? 'CAPTCHA_BYPASS_AUTHORIZED' : raw.recaptcha,
    };

    this.api.apiPremaritalregisterPost({ body }).subscribe({
      next: (response: any) => {
        const registerId: string = JSON.parse(response).id;

        forkJoin([
          this.api.apiAzureuploadGenerateSasGet({
            fileName: `premarital/${registerId}/photo/${photo.name}`,
            contentType: photo.type,
          }),
          this.api.apiAzureuploadGenerateSasGet({
            fileName: `premarital/${registerId}/vicarletter/${letter.name}`,
            contentType: letter.type,
          }),
        ])
          .pipe(
            switchMap(([photoSasUrl, letterSasUrl]) =>
              forkJoin([
                this.fileUploadService.uploadFileToAzure(photo, photoSasUrl!),
                this.fileUploadService.uploadFileToAzure(letter, letterSasUrl!),
              ])
            )
          )
          .subscribe({
            next: ([photoUrl, letterUrl]) => {
              const fileBody = {
                registrationId: registerId,
                photoUrl,
                vicarLetterUrl: letterUrl,
              };

              this.api
                .apiPremaritalregisterFilesRegistrationIdPost({
                  registrationId: registerId,
                  body: fileBody,
                })
                .subscribe({
                  next: () => {
                    this.isSubmitting.set(false); // Hide loading overlay
                    this.successMessage.set(
                      'Registration submitted successfully!'
                    );
                    const dialogRef = this.dialog.open(Dialog, {
                      disableClose: true,
                      data: {
                        title: $localize`Premarital Registration Complete`,
                        messages: [
                          $localize`Your premarital registration is successfully completed.`,
                        ],
                        extraMessage: $localize`A confirmation email has been sent to your registered email address.`,
                      },
                    });
                    dialogRef.afterClosed().subscribe(() => {
                      this.clearLocalStorage(); // Clear saved form data after successful submission
                      this.form.reset();
                      window.history.back();
                    });
                  },
                  error: (err) => {
                    console.error(err);
                    // 🚨 Rollback step
                    this.api
                      .apiPremaritalregisterIdDelete({ id: registerId })
                      .subscribe({
                        next: () =>
                          console.warn(
                            `Rolled back registration ${registerId}`
                          ),
                        error: (rollbackErr) =>
                          console.error('Rollback failed', rollbackErr),
                      });

                    this.errorMessage.set(
                      'File upload failed. Please try again.'
                    );
                    this.showErrorModal.set(true);
                    this.isSubmitting.set(false);
                  },
                });
            },
            error: (err) => {
              console.error(err);

              // 🚨 Rollback step
              this.api
                .apiPremaritalregisterIdDelete({ id: registerId })
                .subscribe({
                  next: () =>
                    console.warn(`Rolled back registration ${registerId}`),
                  error: (rollbackErr) =>
                    console.error('Rollback failed', rollbackErr),
                });

              // Show error dialog
              this.dialog.open(Dialog, {
                disableClose: true,
                data: {
                  title: $localize`Registration Failed`,
                  messages: [
                    $localize`We couldn’t complete your registration.`,
                    $localize`Please try again after some time.`,
                  ],
                },
              });

              this.isSubmitting.set(false);
            },
          });
      },
      error: (err) => {
        console.error('Registration save failed:', err);
        this.errorMessage.set('Registration failed. Please try again.');
        this.showErrorModal.set(true);
        this.isSubmitting.set(false);
      },
    });
  }

  toUtcIsoString(dateInput: string | Date): string {
    const localDate = new Date(dateInput);
    return localDate.toISOString();
  }

  protected readonly timezoneDisplay: string = $localize`DD/MM/YYYY | Time Zone: IST (UTC+05:30)`;

  onDistrictChange(district: string): void {
    this.selectedDistrict.set(district);
    this.form.patchValue({ churchName: '' }); // Reset church selection
    this.selectedChurch.set(null); // Reset selected church

    if (district) {
      this.form.get('churchName')?.enable(); // Enable church name field
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
      this.form.get('churchName')?.disable(); // Disable church name field
      this.availableChurches.set([]);
    }
  }

  onChurchChange(churchName: string): void {
    const church = this.availableChurches().find((c) => c.name === churchName);
    this.selectedChurch.set(church || null);
  }

  private focusFirstInvalidControl(): void {
    try {
      const formElement = this.formEl?.nativeElement;
      if (!formElement) return;
      const firstInvalid: HTMLElement | null = formElement.querySelector(
        'input.ng-invalid, textarea.ng-invalid, select.ng-invalid, mat-select.ng-invalid'
      );
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

  startTutorial(): void {
    // Dynamically import Shepherd CSS
    if (!document.querySelector('link[href*="shepherd"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/shepherd.js@13.0.0/dist/css/shepherd.css';
      document.head.appendChild(link);
    }

    if (this.tour) {
      this.tour.complete();
    }

    this.tour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        cancelIcon: {
          enabled: true,
        },
        classes: 'shepherd-theme-custom',
        scrollTo: { behavior: 'smooth', block: 'center' },
      },
    });

    // Step 1: Welcome & Introduction
    this.tour.addStep({
      id: 'welcome',
      text: `
        <h3 class="text-lg font-bold mb-2">Welcome to the Premarital Registration Form</h3>
        <p class="mb-2">This guided tour will help you understand each section of the form.</p>
        <p class="text-sm text-amber-600 dark:text-amber-400">
          <strong>Important:</strong> Each individual (both partners) must complete their own separate registration.
        </p>
      `,
      buttons: [
        {
          text: 'Exit',
          classes: 'shepherd-button-secondary',
          action: () => this.tour?.complete(),
        },
        {
          text: 'Next',
          action: () => this.tour?.next(),
        },
      ],
    });

    // Step 2: Personal Information
    this.tour.addStep({
      id: 'personal-info',
      text: `
        <h3 class="text-lg font-bold mb-2">Personal Information</h3>
        <p>Enter your basic personal details:</p>
        <ul class="list-disc ml-4 mt-2 text-sm">
          <li><strong>First Name & Last Name:</strong> Your full legal name</li>
          <li><strong>Sex:</strong> Select Male or Female</li>
          <li><strong>Age:</strong> Your current age (1-120)</li>
          <li><strong>Father's Name:</strong> Your father's full name</li>
        </ul>
      `,
      attachTo: {
        element: '#personal-info-section',
        on: 'bottom',
      },
      buttons: [
        {
          text: 'Back',
          classes: 'shepherd-button-secondary',
          action: () => this.tour?.back(),
        },
        {
          text: 'Next',
          action: () => this.tour?.next(),
        },
      ],
    });

    // Step 3: Education & Professional Details
    this.tour.addStep({
      id: 'education-professional',
      text: `
        <h3 class="text-lg font-bold mb-2">Education & Professional Details</h3>
        <p class="mb-2">Provide information about your education and current occupation.</p>
        <ul class="list-disc ml-4 text-sm">
          <li><strong>Occupation:</strong> Your current job or profession</li>
          <li><strong>Education:</strong> Your highest educational qualification</li>
        </ul>
      `,
      attachTo: {
        element: '#education-professional-section',
        on: 'bottom',
      },
      buttons: [
        {
          text: 'Back',
          classes: 'shepherd-button-secondary',
          action: () => this.tour?.back(),
        },
        {
          text: 'Next',
          action: () => this.tour?.next(),
        },
      ],
    });

    // Step 4: Address
    this.tour.addStep({
      id: 'address',
      text: `
        <h3 class="text-lg font-bold mb-2">Address</h3>
        <p class="mb-2">Enter your complete residential address.</p>
        <p class="text-sm text-blue-600 dark:text-blue-400">
          <strong>Tip:</strong> You can use the microphone icon for voice input!
        </p>
      `,
      attachTo: {
        element: '#address-section',
        on: 'bottom',
      },
      buttons: [
        {
          text: 'Back',
          classes: 'shepherd-button-secondary',
          action: () => this.tour?.back(),
        },
        {
          text: 'Next',
          action: () => this.tour?.next(),
        },
      ],
    });

    // Step 5: Church Membership Selection
    this.tour.addStep({
      id: 'church-membership',
      text: `
        <h3 class="text-lg font-bold mb-2">Church Membership</h3>
        <p class="mb-2">Select your CSI MKD membership status:</p>
        <ul class="list-disc ml-4 text-sm">
          <li><strong>Member of CSI MKD:</strong> Select if you are a registered member. You'll need to choose your district and church.</li>
          <li><strong>Not a member:</strong> Select if you belong to another church. You'll enter your church name manually.</li>
        </ul>
        <p class="text-sm mt-2 text-gray-600 dark:text-gray-400">Different fields will appear based on your selection.</p>
      `,
      attachTo: {
        element: '#church-membership-section',
        on: 'bottom',
      },
      buttons: [
        {
          text: 'Back',
          classes: 'shepherd-button-secondary',
          action: () => this.tour?.back(),
        },
        {
          text: 'Next',
          action: () => this.tour?.next(),
        },
      ],
    });

    // Step 6: Church Details (conditional - for members)
    this.tour.addStep({
      id: 'church-member-details',
      text: `
        <h3 class="text-lg font-bold mb-2">Church Details (For Members)</h3>
        <p class="mb-2">If you selected "Member of CSI MKD":</p>
        <ul class="list-disc ml-4 text-sm">
          <li><strong>Clergy District:</strong> Select your district from the dropdown</li>
          <li><strong>Church Name:</strong> After selecting district, choose your specific church</li>
        </ul>
        <p class="text-sm mt-2 text-gray-600 dark:text-gray-400">The priest's name will be shown below if available.</p>
      `,
      attachTo: {
        element: '#church-member-details-section',
        on: 'bottom',
      },
      when: {
        show: () => {
          const element = document.querySelector('#church-member-details-section') as HTMLElement;
          if (!element || !element.offsetParent) {
            this.tour?.next();
          }
        },
      },
      buttons: [
        {
          text: 'Back',
          classes: 'shepherd-button-secondary',
          action: () => this.tour?.back(),
        },
        {
          text: 'Next',
          action: () => this.tour?.next(),
        },
      ],
    });

    // Step 7: Church Details (conditional - for non-members)
    this.tour.addStep({
      id: 'church-nonmember-details',
      text: `
        <h3 class="text-lg font-bold mb-2">Church Details (For Non-Members)</h3>
        <p class="mb-2">If you selected "Not member of CSI MKD":</p>
        <p class="text-sm">Enter the name of your church manually in the text field.</p>
      `,
      attachTo: {
        element: '#church-nonmember-details-section',
        on: 'bottom',
      },
      when: {
        show: () => {
          const element = document.querySelector('#church-nonmember-details-section') as HTMLElement;
          if (!element || !element.offsetParent) {
            this.tour?.next();
          }
        },
      },
      buttons: [
        {
          text: 'Back',
          classes: 'shepherd-button-secondary',
          action: () => this.tour?.back(),
        },
        {
          text: 'Next',
          action: () => this.tour?.next(),
        },
      ],
    });

    // Step 8: Church Activities
    this.tour.addStep({
      id: 'church-activities',
      text: `
        <h3 class="text-lg font-bold mb-2">Church Activities</h3>
        <p class="mb-2">Select the church activities you participate in:</p>
        <ul class="list-disc ml-4 text-sm">
          <li>Choir Member</li>
          <li>Sunday School Teacher</li>
          <li>Youth Fellowship</li>
          <li>Other activities (specify in the text field)</li>
        </ul>
      `,
      attachTo: {
        element: '#church-activities-section',
        on: 'bottom',
      },
      buttons: [
        {
          text: 'Back',
          classes: 'shepherd-button-secondary',
          action: () => this.tour?.back(),
        },
        {
          text: 'Next',
          action: () => this.tour?.next(),
        },
      ],
    });

    // Step 9: Partner & Marriage Information
    this.tour.addStep({
      id: 'partner-marriage',
      text: `
        <h3 class="text-lg font-bold mb-2">Partner & Marriage Information</h3>
        <p class="mb-2">Provide details about your upcoming marriage:</p>
        <ul class="list-disc ml-4 text-sm">
          <li><strong>Fiancé/Fiancée Name:</strong> Your partner's name</li>
          <li><strong>Date of Marriage:</strong> Click the calendar icon to select the date</li>
        </ul>
      `,
      attachTo: {
        element: '#partner-marriage-section',
        on: 'bottom',
      },
      buttons: [
        {
          text: 'Back',
          classes: 'shepherd-button-secondary',
          action: () => this.tour?.back(),
        },
        {
          text: 'Next',
          action: () => this.tour?.next(),
        },
      ],
    });

    // Step 10: Contact Information
    this.tour.addStep({
      id: 'contact-info',
      text: `
        <h3 class="text-lg font-bold mb-2">Contact Information</h3>
        <p class="mb-2">Provide your contact details for communication:</p>
        <ul class="list-disc ml-4 text-sm">
          <li><strong>Country Code:</strong> Select your country code</li>
          <li><strong>WhatsApp Number:</strong> Enter your 10-digit mobile number</li>
          <li><strong>Email:</strong> Enter a valid email address</li>
        </ul>
        <p class="text-sm mt-2 text-amber-600 dark:text-amber-400">
          Confirmation will be sent to this email.
        </p>
      `,
      attachTo: {
        element: '#contact-info-section',
        on: 'bottom',
      },
      buttons: [
        {
          text: 'Back',
          classes: 'shepherd-button-secondary',
          action: () => this.tour?.back(),
        },
        {
          text: 'Next',
          action: () => this.tour?.next(),
        },
      ],
    });

    // Step 11: Session Selection
    this.tour.addStep({
      id: 'session-selection',
      text: `
        <h3 class="text-lg font-bold mb-2">Session Selection</h3>
        <p class="mb-2">Choose your preferred counselling session:</p>
        <ul class="list-disc ml-4 text-sm">
          <li><strong>Number of Days:</strong> Select 1 day (with Bishop's permission) or 3 days</li>
          <li><strong>Session:</strong> Choose from available sessions with dates</li>
        </ul>
        <p class="text-sm mt-2 text-gray-600 dark:text-gray-400">All dates are displayed in IST (Indian Standard Time).</p>
      `,
      attachTo: {
        element: '#session-selection-section',
        on: 'bottom',
      },
      buttons: [
        {
          text: 'Back',
          classes: 'shepherd-button-secondary',
          action: () => this.tour?.back(),
        },
        {
          text: 'Next',
          action: () => this.tour?.next(),
        },
      ],
    });

    // Step 12: File Uploads
    this.tour.addStep({
      id: 'file-uploads',
      text: `
        <h3 class="text-lg font-bold mb-2">Required File Uploads</h3>
        <p class="mb-2">Upload the following required documents:</p>
        <ul class="list-disc ml-4 text-sm">
          <li><strong>Your Photo:</strong> Passport-size photo (JPG/PNG, max 2MB)</li>
          <li><strong>Witness of Vicar:</strong> Letter from your vicar confirming membership and counselling request (PDF/DOC/DOCX/JPG/PNG, max 2MB)</li>
        </ul>
        <p class="text-sm mt-2 text-red-600 dark:text-red-400">Both files are required to complete registration.</p>
      `,
      attachTo: {
        element: '#file-uploads-section',
        on: 'top',
      },
      buttons: [
        {
          text: 'Back',
          classes: 'shepherd-button-secondary',
          action: () => this.tour?.back(),
        },
        {
          text: 'Next',
          action: () => this.tour?.next(),
        },
      ],
    });

    // Step 13: Declarations & Consent
    this.tour.addStep({
      id: 'declarations-consent',
      text: `
        <h3 class="text-lg font-bold mb-2">Declarations & Consent</h3>
        <p class="mb-3">Complete these two required steps:</p>
        <div class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-3">
          <p class="text-sm font-semibold mb-2">Step 1: Declaration Checkbox</p>
          <p class="text-sm">Check the box below that says "I would like to attend the premarital counselling course"</p>
        </div>
        <div class="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
          <p class="text-sm font-semibold mb-2">Step 2: Read and Accept Informed Consent</p>
          <p class="text-sm mb-2"><strong>Click the blue underlined link</strong> that says "Read and Accept Informed Consent and Counselling Agreement"</p>
          <p class="text-sm mb-2">This will open a dialog box with the full agreement. Read it carefully, then:</p>
          <ul class="list-disc ml-4 text-sm">
            <li>Check the box at the bottom of the dialog</li>
            <li>Click the OK button</li>
          </ul>
        </div>
        <p class="text-sm mt-3 text-red-600 dark:text-red-400 font-bold">
          ⚠️ Both steps are required before you can submit the form
        </p>
      `,
      attachTo: {
        element: '#declarations-consent-section',
        on: 'top',
      },
      buttons: [
        {
          text: 'Back',
          classes: 'shepherd-button-secondary',
          action: () => this.tour?.back(),
        },
        {
          text: 'Next',
          action: () => this.tour?.next(),
        },
      ],
    });

    // Step 14: Security & Submit
    this.tour.addStep({
      id: 'security-submit',
      text: `
        <h3 class="text-lg font-bold mb-2">Security Verification & Submit</h3>
        <p class="mb-2">Final steps to complete your registration:</p>
        <ul class="list-disc ml-4 text-sm">
          <li><strong>reCAPTCHA:</strong> Check the "I'm not a robot" box to verify you're human</li>
          <li><strong>Register Button:</strong> Click to submit your completed form</li>
        </ul>
        <p class="text-sm mt-2 text-green-600 dark:text-green-400">
          After submission, you'll receive a confirmation email.
        </p>
      `,
      attachTo: {
        element: '#security-submit-section',
        on: 'top',
      },
      buttons: [
        {
          text: 'Back',
          classes: 'shepherd-button-secondary',
          action: () => this.tour?.back(),
        },
        {
          text: 'Next',
          action: () => this.tour?.next(),
        },
      ],
    });

    // Step 15: Completion
    this.tour.addStep({
      id: 'completion',
      text: `
        <h3 class="text-lg font-bold mb-2">🎉 Tour Complete!</h3>
        <p class="mb-2">You've completed the guided tour of the premarital registration form.</p>
        <p class="text-sm">You can now proceed to fill out the form. If you need to see the tour again, click the help icon (?) in the form header.</p>
        <p class="text-sm mt-2 text-gray-600 dark:text-gray-400">Good luck with your registration!</p>
      `,
      buttons: [
        {
          text: 'Back',
          classes: 'shepherd-button-secondary',
          action: () => this.tour?.back(),
        },
        {
          text: 'Finish',
          action: () => this.tour?.complete(),
        },
      ],
    });

    this.tour.start();
  }

  ngOnDestroy(): void {
    window.removeEventListener('beforeunload', this.beforeUnloadHandler);
    if (this.tour) {
      this.tour.complete();
    }
  }
}
