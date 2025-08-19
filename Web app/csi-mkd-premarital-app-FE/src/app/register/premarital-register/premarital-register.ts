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
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { SuccessDialog } from '../../shared/success-dialog/success-dialog';
import { emailExistsValidatorFactory } from '../../core/validators/unique-email.validator';
import { emailDomainValidator } from '../../core/validators/email-domain.validator';
import { FileUploadService } from '../../core/services/file-upload.service';
import { NoDigitsDirective } from '../../shared/directives/no-digits.directive';
import { OnlyDigitsDirective } from '../../shared/directives/only-digits.directive';
import { SpeechRecognitionDirective } from '../../shared/directives/speech-recognition.directive';
import { Router } from '@angular/router';
import { NgxCaptchaModule } from 'ngx-captcha';
import { ThemeService } from '../../core/services/theme.service';
import { CsiMkdPremaritalAppBeService as ApiService } from '../../../api/api-main-app/services';

@Component({
  selector: 'app-premarital-register',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
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

  protected readonly form: FormGroup;
  protected readonly photoFile = signal<File | null>(null);
  protected readonly vicarLetterFile = signal<File | null>(null);
  protected readonly successMessage = signal('');
  protected readonly errorMessage = signal('');
  protected readonly isSubmitting = signal(false);
  protected readonly formSubmitted = signal(false);
  protected readonly photoError = signal('');
  protected readonly vicarLetterError = signal('');
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
      fianceName: [
        '',
        [Validators.maxLength(100), Validators.pattern(/^[a-zA-Z\s]*$/)],
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
      sessionId: ['', Validators.required],
      recaptcha: ['', Validators.required],
    });
  }

  hasPendingChanges = (): boolean => {
    return this.form.dirty && !this.isSubmitting();
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

  private readonly sessions$ = this.api.apiSessionconfigGet().pipe(
    map((data: any) => {
      return data.map((session: any) => ({
        ...session,
        startDate: session.startDate,
        endDate: session.endDate,
      }));
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

  private resetForm(): void {
    this.form.reset();
    this.form.markAsUntouched();
    this.formSubmitted.set(false);
    this.isSubmitting.set(false);

    this.photoFile.set(null);
    this.vicarLetterFile.set(null);
    this.photoError.set('');
    this.vicarLetterError.set('');
    this.successMessage.set('');
    this.errorMessage.set('');

    // Clear file input DOM elements
    if (this.photoInput) {
      this.photoInput.nativeElement.value = '';
    }
    if (this.letterInput) {
      this.letterInput.nativeElement.value = '';
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
      churchName: raw.churchName,
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
            next: ([photoSasUrl, letterSasUrl]) => {
              const body = {
                registrationId: registerId,
                photoUrl: photoSasUrl,
                vicarLetterUrl: letterSasUrl,
              };
              this.api
                .apiPremaritalregisterSaveFileUrlsPost({ body })
                .subscribe({
                  next: () => {
                    this.successMessage.set(
                      'Registration submitted successfully!'
                    );
                    const dialogRef = this.dialog.open(SuccessDialog, {
                      // width: '400px',
                      disableClose: true,
                      data: {
                        title: 'Premarital Registration Complete',
                        messages: [
                          'Your premarital registration is successfully completed.',
                        ],
                        extraMessage:
                          'A confirmation email has been sent to your registered email address.',
                      },
                    });
                    dialogRef.afterClosed().subscribe(() => {
                      // Navigate back to previous page
                      window.history.back();
                    });
                  },
                  error: (err) => {
                    console.error(err);
                    this.errorMessage.set(
                      'File Upload failed. Please try again.'
                    );
                    this.showErrorModal.set(true);
                    this.isSubmitting.set(false);
                  },
                });
            },
          });
      },
    });
  }

  toUtcIsoString(dateInput: string | Date): string {
    const localDate = new Date(dateInput);
    return localDate.toISOString();
  }

  protected readonly timezoneDisplay: string = 'Time Zone: IST (UTC+05:30)';

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
