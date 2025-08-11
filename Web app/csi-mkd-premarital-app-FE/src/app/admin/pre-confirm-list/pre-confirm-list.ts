import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CsiMkdPremaritalAppBeService } from '../../../api/services';
import { ConfirmationRegisterDto } from '../../../api/models';
import { PageEvent, MatPaginatorModule } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  ],
  animations: [
    trigger('detailExpand', [
      state(
        'collapsed',
        style({ height: '0px', minHeight: '0', display: 'none' })
      ),
      state('expanded', style({ height: '*', display: 'table-row' })),
      transition('expanded <=> collapsed', animate('200ms ease-in-out')),
    ]),
  ],
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

  constructor(
    private api: CsiMkdPremaritalAppBeService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadRegistrations();
  }

  loadRegistrations() {
    this.isLoading.set(true);
    this.api
      .apiConfirmationregisterFilterGet({
        Page: this.pageIndex() + 1,
        PageSize: this.pageSize(),
        Search: this.searchTermInput(),
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
    'ConfirmationDate',
    'CounsellingDate',
    'ParticipantsCount',
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

  // handleDownload() {
  //   // Implement download logic here
  //   this.snackBar.open('Download functionality not implemented yet.', 'Close', {
  //     duration: 3000,
  //   });
  // }

  // handleDownload() {
  //   const items = this.registrations();
  //   if (!items || items.length === 0) {
  //     this.snackBar.open('No data available to download.', 'Close', {
  //       duration: 3000,
  //     });
  //     return;
  //   }

  //   const headers = [
  //     'Church Name',
  //     'Confirmation Date',
  //     'Confirmation Time',
  //     'Participants Count',
  //     'Participants',
  //   ];

  //   const rows = items.map((reg) => {
  //     const participants = (reg.Participants || [])
  //       .map((p) => `${p.Name} (Age: ${p.Age})`)
  //       .join('; ');
  //     return [
  //       reg.ChurchName || '',
  //       reg.ConfirmationDate || '',
  //       reg.ConfirmationTime || '',
  //       reg.Participants?.length || 0,
  //       `"${participants}"`, // Quotes to handle commas/semicolons
  //     ];
  //   });

  //   const csvContent = [
  //     headers.join(','),
  //     ...rows.map((row) => row.join(',')),
  //   ].join('\n');

  //   const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  //   const url = window.URL.createObjectURL(blob);
  //   const a = document.createElement('a');
  //   a.href = url;
  //   a.download = 'pre-confirmation-registrations.csv';
  //   a.click();
  //   window.URL.revokeObjectURL(url);
  // }

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
        'Confirmation Date',
        'Confirmation Time',
        'Participants Count',
        'Participants',
      ],
    ];

    const data = items.map((reg: any) => {
      const participants = (reg.participants || [])
        .map((p: any) => `${p.name} (Age: ${p.age})`)
        .join('\n');
      return [
        reg.churchName || '',
        reg.confirmationDate
          ? new Date(reg.confirmationDate).toLocaleDateString()
          : '',
        reg.counsellingDate || '',
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
    });

    doc.save('pre-confirmation-registrations.pdf');
  }
}
