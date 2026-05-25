import { Component, signal, computed, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Product } from '../../shared/models/product.model';
import { ProductService } from '../../core/services/product.service';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';
import { InventoryService } from '../../core/services/inventory.service';
import { ExpenseService } from '../../core/services/expense.service';
import { NovedadService, Novedad } from '../../core/services/novedad.service';
import { OrdersDashboardComponent } from './orders-dashboard/orders-dashboard.component';
import { InventoryDashboardComponent } from './inventory-dashboard/inventory-dashboard.component';
import { FinancesDashboardComponent } from './finances-dashboard/finances-dashboard.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, OrdersDashboardComponent, InventoryDashboardComponent, FinancesDashboardComponent],
  templateUrl: './admin.html',
  styleUrl: './admin.scss'
})
export class Admin {
  products = computed(() => this.productService.allProducts());
  user = computed(() => this.authService.user());
  
  // Orders dashboard
  ordersDashboard = viewChild.required(OrdersDashboardComponent);
  ordersStats = computed(() => this.orderService.stats());
  unreadOrders = computed(() => this.orderService.unreadOrders().length);
  
  // Inventory dashboard
  inventoryDashboard = viewChild.required(InventoryDashboardComponent);
  inventoryStats = computed(() => this.inventoryService.getInventoryStats());
  criticalAlerts = computed(() => this.inventoryService.activeAlerts().length);
  
  // Finances dashboard
  financesDashboard = viewChild.required(FinancesDashboardComponent);
  financialStats = computed(() => this.expenseService.financialStats());
  
  showModal = signal(false);
  editingProduct = signal<Product | null>(null);
  searchQuery = signal('');
  
  formData = signal<Partial<Product>>({
    name: '',
    category: '',
    description: '',
    price: 0,
    originalPrice: undefined,
    rating: undefined,
    reviewCount: undefined,
    badge: undefined,
    image: undefined
  });
  
  filteredProducts = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.products();
    
