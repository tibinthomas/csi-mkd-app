import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AnimateOnScrollDirective } from '../shared/directives/animate-on-scroll.directive';
import { DONATION_CONFIG } from '../config/support-config';

interface ImpactItem {
  readonly icon: string;
  readonly title: string;
  readonly description: string;
}

@Component({
  selector: 'app-donate',
  templateUrl: './donate.html',
  styleUrl: './donate.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatSnackBarModule,
    AnimateOnScrollDirective,
  ],
})
export class Donate {
  private readonly snackBar = inject(MatSnackBar);

  readonly config = DONATION_CONFIG;

  readonly hasOnlineMethod =
    this.config.upiId !== '' ||
    this.config.razorpayPageUrl !== '' ||
    this.config.bankTransfer !== null;

  readonly upiDeepLink = this.config.upiId
    ? `upi://pay?pa=${encodeURIComponent(this.config.upiId)}&pn=${encodeURIComponent(this.config.upiPayeeName)}&cu=INR`
    : '';

  readonly pageContent = {
    title: $localize`:@@Donate Page Title:Support Our Ministry`,
    subtitle: $localize`:@@Donate Page Subtitle:Your generosity keeps confidential, affordable counselling within everyone's reach.`,
    intro: $localize`:@@Donate Page Intro:The CSI Counselling Centre serves couples, families, students, and individuals across the Madhya Kerala Diocese. Every contribution — however small — helps us subsidise sessions, train counsellors, and reach schools and parishes throughout Kerala.`,
    scripture: $localize`:@@Donate Scripture:“Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver.”`,
    scriptureRef: $localize`:@@Donate Scripture Reference:– 2 Corinthians 9:7`,
    receiptNote: $localize`:@@Donate Receipt Note:For donation receipts or any questions about giving, please contact the Centre office.`,
  };

  readonly impactItems: readonly ImpactItem[] = [
    {
      icon: 'diversity_1',
      title: $localize`:@@Donate Impact Counselling Title:Subsidised Counselling`,
      description: $localize`:@@Donate Impact Counselling Description:Keep individual, couple, and family sessions affordable for every household.`,
    },
    {
      icon: 'school',
      title: $localize`:@@Donate Impact Outreach Title:School & College Outreach`,
      description: $localize`:@@Donate Impact Outreach Description:Bring the SHAPE empowerment programme to more students across Kerala.`,
    },
    {
      icon: 'church',
      title: $localize`:@@Donate Impact Camps Title:Residential Camps`,
      description: $localize`:@@Donate Impact Camps Description:Support the monthly three-day premarital camps and pre-confirmation programmes.`,
    },
  ] as const;

  copyToClipboard(value: string, label: string): void {
    navigator.clipboard.writeText(value).then(
      () => {
        this.snackBar.open(
          $localize`:@@Donate Copied Message:${label}:label: copied to clipboard`,
          $localize`:@@Donate Snackbar Close:Close`,
          { duration: 3000 },
        );
      },
      () => {
        this.snackBar.open(
          $localize`:@@Donate Copy Failed Message:Could not copy. Please copy it manually.`,
          $localize`:@@Donate Snackbar Close:Close`,
          { duration: 3000 },
        );
      },
    );
  }
}
