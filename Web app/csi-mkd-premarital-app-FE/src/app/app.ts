import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  NavigationStart,
  NavigationCancel,
  NavigationError,
  Router,
  RouterOutlet,
} from '@angular/router';
import { SeoService } from './core/services/seo.service';
import { UpdateService } from './core/services/update.service';
import { LoadingService } from './core/services/loading.service';
import { ConsoleDetectionService } from './core/services/console-detection.service';
import { UpdatePromptComponent } from './shared/components/update-prompt/update-prompt.component';
import { GlobalLoaderComponent } from './shared/components/global-loader/global-loader.component';
import { ChatbotComponent } from './chatbot/chatbot.component';
import { ChristmasSnowComponent } from './shared/components/christmas-snow/christmas-snow.component';
import { SantaSleighComponent } from './shared/components/santa-sleigh/santa-sleigh.component';
import { ChristmasOrnamentsComponent } from './shared/components/christmas-ornaments/christmas-ornaments.component';
import { CursorEffectsComponent } from './shared/components/cursor-effects/cursor-effects.component';
import { filter, map, switchMap } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    UpdatePromptComponent,
    GlobalLoaderComponent,
    ChatbotComponent,
    ChristmasSnowComponent,
    SantaSleighComponent,
    ChristmasOrnamentsComponent,
    CursorEffectsComponent
  ],
  template: `
    <!-- Minimal Christmas Decorations -->
    <app-christmas-snow></app-christmas-snow>
    <app-santa-sleigh></app-santa-sleigh>
    <app-christmas-ornaments></app-christmas-ornaments>
    <app-cursor-effects></app-cursor-effects>
    
    <!-- Main App Content -->
    <router-outlet></router-outlet>
    <app-update-prompt></app-update-prompt>
    <app-global-loader></app-global-loader>
    @defer (on idle) {
      <app-chatbot></app-chatbot>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly seoService = inject(SeoService);
  private readonly updateService = inject(UpdateService);
  private readonly loadingService = inject(LoadingService);
  private readonly consoleDetectionService = inject(ConsoleDetectionService);

  ngOnInit(): void {
    // Initialize update service
    this.updateService.checkForUpdate();

    // Initialize console detection for developers
    this.consoleDetectionService.initializeConsoleDetection();

    // Handle loading state for route navigation
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.loadingService.show();
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.loadingService.hide();
      }
    });

    // Handle SEO meta tags
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd
        ),
        map(() => {
          let route = this.activatedRoute;
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        }),
        switchMap((route) => route.data),
        map((data) => ({
          title: data['title'],
          description: data['description'],
        }))
      )
      .subscribe(({ title, description }) => {
        if (title && description) {
          this.seoService.updateMetaTags({ title, description });
        }
      });
  }
}
