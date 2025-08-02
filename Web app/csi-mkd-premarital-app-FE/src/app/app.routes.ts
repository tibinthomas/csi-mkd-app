import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  // Public routes wrapped inside PublicLayout
  {
    path: '',
    loadComponent: () =>
      import('./layouts/public-layout').then((m) => m.PublicLayout),
    children: [
      { path: '', redirectTo: 'about', pathMatch: 'full' },
      {
        path: 'about',
        title: 'About Us - CSI MKD Premarital Counsel',
        loadComponent: () => import('./about/about').then((m) => m.About),
      },
      {
        path: 'feedback',
        title: 'Feedback - CSI MKD Premarital Counsel',
        loadComponent: () =>
          import('./feedback/feedback').then((m) => m.Feedback),
      },
      {
        path: 'feedback-list',
        title: 'Feedback List - CSI MKD Premarital Counsel',
        loadComponent: () =>
          import('./feedback-list/feedback-list').then((m) => m.FeedbackList),
      },
      {
        path: 'team-members',
        title: 'Our Team - CSI MKD Premarital Counsel',
        loadComponent: () =>
          import('./team-members/team-members').then((m) => m.TeamMembers),
      },
      {
        path: 'register',
        title: 'Register - CSI MKD Premarital Counsel',
        loadComponent: () =>
          import('./register/register').then((m) => m.Register),
      },
      {
        path: 'register/premarital-register',
        title: 'Premarital Registration - CSI MKD Premarital Counsel',
        loadComponent: () =>
          import('./register/premarital-register/premarital-register').then(
            (m) => m.PremaritalRegister
          ),
      },
      {
        path: 'register/general-register',
        title: 'General Registration - CSI MKD Premarital Counsel',
        loadComponent: () =>
          import('./register/general-register/general-register').then(
            (m) => m.GeneralRegister
          ),
      },
      {
        path: 'register/pre-confirm-register',
        title: 'Confirmation - CSI MKD Premarital Counsel',
        loadComponent: () =>
          import('./register/pre-confirm-register/pre-confirm-register').then(
            (m) => m.PreConfirmRegister
          ),
      },
      {
        path: 'sessions',
        title: 'Counselling Sessions - CSI MKD Premarital Counsel',
        loadComponent: () =>
          import('./sessions/sessions').then((m) => m.Sessions),
      },
      {
        path: 'register/premarital-register/:sessionId',
        title: 'Premarital Registration - CSI MKD Premarital Counsel',
        loadComponent: () =>
          import('./register/premarital-register/premarital-register').then(
            (m) => m.PremaritalRegister
          ),
      },
    ],
  },

  // Admin login is public, outside admin layout
  {
    path: 'admin/login',
    title: 'Admin Login - CSI MKD Premarital Counsel',
    loadComponent: () =>
      import('./admin/login/login').then((m) => m.AdminLogin),
  },

  // Admin protected routes wrapped inside AdminLayout
  {
    path: 'admin',
    loadComponent: () =>
      import('./layouts/admin-layout').then((m) => m.AdminLayout),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        title: 'Admin Dashboard - CSI MKD Premarital Counsel',
        loadComponent: () =>
          import('./admin/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'premarital',
        title: 'Premarital Registrations - CSI MKD Premarital Counsel',
        loadComponent: () =>
          import('./admin/premarital/premarital').then(
            (m) => m.PremaritalComponent
          ),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'session-config',
        title: 'Session Configuration - CSI MKD Premarital Counsel',
        loadComponent: () =>
          import('./admin/session-config/session-config').then(
            (m) => m.SessionConfig
          ),
      },
      {
        path: 'general-list',
        title: 'General Registrations - CSI MKD Premarital Counsel',
        loadComponent: () =>
          import('./admin/general-list/general-list').then(
            (m) => m.GeneralList
          ),
      },
    ],
  },

  // Optional wildcard route to catch unmatched routes
  // { path: '**', redirectTo: '' },
];
