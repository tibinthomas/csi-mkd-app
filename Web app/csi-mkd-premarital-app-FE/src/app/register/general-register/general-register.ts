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
import { NgxCaptchaModule } from 'ngx-captcha';
import { ThemeService } from '../../core/services/theme.service';
import { CsiMkdPremaritalAppBeService } from '../../../api/api-main-app/services';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { switchMap } from 'rxjs';
import { FileUploadService } from '../../core/services/file-upload.service';
import { Dialog } from '../../shared/dialog-popup/dialog-popup';
import { NoDigitsDirective } from '../../shared/directives/no-digits.directive';
import { OnlyDigitsDirective } from '../../shared/directives/only-digits.directive';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { SpeechRecognitionDirective } from '../../shared/directives/speech-recognition.directive';
import { emailDomainValidator } from '../../core/validators/email-domain.validator';
import { emailExistsValidatorFactory } from '../../core/validators/unique-email.validator';
import { CounselingConsentComponent } from '../../shared/counseling-consent/counseling-consent';
import {
  ChurchDataService,
  ChurchWithDetails,
} from '../../core/services/church-data.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-general-register',

  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    NgxCaptchaModule,
    NoDigitsDirective,
    OnlyDigitsDirective,
    SpeechRecognitionDirective,
    CounselingConsentComponent,
  ],
  hostDirectives: [],
  templateUrl: './general-register.html',
  styleUrl: './general-register.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeneralRegister {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(CsiMkdPremaritalAppBeService);
  private readonly fileUploadService = inject(FileUploadService);
  readonly dialog = inject(MatDialog);
  private readonly themeService = inject(ThemeService);
  private readonly churchDataService = inject(ChurchDataService);

  protected readonly form: FormGroup;
  protected readonly photoFile = signal<File | null>(null);
  protected readonly successMessage = signal('');
  protected readonly errorMessage = signal('');
  protected readonly isSubmitting = signal(false);
  protected readonly formSubmitted = signal(false);
  protected readonly photoError = signal('');
  protected readonly counselingConsentTouched = signal(false);

  // protected siteKey: string = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'; // Test site key
  protected siteKey: string = '6LeODJ0rAAAAAM09ftjENEAG5A9CkDQiL1wa3199';
  protected recaptchaTheme = computed(() =>
    this.themeService.isDark() ? 'dark' : 'light'
  );

  // siteKey = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'; // Example site key, replace with your actual key
  @ViewChild('photoInput') photoInput!: ElementRef<HTMLInputElement>;
  @ViewChild('formEl') formEl!: ElementRef<HTMLFormElement>;
  photoFileName: string | null = '';

  // Church data signals
  protected readonly selectedDistrict = signal<string>('');
  protected readonly availableChurches = signal<ChurchWithDetails[]>([]);
  protected readonly allLocations = toSignal(
    this.churchDataService.getAllLocations(),
    { initialValue: [] }
  );
  protected readonly selectedChurch = signal<ChurchWithDetails | null>(null);

  constructor() {
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
      churchDistrict: ['', Validators.required],
      churchName: [{ value: '', disabled: true }, Validators.required],
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
          // asyncValidators: [
          //   emailExistsValidatorFactory((email) =>
          //     this.api.apiGeneralregisterCheckEmailGet({
          //       email,
          //     })
          //   ),
          // ],
          // updateOn: 'blur',
        },
      ],
      maritalStatus: ['', Validators.required],
      sessionType: ['', Validators.required],
      declaration: [false, Validators.requiredTrue],
      counselingConsent: [false, Validators.requiredTrue],
      recaptcha: ['', Validators.required],
    });
  }

  hasPendingChanges = (): boolean => {
    return this.form.dirty && !this.isSubmitting();
  };

  ngOnInit(): void {
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

  isInvalid(name: string): boolean {
    const control = this.form.get(name);
    if (name === 'counselingConsent') {
      return !!(control && control.invalid && this.formSubmitted());
    }
    return !!(control && control.invalid && this.formSubmitted());
  }

  onFileChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0] || null;
    this.photoFileName = file && file.name;

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

  handleSuccess(token: string) {
    this.form.get('recaptcha')?.setValue(token);
  }

  onCounselingConsentChange(agreed: boolean): void {
    this.counselingConsentTouched.set(true);
    this.form.get('counselingConsent')?.setValue(agreed);
  }
  onSubmit() {
    this.formSubmitted.set(true);

    if (!this.photoFile()) {
      this.photoError.set('Passport-size photo is required.');
    }

    if (this.form.invalid || this.photoError()) {
      this.form.markAllAsTouched();
      this.focusFirstInvalidControl();
      return;
    }

    this.isSubmitting.set(true);

    const raw = this.form.value;
    const photo = this.photoFile()!;

    const body = {
      firstName: raw.firstName,
      lastName: raw.lastName,
      fatherName: raw.fatherName,
      address: raw.address,
      sex: raw.sex,
      age: Number(raw.age),
      education: raw.education,
      occupation: raw.occupation,
      churchId: this.selectedChurch()?.id || null,
      priestName: this.selectedChurch()?.priestName || null,
      phone: `${raw.countryCode}${raw.phone}`,
      email: raw.email,
      maritalStatus: raw.maritalStatus,
      sessionType: raw.sessionType,
      declaration: raw.declaration,
      recaptchaToken: raw.recaptcha,
    };

    this.api.apiGeneralregisterPost({ body }).subscribe({
      next: (response: any) => {
        const registerId: string = JSON.parse(response).id;

        this.api
          .apiAzureuploadGenerateSasGet({
            fileName: `general/${registerId}/photo/${photo.name}`,
            contentType: photo.type,
          })
          .pipe(
            switchMap((photoSasUrl) =>
              this.fileUploadService.uploadFileToAzure(photo, photoSasUrl!)
            )
          )
          .subscribe({
            next: (photoSasUrl) => {
              const saveBody = {
                registrationId: registerId,
                photoUrl: photoSasUrl,
              };

              this.api
                .apiGeneralregisterSavePhotoUrlPost({ body: saveBody })
                .subscribe({
                  next: () => {
                    this.successMessage.set(
                      'Registration submitted successfully!'
                    );
                    const dialogRef = this.dialog.open(Dialog, {
                      disableClose: true,
                      data: {
                        title: $localize`Registration Complete`,
                        messages: [
                          $localize`Your registration is successfully completed.`,
                        ],
                        extraMessage: $localize`A confirmation email has been sent to your registered email address.`,
                      },
                    });
                    dialogRef.afterClosed().subscribe(() => {
                      // Navigate back to previous page
                      window.history.back();
                    });
                  },
                  error: (err) => this.handleUploadError(err, registerId),
                });
            },
            error: (err) => this.handleUploadError(err, registerId),
          });
      },
      error: (err) => {
        this.errorMessage.set('Registration failed. Please try again.');
        this.dialog.open(Dialog, {
          data: {
            title: 'Registration Failed',
            messages: ['Something went wrong. Please try again later.'],
          },
        });
        this.isSubmitting.set(false);
      },
    });
  }

  private handleUploadError(err: any, registerId: string) {
    console.error('Upload error:', err);
    this.errorMessage.set('Photo upload failed. Please try again.');

    // Rollback the registration
    this.api.apiGeneralregisterIdDelete({ id: registerId }).subscribe({
      next: () => console.log('Registration rolled back successfully.'),
      error: (deleteErr) =>
        console.error('Failed to roll back registration:', deleteErr),
    });

    this.dialog.open(Dialog, {
      data: {
        title: 'Upload Failed',
        messages: [
          'There was an error uploading your photo. The registration has been cancelled. Please try again later.',
        ],
      },
    });
    this.isSubmitting.set(false);
  }

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
