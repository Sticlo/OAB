/**
 * Configuración centralizada del sitio
 * Este archivo permite personalizar rápidamente la plantilla para cada cliente
 */

export const SiteConfig = {
  // Información de la empresa
  branding: {
    name: 'OAB',
    tagline: 'Asociación sin ánimo de lucro',
    description: 'Operadores Asociados Bogotá - Operarios y Maquinaria',
    logo: '/assets/logo.png', // Ruta a tu logo
  },

  // Datos de contacto
  contact: {
    email: 'secretaria@operadoresasociadosbogota.com',
    phone: '+57 319 235 5103',
    // IMPORTANTE: Número de WhatsApp para recibir pedidos
    // Formato: código de país + número (sin + ni espacios ni guiones)
    // Ejemplo para Colombia: '573192355103'
    whatsapp: '573192355103',
    address: 'Bogotá, Colombia',
    social: {
      facebook: 'https://www.facebook.com/share/1GiaeNat7u/',
      instagram: 'https://www.instagram.com/operadoresasociados?igsh=MXEzdDN2ZmE2bWlucA==',
      tiktok: 'https://www.tiktok.com/@operadores.bogota?_r=1&_t=ZS-942ayFWM3hk'
    }
  },

  // Configuración del header
  header: {
    promoBanner: 'ASOCIACIÓN SIN ÁNIMO DE LUCRO — OPERARIOS Y MAQUINARIA EN BOGOTÁ',
    showPromoBanner: true,
    menuItems: [
      { label: 'Inicio', route: '/' },
      { label: 'Nosotros', route: '/nosotros' },
      { label: 'Servicios', route: '/servicios' },
      { label: 'Contacto', route: '/contacto' }
    ]
  },

  // Contenido de la página de inicio
  home: {
    hero: {
      tag: 'SELECCIÓN CURADA',
      title: 'Diseño que inspira,\ncalidad que perdura',
      description: 'Descubre nuestra colección de productos premium seleccionados con el mejor gusto. Cada pieza cuenta una historia de artesanía y atención al detalle.',
      ctaText: 'Explorar Colección',
      ctaLink: '/productos'
    },

    stats: [
      { value: '10K+', label: 'Clientes Felices' },
      { value: '50K+', label: 'Productos Vendidos' },
      { value: '4.9', label: 'Rating Promedio' },
      { value: '24/7', label: 'Soporte' }
    ],

    features: [
      {
        icon: 'layers',
        title: 'Calidad Premium',
        description: 'Productos seleccionados con los más altos estándares de calidad.'
      },
      {
        icon: 'map-pin',
        title: 'Envíos Rápidos',
        description: 'Entrega en tiempo récord a cualquier parte del país.'
      },
      {
        icon: 'check-circle',
        title: 'Garantía Total',
        description: '100% de satisfacción garantizada o te devolvemos tu dinero.'
      },
      {
        icon: 'message-circle',
        title: 'Atención 24/7',
        description: 'Soporte personalizado siempre disponible cuando lo necesites.'
      }
    ],

    newsletter: {
      title: 'Mantente al día',
      description: 'Suscríbete para recibir las últimas novedades y ofertas exclusivas',
      placeholder: 'Tu correo electrónico',
      buttonText: 'Suscribirse'
    },

    cta: {
      title: 'Comienza tu experiencia',
      description: 'Únete a miles de clientes satisfechos',
      buttonText: 'Ver Productos',
      buttonLink: '/productos'
    }
  },

  // Configuración del footer
  footer: {
    columns: [
      {
        title: null,
        isBrand: true,
        content: 'Tu plataforma de gestión empresarial. Soluciones digitales para tu negocio.'
      },
      {
        title: 'Navegación',
        links: [
          { label: 'Inicio', url: '/' },
          { label: 'Productos', url: '/productos' },
          { label: 'Categorías', url: '/categorias' },
          { label: 'Testimonios', url: '/testimonios' }
        ]
      },
      {
        title: 'Información',
        links: [
          { label: 'Sobre Nosotros', url: '/sobre-nosotros' },
          { label: 'Contacto', url: '/contacto' },
          { label: 'Términos y Condiciones', url: '/terminos' },
          { label: 'Política de Privacidad', url: '/privacidad' }
        ]
      },
      {
        title: 'Contáctanos',
        isContact: true
      }
    ],
    copyright: '© 2026 OAB - Operadores Asociados Bogotá. Todos los derechos reservados.'
  },

  // Colores del tema (opcional - para futuras mejoras)
  theme: {
    primary: '#FF8C00',
    secondary: '#1a1a1a',
    accent: '#FF8C00',
    background: '#fafafa',
    text: '#1a1a1a'
  },

  // Configuración de pedidos y checkout
  orders: {
    // Habilitar checkout por WhatsApp
    enableWhatsAppCheckout: true,
    
    // Mensaje personalizado para el checkout
    checkoutButtonText: 'Finalizar pedido por WhatsApp',
    
    // Configuración de envío
    shipping: {
      isFree: true,
      cost: 0,
      freeShippingThreshold: 100000 // Envío gratis en compras mayores a esta cantidad
    },
    
    // Limpiar carrito después de enviar pedido por WhatsApp
    clearCartAfterCheckout: false
  }
};
