/**
 * @fileoverview Currency Converter Component
 * @copyright 2024 Yevgeniy Sorokin
 * @license Terms of use: Any use requires prior agreement with the author. See LICENSE file for details.
 */
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig).catch(err => console.error(err));
