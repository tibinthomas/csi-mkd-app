import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { toSignal } from '@angular/core/rxjs-interop';
import { CsiMkdPremaritalAppBeService as ApiService } from '../../../api/api-main-app/services';
import { SessionDataService } from '../../core/services/session-data.service';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiConfiguration } from '../../../api/api-main-app/api-configuration';

@Component({
  selector: 'app-export-phone-modal',
  template: `
    <h2 mat-dialog-title>Export Phone Numbers</h2>
    <form [formGroup]="exportForm">
      <mat-dialog-content class="space-y-4">
        <mat-form-field appearance="fill" class="w-full">
          <mat-label>Session</mat-label>
          <mat-select formControlName="sessionId" required>
            @for (session of sessionList(); track session.sessionName) {
            <mat-option [value]="session.id">{{
              session.sessionName
            }}</mat-option>
            }
          </mat-select>
          <mat-error>Session is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="fill" class="w-full">
          <mat-label>Sex</mat-label>
          <mat-select formControlName="sex">
            <mat-option value="Male">Male</mat-option>
            <mat-option value="Female">Female</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="fill" class="w-full">
          <mat-label>Email to</mat-label>
          <input matInput formControlName="email" />
        </mat-form-field>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-stroked-button type="button" (click)="dialogRef.close()">
          Cancel
        </button>
        <button
          mat-stroked-button
          (click)="onDownload()"
          [disabled]="exportForm.get('sessionName')?.invalid || isLoading()"
        >
          @if(isLoading()){
          <mat-spinner diameter="20"></mat-spinner>
          } @else {
          <span>Download</span>
          }
        </button>
        <button
          mat-flat-button
          color="primary"
          (click)="onDownloadAndEmail()"
          [disabled]="
            exportForm.invalid || !exportForm.get('email')?.value || isLoading()
          "
        >
          @if(isLoading()){
          <mat-spinner diameter="20"></mat-spinner>
          } @else {
          <span>Download & Email</span>
          }
        </button>
      </mat-dialog-actions>
    </form>
  `,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    FormsModule,
    MatProgressSpinnerModule,
  ],
  standalone: true,
})
export class ExportPhoneModalComponent {
  protected readonly dialogRef =
    inject<MatDialogRef<ExportPhoneModalComponent>>(MatDialogRef);
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);
  private readonly sessionDataService = inject(SessionDataService);
  private readonly http = inject(HttpClient);
  private readonly config = inject(ApiConfiguration);

  protected readonly isLoading = signal(false);

  protected readonly sessionList = toSignal(this.sessionDataService.sessions$, {
    initialValue: [],
  });

  exportForm: FormGroup = this.fb.group({
    sessionId: ['', Validators.required],
    sex: [''],
    email: ['csimkdmarry@gmail.com', Validators.email],
  });

  private performExport(params: any): void {
    this.isLoading.set(true);

    // Manually construct the request to ensure responseType is 'blob'
    const queryParams = new HttpParams({ fromObject: params });

    this.http
      .get(this.config.rootUrl + '/api/premaritalregister/vcf', {
        params: queryParams,
        responseType: 'blob',
      })
      .subscribe({
        next: (blob) => {
          this.isLoading.set(false);
          if (blob && blob.size > 0) {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `premarital-contacts-${params.sessionName}.vcf`;
            a.click();
            window.URL.revokeObjectURL(url);
            this.dialogRef.close(true);
          } else {
            console.error('Received empty or invalid blob');
            this.dialogRef.close(false);
          }
        },
        error: (err) => {
          this.isLoading.set(false);
          console.error('Error exporting phone numbers:', err);
          this.dialogRef.close(false);
        },
      });
  }

  onDownload(): void {
    if (this.exportForm.get('sessionId')?.invalid) {
      this.exportForm.markAllAsTouched();
      return;
    }
    const { sessionId, sex } = this.exportForm.value;
    const params: any = {
      sessionId,
      page: 1,
      pageSize: 1000,
    };
    if (sex) {
      params.sex = sex;
    }
    this.performExport(params);
  }

  onDownloadAndEmail(): void {
    if (this.exportForm.invalid || !this.exportForm.get('email')?.value) {
      this.exportForm.markAllAsTouched();
      return;
    }
    const { sessionName, sex, email } = this.exportForm.value;
    const params: any = {
      sessionName,
      page: 1,
      pageSize: 1000,
      email: email,
    };
    if (sex) {
      params.sex = sex;
    }
    this.performExport(params);
  }
}
