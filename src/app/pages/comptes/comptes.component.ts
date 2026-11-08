import { Component, OnInit, OnDestroy, inject, signal, computed, DestroyRef } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, switchMap, catchError, EMPTY } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
  imports: [ToastComponent, ConfigModalComponent, ConsultationComponent, SaisieComponent, PointageComponent, EditionComponent],
  templateUrl: './comptes.component.html',
  styleUrl: './comptes.component.scss'
})
export class ComptesComponent implements OnInit, OnDestroy {
  private sheets = inject(SheetsService);
  private auth = inject(AuthService);
  private config = inject(ConfigService);
  private destroyRef = inject(DestroyRef);

  currentMonth = signal(currentMonthKey());
  monthData = signal<MonthData | null>(null);
  activeTab = signal<Tab>(this.config.getDefaultTab());
  loading = signal(false);
  showConfig = signal(false);

  monthLabel = computed(() => monthKeyToLabel(this.currentMonth()));

  private monthChange$ = new Subject<void>();

  private readonly onVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      this.loadMonth();
    }
  };

  ngOnInit(): void {
    this.monthChange$.pipe(
      switchMap(() => {
        this.loading.set(true);
        this.monthData.set(null);
        return this.sheets.getMonth(this.currentMonth()).pipe(
          catchError((err: HttpErrorResponse) => {
            if (err.status === 404) this.monthData.set(null);
            this.loading.set(false);
            return EMPTY;
          })
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(data => {
      this.monthData.set(data);
      this.loading.set(false);
    });
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
    this.monthChange$.next();
  }
}
