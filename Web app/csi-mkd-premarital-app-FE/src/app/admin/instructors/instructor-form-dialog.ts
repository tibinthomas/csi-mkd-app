import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  InstructorDto,
  CreateInstructorDto,
  UpdateInstructorDto,
} from '../../../api/api-main-app/models';
import { CsiMkdPremaritalAppBeService } from '../../../api/api-main-app/services';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-instructor-form-dialog',
  templateUrl: './instructor-form-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
})
export class InstructorFormDialogComponent {
  private readonly dialogRef = inject(
    MatDialogRef<InstructorFormDialogComponent>
  );
  private readonly data = inject(MAT_DIALOG_DATA);
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(CsiMkdPremaritalAppBeService);
  private readonly snackBar = inject(MatSnackBar);

  readonly isEdit = signal(!!this.data?.instructor);
  readonly instructor: InstructorDto | null = this.data?.instructor || null;
  readonly isSubmitting = signal(false);

  readonly form = this.fb.group({
    name: [
      (this.instructor as any)?.Name || '',
      [Validators.required, Validators.minLength(2)],
    ],
    qualification: [
      (this.instructor as any)?.Qualification || '',
      [Validators.required, Validators.minLength(2)],
    ],
  });

  get dialogTitle() {
    return this.isEdit() ? 'Edit Instructor' : 'Add New Instructor';
  }

  get submitButtonText() {
    return this.isEdit() ? 'Update' : 'Create';
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.form.valid && !this.isSubmitting()) {
      this.isSubmitting.set(true);
      const formValue = this.form.value;

      const instructorData: CreateInstructorDto | UpdateInstructorDto = {
        name: formValue.name!,
        qualification: formValue.qualification!,
      };

      if (this.isEdit() && this.instructor?.id) {
        // Update existing instructor
        this.api
          .apiInstructorsIdPut({
            id: this.instructor.id,
            body: instructorData,
          })
          .pipe(finalize(() => this.isSubmitting.set(false)))
          .subscribe({
            next: () => {
              this.snackBar.open('Instructor updated successfully', 'Close', {
                duration: 3000,
              });
              this.dialogRef.close(true);
            },
            error: (error) => {
              console.error('Error updating instructor:', error);
              this.snackBar.open('Failed to update instructor', 'Close', {
                duration: 3000,
              });
            },
          });
      } else {
        // Create new instructor
        this.api
          .apiInstructorsPost({
            body: instructorData,
          })
          .pipe(finalize(() => this.isSubmitting.set(false)))
          .subscribe({
            next: (response) => {
              this.snackBar.open('Instructor created successfully', 'Close', {
                duration: 3000,
              });
              this.dialogRef.close(response);
            },
            error: (error) => {
              console.error('Error creating instructor:', error);
              this.snackBar.open('Failed to create instructor', 'Close', {
                duration: 3000,
              });
            },
          });
      }
    } else {
      // Mark all fields as touched to show validation errors
      this.form.markAllAsTouched();
    }
  }

  getNameErrorMessage(): string {
    const nameControl = this.form.get('name');
    if (nameControl?.hasError('required')) {
      return 'Name is required';
    }
    if (nameControl?.hasError('minlength')) {
      return 'Name must be at least 2 characters long';
    }
    return '';
  }

  getQualificationErrorMessage(): string {
    const qualificationControl = this.form.get('qualification');
    if (qualificationControl?.hasError('required')) {
      return 'Qualification is required';
    }
    if (qualificationControl?.hasError('minlength')) {
      return 'Qualification must be at least 2 characters long';
    }
    return '';
  }
}
