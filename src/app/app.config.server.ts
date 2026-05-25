import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { provideClientHydration } from '@angular/platform-browser';
import { appConfig as browserConfig } from './app.config.browser';

const serverConfig: ApplicationConfig = {
  providers: [provideServerRendering(), provideClientHydration()]
};

export const config = mergeApplicationConfig(browserConfig, serverConfig);
