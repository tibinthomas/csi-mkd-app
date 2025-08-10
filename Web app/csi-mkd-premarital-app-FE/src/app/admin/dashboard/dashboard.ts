import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { PremaritalRegisterService } from '../../../api/services/premarital-register.service';
import { GeneralRegisterService } from '../../../api/services/general-register.service';
import { ConfirmationRegisterService } from '../../../api/services/confirmation-register.service';
import { forkJoin } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.html',
  imports: [MatCardModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard implements OnInit {
  private readonly premaritalService = inject(PremaritalRegisterService);
  private readonly generalService = inject(GeneralRegisterService);
  private readonly confirmationService = inject(ConfirmationRegisterService);

  readonly premaritalCount = signal(0);
  readonly generalCount = signal(0);
  readonly confirmationCount = signal(0);
  readonly totalCount = signal(0);

  ngOnInit(): void {
    forkJoin({
      premarital: this.premaritalService.apiPremaritalRegisterTotalGet(),
      general: this.generalService.apiGeneralRegisterTotalGet(),
      confirmation: this.confirmationService.apiConfirmationRegisterTotalGet(),
    }).subscribe((results: any) => {
      this.premaritalCount.set(JSON.parse(results.premarital).total);
      this.generalCount.set(JSON.parse(results.general).total);
      this.confirmationCount.set(JSON.parse(results.confirmation).total);

      this.totalCount.set(
        this.premaritalCount() + this.generalCount() + this.confirmationCount()
      );
    });
  }
}
