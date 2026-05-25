import { Component, signal, computed, OnInit, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';

// ═══════════════════════════════════════════════════════════════════
// NOSOTROS — Animación automática de grúa 2D
//
// Paradigma: time-driven animation
//   • Animación automática con ~1 segundo por miembro del equipo
//   • Progreso calculado por tiempo transcurrido
//   • Cada frame se calcula la posición de la grúa vía interpolación
//   • Solo se usan transform y opacity — 0 reflows
//   • Se reinicia automáticamente al finalizar
// ═══════════════════════════════════════════════════════════════════

/** Definición de un tramo de animación dentro del progreso 0→1 */
interface AnimSegment {
  start: number;    // progreso donde empieza (0–1)
  end: number;      // progreso donde termina (0–1)
  memberIndex: number;
  phase: 'lower' | 'grab' | 'rise' | 'travel' | 'drop-lower' | 'place' | 'rise-back' | 'return';
}

@Component({
  selector: 'app-nosotros',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nosotros.html',
  styleUrl: './nosotros.scss'
})
export class Nosotros implements OnInit, OnDestroy {

  // ═══════════════════════════════
  // SEÑALES DE ESTADO (signals)
  // ═══════════════════════════════

  /** Posición horizontal del trole (px). +220 = derecha (carga), -220 = izquierda (organigrama) */
  trolleyPosition = signal(220);
  /** Largo del cable (px) */
  cableHeight = signal(30);
  /** Índice del miembro siendo izado (-1 = ninguno) */
  currentlyLifting = signal(-1);
  /** Cantidad de miembros ya colocados en el organigrama */
  membersPlaced = signal(0);
  /** Progreso del scroll como porcentaje (0–100) para la barra visual */
  scrollPercent = signal(0);
  /** Opacidad de la grúa (0 → 1) */
  craneOpacity = signal(0);
  /** Traslación vertical de la grúa para entrada */
  craneTranslateY = signal(60);
  /** Opacidad de los brazos (aparecen después de la torre) */
  armOpacity = signal(0);
  /** Ángulo de oscilación del cable (grados) */
  cableAngle = signal(0);
  /** Progreso de la animación (0-1) */
  animationProgress = signal(0);

  // ═══════════════════════════════
  // SEÑALES COMPUTADAS (computed)
  // ═══════════════════════════════

  /** Sombra dinámica de la tarjeta suspendida */
  liftedShadow = computed(() => {
    const h = this.cableHeight();
    const blur = Math.min(h / 3, 25);
    return `0 ${blur}px ${blur * 1.5}px rgba(0,0,0,0.25)`;
  });

  /** Opacidad de la sombra proyectada */
  suspendedShadowOpacity = computed(() => {
    const h = this.cableHeight();
    return Math.min(h / 200, 0.6);
  });

  /** Ancho de la sombra proyectada */
  suspendedShadowWidth = computed(() => {
    const h = this.cableHeight();
    return 80 + h * 0.3;
  });

  /** Índice del próximo miembro a levantar */
  nextMemberIndex = computed(() => this.membersPlaced());

  // ═══════════════════════════════
  // DATOS DEL EQUIPO
  // ═══════════════════════════════

  team = [
    // Nivel 1: Presidencia
    { name: 'Juan Pablo Rojas', role: 'Presidente', image: '👨‍💼', level: 1, position: 'presidente' },
    
    // Nivel 2: Vicepresidencia
    { name: 'Camilo Merchán', role: 'Vicepresidente', image: '👨‍💼', level: 2, position: 'vicepresidente' },
    
    // Nivel 3: Direcciones principales
    { name: '', role: 'Secretaría', image: '📋', level: 3, position: 'secretaria' },
    { name: '', role: 'Fiscalía', image: '⚖️', level: 3, position: 'fiscalia' },
    { name: '', role: 'Tesorería', image: '💰', level: 3, position: 'tesoreria' },
    { name: '', role: 'Comunicaciones', image: '📢', level: 3, position: 'comunicaciones' },
    { name: '', role: 'Jurídica', image: '📑', level: 3, position: 'juridica' },
    
    // Nivel 4: Personal bajo cada dirección
    { name: 'Diana Loaiza', role: 'Secretaría', image: '👩‍💼', level: 4, position: 'secretaria-personal' },
    { name: 'Nelson Molina', role: 'Fiscalía', image: '👨‍⚖️', level: 4, position: 'fiscalia-personal' },
    { name: 'Saúl Padilla', role: 'Tesorería', image: '👨‍💼', level: 4, position: 'tesoreria-personal' },
    { name: 'Julián Rojas', role: 'Comunicaciones', image: '👨‍💻', level: 4, position: 'comunicaciones-personal' },
    { name: 'Sebastián Gómez', role: 'Jurídica', image: '👨‍⚖️', level: 4, position: 'juridica-personal' },
    
    // Nivel 5: Otros cargos
    { name: 'Angie Ávila Sierra', role: 'Contadora', image: '👩‍💼', level: 5, position: 'contadora' },
    { name: 'Alejandro Rodríguez', role: 'Fiscalía', image: '👨‍💼', level: 5, position: 'fiscalia-aux' }
  ];

  values = [
    { icon: '🤝', title: 'Solidaridad', description: 'Apoyamos a nuestros asociados en todo momento' },
    { icon: '🎓', title: 'Capacitación', description: 'Promovemos el desarrollo profesional continuo' },
    { icon: '⚖️', title: 'Justicia', description: 'Defendemos los derechos de los operadores' },
    { icon: '🛡️', title: 'Seguridad', description: 'Priorizamos la seguridad en cada operación' }
  ];

  // ═══════════════════════════════
  // TIMELINE DE ANIMACIÓN
  // ═══════════════════════════════

  /** Mapa de segmentos: cada miembro tiene fases con rangos de progreso */
  private segments: AnimSegment[] = [];

  /** Timer para animación automática */
  private animationTimer: any = null;
  private alive = true;

  // ── Constantes de la grúa ──
  private readonly TROLLEY_RIGHT = 220;   // posición en zona de carga
  private readonly TROLLEY_LEFT = -220;   // posición en organigrama
  private readonly CABLE_SHORT = 30;      // cable recogido
  private readonly CABLE_LONG = 190;      // cable extendido (bajar tarjeta)
  private readonly CABLE_GRAB = 170;      // cable al momento de agarrar

  // ── Rangos de progreso ──
  // 0.00 – 0.08  →  Entrada de la grúa
  // 0.08 – 0.10  →  Extensión de brazos
  // 0.10 – 0.96  →  Ciclos de izado (5 miembros × ~0.172 cada uno)
  // 0.96 – 1.00  →  Estado final / reposo
  private readonly CRANE_ENTER_START = 0.00;
  private readonly CRANE_ENTER_END = 0.08;
  private readonly ARM_START = 0.06;
  private readonly ARM_END = 0.10;
  private readonly CYCLE_START = 0.10;
  private readonly CYCLE_END = 0.96;

  constructor(private ngZone: NgZone) {
    this.buildTimeline();
  }

  // ═══════════════════════════════
  // LIFECYCLE
  // ═══════════════════════════════

  ngOnInit(): void {
    // Iniciar animación automática
    this.startAnimation();
  }

  ngOnDestroy(): void {
    this.alive = false;
    this.stopAnimation();
  }

  // ═══════════════════════════════════════
  // CONSTRUCCIÓN DEL TIMELINE
  // ═══════════════════════════════════════

  /**
   * Genera los segmentos de animación para cada miembro.
   * Cada miembro ocupa un rango proporcional dentro de CYCLE_START → CYCLE_END.
   * Dentro de ese rango, las fases se distribuyen así:
   *   lower(12%) → grab(5%) → rise(12%) → travel(25%) → drop-lower(12%) → place(5%) → rise-back(12%) → return(17%)
   */
  private buildTimeline(): void {
    const totalRange = this.CYCLE_END - this.CYCLE_START;
    const memberRange = totalRange / this.team.length;

    // Distribución porcentual de cada fase dentro de un ciclo
    const phaseWeights: { phase: AnimSegment['phase']; weight: number }[] = [
      { phase: 'lower',      weight: 0.12 },
      { phase: 'grab',       weight: 0.05 },
      { phase: 'rise',       weight: 0.12 },
      { phase: 'travel',     weight: 0.25 },
      { phase: 'drop-lower', weight: 0.12 },
      { phase: 'place',      weight: 0.05 },
      { phase: 'rise-back',  weight: 0.12 },
      { phase: 'return',     weight: 0.17 }
    ];

    for (let i = 0; i < this.team.length; i++) {
      const cycleStart = this.CYCLE_START + i * memberRange;
      let cursor = cycleStart;

      for (const pw of phaseWeights) {
        const segLen = memberRange * pw.weight;
        this.segments.push({
          start: cursor,
          end: cursor + segLen,
          memberIndex: i,
          phase: pw.phase
        });
        cursor += segLen;
      }
    }
  }

  // ═══════════════════════════════════════
  // ANIMACIÓN AUTOMÁTICA (cada 1 segundo)
  // ═══════════════════════════════════════

  /** Inicia la animación automática con avance cada 0.75 segundos por miembro */
  private startAnimation(): void {
    this.animationProgress.set(0);
    
    // Duración: 0.75 segundos por cada miembro + entrada (1.5s) + salida (0.75s)
    // Con 16 miembros: 1.5s + (16 * 0.75s) + 0.75s = 14.25 segundos total
    const totalMembers = this.team.length;
    const entranceDuration = 1500;  // 1.5 segundos para entrada de grúa
    const memberDuration = 750;     // 0.75 segundos por cada miembro
    const exitDuration = 750;       // 0.75 segundos al final
    const totalDuration = entranceDuration + (totalMembers * memberDuration) + exitDuration;
    const startTime = Date.now();
    
    const animate = () => {
      if (!this.alive) return;
      
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / totalDuration, 1);
      
      this.ngZone.run(() => {
        this.animationProgress.set(progress);
        this.scrollPercent.set(Math.round(progress * 100));
        this.applyCraneEntrance(progress);
        this.applyArmEntrance(progress);
        this.applyCranePhases(progress);
      });
      
      if (progress < 1) {
        this.animationTimer = setTimeout(animate, 16); // ~60fps
      } else {
        // Al terminar, reiniciar después de 2 segundos
        this.animationTimer = setTimeout(() => {
          this.startAnimation();
        }, 2000);
      }
    };
    
    animate();
  }

  /** Detiene la animación */
  private stopAnimation(): void {
    if (this.animationTimer) {
      clearTimeout(this.animationTimer);
      this.animationTimer = null;
    }
  }

  // ═══════════════════════════════════════
  // INTERPOLACIÓN DE FASES
  // ═══════════════════════════════════════

  /** Entrada de la grúa (opacity + translateY) */
  private applyCraneEntrance(p: number): void {
    if (p < this.CRANE_ENTER_START) {
      this.craneOpacity.set(0);
      this.craneTranslateY.set(60);
    } else if (p > this.CRANE_ENTER_END) {
      this.craneOpacity.set(1);
      this.craneTranslateY.set(0);
    } else {
      const t = this.normalize(p, this.CRANE_ENTER_START, this.CRANE_ENTER_END);
      const eased = this.easeOutCubic(t);
      this.craneOpacity.set(eased);
      this.craneTranslateY.set(this.lerp(60, 0, eased));
    }
  }

  /** Extensión de los brazos (opacity) */
  private applyArmEntrance(p: number): void {
    if (p < this.ARM_START) {
      this.armOpacity.set(0);
    } else if (p > this.ARM_END) {
      this.armOpacity.set(1);
    } else {
      const t = this.normalize(p, this.ARM_START, this.ARM_END);
      this.armOpacity.set(this.easeOutCubic(t));
    }
  }

  /**
   * Aplica el estado de la grúa según el segmento activo.
   * Busca qué segmento del timeline corresponde al progreso actual
   * y calcula posiciones intermedias vía interpolación + easing.
   */
  private applyCranePhases(p: number): void {
    // Antes del primer ciclo → estado inicial
    if (p < this.CYCLE_START) {
      this.trolleyPosition.set(this.TROLLEY_RIGHT);
      this.cableHeight.set(this.CABLE_SHORT);
      this.currentlyLifting.set(-1);
      this.cableAngle.set(0);
      return;
    }

    // Después del último ciclo → estado final
    if (p >= this.CYCLE_END) {
      this.trolleyPosition.set(this.TROLLEY_RIGHT);
      this.cableHeight.set(this.CABLE_SHORT);
      this.currentlyLifting.set(-1);
      this.membersPlaced.set(this.team.length);
      this.cableAngle.set(0);
      return;
    }

    // Buscar segmento activo
    const seg = this.segments.find(s => p >= s.start && p < s.end);
    if (!seg) return;

    const t = this.normalize(p, seg.start, seg.end);        // 0→1 dentro del segmento
    const mi = seg.memberIndex;

    switch (seg.phase) {
      // ── Bajar cable para recoger tarjeta ──
      case 'lower': {
        this.trolleyPosition.set(this.TROLLEY_RIGHT);
        this.cableHeight.set(this.lerp(this.CABLE_SHORT, this.CABLE_LONG, this.easeInQuad(t)));
        this.currentlyLifting.set(-1);
        this.membersPlaced.set(mi);
        // Oscilación suave al bajar
        this.cableAngle.set(Math.sin(t * Math.PI * 3) * 2 * (1 - t));
        break;
      }

      // ── Agarrar tarjeta ──
      case 'grab': {
        this.trolleyPosition.set(this.TROLLEY_RIGHT);
        this.cableHeight.set(this.CABLE_LONG);
        this.currentlyLifting.set(mi);
        this.membersPlaced.set(mi);
        this.cableAngle.set(0);
        break;
      }

      // ── Subir tarjeta ──
      case 'rise': {
        this.trolleyPosition.set(this.TROLLEY_RIGHT);
        this.cableHeight.set(this.lerp(this.CABLE_LONG, this.CABLE_SHORT + 15, this.easeOutCubic(t)));
        this.currentlyLifting.set(mi);
        this.membersPlaced.set(mi);
        // Oscilación de peso al subir
        this.cableAngle.set(Math.sin(t * Math.PI * 4) * 3 * (1 - t));
        break;
      }

      // ── Viaje horizontal hacia el organigrama ──
      case 'travel': {
        const eased = this.easeInOutCubic(t);
        this.trolleyPosition.set(this.lerp(this.TROLLEY_RIGHT, this.TROLLEY_LEFT, eased));
        this.cableHeight.set(this.CABLE_SHORT + 15);
        this.currentlyLifting.set(mi);
        this.membersPlaced.set(mi);
        // Balanceo durante viaje (simulación de inercia)
        const swingPhase = Math.sin(t * Math.PI);   // 0→1→0
        const swingFreq = Math.sin(t * Math.PI * 6);
        this.cableAngle.set(swingFreq * swingPhase * 5);
        break;
      }

      // ── Bajar tarjeta hacia su posición en el organigrama ──
      case 'drop-lower': {
        this.trolleyPosition.set(this.TROLLEY_LEFT);
        this.cableHeight.set(this.lerp(this.CABLE_SHORT + 15, this.CABLE_GRAB, this.easeInQuad(t)));
        this.currentlyLifting.set(mi);
        this.membersPlaced.set(mi);
        this.cableAngle.set(Math.sin(t * Math.PI * 2) * 2 * (1 - t));
        break;
      }

      // ── Soltar tarjeta — se coloca en el organigrama ──
      case 'place': {
        this.trolleyPosition.set(this.TROLLEY_LEFT);
        this.cableHeight.set(this.CABLE_GRAB);
        this.currentlyLifting.set(-1);
        this.membersPlaced.set(mi + 1);
        // Pequeño rebote del cable al soltar
        this.cableAngle.set(Math.sin(t * Math.PI * 6) * 4 * (1 - t));
        break;
      }

      // ── Subir cable vacío ──
      case 'rise-back': {
        this.trolleyPosition.set(this.TROLLEY_LEFT);
        this.cableHeight.set(this.lerp(this.CABLE_GRAB, this.CABLE_SHORT, this.easeOutQuad(t)));
        this.currentlyLifting.set(-1);
        this.membersPlaced.set(mi + 1);
        this.cableAngle.set(Math.sin(t * Math.PI * 3) * 2 * (1 - t));
        break;
      }

      // ── Regresar trole a la zona de carga ──
      case 'return': {
        const eased = this.easeInOutQuad(t);
        this.trolleyPosition.set(this.lerp(this.TROLLEY_LEFT, this.TROLLEY_RIGHT, eased));
        this.cableHeight.set(this.CABLE_SHORT);
        this.currentlyLifting.set(-1);
        this.membersPlaced.set(mi + 1);
        this.cableAngle.set(Math.sin(t * Math.PI * 4) * 2 * (1 - t));
        break;
      }
    }
  }

  // ═══════════════════════════════════════
  // UTILIDADES MATEMÁTICAS
  // ═══════════════════════════════════════

  /** Normaliza un valor entre min y max a 0–1 */
  private normalize(value: number, min: number, max: number): number {
    if (max === min) return 0;
    return Math.max(0, Math.min(1, (value - min) / (max - min)));
  }

  /** Interpolación lineal entre a y b con factor t (0–1) */
  private lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  // ═══════════════════════════════════════
  // FUNCIONES DE EASING
  // ═══════════════════════════════════════

  private easeInQuad(t: number): number {
    return t * t;
  }

  private easeOutQuad(t: number): number {
    return t * (2 - t);
  }

  private easeInOutQuad(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  private easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3);
  }

  private easeInOutCubic(t: number): number {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
}
