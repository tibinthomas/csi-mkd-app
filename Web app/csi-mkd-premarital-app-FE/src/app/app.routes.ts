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
        loadComponent: () => import('./about/about').then((m) => m.About),
      },
      {
        path: 'feedback',
        loadComponent: () =>
          import('./feedback/feedback').then((m) => m.Feedback),
      },
      {
        path: 'feedback-list',
        loadComponent: () =>
          import('./feedback-list/feedback-list').then((m) => m.FeedbackList),
      },
      {
        path: 'team-members',
        loadComponent: () =>
          import('./team-members/team-members').then((m) => m.TeamMembers),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./register/register').then((m) => m.Register),
      },
      {
        path: 'register/premarital-register',
        loadComponent: () =>
          import('./register/premarital-register/premarital-register').then(
            (m) => m.PremaritalRegister
          ),
      },
      {
        path: 'register/general-register',
        loadComponent: () =>
          import('./register/general-register/general-register').then(
            (m) => m.GeneralRegister
          ),
      },
      {
        path: 'register/pre-confirm-register',
        loadComponent: () =>
          import('./register/pre-confirm-register/pre-confirm-register').then(
            (m) => m.PreConfirmRegister
          ),
      },
      {
        path: 'sessions',
        loadComponent: () =>
          import('./sessions/sessions').then((m) => m.Sessions),
      },
      {
        path: 'register/premarital-register/:sessionId',
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
        loadComponent: () =>
          import('./admin/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'premarital',
        loadComponent: () =>
          import('./admin/premarital/premarital').then(
            (m) => m.PremaritalComponent
          ),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'session-config',
        loadComponent: () =>
          import('./admin/session-config/session-config').then(
            (m) => m.SessionConfig
          ),
      },
      {
        path: 'general-list',
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
