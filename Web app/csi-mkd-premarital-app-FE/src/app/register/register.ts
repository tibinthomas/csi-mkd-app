import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [RouterOutlet, RouterLink, NgOptimizedImage, MatCardModule],
  templateUrl: './register.html',

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Register {}
