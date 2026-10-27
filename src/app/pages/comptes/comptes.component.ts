import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { SheetsService } from '../../core/sheets.service';
import { AuthService } from '../../core/auth.service';
import { ConfigService } from '../../core/config.service';
import { ToastComponent } from '../../shared/toast/toast.component';
import { ConfigModalComponent } from '../../shared/config-modal/config-modal.component';
import { ConsultationComponent } from './consultation/consultation.component';
import { SaisieComponent } from './saisie/saisie.component';
import { PointageComponent } from './pointage/pointage.component';
import { EditionComponent } from './edition/edition.component';
import { MonthData } from '../../core/models';
import { currentMonthKey, navigateMonth, monthKeyToLabel } from '../../core/month-utils';

type Tab = 'consultation' | 'saisie' | 'pointage' | 'edition';

@Component({
  selector: 'app-comptes',
  standalone: true,
  imports: [CommonModule, ToastComponent, ConfigModalComponent, ConsultationComponent, SaisieComponent, PointageComponent, EditionComponent],
  templateUrl: './comptes.component.html',
  styleUrl: './comptes.component.scss'
})
export class ComptesComponent implements OnInit, OnDestroy {
  private sheets = inject(SheetsService);
  private auth = inject(AuthService);
  private config = inject(ConfigService);

  currentMonth = signal(currentMonthKey());
  monthData = signal<MonthData | null>(null);
  activeTab = signal<Tab>(this.config.getDefaultTab());
  loading = signal(false);
  showConfig = signal(false);

  monthLabel = () => monthKeyToLabel(this.currentMonth());

  private readonly onVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      this.loadMonth();
    }
  };

  ngOnInit(): void {
    this.loadMonth();
    document.addEventListener('visibilitychange', this.onVisibilityChange);
  }

  ngOnDestroy(): void {
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
  }

  setTab(tab: Tab): void {
    this.activeTab.set(tab);
    if (tab === 'pointage' || tab === 'edition') {
      this.loadMonth();
    }
  }

  prevMonth(): void {
    this.currentMonth.set(navigateMonth(this.currentMonth(), -1));
    this.loadMonth();
  }

  nextMonth(): void {
    this.currentMonth.set(navigateMonth(this.currentMonth(), 1));
    this.loadMonth();
  }

  logout(): void {
    this.auth.logout();
  }

  loadMonth(): void {
    this.loading.set(true);
    this.monthData.set(null);
    this.sheets.getMonth(this.currentMonth()).subscribe({
      next: data => {
        this.monthData.set(data);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 404) this.monthData.set(null);
        this.loading.set(false);
      }
    });
  }
}
