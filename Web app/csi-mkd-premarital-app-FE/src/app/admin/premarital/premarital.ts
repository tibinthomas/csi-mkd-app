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
  baseApiUrl = API_ROOT_URL;
  private readonly premaritalRegisterService = inject(
    PremaritalRegisterService
  );

  protected readonly selectedReg = signal<any | null>(null);
  protected readonly showAllDetails = signal(false);
  private readonly refreshTrigger = signal(0);
  protected readonly filterValue = signal('');
  expandedElement: any = null;

  @ViewChild('pdfContent', { static: false })
  private readonly pdfContent!: ElementRef;

  private readonly registrations$ = toObservable(this.refreshTrigger).pipe(
    switchMap(() =>
      this.premaritalRegisterService.apiPremaritalRegisterGet().pipe(
        map((data: any) => {
          const parsedData = typeof data === 'string' ? JSON.parse(data) : data;

          return parsedData.map((item: any) => ({
            ...item,
            ChurchActivities: JSON.parse(item.ChurchActivitiesJson ?? '{}'), // safely parse the nested JSON
          }));
        }),
        catchError((err) => {
          console.error('Error loading registrations:', err);
          return of([]);
        })
      )
    )
  );

  protected readonly registrations = toSignal(this.registrations$, {
    initialValue: [],
  });

  protected readonly filteredData = computed(() => {
    const filter = this.filterValue().trim().toLowerCase();
    if (!filter) return this.registrations();

    return this.registrations().filter(
      (reg: any) =>
        reg.Name?.toLowerCase().includes(filter) ||
        reg.Email?.toLowerCase().includes(filter) ||
        reg.Phone?.toLowerCase().includes(filter)
    );
  });

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
    const updated = {
      ...reg,
      paymentStatus: !reg.paymentStatus,
    };
    this.premaritalRegisterService
      .apiPremaritalRegisterIdPaymentstatusPut({ id: reg.Id, body: updated })
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
    this.filterValue.set(filterValue);
  }

  clearFilter() {
    this.filterValue.set('');
  }
}
