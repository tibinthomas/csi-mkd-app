import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CsiMkdPremaritalAppBeService } from '../../../api/services';
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
  private readonly api = inject(CsiMkdPremaritalAppBeService);

  readonly premaritalCount = signal(0);
  readonly generalCount = signal(0);
  readonly confirmationCount = signal(0);
  readonly totalCount = signal(0);

  ngOnInit(): void {
    forkJoin({
      premarital: this.api.apiPremaritalregisterTotalGet(),
      general: this.api.apiGeneralregisterTotalGet(),
      confirmation: this.api.apiConfirmationregisterTotalGet(),
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
