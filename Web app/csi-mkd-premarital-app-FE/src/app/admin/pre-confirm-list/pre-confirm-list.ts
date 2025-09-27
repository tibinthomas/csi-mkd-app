import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, signal, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CsiMkdPremaritalAppBeService } from '../../../api/api-main-app/services';
import { ConfirmationRegisterDto } from '../../../api/api-main-app/models';
import { PageEvent, MatPaginatorModule } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ChurchDataService } from '../../core/services/church-data.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-pre-confirm-list',
  templateUrl: './pre-confirm-list.html',
  styleUrls: ['./pre-confirm-list.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatDividerModule,
    MatCardModule,
    DatePipe,
  ],
  providers: [DatePipe],

})
export class PreConfirmList implements OnInit {
  registrations = signal<ConfirmationRegisterDto[]>([]);
  isLoading = signal(false);
  totalRegistrations = signal(0);
  pageIndex = signal(0);
  pageSize = signal(10);
  searchTermInput = signal('');
  expanded = new Set<string>();
  expandedAll = false;
  protected readonly totalCount = signal(0);

  private api = inject(CsiMkdPremaritalAppBeService);
  private snackBar = inject(MatSnackBar);
  private datePipe = inject(DatePipe);
  private dialog = inject(MatDialog);
  private readonly churchDataService = inject(ChurchDataService);

  protected readonly churchData = toSignal(this.churchDataService.churchData$, {
    initialValue: null,
  });

  ngOnInit() {
    this.loadRegistrations();
  }

  loadRegistrations() {
    this.isLoading.set(true);
    this.api
      .apiConfirmationregisterFilterGet({
        page: this.pageIndex() + 1,
        pageSize: this.pageSize(),
        search: this.searchTermInput(),
      })
      .subscribe({
        next: (responseJson: any) => {
          const response = JSON.parse(responseJson);
          this.registrations.set(response.items);
          this.totalCount.set(response.totalCount || 0);

          this.totalRegistrations.set(response.totalCount);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.snackBar.open('Failed to load registrations', 'Close', {
            duration: 3000,
          });
        },
      });
  }

  searchRegistrations() {
    this.pageIndex.set(0);
    this.loadRegistrations();
  }

  clearFilters() {
    this.searchTermInput.set('');
    this.pageIndex.set(0);
    this.loadRegistrations();
  }

  onPageChange(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadRegistrations();
  }
  displayedColumns = [
    'ChurchName',
    'PriestName',
    'ConfirmationDate',
    'CounsellingDate',
    'ParticipantsCount',
    'Actions',
    'expand',
  ];
  expandedRow = signal<any | null>(null);

  toggleRow = (row: any) => {
    this.expandedRow.set(this.expandedRow() === row ? null : row);
  };

  expandedElement = signal<any | null>(null);

  isExpanded(reg: any) {
    return this.expandedRow() === reg;
  }

  handleDownloadCSV() {
    const items = this.registrations();
    if (!items || items.length === 0) {
      this.snackBar.open('No data available to download.', 'Close', {
        duration: 3000,
      });
      return;
    }

    const headers = [
      'Church Name',
      'Priest Name',
      'Confirmation Date',
      'Counselling Date',
      'Participants Count',
      'Participants',
    ];

    const rows = items.map((reg: any) => {
      const participants = (reg.participants || [])
        .map((p: any) => `${p.name} (Age: ${p.age})`)
        .join('; ');
      return [
        this.getChurchNameById(reg.churchId),
        reg.priestName || '',
        reg.confirmationDate
          ? this.datePipe.transform(reg.confirmationDate, 'mediumDate')
          : '',
        reg.counsellingDate
          ? this.datePipe.transform(reg.counsellingDate, 'mediumDate')
          : '',
        reg.participants?.length || 0,
        `"${participants}"`, // Quotes to handle commas/semicolons
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pre-confirmation-registrations.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  handleDownload() {
    const items = this.registrations();

    if (!items || items.length === 0) {
      this.snackBar.open('No data available to download.', 'Close', {
        duration: 3000,
      });
      return;
    }

    const doc = new jsPDF();

    const headers = [
      [
        'Church Name',
        'Priest Name',
        'Confirmation Date',
        'Counselling Date',
        'Participants Count',
        'Participants',
      ],
    ];

    const data = items.map((reg: any) => {
      const participants = (reg.participants || [])
        .map((p: any) => `${p.name} (Age: ${p.age})`)
        .join('\n');
      return [
        this.getChurchNameById(reg.churchId),
        reg.priestName,
        reg.confirmationDate
          ? this.datePipe.transform(reg.confirmationDate, 'mediumDate')
          : '',
        reg.counsellingDate
          ? this.datePipe.transform(reg.counsellingDate, 'mediumDate')
          : '',
        reg.participants?.length || 0,
        participants,
      ];
    });

    doc.text('Pre-Confirmational Registrations', 14, 15);
    autoTable(doc, {
      startY: 20,
      head: headers,
      body: data,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [63, 81, 181] }, // Indigo header
      margin: { left: 14, right: 14 },
      columnStyles: {
        4: { cellWidth: 'wrap' }, // Allow participants column to wrap
      },
    });

    doc.save('pre-confirmation-registrations.pdf');
  }

  getChurchNameById(churchId: number | null | undefined): string {
    return this.churchDataService.getChurchNameById(
      churchId,
      this.churchData()
    );
  }

  deleteRegistration(reg: any): void {
    const dialogRef = this.dialog.open(DeleteConfirmationDialog);

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.isLoading.set(true);
        this.api.apiConfirmationregisterIdDelete({ id: reg.id }).subscribe({
          next: () => {
            this.isLoading.set(false);
            this.snackBar.open('Registration deleted successfully', 'OK', {
              duration: 3000,
            });
            this.loadRegistrations();
          },
          error: (err) => {
            this.isLoading.set(false);
            console.error('Deletion failed', err);
            this.snackBar.open(
              'Failed to delete registration. Please try again.',
              'OK',
              {
                duration: 3000,
              }
            );
          },
        });
      }
    });
  }
}

@Component({
  selector: 'delete-confirmation-dialog',
  template: `
    <h2 mat-dialog-title>Confirm Deletion</h2>
    <mat-dialog-content>
      Are you sure you want to delete this registration?
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-flat-button color="warn" (click)="dialogRef.close(true)">
        Delete
      </button>
      <button mat-stroked-button (click)="dialogRef.close(false)">
        Cancel
      </button>
    </mat-dialog-actions>
  `,
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
})
export class DeleteConfirmationDialog {
  dialogRef = inject(MatDialogRef<DeleteConfirmationDialog>);
}
