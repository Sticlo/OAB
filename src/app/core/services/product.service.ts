import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Product } from '../../shared/models/product.model';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/products`;

  private _products = signal<Product[]>([]);
  readonly allProducts = this._products.asReadonly();

  constructor() {
    this.loadProducts();
  }

  /** Carga todos los productos desde la base de datos */
  loadProducts(): void {
    this.http.get<any[]>(this.url).subscribe({
      next: products => this._products.set(products.map(p => this.mapProduct(p))),
      error: err => console.error('Error cargando productos:', err)
    });
  }

  private mapProduct(p: any): Product {
    return { ...p, id: p._id || p.id };
  }

  getAll(): Product[] {
    return this._products();
  }

  getById(id: string): Product | undefined {
    return this._products().find(p => p.id === id);
  }

  create(product: Omit<Product, 'id'>): Observable<Product> {
    return this.http.post<any>(this.url, product).pipe(
      tap(() => this.loadProducts())
    );
  }

  update(id: string, updates: Partial<Product>): Observable<Product> {
    return this.http.put<any>(`${this.url}/${id}`, updates).pipe(
      tap(() => this.loadProducts())
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`).pipe(
      tap(() => this.loadProducts())
    );
  }

  search(query: string): Product[] {
    const q = query.toLowerCase();
    return this._products().filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      (p.category?.toLowerCase().includes(q) || false)
    );
  }

  filterByCategory(category: string): Product[] {
    return this._products().filter(p =>
      p.category?.toLowerCase() === category.toLowerCase()
    );
  }

  updateProductStock(productId: string, updatedProduct: Product): Observable<Product> {
    return this.update(productId, updatedProduct);
  }

  getLowStockProducts(): Product[] {
    return this._products().filter(p => {
      const stock = p.stockCount || 0;
      const min = p.minStock || 5;
      return stock > 0 && stock <= min;
    });
  }

  getOutOfStockProducts(): Product[] {
    return this._products().filter(p =>
      (p.stockCount || 0) === 0 || p.inStock === false
    );
  }
}
