// The test environment must be set up first: it loads the Angular compiler used by TestBed.
import { setupZonelessTestEnv } from 'jest-preset-angular/setup-env/zoneless';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

setupZonelessTestEnv();

// app.config.ts does not run in unit tests, so the pt-BR locale data is registered here.
registerLocaleData(localePt, 'pt-BR');
