import {
  Component,
  Inject,
  OnInit,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormArray,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MatNativeDateModule,
  provideNativeDateAdapter,
} from '@angular/material/core';

import { CsiMkdPremaritalAppBeService } from '../../../api/api-main-app/services';
import {
  ConfirmationRegisterDto,
  UpdateConfirmationRegisterDto,
} from '../../../api/api-main-app/models';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ChurchDataService } from '../../core/services/church-data.service';
import { FileUploadService } from '../../core/services/file-upload.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-edit-pre-confirm-dialog',
  template: `
    <h2 mat-dialog-title>
      {{ data.isEdit ? 'Edit Registration' : 'Add Registration' }}
    </h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field appearance="fill" class="w-full">
          <mat-label>Church</mat-label>
          <mat-select formControlName="churchId">
            @for (church of churchData()?.churches; track church.id) {
              <mat-option [value]="church.id">{{ church.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="fill" class="w-full">
          <mat-label>Priest Name</mat-label>
          <input matInput formControlName="priestName" />
        </mat-form-field>
        <mat-form-field class="w-full">
          <mat-label>Confirmation Date</mat-label>
          <input
            matInput
            [matDatepicker]="confirmationPicker"
            formControlName="confirmationDate"
            [min]="minDate"
            (click)="confirmationPicker.open()"
          />
          <mat-datepicker-toggle
            matSuffix
            [for]="confirmationPicker"
          ></mat-datepicker-toggle>
          <mat-datepicker #confirmationPicker></mat-datepicker>
        </mat-form-field>
        <mat-form-field class="w-full">
          <mat-label>Counselling Date</mat-label>
          <input
            matInput
            [matDatepicker]="counsellingPicker"
            formControlName="counsellingDate"
            [min]="minDate"
            (click)="counsellingPicker.open()"
          />
          <mat-datepicker-toggle
            matSuffix
            [for]="counsellingPicker"
          ></mat-datepicker-toggle>
          <mat-datepicker #counsellingPicker></mat-datepicker>
        </mat-form-field>

        <h3>Participants</h3>
        <div formArrayName="participants">
          @for (
            participantGroup of participants.controls;
            track participantGroup;
            let i = $index
          ) {
            <div [formGroupName]="i" class="participant-group">
              <mat-form-field>
                <mat-label>Name</mat-label>
                <input matInput formControlName="name" />
              </mat-form-field>
              <mat-form-field>
                <mat-label>Age</mat-label>
                <input matInput formControlName="age" type="number" />
              </mat-form-field>
              <button
                mat-icon-button
                color="warn"
                type="button"
                (click)="removeParticipant(i)"
              >
                <mat-icon>remove_circle</mat-icon>
              </button>
            </div>
          }
        </div>
        <button
          mat-stroked-button
          color="primary"
          type="button"
          (click)="addParticipant()"
          class="w-full"
        >
          Add Participant
        </button>

        @if (data.isEdit) {
          <h3>Vicar's Letter</h3>
          <div class="vicar-letter-section">
            <input
              #vicarLetterInput
              type="file"
              hidden
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              (change)="onVicarLetterChange($event)"
            />
            <button
              mat-stroked-button
              color="primary"
              type="button"
              (click)="vicarLetterInput.click()"
            >
              <mat-icon>upload_file</mat-icon>
              {{ currentVicarLetterUrl ? 'Replace Letter' : 'Upload Letter' }}
            </button>
            @if (vicarLetterFile(); as file) {
              <span class="vicar-letter-file">
                <mat-icon class="text-base">attach_file</mat-icon>
                {{ file.name }}
                <button
                  mat-icon-button
                  type="button"
                  aria-label="Remove selected letter"
                  (click)="clearVicarLetter(vicarLetterInput)"
                >
                  <mat-icon>close</mat-icon>
                </button>
              </span>
            } @else if (currentVicarLetterUrl) {
              <span class="vicar-letter-hint"
                >A letter is already on file; uploading replaces it.</span
              >
            } @else {
              <span class="vicar-letter-hint">No letter uploaded yet.</span>
            }
          </div>
          @if (vicarLetterError()) {
            <p class="vicar-letter-error">{{ vicarLetterError() }}</p>
          }
        }
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button (click)="dialogRef.close()">Cancel</button>
      <button
        mat-flat-button
        color="primary"
        (click)="onSubmit()"
        [disabled]="form.invalid || isSaving() || (data.isEdit && !hasChanges)"
      >
        @if (isSaving()) {
          <mat-spinner diameter="18"></mat-spinner>
        }
        {{ data.isEdit ? 'Update' : 'Create' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .participant-group {
        display: flex;
        gap: 1rem;
        align-items: center;
      }
      .vicar-letter-section {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.75rem;
        margin: 0.5rem 0 1rem;
      }
      .vicar-letter-file {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.85rem;
        word-break: break-all;
      }
      .vicar-letter-hint {
        font-size: 0.8rem;
        opacity: 0.7;
      }
      .vicar-letter-error {
        color: var(--md-sys-color-error, #b3261e);
        font-size: 0.85rem;
        margin-bottom: 1rem;
      }
    `,
  ],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [provideNativeDateAdapter()],
})
export class EditPreConfirmDialogComponent implements OnInit {
  form: FormGroup;
  churchData;
  deletedParticipantIds: string[] = [];
  protected minDate: Date | null = new Date();

