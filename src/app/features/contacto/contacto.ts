import { Component, signal, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contacto.html',
  styleUrl: './contacto.scss'
})
export class Contacto {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  formData = signal({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  
  submitted = signal(false);
  
  contactInfo = [
    { icon: '�', label: 'WhatsApp', value: '+57 319 2355103' },
    { icon: '📧', label: 'Email', value: 'secretaria@operadoresasociadosbogota.com' },
    { icon: '📍', label: 'Dirección', value: 'Bogotá, Colombia' },
    { icon: '🕐', label: 'Horario', value: 'Lun - Vie: 8:00 - 17:00' }
  ];
  
  onSubmit() {
    const data = this.formData();
    
    // Construir mensaje de WhatsApp
    const message = `¡Hola! Me gustaría ponerme en contacto con OAB.%0A%0A` +
                    `*Nombre:* ${data.name}%0A` +
                    `*Email:* ${data.email}%0A` +
                    `*Teléfono:* ${data.phone}%0A%0A` +
                    `*Mensaje:*%0A${data.message}`;
    
    // Número de WhatsApp de OAB
    const whatsappNumber = '573192355101'; // Sin espacios ni caracteres especiales
    
    // URL de WhatsApp
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
    
    // Mostrar mensaje de confirmación
    this.submitted.set(true);
    
    // Redirigir a WhatsApp después de un breve delay
    setTimeout(() => {
      if (this.isBrowser) {
        window.open(whatsappUrl, '_blank');
      }
      
      // Resetear formulario
      setTimeout(() => {
        this.submitted.set(false);
        this.formData.set({
          name: '',
          email: '',
          phone: '',
          message: ''
        });
      }, 1500);
    }, 1000);
  }
}
