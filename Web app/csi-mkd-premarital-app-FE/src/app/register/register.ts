import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AnimateOnScrollDirective } from '../shared/directives/animate-on-scroll.directive';

@Component({
  selector: 'app-register',
  imports: [
    RouterOutlet,
    RouterLink,
    NgOptimizedImage,
    MatCardModule,
    AnimateOnScrollDirective,
  ],
  templateUrl: './register.html',

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Register {}
