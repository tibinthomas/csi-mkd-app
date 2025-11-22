import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpClient, HttpParams } from '@angular/common/http';
import { saveAs } from 'file-saver';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ApiConfiguration } from '../../../api/api-main-app/api-configuration';
import { CsiMkdPremaritalAppBeService as ApiService } from '../../../api/api-main-app/services';
import { SessionDataService } from '../../core/services/session-data.service';

@Component({
  selector: 'app-export-name-church-modal',
  template: `
    <h2 mat-dialog-title>Export Name & Church Name</h2>

    <form [formGroup]="exportForm">
      <mat-dialog-content class="space-y-4">
        <!-- Session -->
        <mat-form-field appearance="fill" class="w-full">
          <mat-label>Session</mat-label>
          <mat-select formControlName="sessionId" required>
            @for (session of sessionList(); track session.sessionName) {
            <mat-option [value]="session.id">
              {{ session.sessionName }}
            </mat-option>
            }
          </mat-select>
          <mat-error>Session is required</mat-error>
        </mat-form-field>

        <!-- Sex -->
        <mat-form-field appearance="fill" class="w-full">
          <mat-label>Sex</mat-label>
          <mat-select formControlName="sex">
            <mat-option value="">All</mat-option>
            <mat-option value="Male">Male</mat-option>
            <mat-option value="Female">Female</mat-option>
          </mat-select>
        </mat-form-field>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-stroked-button type="button" (click)="dialogRef.close()">
          Cancel
        </button>

        <button
          mat-flat-button
          color="primary"
          (click)="onExport()"
          [disabled]="exportForm.invalid || isLoading()"
        >
          @if (isLoading()) {
          <mat-spinner diameter="20"></mat-spinner>
          } @else {
          <span>Download</span>
          }
        </button>
      </mat-dialog-actions>
    </form>
  `,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule
],
  standalone: true,
})
export class ExportNameChurchModalComponent {
  protected readonly dialogRef =
    inject<MatDialogRef<ExportNameChurchModalComponent>>(MatDialogRef);
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly config = inject(ApiConfiguration);
  private readonly api = inject(ApiService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly sessionDataService = inject(SessionDataService);

  protected readonly isLoading = signal(false);

  protected readonly sessionList = toSignal(this.sessionDataService.sessions$, {
    initialValue: [],
  });

  exportForm: FormGroup = this.fb.group({
    sessionId: ['', Validators.required],
    sex: [''],
  });

  onExport(): void {
    if (this.exportForm.invalid) {
      this.exportForm.markAllAsTouched();
      return;
    }

    const { sessionId, sex } = this.exportForm.value;
    this.isLoading.set(true);

    // First, get the session name using apiSessionconfigIdGet
    this.api.apiSessionconfigIdGet({ id: Number(sessionId) }).subscribe({
      next: (session: any) => {
        const sessionName = session?.sessionName || sessionId;

        const params: any = {
          SessionId: Number(sessionId),
          Sex: sex || '',
        };

        const queryParams = new HttpParams({ fromObject: params });

        // Download spreadsheet
        this.http
          .get(this.config.rootUrl + '/api/premaritalregister/spreadsheet', {
            params: queryParams,
            responseType: 'blob',
          })
          .subscribe({
            next: (blob) => {
              this.isLoading.set(false);
              if (blob && blob.size > 0) {
                saveAs(
                  new Blob([blob], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                  }),
                  `name-and-church-name-${sessionName}-${sex || 'All'}.xlsx`
                );
                this.dialogRef.close(true);
              } else {
                this.snackBar.open('No data found to export', 'Close', {
                  duration: 3000,
                });
                this.dialogRef.close(false);
              }
            },
            error: (err) => {
              console.error('Error exporting spreadsheet:', err);
              this.snackBar.open('Failed to export spreadsheet', 'Close', {
                duration: 3000,
              });
              this.isLoading.set(false);
              this.dialogRef.close(false);
            },
          });
      },
      error: (err) => {
        console.error('Error fetching session name:', err);
        this.snackBar.open('Failed to fetch session name', 'Close', {
          duration: 3000,
        });
        this.isLoading.set(false);
      },
    });
  }
}
