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
import { CsiMkdPremaritalAppBeService } from '../../../api/services';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { switchMap } from 'rxjs';
import { FileUploadService } from '../../core/services/file-upload.service';
import { SuccessDialogComponent } from '../success-dialog';
import { NoDigitsDirective } from '../../shared/directives/no-digits.directive';
import { OnlyDigitsDirective } from '../../shared/directives/only-digits.directive';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { emailDomainValidator } from '../../core/validators/email-domain.validator';
import { emailExistsValidatorFactory } from '../../core/validators/unique-email.validator';

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

  protected readonly form: FormGroup;
  protected readonly photoFile = signal<File | null>(null);
  protected readonly successMessage = signal('');
  protected readonly errorMessage = signal('');
  protected readonly isSubmitting = signal(false);
  protected readonly formSubmitted = signal(false);
  protected readonly photoError = signal('');

  protected siteKey: string = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'; // Test site key
  // protected siteKey: string = '6LeODJ0rAAAAAM09ftjENEAG5A9CkDQiL1wa3199';
  protected recaptchaTheme = computed(() => this.themeService.isDark() ? 'dark' : 'light');

  // siteKey = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'; // Example site key, replace with your actual key
  @ViewChild('photoInput') photoInput!: ElementRef<HTMLInputElement>;
  @ViewChild('formEl') formEl!: ElementRef<HTMLFormElement>;
  photoFileName: string | null = '';
  showErrorModal = signal(false);

  constructor() {
    this.form = this.fb.group({
      firstName: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
          Validators.pattern(/^[a-zA-Z\s]*$/),
        ],
      ],
      lastName: [
        '',
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(50),
          Validators.pattern(/^[a-zA-Z\s]*$/),
        ],
      ],
      fatherName: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
          Validators.pattern(/^[a-zA-Z\s]*$/),
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
          Validators.pattern(/^[a-zA-Z\s]*$/),
        ],
      ],
      occupation: [
        '',
        [
          Validators.required,
          Validators.maxLength(100),
          Validators.pattern(/^[a-zA-Z\s]*$/),
        ],
      ],
      churchName: [
        '',
        [
          Validators.required,
          Validators.maxLength(100),
          Validators.pattern(/^[a-zA-Z0-9\s]*$/),
        ],
      ],
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
              this.api.apiGeneralregisterCheckEmailGet({
                email,
              })
            ),
          ],
          updateOn: 'blur',
        },
      ],
      maritalStatus: ['', Validators.required],
      sessionType: ['', Validators.required],
      declaration: [false, Validators.requiredTrue],
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
    return !!(control && control.invalid && this.formSubmitted());
  }

  onFileChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0] || null;
    this.photoFileName = file && file.name;

    if (file && !file.type.startsWith('image/')) {
      this.photoError.set('Only image files are allowed.');
      this.photoFile.set(null);
    } else {
      this.photoFile.set(file);
      this.photoError.set('');
    }
  }

  private resetForm(): void {
    this.form.reset();
    this.form.markAsUntouched();
    this.formSubmitted.set(false);
    this.isSubmitting.set(false);
    this.photoFile.set(null);
    this.photoFileName = '';

    this.photoError.set('');
    if (this.photoInput) {
      this.photoInput.nativeElement.value = '';
    }
  }

  handleSuccess(token: string) {
    this.form.get('recaptcha')?.setValue(token);
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
      churchName: raw.churchName || undefined,
      phone: `${raw.countryCode}${raw.phone}`,
      email: raw.email,
      maritalStatus: raw.maritalStatus,
      sessionType: raw.sessionType,
      declaration: raw.declaration,
      recaptchaToken: raw.recaptcha,
    };

    this.api.apiGeneralregisterPost$FormData({ body }).subscribe({
      next: (response: any) => {
        const registerId: number = JSON.parse(response).id;

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
                .apiGeneralregisterSavePhotoUrlPost$FormData({ body: saveBody })
                .subscribe({
                  next: () => {
                    this.successMessage.set(
                      'Registration submitted successfully!'
                    );
                    this.dialog.open(SuccessDialogComponent, {
                      width: '400px',
                      disableClose: true,
                      data: {
                        message: 'Registration successful!',
                        registerType: 'general',
                      },
                    });
                    this.resetForm();
                    this.isSubmitting.set(false);
                  },
                  error: (err) => this.handleUploadError(err),
                });
            },
            error: (err) => this.handleUploadError(err),
          });
      },
      error: (err) => {
        this.errorMessage.set('Registration failed. Please try again.');
        this.showErrorModal.set(true);
        this.isSubmitting.set(false);
      },
    });
  }

  private handleUploadError(err: any) {
    console.error('Upload error:', err);
    this.errorMessage.set('Photo upload failed. Please try again.');
    this.showErrorModal.set(true);
    this.isSubmitting.set(false);
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