  protected readonly vicarLetterFile = signal<File | null>(null);
  protected readonly vicarLetterError = signal<string>('');
  protected readonly isSaving = signal(false);

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditPreConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      reg: UpdateConfirmationRegisterDto | ConfirmationRegisterDto;
      isEdit: boolean;
    },
    private api: CsiMkdPremaritalAppBeService,
    private snackBar: MatSnackBar,
    private churchDataService: ChurchDataService,
    private fileUploadService: FileUploadService,
  ) {
    this.churchData = toSignal(this.churchDataService.churchData$, {
      initialValue: null,
    });
    this.form = this.fb.group({
      churchId: [null, Validators.required],
      priestName: ['', Validators.required],
      confirmationDate: [null, Validators.required],
      counsellingDate: [null, Validators.required],
      participants: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    if (this.data.isEdit) {
      // Existing records may hold past dates; enforcing a min date would keep
      // the form permanently invalid and the Update button disabled.
      this.minDate = null;
      this.form.patchValue(this.data.reg);
      if (this.data.reg.participants) {
        this.data.reg.participants.forEach((p) => this.addParticipant(p));
      }
      this.form.controls['churchId'].disable();
    }
  }

  get participants(): FormArray {
    return this.form.get('participants') as FormArray;
  }

  protected get hasChanges(): boolean {
    return (
      this.form.dirty ||
      this.vicarLetterFile() !== null ||
      this.deletedParticipantIds.length > 0
    );
  }

  addParticipant(
    participant: {
      id?: string | null;
      name: string | null;
      age?: number | undefined | null;
    } | null = null,
  ) {
    const participantGroup = this.fb.group({
      id: [participant?.id || null],
      name: [participant?.name || '', Validators.required],
      age: [participant?.age || null, [Validators.required, Validators.min(1)]],
    });
    this.participants.push(participantGroup);
    // Only user-initiated additions count as a change; prefilled rows from
    // ngOnInit pass the existing participant in.
    if (!participant) {
      this.participants.markAsDirty();
    }
  }

  removeParticipant(index: number) {
    const removedParticipant = this.participants.at(index);
    if (removedParticipant && removedParticipant.value.id) {
      this.deletedParticipantIds.push(removedParticipant.value.id);
    }
    this.participants.removeAt(index);
    this.participants.markAsDirty();
  }

  get currentVicarLetterUrl(): string | null {
    return (this.data.reg as any).confirmationDocument?.vicarLetterUrl ?? null;
  }

  onVicarLetterChange(event: Event) {
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
      this.vicarLetterError.set('');
      this.vicarLetterFile.set(file);
    }
  }

  clearVicarLetter(input: HTMLInputElement) {
    input.value = '';
    this.vicarLetterFile.set(null);
    this.vicarLetterError.set('');
  }

  onSubmit() {
    if (this.form.invalid || this.isSaving()) {
      return;
    }

    const formData = this.form.getRawValue();

    if (this.data.isEdit) {
      const id = (this.data.reg as any).id; // Route parameter value
      const file = this.vicarLetterFile();

      if (file) {
        this.isSaving.set(true);
        this.api
          .apiAzureuploadGenerateSasGet({
            fileName: `confirmation/${id}/witnessofvicar/${file.name}`,
            contentType: file.type,
          })
          .pipe(
            switchMap((sasUrl) =>
              this.fileUploadService.uploadFileToAzure(file, sasUrl!),
            ),
          )
          .subscribe({
            next: (blobUrl) => this.updateRegistration(id, formData, blobUrl),
            error: () => {
              this.isSaving.set(false);
              this.vicarLetterError.set(
                'Letter upload failed. The registration was not updated.',
              );
            },
          });
      } else {
        this.isSaving.set(true);
        this.updateRegistration(id, formData, null);
      }
    } else {
      // For new registration
      const newReg: ConfirmationRegisterDto = {
        ...formData,
        recaptchaToken: 'dummy-token', // handle this properly in production
      };

      this.api.apiConfirmationregisterPost({ body: newReg }).subscribe({
        next: () => {
          this.snackBar.open($localize`Registration created successfully`, $localize`Close`, {
            duration: 3000,
          });
          this.dialogRef.close(true);
        },
        error: () => {
          this.snackBar.open($localize`Failed to create registration`, $localize`Close`, {
            duration: 3000,
          });
        },
      });
    }
  }

  private updateRegistration(
    id: string,
    formData: any,
    vicarLetterUrl: string | null,
  ) {
    // Build the updated DTO (no id property inside the DTO)
    const updatedReg: UpdateConfirmationRegisterDto = {
      ...formData,
      deletedParticipantIds: this.deletedParticipantIds,
      ...(vicarLetterUrl ? { vicarLetterUrl } : {}),
    };

    this.api
      .apiConfirmationregisterIdPut({
        id, // send id separately in route param
        body: updatedReg, // DTO without id
      })
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          this.snackBar.open($localize`Registration updated successfully`, $localize`Close`, {
            duration: 3000,
          });
          this.dialogRef.close(true);
        },
        error: () => {
          this.isSaving.set(false);
          this.snackBar.open($localize`Failed to update registration`, $localize`Close`, {
            duration: 3000,
          });
        },
      });
  }
}