    return this.products().filter(p =>
      p.name.toLowerCase().includes(query) ||
      (p.category?.toLowerCase().includes(query) || false) ||
      p.description.toLowerCase().includes(query)
    );
  });
  
  categories = ['AURICULARES', 'BOCINAS', 'SMARTWATCH', 'CARGADORES', 'ALMACENAMIENTO', 'ACCESORIOS'];
  badges = ['Nuevo', 'Oferta', 'Popular', 'Exclusivo', 'Pro'];

  // ─── Novedades ───────────────────────────────────────────────
  novedades = computed(() => this.novedadService.novedades());
  showNovedadModal = signal(false);
  editingNovedad = signal<Novedad | null>(null);
  novedadImagePreview = signal<string | null>(null);
  novedadImageLoading = signal(false);

  novedadForm = signal<Partial<Novedad>>({
    titulo: '',
    descripcion: '',
    categoria: 'General',
    fecha: new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }),
    activo: true,
    destacado: false,
    imagen: undefined,
    link: ''
  });

  novedadCategorias = ['General', 'Institucional', 'Eventos', 'Alianzas', 'Beneficios', 'Productos', 'Promociones'];
  
  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private orderService: OrderService,
    private inventoryService: InventoryService,
    private expenseService: ExpenseService,
    private novedadService: NovedadService,
    public router: Router
  ) {}
  
  openCreateModal(): void {
    this.editingProduct.set(null);
    this.formData.set({
      name: '',
      category: '',
      description: '',
      price: 0,
      originalPrice: undefined,
      rating: undefined,
      reviewCount: undefined,
      badge: undefined,
      image: undefined
    });
    this.showModal.set(true);
  }
  
  openEditModal(product: Product): void {
    this.editingProduct.set(product);
    this.formData.set({ ...product });
    this.showModal.set(true);
  }
  
  closeModal(): void {
    this.showModal.set(false);
    this.editingProduct.set(null);
  }
  
  saveProduct(): void {
    const data = this.formData();

    if (!data.name || !data.category || !data.description || !data.price) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    if (this.editingProduct()) {
      this.productService.update(this.editingProduct()!.id, data).subscribe({
        next: () => this.closeModal(),
        error: () => alert('Error al actualizar el producto.')
      });
    } else {
      this.productService.create(data as Omit<Product, 'id'>).subscribe({
        next: () => this.closeModal(),
        error: () => alert('Error al crear el producto.')
      });
    }
  }
  
  deleteProduct(id: string): void {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      this.productService.delete(id).subscribe({
        error: () => alert('Error al eliminar el producto.')
      });
    }
  }
  
  updateField<K extends keyof Product>(field: K, value: Product[K]): void {
    this.formData.update(data => ({ ...data, [field]: value }));
  }

  // ─── Publicar ────────────────────────────────────────────────

  showPublicarModal = signal(false);
  publicarImagePreview = signal<string | null>(null);
  publicarImageLoading = signal(false);
  publicarForm = signal<{
    titulo: string;
    descripcion: string;
    imagen?: string;
    destino: 'productos' | 'novedades' | 'patrocinadores' | '';
  }>({ titulo: '', descripcion: '', imagen: undefined, destino: '' });

  openPublicarModal(): void {
    this.publicarForm.set({ titulo: '', descripcion: '', imagen: undefined, destino: '' });
    this.publicarImagePreview.set(null);
    this.showPublicarModal.set(true);
  }

  closePublicarModal(): void {
    this.showPublicarModal.set(false);
  }

  onPublicarImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.publicarImageLoading.set(true);
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const original = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const MAX = 900;
        let { width, height } = img;
        if (width > height) {
          if (width > MAX) { height = Math.round((height * MAX) / width); width = MAX; }
        } else {
          if (height > MAX) { width = Math.round((width * MAX) / height); height = MAX; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.75);
        this.publicarImagePreview.set(compressed);
        this.publicarForm.update(f => ({ ...f, imagen: compressed }));
        this.publicarImageLoading.set(false);
      };
      img.src = original;
    };
    reader.readAsDataURL(file);
  }

  removePublicarImage(): void {
    this.publicarImagePreview.set(null);
    this.publicarForm.update(f => ({ ...f, imagen: undefined }));
  }

  setPublicarTitulo(value: string): void {
    this.publicarForm.update(f => ({ ...f, titulo: value }));
  }

  setPublicarDescripcion(value: string): void {
    this.publicarForm.update(f => ({ ...f, descripcion: value }));
  }

  setPublicarDestino(value: 'productos' | 'novedades' | 'patrocinadores'): void {
    this.publicarForm.update(f => ({ ...f, destino: value }));
  }

  savePublicacion(): void {
    const f = this.publicarForm();
    if (!f.titulo.trim() || !f.descripcion.trim()) {
      alert('El título y la descripción son obligatorios.');
      return;
    }
    if (!f.destino) {
      alert('Selecciona dónde quieres publicar.');
      return;
    }
    const fecha = new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
    if (f.destino === 'productos') {
      this.productService.create({
        name: f.titulo,
        description: f.descripcion,
        price: 0,
        category: 'General',
        image: f.imagen,
        inStock: true
      }).subscribe({
        next: () => this.closePublicarModal(),
        error: () => alert('Error al publicar el producto.')
      });
    } else {
      const categoria = f.destino === 'patrocinadores' ? 'Patrocinios' : 'General';
      this.novedadService.create({
        titulo: f.titulo,
        descripcion: f.descripcion,
        imagen: f.imagen,
        categoria,
        fecha,
        activo: true,
        destacado: false
      }).subscribe({
        next: () => this.closePublicarModal(),
        error: () => alert('Error al publicar.')
      });
    }
  }

  openOrdersDashboard(): void {
    this.ordersDashboard().open();
  }

  openInventoryDashboard(): void {
    this.inventoryDashboard().open();
  }

  openFinancesDashboard(): void {
    this.financesDashboard().open();
  }

  // ─── Novedades ───────────────────────────────────────────────

  openNovedadModal(novedad?: Novedad): void {
    if (novedad) {
      this.editingNovedad.set(novedad);
      this.novedadForm.set({ ...novedad });
      this.novedadImagePreview.set(novedad.imagen || null);
    } else {
      this.editingNovedad.set(null);
      this.novedadForm.set({
        titulo: '',
        descripcion: '',
        categoria: 'General',
        fecha: new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }),
        activo: true,
        destacado: false,
        imagen: undefined,
        link: ''
      });
      this.novedadImagePreview.set(null);
    }
    this.showNovedadModal.set(true);
  }

  closeNovedadModal(): void {
    this.showNovedadModal.set(false);
    this.editingNovedad.set(null);
    this.novedadImagePreview.set(null);
  }

  updateNovedadField<K extends keyof Novedad>(field: K, value: Novedad[K]): void {
    this.novedadForm.update(f => ({ ...f, [field]: value }));
  }

  /**
   * Comprime la imagen usando Canvas antes de guardar.
   * Máx 900px de ancho/alto, calidad 0.75 → reduce drasticamente el tamaño.
   */
  onNovedadImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.novedadImageLoading.set(true);

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const original = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const MAX_SIZE = 900;
        let { width, height } = img;

        // Redimensionar manteniendo proporción
        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);

        // Usar JPEG calidad 0.75 para máxima reducción
        const compressed = canvas.toDataURL('image/jpeg', 0.75);
        this.novedadImagePreview.set(compressed);
        this.novedadForm.update(f => ({ ...f, imagen: compressed }));
        this.novedadImageLoading.set(false);
      };
      img.src = original;
    };
    reader.readAsDataURL(file);
  }

  removeNovedadImage(): void {
    this.novedadImagePreview.set(null);
    this.novedadForm.update(f => ({ ...f, imagen: undefined }));
  }

  saveNovedad(): void {
    const data = this.novedadForm();
    if (!data.titulo?.trim() || !data.descripcion?.trim()) {
      alert('El título y la descripción son obligatorios.');
      return;
    }

    const editing = this.editingNovedad();
    if (editing) {
      this.novedadService.update(editing.id, data).subscribe({
        next: () => this.closeNovedadModal(),
        error: () => alert('Error al actualizar la novedad.')
      });
    } else {
      this.novedadService.create({
        titulo: data.titulo!,
        descripcion: data.descripcion!,
        categoria: data.categoria || 'General',
        fecha: data.fecha || new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }),
        activo: data.activo ?? true,
        destacado: data.destacado ?? false,
        imagen: data.imagen,
        link: data.link
      }).subscribe({
        next: () => this.closeNovedadModal(),
        error: () => alert('Error al crear la novedad.')
      });
    }
  }

  deleteNovedad(id: string): void {
    if (confirm('¿Eliminar esta novedad?')) {
      this.novedadService.delete(id).subscribe({
        error: () => alert('Error al eliminar la novedad.')
      });
    }
  }
  
  logout(): void {
    this.authService.logout();
  }
}
  
  