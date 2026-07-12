import {
  Component,
  ChangeDetectionStrategy,
  viewChild,
  signal,
  computed,
  inject,
  DestroyRef,
  afterNextRender,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSidenav } from '@angular/material/sidenav';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LanguageSelectorComponent } from '../shared/language-selector/language-selector';
import { ThemeToggle } from '../shared/theme-toggle/theme-toggle';
import { AuthService } from '../core/auth/auth.service';

interface NavigationItem {
  routerLink: string;
  icon: string;
  label: string;
}

@Component({
  selector: 'app-admin-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLayout {
  private readonly destroyRef = inject(DestroyRef);
  private readonly auth = inject(AuthService);

  readonly sidenav = viewChild.required<MatSidenav>('sidenav');

  readonly isMobile = signal(false);
  readonly sidenavOpen = signal(false);

  readonly navigationItems: NavigationItem[] = [
    { routerLink: '/admin/dashboard', icon: 'dashboard', label: 'Dashboard' },
    {
      routerLink: '/admin/premarital',
      icon: 'people',
      label: 'Premarital Register List',
    },
    {
      routerLink: '/admin/abroad-premarital',
      icon: 'flight',
      label: 'Abroad & Outside Kerala',
    },
    {
      routerLink: '/admin/session-config',
      icon: 'event',
      label: 'Premarital Session Config',
    },
    {
      routerLink: '/admin/instructors',
      icon: 'school',
      label: 'Instructors',
    },
    {
      routerLink: '/admin/deactivate-sessions',
      icon: 'disabled_by_default',
      label: 'Deactivate Sessions',
    },
    {
      routerLink: '/admin/general-list',
      icon: 'list_alt',
      label: 'General Register List',
    },
    {
      routerLink: '/admin/pre-confirm-list',
      icon: 'check_circle',
      label: 'Pre-Confirm List',
    },
    {
      routerLink: '/admin/app-feedback',
      icon: 'rate_review',
      label: 'App Feedback',
    },
    {
      routerLink: '/admin/database-backup',
      icon: 'backup',
      label: 'Database Backup',
    },
  ];

  readonly sidenavMode = computed(() => (this.isMobile() ? 'over' : 'side'));
  readonly sidenavOpened = computed(
    () => !this.isMobile() || this.sidenavOpen(),
  );
  readonly menuIcon = computed(() => (this.sidenavOpen() ? 'close' : 'menu'));

  constructor() {
    this.initializeResponsiveHandler();

    afterNextRender(() => {
      this.setupSidenavSubscription();
    });
  }

  private initializeResponsiveHandler(): void {
    this.updateMobileState();

    window.addEventListener('resize', () => {
      this.updateMobileState();
    });
  }

  private updateMobileState(): void {
    const mobile = window.innerWidth < 768;
    this.isMobile.set(mobile);

    if (mobile) {
      this.sidenavOpen.set(false);
    } else {
      this.sidenavOpen.set(true);
    }
  }

  private setupSidenavSubscription(): void {
    this.sidenav()
      .openedChange.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((opened) => {
        this.sidenavOpen.set(opened);
      });
  }

  toggleSidenav(): void {
    this.sidenav().toggle();
  }

  onNavItemClick(): void {
    if (this.isMobile()) {
      this.toggleSidenav();
    }
  }

  onLogout(): void {
    this.auth.logout(); // This clears tokens and navigates to login
  }
}
