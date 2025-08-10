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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
import { FormControl, FormsModule } from '@angular/forms';
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
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { SessionConfigService } from '../../../api/services';
import { ApiSessionconfigGet$Params } from '../../../api/fn/session-config/api-sessionconfig-get';
import { ApiSessionconfigSessionsGet$Params } from '../../../api/fn/session-config/api-sessionconfig-sessions-get';
import { ApiSessionconfigPost$Params } from '../../../api/fn/session-config/api-sessionconfig-post';
import { CreateUpdateSessionDto } from '../../../api/models';

@Component({
  selector: 'app-premarital-list',
  templateUrl: './premarital.html',
  styleUrl: './premarital.scss',

  changeDetection: ChangeDetectionStrategy.OnPush,

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
    MatProgressSpinnerModule,
    MatSelectModule,
    MatCardModule,
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
  private readonly sessionConfigService = inject(SessionConfigService);

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
  protected readonly isLoading = signal<boolean>(false);
  // Store selected year
  readonly selectedYear = signal<number | null>(new Date().getFullYear());
  // Store selected session
  readonly selectedSession = signal<string | null>(null);
  private lastSelectedYear: number | null = null;
  readonly isApproving = signal<number | null>(null);
  private _snackBar = inject(MatSnackBar);

  baseApiUrl = API_ROOT_URL;
  expandedElement: any = null;
  disableSelect = new FormControl(false);

  private readonly registrations$ = toObservable(
    computed(() => [
      this.filterTrigger(),
      this.pageIndex(),
      this.pageSize(),
      this.searchTerm(),
      this.unapprovedOnly(),
      this.activeSessionOnly(),
      this.selectedYear(),
      this.selectedSession(),
    ])
  ).pipe(
    switchMap(
      ([
        _,
        pageIndex,
        pageSize,
        searchTerm,
        unapproved,
        activeSession,
        selectedYear,
        selectedSession,
      ]) => {
        // If selectedYear changed, reset selectedSession to null before calling API
        if (selectedSession !== null && this.shouldResetSession(selectedYear)) {
          this.selectedSession.set(null);
          selectedSession = null;
        }
        this.isLoading.set(true); // start spinner
        return this.premaritalRegisterService
          .apiPremaritalRegisterFilterGet({
            Page: (pageIndex as number) + 1,
            PageSize: pageSize as number,
            Search: searchTerm as string,
            UnapprovedOnly: unapproved as boolean,
            ActiveSessionOnly: activeSession as boolean,
            SessionYear: selectedYear as number,
            SessionName: selectedSession as string,
          })
          .pipe(
            map((response: any) => {
              const data =
                typeof response === 'string' ? JSON.parse(response) : response;
              this.totalCount.set(data.totalCount || 0);
              this.isLoading.set(false); // stop spinner
              return (data.items ?? []).map((item: any) => ({
                ...item,
                ChurchActivities: JSON.parse(item.ChurchActivitiesJson ?? '{}'),
              }));
            }),
            catchError((err) => {
              console.error('Error loading filtered data:', err);
              this.isLoading.set(false); // also stop on error
              return of([]);
            })
          );
      }
    )
  );

  private shouldResetSession(newYear: any): boolean {
    if (this.lastSelectedYear !== null && this.lastSelectedYear !== newYear) {
      this.lastSelectedYear = newYear;
      return true;
    }
    this.lastSelectedYear = newYear;
    return false;
  }

  protected readonly registrations = toSignal(this.registrations$, {
    initialValue: [],
  });

  private readonly sessions$ = this.sessionConfigService
    .apiSessionconfigGet()
    .pipe(
      map((data: any) => {
        const parsed = JSON.parse(data);
        return parsed.map((session: any) => ({
          ...session,
        }));
      }),
      catchError((err) => {
        console.error('Error loading sessions:', err);
        return of([]); // fallback to empty array
      })
    );

  protected readonly sessionList = toSignal(this.sessions$, {
    initialValue: [],
  });

  readonly sessionYears = computed(() => [
    ...new Set(
      this.sessionList().map((session: any) =>
        new Date(session.StartDate).getFullYear()
      )
    ),
  ]);

  readonly filteredSessionsByYear = computed(() => {
    const filtered = this.selectedYear()
      ? this.sessionList().filter(
          (session: any) =>
            new Date(session.StartDate).getFullYear() === this.selectedYear()
        )
      : this.sessionList();

    const uniqueSessionNames = new Set(filtered.map((s: any) => s.SessionName));
    return [
      ...Array.from(uniqueSessionNames).map((name) => ({ SessionName: name })),
    ];
  });

  searchRegistrations() {
    this.searchTerm.set(this.searchTermInput().trim());
    this.pageIndex.set(0); // Reset pagination
  }

  clearFilters() {
    this.searchTermInput.set('');
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
      activities?.ChoirMember ||
      activities?.SsTeacher ||
      activities?.YouthFellowship ||
      (activities?.Other && activities.Other.trim() !== '')
    );
  }

  getSelectedActivities(activities: any): string[] {
    const labels: { [key: string]: string } = {
      ChoirMember: 'Choir Member',
      SsTeacher: 'Sunday School Teacher',
      YouthFellowship: 'Youth Fellowship',
      Other: activities.Other,
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

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      this.isApproving.set(reg.Id);

      if (confirmed) {
        const updated = {
          ...reg,
          PaymentStatus: !reg.PaymentStatus,
        };
        this.premaritalRegisterService
          .apiPremaritalRegisterIdPaymentstatusPut({
            id: reg.Id,
            body: updated,
          })
          .subscribe({
            next: () => {
              reg.PaymentStatus = !reg.PaymentStatus;
              this.isApproving.set(null);

              this.refreshTrigger.set(this.refreshTrigger() + 1); // triggers new data from API
            },
            error: (err) => {
              this.isApproving.set(null);

              console.error('Payment update failed', err);
              alert('Failed to update payment status. Please try again.');
            },
          });
      }
    });
  }

  async downloadAsPDF(): Promise<void> {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    });

    doc.setFontSize(16);
    doc.text('Premarital Registrations Report', 40, 40);

    const data = this.registrations();
    if (data.length) {
      for (let index = 0; index < data.length; index++) {
        const reg = data[index];
        const yOffset = 60 + index * 180;

        if (yOffset > doc.internal.pageSize.height - 200) {
          doc.addPage();
        }

        const baseY = doc.lastAutoTable
          ? doc.lastAutoTable.finalY + 20
          : yOffset;

        autoTable(doc, {
          startY: baseY,
          head: [['Field', 'Value']],
          body: [
            ['Full Name', `${reg.FirstName} ${reg.LastName}`],
            ['Sex', reg.Sex],
            ['Age', reg.Age],
            ['Email', reg.Email],
            ['Phone', reg.Phone],
            ['Father Name', reg.FatherName],
            ['Address', reg.Address],
            ['Education', reg.Education],
            ['Occupation', reg.Occupation],
            ['Church', reg.ChurchName],
            ['Fiancé Name', reg.FianceName],
            ['Session Name', reg.SessionName],
            ['Session Days', reg.Days],
            [
              'Date of Marriage',
              new Date(reg.DateOfMarriage).toLocaleDateString(),
            ],
            [
              'Church Activities',
              this.getSelectedActivities(reg.ChurchActivities).join(', ') ||
                'None',
            ],
            ['Payment Status', reg.PaymentStatus ? 'Received' : 'Pending'],
            ['Vicar Letter', reg.VicarLetterUrl ? reg.VicarLetterUrl : 'N/A'],
          ],
          styles: {
            fontSize: 10,
            cellPadding: 4,
          },
          theme: 'grid',
          headStyles: {
            fillColor: [63, 81, 181],
            textColor: 255,
          },
          margin: { left: 40, right: 40 },
        });

        // Add photo image (if exists)
        if (reg.PhotoUrl) {
          try {
            const imageData = await this.getBase64ImageFromUrl(reg.PhotoUrl);
            doc.addImage(imageData, 'JPEG', 400, baseY + 20, 100, 100);
          } catch (e) {
            console.warn('Could not load image', e);
          }
        }
      }

      doc.save('premarital-registrations-full.pdf');
    }
  }

  handleDownload(): void {
    if (this.registrations().length) {
      this.downloadAsPDF();
    } else {
      this._snackBar.open('There are no registrations to download', 'OK');
    }
  }

  private async getBase64ImageFromUrl(imageUrl: string): Promise<string> {
    const res = await fetch(imageUrl);
    const blob = await res.blob();

    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject('Image conversion failed');
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
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
