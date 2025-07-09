import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  OnInit,
  computed,
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
import { SessionFormDialogComponent } from './session-config-form';
import { formatDate } from '@angular/common';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelTitle,
  MatExpansionPanelHeader,
  MatExpansionPanelDescription,
} from '@angular/material/expansion';
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
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelTitle,
    MatExpansionPanelHeader,
    MatExpansionPanelDescription,
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
  protected selectedYear = signal(new Date());

  private readonly sessionList$ = toObservable(this.refreshTrigger).pipe(
    switchMap(() =>
      this.sessionConfigService.apiSessionconfigGet$Json().pipe(
        map((data) =>
          data
            .map((session: any) => ({
              ...session,
            }))
            .sort((a: any, b: any) => b.Id - a.Id)
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

  chooseYear(normalizedYear: Date, datepicker: any) {
    this.selectedYear.set(new Date(normalizedYear.getFullYear(), 0));
    datepicker.close();
  }

  onYearChange(event: any) {
    this.selectedYear.set(new Date(event.value.getFullYear()));
  }

  readonly groupedSessions = computed(() => {
    const year = this.selectedYear().getFullYear();
    const sessionsInYear = this.sessionList().filter(
      (s) => new Date(s.StartDate).getFullYear() === year
    );

    if (!sessionsInYear.length) return [];

    const grouped: Record<string, any[]> = {};
    sessionsInYear.forEach((session) => {
      const month = formatDate(session.StartDate, 'MMMM', 'en-US');
      if (!grouped[month]) grouped[month] = [];
      grouped[month].push(session);
    });

    return Object.entries(grouped).map(([monthName, sessions]) => ({
      monthName,
      sessions,
    }));
  });

  deleteSession(session: any) {
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      data: {
        message: `Are you sure you want to delete the session "${session.SessionName}"?`,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.sessionConfigService
          .apiSessionconfigIdDelete({ id: session.Id })
          .subscribe({
            next: () => {
              this.refreshTrigger.set(this.refreshTrigger() + 1);
            },
            error: (err) => {
              const errorMsg =
                JSON.parse(err?.error).message ??
                'Failed to delete session configuration.';
              console.log(err);
              this.dialog.open(AlertDialog, {
                data: { message: errorMsg },
              });
            },
          });
      }
    });
  }

  toggleStatus(session: any) {
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      data: {
        message: `Do you want to make "${session.SessionName}" ${
          session.IsActive ? 'inactive' : 'active'
        }?`,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const updatedSession = {
          ...session,
          isActive: !session.IsActive,
        };
        this.sessionConfigService
          .apiSessionconfigIdPut({
            id: session.Id,
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
    });
  }

  toUtcIsoString(dateInput: string | Date): string {
    const localDate = new Date(dateInput);
    return localDate.toISOString();
  }

  addSession() {
    const dialogRef = this.dialog.open(SessionFormDialogComponent, {
      data: {},
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const session = {
          ...result,
          startDate: this.toUtcIsoString(result.startDate),
          endDate: this.toUtcIsoString(result.endDate),
        };
        this.sessionConfigService
          .apiSessionconfigPost$Json({ body: session })
          .subscribe({
            next: () => this.refreshTrigger.set(this.refreshTrigger() + 1),
            error: () =>
              this.dialog.open(AlertDialog, {
                data: { message: 'Failed to create session' },
              }),
          });
      }
    });
  }

  editSession(session: any) {
    const dialogRef = this.dialog.open(SessionFormDialogComponent, {
      data: { session },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const updated = {
          ...result,
          startDate: this.toUtcIsoString(result.startDate),
          endDate: this.toUtcIsoString(result.endDate),
        };
        this.sessionConfigService
          .apiSessionconfigIdPut({ id: updated.id, body: updated })
          .subscribe({
            next: () => this.refreshTrigger.set(this.refreshTrigger() + 1),
            error: () =>
              this.dialog.open(AlertDialog, {
                data: { message: 'Failed to update session' },
              }),
          });
      }
    });
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
