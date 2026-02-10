import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  computed,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  catchError,
  map,
  of,
  switchMap,
} from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { FormsModule } from '@angular/forms';
import {
  MatFormField,
  MatFormFieldModule,
  MatLabel,
} from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  MatDialog,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CsiMkdPremaritalAppBeService as ApiService } from '../../../api/api-main-app/services';
import {
  ChurchDataService,
} from '../../core/services/church-data.service';
import {
  CertificateService,
  CertificateType,
} from '../../core/services/certificate.service';
import { CertificatePreviewDialog } from '../../shared/components/certificate-preview-dialog/certificate-preview-dialog';
import { ParticipantOutsideKeralaDto, PremaritalOutsideKeralaRegisterDto } from '../../../api/api-main-app/models';

@Component({
  selector: 'app-abroad-premarital-list',
  templateUrl: './abroad-premarital-list.html',
  styleUrl: './abroad-premarital-list.scss',
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
    MatPaginatorModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatTooltipModule,
    MatDialogModule,
  ],
})
export class AbroadPremaritalListComponent {
  private readonly dialog = inject(MatDialog);
  private readonly api = inject(ApiService);
  private readonly churchDataService = inject(ChurchDataService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly certificateService = inject(CertificateService);

  protected readonly totalCount = signal(0);
  protected readonly searchTermInput = signal<string>('');
  protected readonly searchTerm = signal<string>('');
  protected readonly unapprovedOnly = signal<boolean>(false);
  protected readonly pageIndex = signal<number>(0);
  protected readonly pageSize = signal<number>(10);
  private readonly filterTrigger = signal(0);
  protected readonly isLoading = signal<boolean>(false);
  readonly isApproving = signal<number | null>(null);
  readonly isDeleting = signal<number | null>(null);
  readonly printedParticipants = signal<Set<string>>(new Set());
  readonly lastClickedId = signal<number | null>(null);
  expandedElement: any = null;

  protected readonly churchData = toSignal(this.churchDataService.churchData$, {
    initialValue: null,
  });

  // Fetch registrations from API
  private readonly registrations$ = toObservable(
    computed(() => [
      this.filterTrigger(),
      this.pageIndex(),
      this.pageSize(),
      this.searchTerm(),
      this.unapprovedOnly(),
    ])
  ).pipe(
    switchMap(
      ([_, pageIndex, pageSize, searchTerm, unapproved]) => {
        this.isLoading.set(true);
        
        // Call the API to get all abroad registrations
        return this.api.apiPremaritalregisterOutsideKeralaGet().pipe(
          map((response: any) => {
            console.log('Raw API Response:', response);
            console.log('Response type:', typeof response);
            
            // Parse response if it's a string
            const data = typeof response === 'string' ? JSON.parse(response) : response;
            console.log('Parsed data:', data);
            
            // Handle array response
            let items = Array.isArray(data) ? data : (data?.items || []);
            console.log('Items extracted:', items);
            console.log('Items count:', items.length);
            
            // Apply client-side filtering for search
            if (searchTerm && typeof searchTerm === 'string') {
              const term = searchTerm.toLowerCase();
              items = items.filter((item: any) => {
                const participantNames = item.participants?.map((p: any) => p.name?.toLowerCase()).join(' ') || '';
                const churchName = this.getChurchNameById(item.churchId).toLowerCase();
                const priestName = (item.priestName || '').toLowerCase();
                
                return participantNames.includes(term) || 
                       churchName.includes(term) || 
                       priestName.includes(term);
              });
            }
            
            // Apply client-side filtering for unapproved only
            if (unapproved) {
              items = items.filter((item: any) => !item.paymentStatus);
            }
            
            // Set total count before pagination
            this.totalCount.set(items.length);
            console.log('Total count after filters:', items.length);
            
            // Apply client-side pagination
            const start = Number(pageIndex) * Number(pageSize);
            const paginatedItems = items.slice(start, start + Number(pageSize));
            
            this.isLoading.set(false);
            return paginatedItems;
          }),
          catchError((err) => {
            console.error('Error loading abroad registrations:', err);
            this.isLoading.set(false);
            this.totalCount.set(0);
            return of([]);
          })
        );
      }
    )
  );

  protected readonly registrations = toSignal(this.registrations$, {
    initialValue: [],
  });
  readonly tableData = computed(() => this.registrations());



  searchRegistrations() {
    this.searchTerm.set(this.searchTermInput().trim());
    this.pageIndex.set(0);
  }

  clearFilters() {
    this.searchTermInput.set('');
    this.unapprovedOnly.set(false);
    this.searchRegistrations();
  }

  onPageChange(event: any) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  toggle(reg: any) {
    this.expandedElement = this.isExpanded(reg) ? null : reg;
    this.lastClickedId.set(reg.id);
  }

  isExpanded(reg: any) {
    return this.expandedElement === reg;
  }

  getChurchNameById(churchId: number | null): string {
    if (!churchId) return 'N/A';
    const data = this.churchData();
    if (!data || !Array.isArray(data.churches)) return 'Unknown Church';
    const church = data.churches.find((c: any) => c.id === churchId);
    return church?.name || 'Unknown Church';
  }

  approvePayment(reg: any): void {
    // TODO: Implement payment approval for abroad registrations
    this.snackBar.open('Payment approval not yet implemented', 'Close', {
      duration: 3000,
    });
  }

  deleteRegistration(reg: any): void {
    const participantNames = this.formatParticipants(reg.participants);
    const confirmed = confirm(`Are you sure you want to delete the registration for ${participantNames}?`);
    
    if (confirmed) {
      this.isDeleting.set(reg.id);
      
      this.api.apiPremaritalregisterOutsideKeralaIdDelete({ id: reg.id.toString() })
        .subscribe({
          next: () => {
            this.isDeleting.set(null);
            this.snackBar.open('Registration deleted successfully', 'Close', {
              duration: 3000,
            });
            // Refresh the list
            this.filterTrigger.set(this.filterTrigger() + 1);
          },
          error: (err) => {
            this.isDeleting.set(null);
            console.error('Delete failed', err);
            this.snackBar.open('Failed to delete registration. Please try again.', 'Close', {
              duration: 3000,
            });
          },
        });
    }
  }

  formatParticipants(participants: any[]): string {
    if (!participants || participants.length === 0) return 'N/A';
    return participants.map((p: any) => p.name).join(', ');
  }

  formatDate(date: string | Date | null, timezone?: string): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    
    // Format in IST
    const istOptions: Intl.DateTimeFormatOptions = { 
      timeZone: 'Asia/Kolkata', 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    };
    const istDate = d.toLocaleDateString('en-GB', istOptions);
    
    if (!timezone || timezone === 'Asia/Kolkata') {
      return `${istDate}`;
    }

    // Format in Local Timezone
    try {
      const localOptions: Intl.DateTimeFormatOptions = { 
        timeZone: timezone, 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      };
      const localDate = d.toLocaleDateString('en-GB', localOptions);
      return `${localDate}`;
    } catch (e) {
      return `${istDate}`;
    }
  }

