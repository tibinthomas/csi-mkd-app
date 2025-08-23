import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { pendingChangesGuard } from './core/guards/pending-changes.guard';

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
        data: {
          description:
            'Learn more about the CSI Madhya Kerala Diocese Premarital Counselling Centre.',
        },
        loadComponent: () => import('./about/about').then((m) => m.About),
      },
      {
        path: 'feedback-questions',
        title: 'Feedback - CSI MKD Premarital Counsel',
        data: {
          description:
            'Provide feedback on your premarital counselling session.',
        },
        loadComponent: () =>
          import('./feedback-questions/feedback-questions').then(
            (m) => m.FeedbackQuestions
          ),
        canDeactivate: [pendingChangesGuard],
      },
      {
        path: 'feedback/:userId',
        title: 'Feedback - CSI MKD Premarital Counsel',
        data: {
          description:
            'Provide feedback on your premarital counselling session.',
        },
        loadComponent: () =>
          import('./feedback-questions/feedback/feedback').then(
            (m) => m.Feedback
          ),
        canDeactivate: [pendingChangesGuard],
      },
      {
        path: 'questions/:userId',
        title: 'Questions - CSI MKD Premarital Counsel',
        data: {
          description: 'Provide thoughts on your premarital counselling.',
        },
        loadComponent: () =>
          import('./feedback-questions/questions/questions').then(
            (m) => m.Questions
          ),
        canDeactivate: [pendingChangesGuard],
      },
      {
        path: 'feedback-list',
        title: 'Feedback List - CSI MKD Premarital Counsel',
        data: { description: 'View feedback from past participants.' },
        loadComponent: () =>
          import('./feedback-list/feedback-list').then((m) => m.FeedbackList),
      },
      {
        path: 'team-members',
        title: 'Our Team - CSI MKD Premarital Counsel',
        data: {
          description:
            'Meet the team behind the CSI MKD Premarital Counselling Centre.',
        },
        loadComponent: () =>
          import('./team-members/team-members').then((m) => m.TeamMembers),
      },
      {
        path: 'register',
        title: 'Register - CSI MKD Premarital Counsel',
        data: { description: 'Register for premarital counselling sessions.' },
        loadComponent: () =>
          import('./register/register').then((m) => m.Register),
      },
      {
        path: 'register/premarital-register',
        title: 'Premarital Registration - CSI MKD Premarital Counsel',
        data: { description: 'Register for premarital counselling sessions.' },
        loadComponent: () =>
          import('./register/premarital-register/premarital-register').then(
            (m) => m.PremaritalRegister
          ),
        canDeactivate: [pendingChangesGuard],
      },
      {
        path: 'register/general-register',
        title: 'General Registration - CSI MKD Premarital Counsel',
        data: { description: 'Register for general counselling sessions.' },
        loadComponent: () =>
          import('./register/general-register/general-register').then(
            (m) => m.GeneralRegister
          ),
        canDeactivate: [pendingChangesGuard],
      },
      {
        path: 'register/pre-confirm-register',
        title: 'Confirmation - CSI MKD Premarital Counsel',
        data: {
          description: 'Confirm your registration for counselling sessions.',
        },
        loadComponent: () =>
          import('./register/pre-confirm-register/pre-confirm-register').then(
            (m) => m.PreConfirmRegister
          ),
        canDeactivate: [pendingChangesGuard],
      },
      {
        path: 'sessions',
        title: 'Counselling Sessions - CSI MKD Premarital Counsel',
        data: { description: 'View upcoming premarital counselling sessions.' },
        loadComponent: () =>
          import('./sessions/sessions').then((m) => m.Sessions),
      },
      {
        path: 'register/premarital-register/:sessionId',
        title: 'Premarital Registration - CSI MKD Premarital Counsel',
        data: {
          description:
            'Register for a specific premarital counselling session.',
        },
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
    data: { description: 'Login to the admin dashboard.' },
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
        data: {
          description:
            'Admin dashboard for managing registrations and sessions.',
        },
        loadComponent: () =>
          import('./admin/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'premarital',
        title: 'Premarital Registrations - CSI MKD Premarital Counsel',
        data: { description: 'View and manage premarital registrations.' },
        loadComponent: () =>
          import('./admin/premarital/premarital').then(
            (m) => m.PremaritalComponent
          ),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'session-config',
        title: 'Session Configuration - CSI MKD Premarital Counsel',
        data: { description: 'Configure premarital counselling sessions.' },
        loadComponent: () =>
          import('./admin/session-config/session-config').then(
            (m) => m.SessionConfig
          ),
      },

      {
        path: 'general-list',
        title: 'General Registrations - CSI MKD Premarital Counsel',
        data: { description: 'View and manage general registrations.' },
        loadComponent: () =>
          import('./admin/general-list/general-list').then(
            (m) => m.GeneralList
          ),
      },
      {
        path: 'pre-confirm-list',
        title: 'Pre-Confirmation Registrations - CSI MKD Premarital Counsel',
        data: {
          description: 'View and manage pre-confirmation registrations.',
        },
        loadComponent: () =>
          import('./admin/pre-confirm-list/pre-confirm-list').then(
            (m) => m.PreConfirmList
          ),
      },
      {
        path: 'deactivate-sessions',
        title: 'Deactivate Sessions - CSI MKD Premarital Counsel',
        data: { description: 'Deactivate sessions that will begin in 3 days' },
        loadComponent: () =>
          import('./admin/deactivate-sessions/deactivate-sessions').then(
            (m) => m.DeactivateSessions
          ),
      },
      {
        path: 'instructors',
        title: 'Instructors Management - CSI MKD Premarital Counsel',
        data: { description: 'Manage counseling instructors' },
        loadComponent: () =>
          import('./admin/instructors/instructors').then(
            (m) => m.Instructors
          ),
      },
    ],
  },

  // Wildcard route for a 404 page
  {
    path: '**',
    title: 'Page Not Found - CSI MKD Premarital Counsel',
    data: { description: 'The page you are looking for does not exist.' },
    loadComponent: () =>
      import('./not-found/not-found').then((m) => m.NotFound),
  },
];
