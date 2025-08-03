import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { GeneralRegisterService } from '../../../api/services';
import { AzureUploadService } from '../../../api/services';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { switchMap } from 'rxjs';
import { FileUploadService } from '../../core/services/file-upload.service';
import { SuccessDialogComponent } from '../success-dialog';
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
  ],
  templateUrl: './general-register.html',
  styleUrl: './general-register.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeneralRegister {
  private readonly fb = inject(FormBuilder);
  private readonly generalRegisterService = inject(GeneralRegisterService);
  private readonly azureUploadService = inject(AzureUploadService);
  private readonly fileUploadService = inject(FileUploadService);
  readonly dialog = inject(MatDialog);

  protected readonly form: FormGroup;
  protected readonly photoFile = signal<File | null>(null);
  protected readonly successMessage = signal('');
  protected readonly errorMessage = signal('');
  protected readonly isSubmitting = signal(false);
  protected readonly formSubmitted = signal(false);
  protected readonly photoError = signal('');

  @ViewChild('photoInput') photoInput!: ElementRef<HTMLInputElement>;
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
      address: ['', [Validators.required, Validators.maxLength(250)]],
      sex: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(1), Validators.max(120)]],
      education: ['', [Validators.required, Validators.maxLength(100)]],
      occupation: ['', [Validators.required, Validators.maxLength(100)]],
      churchName: ['', [Validators.required, Validators.maxLength(100)]],
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
              this.generalRegisterService.apiGeneralRegisterCheckEmailGet({
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
    });
  }

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

  onSubmit() {
    this.formSubmitted.set(true);

    if (!this.photoFile()) {
      this.photoError.set('Passport-size photo is required.');
    }

    if (this.form.invalid || this.photoError()) {
      this.form.markAllAsTouched();
      return;
    }

    const photo = this.photoFile()!;

    const raw = this.form.value;

    const body = {
      FirstName: raw.firstName,
      LastName: raw.lastName,
      FatherName: raw.fatherName,
      Address: raw.address,
      Sex: raw.sex,
      Age: Number(raw.age),
      Education: raw.education,
      Occupation: raw.occupation,
      ChurchName: raw.churchName || undefined,
      Phone: raw.phone,
      Email: raw.email,
      MaritalStatus: raw.maritalStatus,
      SessionType: raw.sessionType,
      Declaration: raw.declaration,
    };

    this.isSubmitting.set(true);

    this.generalRegisterService.apiGeneralRegisterPost({ body }).subscribe({
      next: (response: any) => {
        const registerId: number = JSON.parse(response).id;
        this.azureUploadService
          .apiAzureUploadGenerateSasGet({
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
              const body = {
                RegistrationId: registerId,
                PhotoUrl: photoSasUrl,
              };
              this.generalRegisterService
                .apiGeneralRegisterSavePhotoUrlPost({ body })
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
}
