import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  inject,
  signal,
  computed,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, switchMap } from 'rxjs';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { PremaritalRegisterService } from '../../../api/services/premarital-register.service';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { FormsModule } from '@angular/forms';
import {
  MatFormField,
  MatFormFieldModule,
  MatLabel,
} from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-premarital-list',
  templateUrl: './premarital.html',
  styleUrl: './premarital.scss',

  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    FormsModule,
    MatFormField,
    MatLabel,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    NgOptimizedImage,
    MatPaginatorModule,
    MatCheckboxModule,
  ],
  animations: [
    trigger('detailExpand', [
      state(
        'collapsed',
        style({ height: '0px', minHeight: '0', display: 'none' })
      ),
      state('expanded', style({ height: '*', display: 'block' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class PremaritalComponent {
  private readonly dialog = inject(MatDialog);
  private readonly premaritalRegisterService = inject(
    PremaritalRegisterService
  );

  protected readonly selectedReg = signal<any | null>(null);
  protected readonly showAllDetails = signal(false);
  private readonly refreshTrigger = signal(0);
  protected readonly totalCount = signal(0);
  // This one is bound to the input box
  protected readonly searchTermInput = signal<string>('');

  // This is used in the actual API request (only updated on search click)
  protected readonly searchTerm = signal<string>('');
  protected readonly unapprovedOnly = signal<boolean>(false);
  protected readonly activeSessionOnly = signal<boolean>(false);
  protected readonly pageIndex = signal<number>(0);
  protected readonly pageSize = signal<number>(10);
  @ViewChild('pdfContent', { static: false })
  private readonly pdfContent!: ElementRef;
  private readonly filterTrigger = signal(0);

  baseApiUrl = API_ROOT_URL;
  expandedElement: any = null;

  private readonly registrations$ = toObservable(
    computed(() => [
      this.filterTrigger(),
      this.pageIndex(),
      this.pageSize(),
      this.searchTerm(),
      this.unapprovedOnly(),
      this.activeSessionOnly(),
    ])
  ).pipe(
    switchMap(
      ([_, pageIndex, pageSize, searchTerm, unapproved, activeSession]) =>
        this.premaritalRegisterService
          .apiPremaritalRegisterFilterGet({
            Page: (pageIndex as number) + 1,
            PageSize: pageSize as number,
            Search: searchTerm as string,
            UnapprovedOnly: unapproved as boolean,
            ActiveSessionOnly: activeSession as boolean,
          })
          .pipe(
            map((response: any) => {
              const data =
                typeof response === 'string' ? JSON.parse(response) : response;
              this.totalCount.set(data.totalCount || 0);

              return (data.items ?? []).map((item: any) => ({
                ...item,
                ChurchActivities: JSON.parse(item.ChurchActivitiesJson ?? '{}'),
              }));
            }),
            catchError((err) => {
              console.error('Error loading filtered data:', err);
              return of([]);
            })
          )
    )
  );

  protected readonly registrations = toSignal(this.registrations$, {
    initialValue: [],
  });

  searchRegistrations() {
    this.searchTerm.set(this.searchTermInput().trim());
    this.pageIndex.set(0); // Reset pagination
  }

  clearFilters() {
    this.searchTerm.set('');
    this.unapprovedOnly.set(false);
    this.activeSessionOnly.set(false);
    this.searchRegistrations();
  }

  onPageChange(event: any) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  /** Toggles the expanded state of an element. */
  toggle(reg: any) {
    this.expandedElement = this.isExpanded(reg) ? null : reg;
  }

  isExpanded(reg: any) {
    return this.expandedElement === reg;
  }

  hasActivities(activities: any): boolean {
    return (
      activities?.choirMember ||
      activities?.ssTeacher ||
      activities?.youthFellowship ||
      (activities?.other && activities.other.trim() !== '')
    );
  }

  getSelectedActivities(activities: any): string[] {
    const labels: { [key: string]: string } = {
      choirMember: 'Choir Member',
      ssTeacher: 'Sunday School Teacher',
      youthFellowship: 'Youth Fellowship',
    };

    const selected: string[] = [];

    for (const key in labels) {
      if (activities?.[key]) selected.push(labels[key]);
    }

    if (activities?.other?.trim()) {
      selected.push(activities.other);
    }

    return selected;
  }

  approvePayment(reg: any): void {
    const dialogRef = this.dialog.open(ConfirmationDialog);

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        const updated = {
          ...reg,
          paymentStatus: !reg.paymentStatus,
        };
        this.premaritalRegisterService
          .apiPremaritalRegisterIdPaymentstatusPut({
            id: reg.Id,
            body: updated,
          })
          .subscribe({
            next: () => {
              reg.PaymentStatus = 'Received';
              this.refreshTrigger.set(this.refreshTrigger() + 1);
            },
            error: (err) => {
              console.error('Payment update failed', err);
              alert('Failed to update payment status. Please try again.');
            },
          });
      }
    });
  }

  async downloadAsPDF() {
    try {
      this.showAllDetails.set(true);
      await new Promise((resolve) => setTimeout(resolve, 500));

      const data = this.pdfContent.nativeElement;
      const canvas = await html2canvas(data, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('premarital-registrations.pdf');
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate PDF.');
    } finally {
      this.showAllDetails.set(false);
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    filterValue.trim().toLowerCase();
    this.searchTerm.set(filterValue);
  }

  clearFilter() {
    this.searchTerm.set('');
  }
}

@Component({
  selector: 'confirmation-dialog',
  template: `
    <h2 mat-dialog-title>Confirm Approval</h2>
    <mat-dialog-content
      >Are you sure you want to approve this payment?</mat-dialog-content
    >
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close(false)">Cancel</button>
      <button mat-raised-button color="primary" (click)="dialogRef.close(true)">
        Approve
      </button>
    </mat-dialog-actions>
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
