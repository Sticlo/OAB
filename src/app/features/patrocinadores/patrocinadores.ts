import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NovedadService } from '../../core/services/novedad.service';
import { PATROCINADORES_ESTATICOS, PatrocinadorConfig } from './patrocinadores.config';

export interface Patrocinador extends PatrocinadorConfig {}

@Component({
  selector: 'app-patrocinadores',
  imports: [CommonModule],
  templateUrl: './patrocinadores.html',
  styleUrl: './patrocinadores.scss',
  standalone: true
})
export class Patrocinadores {
  private novedadService = inject(NovedadService);

  patrocinadores = computed<Patrocinador[]>(() => {
    const dynamic = this.novedadService
      .novedades()
      .filter(n => n.categoria === 'Patrocinios' && n.activo)
      .map(n => ({
        id: String(n.id),
        nombre: n.titulo,
        logo: n.imagen || 'assets/images/maquipesados.png',
        descripcion: n.descripcion,
        instagram: n.link?.includes('instagram') ? n.link : undefined,
        whatsapp: n.link?.includes('wa.me') || n.link?.includes('whatsapp') ? n.link : undefined
      }));

    const estaticos = PATROCINADORES_ESTATICOS;
    const idsEstaticos = new Set(estaticos.map(p => p.id));
    const extras = dynamic.filter(p => !idsEstaticos.has(p.id));

    return [...estaticos, ...extras];
  });
}
