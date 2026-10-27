import { Component, input, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MonthData } from '../../../core/models';
import { ConfigService } from '../../../core/config.service';

@Component({
  selector: 'app-consultation',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './consultation.component.html',
  styleUrl: './consultation.component.scss'
})
export class ConsultationComponent {
  monthData = input<MonthData | null>(null);

  showReelles   = signal(true);
  showAVenir    = signal(true);
  showRecurrent = signal(true);

  private config = inject(ConfigService);
  private savedFilter = this.config.getAccountFilter();

  filterCCM    = signal(this.savedFilter.ccm);
  filterBourso = signal(this.savedFilter.bourso);

  compteFilter = computed<'both' | 'CCM' | 'Boursorama'>(() => {
    if (this.filterCCM() && this.filterBourso()) return 'both';
    return this.filterCCM() ? 'CCM' : 'Boursorama';
  });

  toggleCCM(): void {
    if (this.filterCCM() && !this.filterBourso()) return;
    this.filterCCM.update(v => !v);
    this.config.setAccountFilter(this.filterCCM(), this.filterBourso());
  }

  toggleBourso(): void {
    if (this.filterBourso() && !this.filterCCM()) return;
    this.filterBourso.update(v => !v);
    this.config.setAccountFilter(this.filterCCM(), this.filterBourso());
  }

  reellesSorted = computed(() => {
    const f = this.compteFilter();
    const sorted = [...(this.monthData()?.operationsReelles ?? [])].sort((a, b) => {
      const dateDiff = parseInt(b.date ?? '0', 10) - parseInt(a.date ?? '0', 10);
      return dateDiff !== 0 ? dateDiff : b.ligne - a.ligne;
    });
    return f === 'both' ? sorted : sorted.filter(o => o.compte === f);
  });

  opsAVenir = computed(() => {
    const f = this.compteFilter();
    const ops = this.monthData()?.operationsPrevisionnelles.filter(o => o.type === 'a_venir') ?? [];
    return f === 'both' ? ops : ops.filter(o => o.compte === f);
  });

  opsRecurrentes = computed(() => {
    const f = this.compteFilter();
    const ops = this.monthData()?.operationsPrevisionnelles.filter(o => o.type === 'recurrent') ?? [];
    return f === 'both' ? ops : ops.filter(o => o.compte === f);
  });
}
