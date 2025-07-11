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

import { RegisterService } from '../../../api/services';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';

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
  ],
  templateUrl: './general-register.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeneralRegister {
  private readonly fb = inject(FormBuilder);
  private readonly registerService = inject(RegisterService);

  protected readonly form: FormGroup;
  protected readonly photoFile = signal<File | null>(null);
  protected readonly successMessage = signal('');
  protected readonly errorMessage = signal('');
  protected readonly isSubmitting = signal(false);
  protected readonly formSubmitted = signal(false);
  protected readonly photoError = signal('');

  @ViewChild('photoInput') photoInput!: ElementRef<HTMLInputElement>;

  constructor() {
    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(3)]],
      lastName: ['', [Validators.required, Validators.minLength(3)]],
      fatherName: ['', Validators.required],
      address: ['', Validators.required],
      sex: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(1), Validators.max(120)]],
      education: ['', Validators.required],
      occupation: ['', Validators.required],
      churchName: [''],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      email: ['', [Validators.required, Validators.email]],
      maritalStatus: ['', Validators.required],
      sessionType: ['', Validators.required],
      declaration: [false, Validators.requiredTrue],
      photoFile: [null, Validators.required],
    });
  }

  isInvalid(name: string): boolean {
    const control = this.form.get(name);
    return !!(control && control.invalid && this.formSubmitted());
  }

  onFileChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0] || null;
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
      Photo: this.photoFile() as Blob,
    };

    this.isSubmitting.set(true);

    this.registerService.apiRegisterPost({ body }).subscribe({
      next: () => {
        this.successMessage.set('Registration submitted successfully!');
        this.resetForm();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage.set('Submission failed. Please try again.');
        this.isSubmitting.set(false);
      },
    });
  }
}