  getParticipantKey(regId: any, participant: ParticipantOutsideKeralaDto): string {
    if (participant.name) return participant.name;
    // Fallback composite key
    return `${regId}_${participant.name}`;
  }
  

  isPrinted(participant: ParticipantOutsideKeralaDto, reg: PremaritalOutsideKeralaRegisterDto): boolean {
    const key = this.getParticipantKey((reg as any).id, participant);
    return this.printedParticipants().has(key);
  }
  
  resetPrintStatus(participant: ParticipantOutsideKeralaDto, reg: PremaritalOutsideKeralaRegisterDto): void {
    const key = this.getParticipantKey((reg as any).id, participant);
    this.printedParticipants.update(set => {
      const newSet = new Set(set);
      newSet.delete(key);
      return newSet;
    });
  }

  async generateCertificate(
    participant: ParticipantOutsideKeralaDto,
    registration: PremaritalOutsideKeralaRegisterDto
  ): Promise<void> {
    try {
      let sessionStartDate: Date | undefined;
      let sessionEndDate: Date | undefined;
      let sessionDates: Date[] = [];

      if (registration.sessionStartDate) {
        sessionDates.push(new Date(registration.sessionStartDate));
      }

      const certificateData = {
        name: `${participant.name}`,
        completionDate: new Date(),
        sessionName: 'Premarital Counseling',
        churchName:
          this.getChurchNameById(registration.churchId ?? null) || 'Unknown Church',
        priestName: registration.priestName,
        dates: sessionDates,
        programDuration: `1 Day`,
        sessionStartDate,
        sessionEndDate,
      };

      const htmlContent = await this.certificateService.previewCertificate(
        certificateData,
        CertificateType.PRE_MARITAL
      );

      this.openCertificatePreview(htmlContent, certificateData);
      
      // Mark as printed
      const key = this.getParticipantKey((registration as any).id, participant);
      this.printedParticipants.update(set => {
        const newSet = new Set(set);
        newSet.add(key);
        return newSet;
      });
      
    } catch (error) {
      console.error('Error generating certificate:', error);
      this.snackBar.open(`Failed to generate certificate: ${error}`, 'OK', {
        duration: 5000,
      });
    }
  }

  private openCertificatePreview(htmlContent: string, data: any): void {
    this.dialog.open(CertificatePreviewDialog, {
      data: { 
        htmlContent, 
        certificateData: data,
        certificateType: CertificateType.PRE_MARITAL
      },
      width: '95vw',
      height: '95vh',
      maxWidth: '95vw',
      maxHeight: '95vh',
      panelClass: 'full-screen-dialog',
    });
  }
  
}
