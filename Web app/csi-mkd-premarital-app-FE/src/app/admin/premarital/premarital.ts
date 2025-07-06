import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  ViewChild,
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
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

@Component({
  selector: 'app-premarital-list',
  templateUrl: './premarital.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    NgOptimizedImage,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
  ],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class PremaritalComponent {
  displayedColumns: string[] = [
    'name',
    'sex',
    'age',
    'phone',
    'email',
    'sessionName',
    'photoPath',
    'vicarLetterPath',
    'paymentStatus',
  ];
  private readonly premaritalRegisterService = inject(
    PremaritalRegisterService
  );

  protected readonly selectedReg = signal<any | null>(null);
  protected readonly showAllDetails = signal(false);
  private readonly refreshTrigger = signal(0);

  @ViewChild('pdfContent', { static: false })
  private readonly pdfContent!: ElementRef;

  private readonly registrations$ = toObservable(this.refreshTrigger).pipe(
    switchMap(() =>
      this.premaritalRegisterService.apiPremaritalRegisterGet().pipe(
        map((data: any) => {
          const parsed = typeof data === 'string' ? JSON.parse(data) : data;
          return parsed.map((reg: any) => ({
            ...reg,
            churchActivities: reg.churchActivitiesJson
              ? JSON.parse(reg.churchActivitiesJson)
              : {},
          }));
        }),
        catchError((err) => {
          console.error('Error loading registrations:', err);
          return of([]); // fallback to empty array
        })
      )
    )
  );

  protected readonly registrations = toSignal(this.registrations$, {
    initialValue: [],
  });

  toggleDetails(reg: any): void {
    this.selectedReg.update((value) => (value === reg ? null : reg));
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
      if (activities?.[key]) {
        selected.push(labels[key]);
      }
    }

    if (activities?.other?.trim()) {
      selected.push(activities.other);
    }

    return selected;
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

  handleRowClick(event: MouseEvent, reg: any) {
    const target = event.target as HTMLElement;
    if (target.closest('button')) {
      return;
    }
    this.toggleDetails(reg);
  }

  markPaymentReceived(reg: any) {
    if (reg.paymentStatus) return;

    const updated = {
      ...reg,
      paymentStatus: true,
    };

    this.premaritalRegisterService
      .apiPremaritalRegisterIdPaymentstatusPut({
        id: reg.id,
        body: updated,
      })
      .pipe(
        catchError((err) => {
          console.error('Failed to mark payment as received:', err);
          alert('Failed to mark payment as received.');
          return of(null);
        })
      )
      .subscribe(() => {
        this.refreshTrigger.set(this.refreshTrigger() + 1);
      });
  }
}
