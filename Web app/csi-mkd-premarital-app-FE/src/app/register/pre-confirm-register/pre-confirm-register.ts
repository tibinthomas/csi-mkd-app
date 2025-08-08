import { Component, inject, signal } from '@angular/core';
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
import {
  AzureUploadService,
  ConfirmationRegisterService,
} from '../../../api/services';
import { FileUploadService } from '../../core/services/file-upload.service';
import { SuccessDialogComponent } from '../success-dialog';
import { switchMap } from 'rxjs';
import { NgxCaptchaModule } from 'ngx-captcha';

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
  ],
  templateUrl: './pre-confirm-register.html',
  styleUrl: './pre-confirm-register.scss',
})
export class PreConfirmRegister {
  private readonly fb = inject(FormBuilder);
  private readonly confirmationRegisterService = inject(
    ConfirmationRegisterService
  );
  private readonly azureUploadService = inject(AzureUploadService);
  private readonly fileUploadService = inject(FileUploadService);
  readonly dialog = inject(MatDialog);

  protected readonly form: FormGroup;
  protected readonly formSubmitted = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly minDate = new Date().toISOString().split('T')[0];
  protected readonly vicarLetterFile = signal<File | null>(null);
  protected readonly vicarLetterError = signal<string>('');

  // protected siteKey: string = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'; // Test site key
  protected siteKey: string = '6LeODJ0rAAAAAM09ftjENEAG5A9CkDQiL1wa3199';

  constructor() {
    this.form = this.fb.group({
      churchName: ['', [Validators.required, Validators.maxLength(100)]],
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
      return;
    }
    this.isSubmitting.set(true);
    const raw = this.form.value;

    const body = {
      ChurchName: raw.churchName,
      ConfirmationDate: new Date(raw.confirmationDate).toISOString(),
      CounsellingDate: new Date(raw.counsellingDate).toISOString(),
      Participants: raw.participants.map((p: any) => ({
        Name: p.name,
        Age: p.age,
      })),
      Consent: raw.consent,
      RecaptchaToken: raw.recaptcha,
    };
    // Handle form submission logic here

    const file = this.vicarLetterFile()!;

    this.confirmationRegisterService
      .apiConfirmationRegisterPost({ body }) // Adjust type as needed
      .subscribe({
        next: (response: any) => {
          const registerId = JSON.parse(response).Id;
          this.azureUploadService
            .apiAzureUploadGenerateSasGet({
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
                this.confirmationRegisterService
                  .apiConfirmationRegisterSaveFileUrlPost({
                    body: {
                      RegistrationId: registerId,
                      VicarLetterUrl: fileSasUrl,
                    },
                  })
                  .subscribe({
                    next: () => {
                      this.isSubmitting.set(false);
                      this.dialog.open(SuccessDialogComponent, {
                        data: {
                          message: 'Pre-confirmation Registration successful!',
                          registerType: 'pre-confirmation',
                        },
                      });
                      this.resetForm();
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

  private resetForm(): void {
    this.formSubmitted.set(false);
    this.isSubmitting.set(false);
    this.form.markAsUntouched();
    this.form.markAsPristine();
    this.form.updateValueAndValidity();
    this.form.reset();
    this.vicarLetterFile.set(null);
    this.vicarLetterError.set('');
    this.participants().clear();
    this.participants().push(
      this.fb.group({
        name: ['', Validators.required],
        age: [
          '',
          [Validators.required, Validators.min(1), Validators.max(120)],
        ],
      })
    );
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
      'image/jpeg',
      'image/png',
    ];

    if (file && !allowedTypes.includes(file.type)) {
      this.vicarLetterError.set('Allowed types: PDF, DOC, JPG, PNG');
      this.vicarLetterFile.set(null);
    } else if (file && file.size > 5 * 1024 * 1024) {
      this.vicarLetterError.set('File too large. Max size is 5MB.');
      this.vicarLetterFile.set(null);
    } else {
      this.vicarLetterFile.set(file);
      this.vicarLetterError.set('');
    }
  }

  removeParticipant(index: number): void {
    this.participants().removeAt(index);
  }
}
