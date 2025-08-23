// session-form-dialog.component.ts
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  computed,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-session-form-dialog',

  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
  ],
  templateUrl: './session-config-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionFormDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<SessionFormDialogComponent>);
  private readonly fb = inject(FormBuilder);
  private readonly data = inject(MAT_DIALOG_DATA);

  protected readonly isEdit = signal(!!this.data?.session?.Id);

  protected readonly form = this.fb.group({
    id: [this.data?.session?.Id ?? null],
    sessionName: [this.data?.session?.SessionName ?? '', Validators.required],
    startDate: [this.data?.session?.StartDate ?? '', Validators.required],
    endDate: [this.data?.session?.EndDate ?? '', Validators.required],
    isActive: [this.data?.session?.IsActive ?? true],
  });

  protected readonly timezoneDisplay: string = 'Format: DD/MM/YYYY | Time Zone: IST (UTC+05:30)';

  onSubmit() {
    if (this.form.invalid) return;
    this.dialogRef.close(this.form.value);
  }

  close() {
    this.dialogRef.close();
  }
}
