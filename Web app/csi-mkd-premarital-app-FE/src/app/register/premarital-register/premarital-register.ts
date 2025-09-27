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
import { Router } from '@angular/router';
import { NgxCaptchaModule } from 'ngx-captcha';
import { ThemeService } from '../../core/services/theme.service';
import { CsiMkdPremaritalAppBeService as ApiService } from '../../../api/api-main-app/services';
import {
  ChurchDataService,
  ChurchWithDetails,
} from '../../core/services/church-data.service';
import { SessionsFallbackService } from '../../core/services/sessions-fallback.service';
import { MatTooltipModule } from '@angular/material/tooltip';

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

  private readonly api = inject(ApiService);
  private readonly fileUploadService = inject(FileUploadService);
  private readonly themeService = inject(ThemeService);
  private readonly churchDataService = inject(ChurchDataService);
  private readonly sessionsFallbackService = inject(SessionsFallbackService);

  protected readonly form: FormGroup;
  protected readonly photoFile = signal<File | null>(null);
  protected readonly vicarLetterFile = signal<File | null>(null);
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

  constructor() {
    const navState = this.router.getCurrentNavigation()?.extras.state;
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
          Validators.maxLength(250),
          Validators.pattern(/^[a-zA-Z0-9\s,.-]*$/),
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

  hasPendingChanges = (): boolean => {
    return this.form.dirty;
  };

  ngOnInit() {
    this.sessionList(); // load sessionList()
    if (this.selectedSessionId()) {
      this.form.patchValue({ sessionId: this.selectedSessionId() });
    }
    window.addEventListener('beforeunload', this.beforeUnloadHandler);
  }

  ngOnDestroy(): void {
    window.removeEventListener('beforeunload', this.beforeUnloadHandler);
  }

  private beforeUnloadHandler = (event: BeforeUnloadEvent) => {
    if (this.hasPendingChanges()) {
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
      if (file && !file.type.startsWith('image/')) {
        this.photoError.set('Only image files are allowed.');
        this.photoFile.set(null);
      } else if (file && file.size > 2 * 1024 * 1024) {
        this.photoError.set('File too large. Max size is 2MB.');
        this.photoFile.set(null);
      } else {
        this.photoFile.set(file);
        this.photoError.set('');
      }
    }
    if (type === 'vicarLetter') {
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
      recaptchaToken: raw.recaptcha,
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
}
