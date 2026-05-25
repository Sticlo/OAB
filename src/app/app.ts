import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './layout/header/header';
import { Footer } from './layout/footer/footer';
import { FaqChat } from './shared/components/faq-chat/faq-chat';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, FaqChat],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('SIO - Sistema Interno Operativo');
}
