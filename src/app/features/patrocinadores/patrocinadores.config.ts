/** Patrocinadores fijos mostrados en /patrocinadores */
export interface PatrocinadorConfig {
  id: string;
  nombre: string;
  logo: string;
  descripcion: string;
  instagram?: string;
  facebook?: string;
  whatsapp?: string;
  sitioWeb?: string;
  catalogoPdf?: string;
  catalogoLabel?: string;
}

export const PATROCINADORES_ESTATICOS: PatrocinadorConfig[] = [
  {
    id: 'maquipesados',
    nombre: 'Maquipesados Internacional S.A.S.',
    logo: 'assets/images/maquipesados.png',
    descripcion:
      'Repuestos de maquinaria pesada. Suministro de partes para Caterpillar, Komatsu, Kobelco, Hitachi, Case y más marcas, con despachos a nivel nacional.',
    instagram: 'https://www.instagram.com/maquipesados_?igshid=h9szd7brx7gb',
    whatsapp: 'https://whatsapp.com/channel/0029Va8hMD8EQIajPGQxbU1d',
    catalogoPdf: 'assets/documents/catalogo-mpi-2021.pdf',
    catalogoLabel: 'Ver catálogo PDF'
  },
  {
    id: 'en-la-juega',
    nombre: 'En la Juega - Design',
    logo: 'assets/images/en-la-juega.png',
    descripcion:
      'Stencil art y cultura urbana. Aliado de OAB que apoya el arte y la expresión en la calle.',
    instagram: 'https://www.instagram.com/3nlaju3ga',
    facebook: 'https://www.facebook.com/3nlaju3ga'
  },
  {
    id: 'sio-creacion-web',
    nombre: 'SIO - Creación páginas web',
    logo: 'assets/images/sio-creacion-web.png',
    descripcion:
      'Organización, control y evolución digital. Desarrollo de páginas web y soluciones digitales para tu negocio.',
    instagram: 'https://www.instagram.com/sio_web/',
    whatsapp: 'https://wa.me/573017453703',
    sitioWeb: 'https://siodigitalweb.com/home'
  },
  {
    id: 'the-crusher',
    nombre: 'The Crusher',
    logo: 'assets/images/the-crusher.png',
    descripcion:
      'Sublimación, estampados y merchandising personalizado. Productos y diseños para tu marca o evento.',
    whatsapp: 'https://wa.me/573194542398'
  }
];
