import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FeedbackDataService {
  userDetails = signal<any | null>(null);
}
