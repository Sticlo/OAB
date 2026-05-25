import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SiteConfig } from '../../../config/site.config';

@Component({
  selector: 'app-faq-chat',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faq-chat.html',
  styleUrl: './faq-chat.scss'
})
export class FaqChat {
  isOpen = signal(false);

  private readonly affiliateMessage =
    'Vengo de la página web, me interesa asociarme a la federación';

  readonly whatsappAffiliateLink = `https://wa.me/${SiteConfig.contact.whatsapp}?text=${encodeURIComponent(this.affiliateMessage)}`;
  readonly phoneCallLink = `tel:+${SiteConfig.contact.whatsapp}`;

  toggleChat() {
    this.isOpen.set(!this.isOpen());
  }

  closeChat() {
    this.isOpen.set(false);
  }
}
