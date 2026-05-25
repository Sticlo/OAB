import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

interface Service {
  icon: string;
  title: string;
  description: string;
  features: string[];
}

@Component({
  selector: 'app-servicios',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './servicios.html',
  styleUrl: './servicios.scss'
})
export class Servicios {
  services: Service[] = [
    {
      icon: '�',
      title: 'Capacitación Profesional',
      description: 'Programas de formación continua y actualización para operadores de maquinaria pesada',
      features: [
        'Cursos de operación de maquinaria',
        'Talleres de seguridad industrial',
        'Capacitación en nuevas tecnologías',
        'Actualización de competencias'
      ]
    },
    {
      icon: '⚖️',
      title: 'Asesoría Legal',
      description: 'Orientación jurídica y representación para la defensa de los derechos de nuestros asociados',
      features: [
        'Consulta legal gratuita',
        'Representación jurídica',
        'Defensa de derechos laborales',
        'Asesoría en contratos'
      ]
    },
    {
      icon: '💼',
      title: 'Bolsa de Empleo',
      description: 'Conexión entre operadores certificados y empresas que requieren sus servicios',
      features: [
        'Ofertas laborales exclusivas',
        'Intermediación laboral',
        'Base de datos actualizada',
        'Perfiles profesionales'
      ]
    },
    {
      icon: '🎓',
      title: 'Certificaciones',
      description: 'Respaldo y certificación oficial de competencias para operadores de maquinaria',
      features: [
        'Certificados avalados',
        'Validación de experiencia',
        'Reconocimiento profesional',
        'Competencias certificadas'
      ]
    },
    {
      icon: '🤝',
      title: 'Bienestar Social',
      description: 'Programas de bienestar integral para asociados y sus familias',
      features: [
        'Programas de salud',
        'Actividades recreativas'
      ]
    },
    {
      icon: '🏢',
      title: 'Representación Gremial',
      description: 'Vocería y defensa de los intereses del sector ante entidades públicas y privadas',
      features: [
        'Negociación colectiva',
        'Defensa gremial',
        'Participación en mesas sectoriales',
        'Incidencia en políticas públicas'
      ]
    }
  ];
}
