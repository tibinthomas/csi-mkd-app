import {
  Component,
  inject,
  signal,
  computed,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CsiMkdPremaritalAppBeService } from '../../../api/api-main-app/services';
import { NoDigitsDirective } from '../../shared/directives/no-digits.directive';
import { OnlyDigitsDirective } from '../../shared/directives/only-digits.directive';
import { FileUploadService } from '../../core/services/file-upload.service';
import { SuccessDialog } from '../../shared/success-dialog/success-dialog';
import { switchMap } from 'rxjs';
import { NgxCaptchaModule } from 'ngx-captcha';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-pre-confirm-register',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatCardModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatDialogModule,
    MatCheckboxModule,
    NgxCaptchaModule,
    NoDigitsDirective,
    OnlyDigitsDirective,
  ],
  templateUrl: './pre-confirm-register.html',
  styleUrl: './pre-confirm-register.scss',
})
export class PreConfirmRegister {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(CsiMkdPremaritalAppBeService);
  private readonly fileUploadService = inject(FileUploadService);
  readonly dialog = inject(MatDialog);
  private readonly themeService = inject(ThemeService);
  @ViewChild('formEl') formEl!: ElementRef<HTMLFormElement>;

  protected readonly form: FormGroup;
  protected readonly formSubmitted = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly minDate = new Date().toISOString().split('T')[0];
  protected readonly vicarLetterFile = signal<File | null>(null);
  protected readonly vicarLetterError = signal<string>('');

  // protected siteKey: string = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'; // Test site key
  protected siteKey: string = '6LeODJ0rAAAAAM09ftjENEAG5A9CkDQiL1wa3199';
  protected recaptchaTheme = computed(() =>
    this.themeService.isDark() ? 'dark' : 'light'
  );

  constructor() {
    this.form = this.fb.group({
      churchName: [
        '',
        [
          Validators.required,
          Validators.maxLength(100),
          Validators.pattern(/^[a-zA-Z0-9\s]*$/),
        ],
      ],
      confirmationDate: ['', Validators.required],
      counsellingDate: ['', Validators.required],
      participants: this.fb.array([
        this.fb.group({
          name: [
            '',
            [
              Validators.required,
              Validators.maxLength(100),
              Validators.pattern(/^[a-zA-Z\s]*$/),
            ],
          ],
          age: [
            '',
            [Validators.required, Validators.min(1), Validators.max(120)],
          ],
        }),
      ]),
      consent: [false, Validators.requiredTrue],
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

  protected readonly timezoneDisplay: string = 'Format: DD/MM/YYYY | Time Zone: IST (UTC+05:30)';

  isInvalid(name: string): boolean {
    const control = this.form.get(name);
    return !!(control && control.invalid && this.formSubmitted());
  }

  handleSuccess(response: string): void {
    this.form.get('recaptcha')?.setValue(response);
  }

  onSubmit(): void {
    this.formSubmitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.focusFirstInvalidControl();
      return;
    }
    this.isSubmitting.set(true);
    const raw = this.form.value;

    const body = {
      churchName: raw.churchName,
      confirmationDate: new Date(raw.confirmationDate).toISOString(),
      counsellingDate: new Date(raw.counsellingDate).toISOString(),
      participants: raw.participants.map((p: any) => ({
        name: p.name,
        age: p.age,
      })),
      consent: raw.consent,
      recaptchaToken: raw.recaptcha,
    };
    // Handle form submission logic here

    const file = this.vicarLetterFile()!;

    this.api.apiConfirmationregisterPost({ body }).subscribe({
      next: (response: any) => {
        const registerId = JSON.parse(response).Id;
        this.api
          .apiAzureuploadGenerateSasGet({
            fileName: `confirmation/${registerId}/witnessofvicar/${file.name}`,
            contentType: file.type,
          })
          .pipe(
            switchMap((fileSasUrl) =>
              this.fileUploadService.uploadFileToAzure(file, fileSasUrl!)
            )
          )
          .subscribe({
            next: (fileSasUrl) => {
              this.api
                .apiConfirmationregisterSaveFileUrlPost({
                  body: {
                    registrationId: registerId,
                    vicarLetterUrl: fileSasUrl,
                  },
                })
                .subscribe({
                  next: () => {
                    const dialogRef = this.dialog.open(SuccessDialog, {
                      data: {
                        title: 'Pre-Confirmation Registration Complete',
                        messages: [
                          'Your pre-confirmation registration is successfully completed.',
                        ],
                      },
                    });
                    dialogRef.afterClosed().subscribe(() => {
                      // Navigate back to previous page
                      window.history.back();
                    });
                  },
                  error: (error: any) => {
                    console.error('Error saving file URL:', error);
                    this.isSubmitting.set(false);
                    this.vicarLetterError.set('File upload failed.');
                  },
                });
            },
            error: (error: any) => {
              console.error('Error uploading file:', error);
              this.isSubmitting.set(false);
              this.vicarLetterError.set('File upload failed.');
            },
          });
      },
      error: (error: any) => {
        console.error('Error submitting form:', error);
        this.isSubmitting.set(false);
        // Handle error appropriately, e.g., show a message to the user
      },
    });
  }
  participants(): FormArray {
    return this.form.get('participants') as FormArray;
  }

  addParticipant(): void {
    this.participants().push(
      this.fb.group({
        name: [
          '',
          [
            Validators.required,
            Validators.maxLength(100),
            Validators.pattern(/^[a-zA-Z\s]*$/),
          ],
        ],
        age: [
          '',
          [Validators.required, Validators.min(1), Validators.max(120)],
        ],
      })
    );
  }

  isParticipantInvalid(index: number, controlName: string): boolean {
    const control = (this.participants().at(index) as FormGroup).get(
      controlName
    );
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onFileChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0] || null;

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

  removeParticipant(index: number): void {
    this.participants().removeAt(index);
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
