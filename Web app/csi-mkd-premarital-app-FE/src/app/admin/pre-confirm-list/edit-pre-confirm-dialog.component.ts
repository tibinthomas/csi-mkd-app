import { Component, Inject, OnInit, signal } from '@angular/core';
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
import { toSignal } from '@angular/core/rxjs-interop';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

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
            @for(church of churchData()?.churches; track church.id){
            <mat-option [value]="church.id">{{ church.name }}</mat-option>
            }
          </mat-select>
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
          @for(participantGroup of participants.controls; track participantGroup; let i = $index){
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
          (click)="addParticipant()"
          class="w-full"
        >
          Add Participant
        </button>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button (click)="dialogRef.close()">Cancel</button>
      <button
        mat-flat-button
        color="primary"
        (click)="onSubmit()"
        [disabled]="form.invalid"
      >
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
    MatIconModule
],
  providers: [provideNativeDateAdapter()],
})
export class EditPreConfirmDialogComponent implements OnInit {
  form: FormGroup;
  churchData;
  deletedParticipantIds: string[] = [];
  protected readonly minDate = new Date();

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
    private churchDataService: ChurchDataService
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

  addParticipant(
    participant: {
      id?: string | null;
      name: string | null;
      age?: number | undefined | null;
    } | null = null
  ) {
    const participantGroup = this.fb.group({
      id: [participant?.id || null],
      name: [participant?.name || '', Validators.required],
      age: [participant?.age || null, [Validators.required, Validators.min(1)]],
    });
    this.participants.push(participantGroup);
  }

  removeParticipant(index: number) {
    const removedParticipant = this.participants.at(index);
    if (removedParticipant && removedParticipant.value.id) {
      this.deletedParticipantIds.push(removedParticipant.value.id);
    }
    this.participants.removeAt(index);
  }

  onSubmit() {
    if (this.form.invalid) {
      return;
    }

    const formData = this.form.getRawValue();

    if (this.data.isEdit) {
      // Build the updated DTO (no id property inside the DTO)
      const updatedReg: UpdateConfirmationRegisterDto = {
        ...formData,
        deletedParticipantIds: this.deletedParticipantIds,
      };

      const id = (this.data.reg as any).id; // Route parameter value

      this.api
        .apiConfirmationregisterIdPut({
          id, // send id separately in route param
          body: updatedReg, // DTO without id
        })
        .subscribe({
          next: () => {
            this.snackBar.open('Registration updated successfully', 'Close', {
              duration: 3000,
            });
            this.dialogRef.close(true);
          },
          error: () => {
            this.snackBar.open('Failed to update registration', 'Close', {
              duration: 3000,
            });
          },
        });
    } else {
      // For new registration
      const newReg: ConfirmationRegisterDto = {
        ...formData,
        recaptchaToken: 'dummy-token', // handle this properly in production
      };

      this.api.apiConfirmationregisterPost({ body: newReg }).subscribe({
        next: () => {
          this.snackBar.open('Registration created successfully', 'Close', {
            duration: 3000,
          });
          this.dialogRef.close(true);
        },
        error: () => {
          this.snackBar.open('Failed to create registration', 'Close', {
            duration: 3000,
          });
        },
      });
    }
  }
}
