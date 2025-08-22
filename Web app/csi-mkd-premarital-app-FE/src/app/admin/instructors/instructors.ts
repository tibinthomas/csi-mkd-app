import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  computed,
} from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import {
  MatDialogModule,
  MatDialog,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CsiMkdPremaritalAppBeService } from '../../../api/api-main-app/services';
import { InstructorDto } from '../../../api/api-main-app/models';
import { InstructorFormDialogComponent } from './instructor-form-dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-instructors',
  templateUrl: './instructors.html',
  styleUrl: './instructors.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
})
export class Instructors implements OnInit {
  private readonly api = inject(CsiMkdPremaritalAppBeService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly displayedColumns = ['name', 'qualification', 'actions'];
  readonly instructors = signal<InstructorDto[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  readonly sortedInstructors = computed(() => {
    return this.instructors().sort((a, b) => {
      const idA = (a as any).Id || a.id || 0;
      const idB = (b as any).Id || b.id || 0;
      return idA - idB;
    });
  });

  ngOnInit() {
    this.loadInstructors();
  }

  loadInstructors() {
    this.isLoading.set(true);
    this.error.set(null);

    this.api.apiInstructorsGet().subscribe({
      next: (instructors) => {
        this.instructors.set(instructors || []);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load instructors', err);
        this.error.set('Failed to load instructors');
        this.isLoading.set(false);
        this.snackBar.open('Failed to load instructors', 'Close', {
          duration: 5000,
        });
      },
    });
  }

  addInstructor() {
    const dialogRef = this.dialog.open(InstructorFormDialogComponent, {
      width: '500px',
      data: {},
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.createInstructor(result);
      }
    });
  }

  editInstructor(instructor: InstructorDto) {
    const dialogRef = this.dialog.open(InstructorFormDialogComponent, {
      width: '500px',
      data: { instructor },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.updateInstructor(instructor.id!, result);
      }
    });
  }

  deleteInstructor(instructor: InstructorDto) {
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      data: {
        message: `Are you sure you want to delete instructor "${instructor.name}"?`,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.performDelete(instructor.id!);
      }
    });
  }

  private createInstructor(instructorData: any) {
    this.api.apiInstructorsPost({ body: instructorData }).subscribe({
      next: () => {
        this.loadInstructors();
        this.snackBar.open('Instructor created successfully', 'Close', {
          duration: 3000,
        });
      },
      error: (err) => {
        console.error('Failed to create instructor', err);
        this.snackBar.open('Failed to create instructor', 'Close', {
          duration: 5000,
        });
      },
    });
  }

  private updateInstructor(id: number, instructorData: any) {
    this.api
      .apiInstructorsIdPut({ id, body: { ...instructorData, id } })
      .subscribe({
        next: () => {
          this.loadInstructors();
          this.snackBar.open('Instructor updated successfully', 'Close', {
            duration: 3000,
          });
        },
        error: (err) => {
          console.error('Failed to update instructor', err);
          this.snackBar.open('Failed to update instructor', 'Close', {
            duration: 5000,
          });
        },
      });
  }

  private performDelete(id: number) {
    this.api.apiInstructorsIdDelete({ id }).subscribe({
      next: () => {
        this.loadInstructors();
        this.snackBar.open('Instructor deleted successfully', 'Close', {
          duration: 3000,
        });
      },
      error: (err) => {
        console.error('Failed to delete instructor', err);
        this.snackBar.open('Failed to delete instructor', 'Close', {
          duration: 5000,
        });
      },
    });
  }
}

@Component({
  selector: 'confirmation-dialog',
  template: `
    <h1 mat-dialog-title>Confirmation</h1>
    <div mat-dialog-content>{{ data.message }}</div>
    <div mat-dialog-actions>
      <button mat-button [mat-dialog-close]="true">Yes</button>
      <button mat-button [mat-dialog-close]="false">No</button>
    </div>
  `,
  imports: [MatDialogModule, MatButtonModule],
})
export class ConfirmationDialog {
  data = inject(MAT_DIALOG_DATA);
}
