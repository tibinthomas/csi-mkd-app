import { Routes } from '@angular/router';
import { PublicLayout } from './layouts/public-layout';
import { AdminLayout } from './layouts/admin-layout';
import { About } from './about/about';
import { Feedback } from './feedback/feedback';
import { FeedbackList } from './feedback-list/feedback-list';
import { TeamMembers } from './team-members/team-members';
import { Register } from './register/register';
import { PremaritalRegister } from './register/premarital-register/premarital-register';
import { GeneralRegister } from './register/general-register/general-register';
import { AdminLogin } from './admin/login/login';
import { Dashboard } from './admin/dashboard/dashboard';
import { PremaritalComponent } from './admin/premarital/premarital';
import { SessionConfig } from './admin/session-config/session-config';
import { authGuard } from './core/auth/auth.guard';
import { Sessions } from './sessions/sessions';
import { GeneralList } from './admin/general-list/general-list';
import { PreConfirmRegister } from './register/pre-confirm-register/pre-confirm-register';

export const routes: Routes = [
  // Public routes wrapped inside PublicLayout
  {
    path: '',
    component: PublicLayout,
    children: [
      { path: '', redirectTo: 'about', pathMatch: 'full' },
      { path: 'about', component: About },
      { path: 'feedback', component: Feedback },
      { path: 'feedback-list', component: FeedbackList },
      { path: 'team-members', component: TeamMembers },
      { path: 'register', component: Register },
      { path: 'register/premarital-register', component: PremaritalRegister },
      { path: 'register/general-register', component: GeneralRegister },
      { path: 'register/pre-confirm-register', component: PreConfirmRegister },
      { path: 'sessions', component: Sessions },
      {
        path: 'register/premarital-register/:sessionId',
        component: PremaritalRegister,
      },
    ],
  },

  // Admin login is public, outside admin layout
  { path: 'admin/login', component: AdminLogin },

  // Admin protected routes wrapped inside AdminLayout
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'premarital', component: PremaritalComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'session-config',
        component: SessionConfig,
      },
      { path: 'general-list', component: GeneralList },
    ],
  },

  // Optional wildcard route to catch unmatched routes
  // { path: '**', redirectTo: '' },
];
