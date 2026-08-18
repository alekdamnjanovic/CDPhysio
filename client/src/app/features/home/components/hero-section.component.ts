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
  connections: string[];
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
              <p>Select a region to see its root-cause connections.</p>
            </div>
            
            <div class="kinetic-map">
              <svg viewBox="0 0 300 500" class="wireframe-svg">
                <!-- Connections -->
                <line *ngFor="let line of connectionLines()" 
                      [attr.x1]="line.x1" [attr.y1]="line.y1" 
                      [attr.x2]="line.x2" [attr.y2]="line.y2" 
                      [class.active-line]="line.isActive"
                      class="connection-line" />
                
                <!-- Nodes -->
                <g *ngFor="let region of regions" 
                   class="node-group" 
                   [class.active]="activeRegionId() === region.id || isConnected(region.id)"
                   [class.primary]="activeRegionId() === region.id"
                   (click)="setActiveRegion(region.id)">
                  <circle [attr.cx]="region.x" [attr.cy]="region.y" r="8" class="node-point" />
                  <circle [attr.cx]="region.x" [attr.cy]="region.y" r="16" class="node-hitbox" />
                  <text [attr.x]="region.x + (region.x > 150 ? 15 : -15)" 
                        [attr.y]="region.y + 4" 
                        [attr.text-anchor]="region.x > 150 ? 'start' : 'end'"
                        class="node-label">{{ region.name }}</text>
                </g>
              </svg>

              <!-- Dynamic Card -->
              <div class="kinetic-card" *ngIf="activeRegion() as region">
                <h4>{{ region.name }}</h4>
                <p>{{ region.description }}</p>
                <div class="kinetic-card-links">
                  <span class="link-label">Connected to:</span>
                  <span *ngFor="let conn of region.connections; let last = last">
                    {{ getRegionName(conn) }}{{ !last ? ', ' : '' }}
                  </span>
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

  public regions: BodyRegion[] = [
    { id: 'neck', name: 'Cervical Spine', x: 150, y: 50, connections: ['shoulder', 'thoracic'], description: 'Neck pain often stems from poor thoracic mobility or shoulder mechanics.' },
    { id: 'shoulder', name: 'Shoulder Complex', x: 200, y: 100, connections: ['neck', 'thoracic'], description: 'Shoulder issues are frequently linked to neck posture and mid-back stiffness.' },
    { id: 'thoracic', name: 'Thoracic Spine', x: 150, y: 140, connections: ['neck', 'shoulder', 'lumbar'], description: 'The mid-back acts as a central hub; stiffness here forces the neck or lower back to overcompensate.' },
    { id: 'lumbar', name: 'Lumbar Spine', x: 150, y: 220, connections: ['thoracic', 'hip'], description: 'Lower back pain is rarely just a back problem—it is often a symptom of hip immobility or core dysfunction.' },
    { id: 'hip', name: 'Hip Joint', x: 110, y: 260, connections: ['lumbar', 'knee'], description: 'The hips are the engine of movement. Poor hip mobility inevitably overloads the lower back or knees.' },
    { id: 'knee', name: 'Knee', x: 120, y: 350, connections: ['hip', 'ankle'], description: 'The knee is a "dumb joint" caught between the hip and ankle. Knee pain usually originates from above or below.' },
    { id: 'ankle', name: 'Ankle / Foot', x: 130, y: 440, connections: ['knee'], description: 'As the foundation of the kinetic chain, foot instability can travel upwards, causing knee or hip pain.' }
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
    const lines: any[] = [];
    const activeId = this.activeRegionId();
    const activeRegion = this.activeRegion();
    
    // Generate all pairs to avoid duplicates
    const drawn = new Set<string>();
    
    for (const r1 of this.regions) {
      for (const conn of r1.connections) {
        const r2 = this.regions.find(r => r.id === conn);
        if (r2) {
          const pairKey = [r1.id, r2.id].sort().join('-');
          if (!drawn.has(pairKey)) {
            drawn.add(pairKey);
            
            // Check if this line is active (connects the active region to one of its connections)
            const isActive = activeRegion && 
                             ((r1.id === activeId && activeRegion.connections.includes(r2.id)) ||
                              (r2.id === activeId && activeRegion.connections.includes(r1.id)));
                              
            lines.push({
              x1: r1.x, y1: r1.y,
              x2: r2.x, y2: r2.y,
              isActive
            });
          }
        }
      }
    }
    return lines;
  });

  public setActiveRegion(id: string): void {
    this.activeRegionId.set(id);
  }
}
