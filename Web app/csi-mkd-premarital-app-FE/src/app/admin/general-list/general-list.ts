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
import { NgOptimizedImage } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
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
import { CsiMkdPremaritalAppBeService } from '../../../api/api-main-app/services';
import { ChurchDataService } from '../../core/services/church-data.service';

@Component({
  selector: 'app-general-list',
  templateUrl: './general-list.html',
  styleUrl: './general-list.scss',

  changeDetection: ChangeDetectionStrategy.OnPush,

  imports: [
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
    MatCardModule
],
})
export class GeneralList {
  private readonly dialog = inject(MatDialog);
  private readonly api = inject(CsiMkdPremaritalAppBeService);
  private readonly churchDataService = inject(ChurchDataService);

  protected readonly selectedReg = signal<any | null>(null);
  protected readonly showAllDetails = signal(false);
  private readonly refreshTrigger = signal(0);
  protected readonly totalCount = signal(0);
  // This one is bound to the input box
  protected readonly searchTermInput = signal<string>('');

  // This is used in the actual API request (only updated on search click)
  protected readonly searchTerm = signal<string>('');
  protected readonly unapprovedOnly = signal<boolean>(false);
  protected readonly pageIndex = signal<number>(0);
  protected readonly pageSize = signal<number>(10);
  @ViewChild('pdfContent', { static: false })
  private readonly pdfContent!: ElementRef;
  private readonly filterTrigger = signal(0);
  protected readonly isLoading = signal<boolean>(false);
  readonly isApproving = signal<number | null>(null);
  private _snackBar = inject(MatSnackBar);

  protected readonly churchData = toSignal(this.churchDataService.churchData$, {
    initialValue: null,
  });

  baseApiUrl = API_ROOT_URL_MAIN_APP;
  expandedElement: any = null;
  disableSelect = new FormControl(false);

  private readonly registrations$ = toObservable(
    computed(() => [
      this.filterTrigger(),
      this.pageIndex(),
      this.pageSize(),
      this.searchTerm(),
      this.unapprovedOnly(),
    ])
  ).pipe(
    switchMap(([_, pageIndex, pageSize, searchTerm, unapproved]) => {
      this.isLoading.set(true); // start spinner
      return this.api
        .apiGeneralregisterFilterGet({
          page: (pageIndex as number) + 1,
          pageSize: pageSize as number,
          search: searchTerm as string,
          unapprovedOnly: unapproved as boolean,
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
    })
  );

  protected readonly registrations = toSignal(this.registrations$, {
    initialValue: [],
  });

  searchRegistrations() {
    this.searchTerm.set(this.searchTermInput().trim());
    this.pageIndex.set(0); // Reset pagination
  }

  clearFilters() {
    this.searchTermInput.set('');
    this.unapprovedOnly.set(false);
    this.searchRegistrations();
  }

  onUnapprovedChange(checked: boolean) {
    this.unapprovedOnly.set(checked);
    this.pageIndex.set(0); // Reset pagination
    this.filterTrigger.set(this.filterTrigger() + 1); // Trigger new API call
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

  approvePayment(reg: any): void {
    const dialogRef = this.dialog.open(ConfirmationDialog);

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.isApproving.set(reg.id);

        const updated = {
          ...reg,
          paymentStatus: !reg.paymentStatus,
        };
        this.api
          .apiGeneralregisterIdPaymentstatusPut({
            id: reg.id,
            body: updated,
          })
          .subscribe({
            next: () => {
              reg.paymentStatus = !reg.paymentStatus;
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
            ['Full Name', `${reg.firstName} ${reg.lastName}`],
            ['Sex', reg.sex],
            ['Age', reg.age],
            ['Email', reg.email],
            ['Phone', reg.phone],
            ['Father Name', reg.fatherName],
            ['Address', reg.address],
            ['Education', reg.education],
            ['Occupation', reg.occupation],
            ['Church', this.getChurchDisplayName(reg.churchId, reg.priestName)],
            ['Session Type', reg.sessionType],
            ['Payment Status', reg.paymentStatus ? 'Received' : 'Pending'],
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
        if (reg.photoUrl) {
          try {
            const imageData = await this.getBase64ImageFromUrl(reg.photoUrl);
            doc.addImage(imageData, 'JPEG', 400, baseY + 20, 100, 100);
          } catch (e) {
            console.warn('Could not load image', e);
          }
        }
      }

      doc.save('general-registrations-full.pdf');
    }
  }

  handleDownload(): void {
    if (this.registrations().length) {
      this.downloadAsPDF();
    } else {
      this._snackBar.open($localize`There are no registrations to download`, $localize`OK`);
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

  getChurchDisplayName(
    churchId: number | null | undefined,
    priestName: string | null | undefined
  ): string {
    const churchName = this.churchDataService.getChurchNameById(
      churchId,
      this.churchData()
    );
    return `${churchName}${priestName ? ` (${priestName})` : ''}`;
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
        this.api.apiGeneralregisterIdDelete({ id: reg.id }).subscribe({
          next: () => {
            this.isLoading.set(false);
            this._snackBar.open($localize`Registration deleted successfully`, $localize`OK`, {
              duration: 3000,
            });
            this.filterTrigger.set(this.filterTrigger() + 1);
          },
          error: (err) => {
            this.isLoading.set(false);
            console.error('Deletion failed', err);
            this._snackBar.open(
              $localize`Failed to delete registration. Please try again.`,
              $localize`OK`,
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
  selector: 'confirmation-dialog',
  template: `
    <h2 mat-dialog-title>Confirm Approval</h2>
    <mat-dialog-content
      >Are you sure you want to approve this payment?</mat-dialog-content
    >
    <mat-dialog-actions align="end">
      <button mat-flat-button color="primary" (click)="dialogRef.close(true)">
        Approve
      </button>
      <button mat-stroked-button (click)="dialogRef.close(false)">
        Cancel
      </button>
    </mat-dialog-actions>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
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
  selector: 'delete-confirmation-dialog',
  template: `
    <h2 mat-dialog-title>Confirm Deletion</h2>
    <mat-dialog-content
      >Are you sure you want to delete this registration?</mat-dialog-content
    >
    <mat-dialog-actions align="end">
      <button mat-flat-button color="warn" (click)="dialogRef.close(true)">
        Delete
      </button>
      <button mat-stroked-button (click)="dialogRef.close(false)">
        Cancel
      </button>
    </mat-dialog-actions>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MatDialogModule, MatButtonModule],
})
export class DeleteConfirmationDialog {
  dialogRef = inject<MatDialogRef<DeleteConfirmationDialog>>(MatDialogRef);
}
