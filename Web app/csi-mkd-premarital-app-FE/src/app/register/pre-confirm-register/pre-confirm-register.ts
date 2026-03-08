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
import { MatAutocompleteModule } from '@angular/material/autocomplete';
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
import { Dialog } from '../../shared/dialog-popup/dialog-popup';
import { switchMap } from 'rxjs';
import { NgxCaptchaModule } from 'ngx-captcha';
import { ThemeService } from '../../core/services/theme.service';
import {
  ChurchDataService,
  ChurchWithDetails,
  Priest,
} from '../../core/services/church-data.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-pre-confirm-register',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatCardModule,
    MatSelectModule,
    MatAutocompleteModule,
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
  private readonly churchDataService = inject(ChurchDataService);
  @ViewChild('formEl') formEl!: ElementRef<HTMLFormElement>;

  protected readonly form: FormGroup;
  protected readonly formSubmitted = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly minDate = new Date().toISOString().split('T')[0];
  protected readonly vicarLetterFile = signal<File | null>(null);
  protected readonly vicarLetterPreviewUrl = signal<string | null>(null);
  protected readonly vicarLetterError = signal<string>('');

  // Church data signals
  protected readonly selectedDistrict = signal<string>('');
  protected readonly availableChurches = signal<ChurchWithDetails[]>([]);
  protected readonly allLocations = toSignal(
    this.churchDataService.getAllLocations(),
    { initialValue: [] }
  );
  protected readonly selectedChurch = signal<ChurchWithDetails | null>(null);
  protected readonly allPriests = toSignal(
    this.churchDataService.getAllPriests(),
    { initialValue: [] as Priest[] }
  );
  protected readonly priestSearchTerm = signal('');
  protected readonly filteredPriests = computed(() => {
    const term = this.priestSearchTerm().toLowerCase().trim();
    const priests = this.allPriests();
    if (!term) return priests;
    return priests.filter(p => p.name.toLowerCase().includes(term));
  });

  // protected siteKey: string = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'; // Test site key
  protected siteKey: string = '6LeODJ0rAAAAAM09ftjENEAG5A9CkDQiL1wa3199';
  protected recaptchaTheme = computed(() =>
    this.themeService.isDark() ? 'dark' : 'light'
  );

  constructor() {
    this.form = this.fb.group({
      churchDistrict: ['', Validators.required],
      churchName: [{ value: '', disabled: true }, Validators.required],
      priestName: ['', Validators.required],
      confirmationDate: ['', Validators.required],
      counsellingDate: ['', Validators.required],
      participants: this.fb.array([
        this.fb.group({
          name: [
            '',
            [
              Validators.required,
              Validators.maxLength(100),
              Validators.pattern(/^[a-zA-Z\s.]*$/),
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

  private readonly storageKey = 'preConfirmationForm';

  protected saveForm(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.form.value));
    alert('Form data saved locally.');
  }

  protected loadForm(showAlert = false): void {
    const savedData = localStorage.getItem(this.storageKey);
    if (savedData) {
      const formData = JSON.parse(savedData);

      // Temporarily remove validators to avoid issues with disabled fields
      this.form.get('churchName')?.clearValidators();
      this.form.get('churchName')?.updateValueAndValidity();

      // Patch all data except participants
      const { participants, ...mainFormData } = formData;
      this.form.patchValue(mainFormData);

      // Handle participants array
      if (participants && Array.isArray(participants)) {
        this.participants().clear();
        participants.forEach((participant: any) => {
          this.participants().push(this.fb.group(participant));
        });
      }

      // Handle dependent dropdown for church
      if (formData.churchDistrict) {
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
        alert('Form data loaded from local storage.');
      }
    } else {
      if (showAlert) {
        alert('No saved data found.');
      }
    }
  }

  protected clearForm(): void {
    localStorage.removeItem(this.storageKey);
    this.form.reset();
    this.participants().clear();
    this.addParticipant(); // Add one default participant

    // Revoke object URL
    if (this.vicarLetterPreviewUrl()) {
      URL.revokeObjectURL(this.vicarLetterPreviewUrl()!);
      this.vicarLetterPreviewUrl.set(null);
    }
    this.vicarLetterFile.set(null);
    this.vicarLetterError.set('');

    alert('Local form data cleared.');
  }

  hasPendingChanges = (): boolean => {
    return this.form.dirty;
  };

  ngOnInit(): void {
    this.loadForm(false); // Load form on init without showing alert
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

  protected readonly timezoneDisplay: string = $localize`DD/MM/YYYY | Time Zone: IST (UTC+05:30)`;

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

    const selectedChurch = this.selectedChurch();
    const body = {
      churchId: selectedChurch?.id || null,
      priestName: raw.priestName || null,
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
        const registerId = JSON.parse(response).id;
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
                    const dialogRef = this.dialog.open(Dialog, {
                      data: {
                        title: $localize`Pre-Confirmation Registration Complete`,
                        messages: [
                          $localize`Your pre-confirmation registration is successfully completed.`,
                        ],
                      },
                    });
                    dialogRef.afterClosed().subscribe(() => {
                      // Navigate back to previous page
                      this.form.reset();
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
      this.vicarLetterPreviewUrl.set(null);
    } else if (file && file.size > 2 * 1024 * 1024) {
      this.vicarLetterError.set('File too large. Max size is 2MB.');
      this.vicarLetterFile.set(null);
      this.vicarLetterPreviewUrl.set(null);
    } else {
      // Revoke old URL
      if (this.vicarLetterPreviewUrl()) {
        URL.revokeObjectURL(this.vicarLetterPreviewUrl()!);
      }

      this.vicarLetterFile.set(file);
      this.vicarLetterError.set('');

      if (file) {
        const url = URL.createObjectURL(file);
        this.vicarLetterPreviewUrl.set(url);
      } else {
        this.vicarLetterPreviewUrl.set(null);
      }
    }
  }

  removeParticipant(index: number): void {
    this.participants().removeAt(index);
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

  onPriestInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.priestSearchTerm.set(value);
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
