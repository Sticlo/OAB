import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '@environments/environment';

export interface Novedad {
  id: string;
  titulo: string;
  descripcion: string;
  imagen?: string;
  categoria: string;
  fecha: string;
  activo: boolean;
  destacado: boolean;
  link?: string;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NovedadService {
  private http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/novedades`;

  private _novedades = signal<Novedad[]>([]);

  readonly novedades = this._novedades.asReadonly();
  readonly activas = computed(() => this._novedades().filter(n => n.activo));
  readonly total = computed(() => this._novedades().length);

  constructor() {
    this.loadNovedades();
  }

  loadNovedades(): void {
    this.http.get<any[]>(this.url).subscribe({
      next: data => this._novedades.set(data.map(n => this.mapNovedad(n))),
      error: err => console.error('Error cargando novedades:', err)
    });
  }

  private mapNovedad(n: any): Novedad {
    return { ...n, id: n._id || n.id };
  }

  create(data: Omit<Novedad, 'id' | 'createdAt'>): Observable<Novedad> {
    return this.http.post<any>(this.url, data).pipe(
      tap(() => this.loadNovedades())
    );
  }

  update(id: string, data: Partial<Novedad>): Observable<Novedad> {
    return this.http.put<any>(`${this.url}/${id}`, data).pipe(
      tap(() => this.loadNovedades())
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`).pipe(
      tap(() => this.loadNovedades())
    );
  }

  getById(id: string): Novedad | undefined {
    return this._novedades().find(n => n.id === id);
  }
}
