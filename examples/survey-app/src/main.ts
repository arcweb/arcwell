import { HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules, withRouterConfig } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { AuthInterceptor } from '@interceptors/auth.interceptor';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

import { HealthService } from '@services/health.service';
import { FactTypeService } from '@services/fact-type.service';
import { AuthService } from '@services/auth.service';
import { FactService } from '@services/fact.service';
import { NgxEchartsModule } from 'ngx-echarts';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules), withRouterConfig({ onSameUrlNavigation: 'reload' })),
    provideHttpClient(
      withFetch(),
      withInterceptorsFromDi()
    ),
    AuthService,
    FactService,
    FactTypeService,
    HealthService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
});
