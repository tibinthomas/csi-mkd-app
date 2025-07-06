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

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    LanguageSelectorComponent,
  ],
  template: `
    <mat-sidenav-container class="h-screen">
      <mat-sidenav
        #sidenav
        [mode]="isMobile() ? 'over' : 'side'"
        [opened]="!isMobile() || sidenavOpen()"
        (openedChange)="sidenavOpen.set($event)"
      >
        <mat-toolbar color="primary">CSI Admin</mat-toolbar>
        <mat-nav-list>
          <a
            mat-list-item
            routerLink="/admin/dashboard"
            routerLinkActive="active-link"
            >Dashboard</a
          >
          <a
            mat-list-item
            routerLink="/admin/premarital"
            routerLinkActive="active-link"
            >Premarital List</a
          >
          <a
            mat-list-item
            routerLink="/admin/session-config"
            routerLinkActive="active-link"
            >Session Configuration</a
          >
          <a mat-list-item routerLink="/admin/login">Logout</a>
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar>
          <button mat-icon-button (click)="toggleSidenav()">
            <mat-icon>{{ sidenavOpen() ? 'close' : 'menu' }}</mat-icon>
          </button>

          <span class="flex-auto"></span>
          <app-language-selector></app-language-selector>
        </mat-toolbar>
        <main class="p-4">
          <router-outlet></router-outlet>
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
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
