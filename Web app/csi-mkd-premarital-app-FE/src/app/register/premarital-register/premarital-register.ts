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

import { PremaritalRegisterService } from '../../../api/services/premarital-register.service';
import { SessionConfigService } from '../../../api/services';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';
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
import { SuccessDialogComponent } from './success-dialog';
import { uniqueEmailValidator } from '../../core/validators/unique-email.validator';
import { emailDomainValidator } from '../../core/validators/email-domain.validator';
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
  ],
  templateUrl: './premarital-register.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PremaritalRegister {
  private readonly fb = inject(FormBuilder);
  readonly dialog = inject(MatDialog);

  private readonly premaritalRegisterService = inject(
    PremaritalRegisterService
  );
  private readonly sessionConfigService = inject(SessionConfigService);

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

  @ViewChild('photoInput') photoInput!: ElementRef<HTMLInputElement>;
  @ViewChild('letterInput') letterInput!: ElementRef<HTMLInputElement>;
  photoFileName: string | null = '';
  vicarLetterFileName: string | null = '';

  constructor() {
    this.form = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
      fatherName: ['', Validators.required],
      address: ['', Validators.required],
      sex: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(1), Validators.max(120)]],
      education: ['', Validators.required],
      occupation: ['', Validators.required],
      churchName: ['', Validators.required],
      fianceName: [''],
      dateOfMarriage: [''],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      email: [
        '',
        {
          validators: [
            Validators.required,
            Validators.email,
            emailDomainValidator(),
          ],
          asyncValidators: [uniqueEmailValidator()],
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
    });
  }

  private readonly sessions$ = this.sessionConfigService
    .apiSessionconfigGet$Json()
    .pipe(
      map((data: any) =>
        data.map((session: any) => ({
          ...session,
          startDate: session.startDate,
          endDate: session.endDate,
        }))
      ),
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
      this.photoFileName = file && file.name;

      if (file && !file.type.startsWith('image/')) {
        this.photoError.set('Only image files are allowed.');
        this.photoFile.set(null);
      } else if (file && file.size > 5 * 1024 * 1024) {
        this.photoError.set('File too large. Max size is 5MB.');
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
        'image/jpeg',
        'image/png',
      ];
      this.vicarLetterFileName = file && file.name;

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
      return;
    }

    const raw = this.form.value;

    const body = {
      Name: raw.name,
      FatherName: raw.fatherName,
      Address: raw.address,
      Sex: raw.sex,
      Age: Number(raw.age),
      Education: raw.education,
      Occupation: raw.occupation,
      ChurchName: raw.churchName,
      FianceName: raw.fianceName || undefined,
      DateOfMarriage: raw.dateOfMarriage
        ? this.toUtcIsoString(raw.dateOfMarriage)
        : undefined,
      Phone: raw.phone,
      Email: raw.email,
      Days: raw.days,
      ChoirMember: raw.churchActivities?.choirMember || false,
      SsTeacher: raw.churchActivities?.ssTeacher || false,
      YouthFellowship: raw.churchActivities?.youthFellowship || false,
      Other: raw.churchActivities?.other || undefined,
      Declaration: raw.declaration,
      Photo: this.photoFile() as Blob,
      VicarLetter: this.vicarLetterFile() as Blob,
      SessionId: Number(raw.sessionId),
      PaymentStatus: false, // if you want to set it; optional field
    };

    this.isSubmitting.set(true);

    this.premaritalRegisterService
      .apiPremaritalRegisterPost({ body })
      .subscribe({
        next: () => {
          this.successMessage.set('Registration submitted successfully!');
          this.showSuccessModal.set(true);
          this.dialog.open(SuccessDialogComponent, {
            width: '400px',
            disableClose: true,
          });

          this.resetForm();
        },
        error: (err) => {
          console.error(err);
          this.errorMessage.set('Submission failed. Please try again.');
          this.showErrorModal.set(true);
          this.isSubmitting.set(false);
        },
      });
  }

  toUtcIsoString(dateInput: string | Date): string {
    const localDate = new Date(dateInput);
    return localDate.toISOString();
  }
}
