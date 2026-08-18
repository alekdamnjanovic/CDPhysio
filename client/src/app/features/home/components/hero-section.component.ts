import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RevealDirective } from '../../../core/directives/reveal.directive';
import { ParallaxDirective } from '../../../core/directives/parallax.directive';
import { CLINIC_CONFIG } from '../../../core/constants/clinic.constants';

interface BodyRegion {
  id: string;
  name: string;
  x: number;
  y: number;
  labelSide: 'left' | 'right';
  connections: string[];
  rootCauses: string;
  description: string;
}

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [RevealDirective, ParallaxDirective, NgFor, NgIf],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="hero-wrapper">
      <div class="hero-particles" aria-hidden="true">
        <span class="particle p1"></span>
        <span class="particle p2"></span>
        <span class="particle p3"></span>
        <span class="particle p4"></span>
        <span class="particle p5"></span>
        <span class="particle p6"></span>
        <span class="particle p7"></span>
        <span class="particle p8"></span>
      </div>

      <div class="hero-orb orb-1" aria-hidden="true"></div>
      <div class="hero-orb orb-2" aria-hidden="true"></div>

      <section class="hero reveal" appReveal>
        <div class="hero-content">
          <span class="tagline">{{ clinic.tagline }}</span>
          <h1>{{ clinic.heroHeading }}</h1>
          <p>{{ clinic.heroDescription }}</p>
          <div class="hero-actions">
            <a href="#about" class="btn secondary">Meet the Practitioner</a>
            <a [href]="clinic.janeAppBookingUrl" target="_blank" rel="noopener" class="btn cta">Book Now</a>
          </div>
        </div>

        <div class="hero-visual" appParallax>
          <div class="kinetic-chain-container">
            <div class="kinetic-header">
              <span class="kinetic-eyebrow">Interactive Concept</span>
              <h3>The Kinetic Chain</h3>
              <p>Tap a joint to discover where pain really comes from.</p>
            </div>

            <div class="kinetic-map">
              <svg viewBox="0 0 340 520" class="body-svg" aria-label="Interactive kinetic chain body map">
                <defs>
                  <filter id="glowFilter">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <linearGradient id="activeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#00A8E8" stop-opacity="0.9"/>
                    <stop offset="100%" stop-color="#0072A3" stop-opacity="0.9"/>
                  </linearGradient>
                </defs>

                <!-- Connection lines (all pairs) -->
                <line *ngFor="let line of connectionLines()"
                      [attr.x1]="line.x1" [attr.y1]="line.y1"
                      [attr.x2]="line.x2" [attr.y2]="line.y2"
                      [class.active-line]="line.isActive"
                      class="chain-line" />

                <!-- Pulse rings for active node -->
                <circle *ngIf="activeRegion() as ar"
                        [attr.cx]="ar.x" [attr.cy]="ar.y" r="14"
                        class="pulse-ring" />

                <!-- Region nodes -->
                <g *ngFor="let region of regions"
                   class="region-node"
                   [class.is-active]="activeRegionId() === region.id"
                   [class.is-connected]="isConnected(region.id)"
                   [class.is-idle]="activeRegionId() !== region.id && !isConnected(region.id)"
                   (click)="setActiveRegion(region.id)"
                   role="button"
                   [attr.aria-label]="'Select ' + region.name"
                   tabindex="0"
                   (keydown.enter)="setActiveRegion(region.id)"
                   (keydown.space)="setActiveRegion(region.id)">
                  <circle [attr.cx]="region.x" [attr.cy]="region.y" r="20" class="hit-area" />
                  <circle [attr.cx]="region.x" [attr.cy]="region.y" r="7" class="node-dot" />
                  <text [attr.x]="region.labelSide === 'right' ? region.x + 14 : region.x - 14"
                        [attr.y]="region.y + 4"
                        [attr.text-anchor]="region.labelSide === 'right' ? 'start' : 'end'"
                        class="node-text">{{ region.name }}</text>
                </g>
              </svg>

              <!-- Info card -->
              <div class="info-card" *ngIf="activeRegion() as region" [attr.data-region]="region.id">
                <div class="info-card-header">
                  <div class="info-dot"></div>
                  <h4>{{ region.name }}</h4>
                </div>
                <p class="info-desc">{{ region.description }}</p>
                <div class="info-root" *ngIf="region.rootCauses">
                  <span class="info-root-label">Root-cause connections:</span>
                  <span class="info-root-value">{{ region.rootCauses }}</span>
                </div>
                <div class="info-links">
                  <button *ngFor="let conn of region.connections"
                          class="info-link-btn"
                          (click)="setActiveRegion(conn)">
                    {{ getRegionName(conn) }} →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `
})
export class HeroSectionComponent {
  protected readonly clinic = CLINIC_CONFIG;

  public activeRegionId = signal<string>('knee');

  /*
   * Anatomically accurate kinetic chain regions.
   * Positions map onto the SVG body silhouette (viewBox 0 0 340 520).
   * Connections reflect the biomechanical kinetic chain:
   *   - Adjacent joints are linked (ankle↔knee↔hip↔lumbar↔thoracic↔cervical)
   *   - The shoulder complex connects via the thoracic spine and cervical spine
   *   - The core/pelvis bridge the upper and lower chains
   */
  public regions: BodyRegion[] = [
    {
      id: 'cervical',
      name: 'Cervical Spine',
      x: 170, y: 68,
      labelSide: 'right',
      connections: ['shoulder', 'thoracic'],
      rootCauses: 'Forward head posture, thoracic stiffness, shoulder tension',
      description: 'Neck pain rarely starts in the neck. It is commonly driven by poor thoracic mobility forcing the cervical spine to compensate, or by chronic shoulder elevation and tension patterns.'
    },
    {
      id: 'shoulder',
      name: 'Shoulder',
      x: 230, y: 100,
      labelSide: 'right',
      connections: ['cervical', 'thoracic'],
      rootCauses: 'Thoracic kyphosis, scapular dyskinesis, cervical dysfunction',
      description: 'The shoulder relies on the thoracic spine for overhead range. Mid-back stiffness or poor scapular control forces the rotator cuff and labrum to overwork, increasing injury risk.'
    },
    {
      id: 'thoracic',
      name: 'Thoracic Spine',
      x: 170, y: 150,
      labelSide: 'left',
      connections: ['cervical', 'shoulder', 'lumbar'],
      rootCauses: 'Sedentary posture, rib cage restrictions, diaphragm tension',
      description: 'The thoracic spine is the central hub of the kinetic chain. Stiffness here forces both the neck and lower back to overcompensate, making it a common hidden driver of pain above and below.'
    },
    {
      id: 'lumbar',
      name: 'Low Back',
      x: 170, y: 220,
      labelSide: 'right',
      connections: ['thoracic', 'hip'],
      rootCauses: 'Hip immobility, poor core stabilization, thoracic stiffness',
      description: 'Low back pain is most often a symptom, not the source. Limited hip mobility or thoracic stiffness forces the lumbar spine to move beyond its designed range, creating strain and disc stress.'
    },
    {
      id: 'hip',
      name: 'Hip / Pelvis',
      x: 155, y: 275,
      labelSide: 'left',
      connections: ['lumbar', 'knee'],
      rootCauses: 'Core weakness, pelvic asymmetry, lumbar compensation',
      description: 'The hip is the engine of the kinetic chain. Restrictions in hip rotation or extension overload the lumbar spine above and alter knee mechanics below. Hip mobility is foundational to pain-free movement.'
    },
    {
      id: 'knee',
      name: 'Knee',
      x: 160, y: 365,
      labelSide: 'right',
      connections: ['hip', 'ankle'],
      rootCauses: 'Hip weakness, ankle stiffness, foot pronation',
      description: 'The knee is caught between the hip and ankle. It is a stable hinge joint controlled by the joints above and below. Most knee pain originates from poor hip control or limited ankle dorsiflexion.'
    },
    {
      id: 'ankle',
      name: 'Ankle / Foot',
      x: 162, y: 450,
      labelSide: 'left',
      connections: ['knee'],
      rootCauses: 'Arch collapse, calf tightness, prior ankle sprains',
      description: 'As the foundation of the kinetic chain, foot and ankle dysfunction travels upward. Limited ankle dorsiflexion alters knee tracking and hip mechanics, and is a common hidden driver of knee and even back pain.'
    }
  ];

  public activeRegion = computed(() => {
    return this.regions.find(r => r.id === this.activeRegionId());
  });

  public isConnected(id: string): boolean {
    const current = this.activeRegion();
    if (!current) return false;
    return current.connections.includes(id);
  }

  public getRegionName(id: string): string {
    return this.regions.find(r => r.id === id)?.name || id;
  }

  public connectionLines = computed(() => {
    const lines: { x1: number; y1: number; x2: number; y2: number; isActive: boolean }[] = [];
    const activeId = this.activeRegionId();
    const active = this.activeRegion();
    const drawn = new Set<string>();

    for (const r1 of this.regions) {
      for (const connId of r1.connections) {
        const r2 = this.regions.find(r => r.id === connId);
        if (!r2) continue;
        const key = [r1.id, r2.id].sort().join(':');
        if (drawn.has(key)) continue;
        drawn.add(key);

        const isActive = !!active &&
          ((r1.id === activeId && active.connections.includes(r2.id)) ||
           (r2.id === activeId && active.connections.includes(r1.id)));

        lines.push({ x1: r1.x, y1: r1.y, x2: r2.x, y2: r2.y, isActive });
      }
    }
    return lines;
  });

  public setActiveRegion(id: string): void {
    this.activeRegionId.set(id);
  }
}
