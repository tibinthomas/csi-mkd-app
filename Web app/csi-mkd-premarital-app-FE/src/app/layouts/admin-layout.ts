import { Component } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink, RouterOutlet } from '@angular/router';
import { LanguageSelectorComponent } from '../shared/language-selector/language-selector';

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
  ],
  template: `
    <mat-sidenav-container class="h-screen">
      <mat-sidenav #sidenav mode="side" [opened]="!isMobile">
        <mat-toolbar color="primary">
          <span>CSI Admin</span>
        </mat-toolbar>
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
          @if (isMobile) {
          <button mat-icon-button (click)="sidenav.toggle()">
            <mat-icon>menu</mat-icon>
          </button>
          }
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
export class AdminLayout {
  isMobile = false;

  constructor() {
    this.isMobile = window.innerWidth < 768;
    window.onresize = () => {
      this.isMobile = window.innerWidth < 768;
    };
  }
}
