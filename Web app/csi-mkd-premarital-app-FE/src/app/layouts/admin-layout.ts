import {
  Component,
  ViewChild,
  AfterViewInit,
  signal,
  effect,
} from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink, RouterOutlet } from '@angular/router';
import { LanguageSelectorComponent } from '../shared/language-selector/language-selector';
import { ThemeToggle } from '../shared/theme-toggle/theme-toggle';

@Component({
  selector: 'app-admin-layout',

  imports: [
    RouterOutlet,
    RouterLink,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    LanguageSelectorComponent,
    ThemeToggle,
  ],
  styleUrl: './admin-layout.scss',
  templateUrl: './admin-layout.html',
})
export class AdminLayout implements AfterViewInit {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  isMobile = signal(window.innerWidth < 768);
  sidenavOpen = signal(false);

  constructor() {
    window.onresize = () => {
      const mobile = window.innerWidth < 768;
      this.isMobile.set(mobile);

      // Auto-close the sidenav on resize to mobile
      if (mobile) {
        this.sidenavOpen.set(false);
      } else {
        this.sidenavOpen.set(true);
      }
    };
  }

  ngAfterViewInit(): void {
    this.sidenav.openedChange.subscribe((opened) => {
      this.sidenavOpen.set(opened);
    });
  }

  toggleSidenav(): void {
    this.sidenav.toggle();
  }
}
