import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { SessionConfigService } from '../../../api/services';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, switchMap } from 'rxjs';
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-session-config',
  templateUrl: './session-config.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    DatePipe,
  ],
})
export class SessionConfig implements OnInit {
  displayedColumns: string[] = [
    'sessionName',
    'startDate',
    'endDate',
    'isActive',
    'actions',
  ];
  private readonly fb = inject(FormBuilder);
  private readonly sessionConfigService = inject(SessionConfigService);
  private readonly dialog = inject(MatDialog);

  protected readonly form = this.fb.group({
    id: [null],
    sessionName: ['', Validators.required],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    isActive: [true],
  });

  protected readonly editMode = signal(false);
  protected readonly showModal = signal(false);
  private readonly refreshTrigger = signal(0);

  private readonly sessionList$ = toObservable(this.refreshTrigger).pipe(
    switchMap(() =>
      this.sessionConfigService.apiSessionconfigGet$Json().pipe(
        map((data) =>
          data.map((session: any) => ({
            ...session,
          }))
        ),
        catchError((err) => {
          console.error('Failed to load sessions', err);
          alert('Failed to load session configurations.');
          return of([]);
        })
      )
    )
  );

  protected readonly sessionList = toSignal(this.sessionList$, {
    initialValue: [],
  });

  ngOnInit() {
    this.refreshTrigger.set(this.refreshTrigger() + 1);
  }

  onSubmit() {
    if (this.form.invalid) return;

    const raw = this.form.value;
    const session = {
      ...raw,
      sessionName: raw.sessionName ?? null,
      startDate: this.toUtcIsoString(raw.startDate as string),
      endDate: this.toUtcIsoString(raw.endDate as string),
      isActive: raw.isActive !== null ? raw.isActive : true,
    };

    if (this.editMode() && session.id) {
      this.sessionConfigService
        .apiSessionconfigIdPut({
          id: session.id,
          body: session,
        })
        .subscribe({
          next: () => {
            this.refreshTrigger.set(this.refreshTrigger() + 1);
            this.form.reset();
            this.editMode.set(false);
            this.closeModal();
          },
          error: (err) => {
            console.error('Update failed', err);
            alert('Failed to update session configuration.');
          },
        });
    } else {
      this.sessionConfigService
        .apiSessionconfigPost$Json({
          body: session,
        })
        .subscribe({
          next: () => {
            this.refreshTrigger.set(this.refreshTrigger() + 1);
            this.form.reset();
            this.closeModal();
          },
          error: (err) => {
            console.error('Creation failed', err);
            alert('Failed to create session configuration.');
          },
        });
    }
  }

  editSession(session: any) {
    this.editMode.set(true);
    this.form.patchValue(session);
    this.showModal.set(true);
  }

  deleteSession(session: any) {
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      data: {
        message: `Are you sure you want to delete the session "${session.sessionName}"?`,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.sessionConfigService
          .apiSessionconfigIdDelete({ id: session.id })
          .subscribe({
            next: () => {
              this.refreshTrigger.set(this.refreshTrigger() + 1);
            },
            error: (err) => {
              console.error('Delete failed', err);
              this.dialog.open(AlertDialog, {
                data: { message: 'Failed to delete session configuration.' },
              });
            },
          });
      }
    });
  }

  toggleStatus(session: any) {
    const updatedSession = {
      ...session,
      isActive: !session.isActive,
    };
    this.sessionConfigService
      .apiSessionconfigIdPut({
        id: session.id,
        body: updatedSession,
      })
      .subscribe({
        next: () => {
          this.refreshTrigger.set(this.refreshTrigger() + 1);
        },
        error: (err) => {
          console.error('Failed to toggle session status', err);
          this.dialog.open(AlertDialog, {
            data: { message: 'Failed to update status.' },
          });
        },
      });
  }

  openModal() {
    this.editMode.set(false);
    this.form.reset();
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  toUtcIsoString(dateInput: string | Date): string {
    const localDate = new Date(dateInput);
    return localDate.toISOString();
  }
}

@Component({
  selector: 'confirmation-dialog',
  template: `
    <h1 mat-dialog-title>Confirmation</h1>
    <div mat-dialog-content>{{ data.message }}</div>
    <div mat-dialog-actions>
      <button mat-button (click)="onNoClick()">No</button>
      <button mat-button [mat-dialog-close]="true">Yes</button>
    </div>
  `,
  imports: [MatDialogModule, MatButtonModule],
})
export class ConfirmationDialog {
  dialogRef = inject<MatDialogRef<ConfirmationDialog>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);

  onNoClick(): void {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'alert-dialog',
  template: `
    <h1 mat-dialog-title>Alert</h1>
    <div mat-dialog-content>{{ data.message }}</div>
    <div mat-dialog-actions>
      <button mat-button (click)="onOkClick()">OK</button>
    </div>
  `,
  imports: [MatDialogModule, MatButtonModule],
})
export class AlertDialog {
  dialogRef = inject<MatDialogRef<AlertDialog>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);

  onOkClick(): void {
    this.dialogRef.close();
  }
}
