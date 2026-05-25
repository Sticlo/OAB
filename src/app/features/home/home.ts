import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { TestimonialCardComponent, Testimonial } from '../../shared/components/testimonial-card/testimonial-card.component';

@Component({
  selector: 'app-home',
  imports: [RouterLink, ButtonComponent, TestimonialCardComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  // Testimonios
  testimonials: Testimonial[] = [
    {
      id: '1',
      name: 'Carlos Rodríguez',
      role: 'Operador de Excavadora',
      company: 'Operadores Asociados Bogotá',
      content: 'Ser parte de OAB me ha permitido acceder a mejores oportunidades laborales y capacitación continua. Es una organización que realmente se preocupa por sus asociados.',
      rating: 5
    },
    {
      id: '2',
      name: 'María González',
      role: 'Operadora de Torregrúa',
      company: 'Operadores Asociados Bogotá',
      content: 'La asesoría legal y el respaldo gremial que ofrece la asociación me han dado tranquilidad en mi trabajo. Recomiendo a todos los operadores unirse.',
      rating: 5
    },
    {
      id: '3',
      name: 'Jorge Martínez',
      role: 'Operador de Bulldozer',
      company: 'Operadores Asociados Bogotá',
      content: 'Gracias a las certificaciones de OAB he podido trabajar en proyectos importantes. La red de contactos y las oportunidades laborales son excelentes.',
      rating: 5
    }
  ];
  
  // Estadísticas
  stats = [
    { value: '500+', label: 'Operadores Asociados' },
    { value: '11+', label: 'Años de Experiencia' },
    { value: '100%', label: 'Sin Ánimo de Lucro' }
  ];
}

