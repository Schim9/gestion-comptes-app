import { Component, inject, input, signal } from '@angular/core';
import { concatMap, map, of } from 'rxjs';
import { DiagnosticService } from '../../core/diagnostic.service';

type DiagStatus = 'idle' | 'loading' | 'ok' | 'error';
interface DiagCheck { label: string; status: DiagStatus; message?: string; }

const IDLE_CHECKS: DiagCheck[] = [
  { label: 'Serveur',       status: 'idle' },
  { label: 'Identifiants',  status: 'idle' },
  { label: 'Google Sheets', status: 'idle' }
];

@Component({
  selector: 'app-diagnostic-widget',
  standalone: true,
  imports: [],
  templateUrl: './diagnostic-widget.component.html',
  styleUrl: './diagnostic-widget.component.scss'
})
export class DiagnosticWidgetComponent {
  url      = input('');
  username = input('');
  password = input('');

  private diag = inject(DiagnosticService);

  diagRunning = signal(false);
  checks = signal<DiagCheck[]>(IDLE_CHECKS);

  private updateCheck(i: number, check: DiagCheck): void {
    this.checks.update(c => c.map((x, idx) => idx === i ? check : x));
  }

  run(): void {
    this.diagRunning.set(true);
    this.checks.set([
      { label: 'Serveur',       status: 'loading' },
      { label: 'Identifiants',  status: 'idle' },
      { label: 'Google Sheets', status: 'idle' }
    ]);

    const url = this.url() || undefined;
    this.diag.checkStatus(url).pipe(
      concatMap(({ health, sheets }) => {
        this.updateCheck(0, { label: 'Serveur', status: health.ok ? 'ok' : 'error', message: health.message });
        if (!health.ok) {
          this.updateCheck(2, { label: 'Google Sheets', status: 'error', message: sheets.message });
          return of(null);
        }
        this.updateCheck(1, { label: 'Identifiants', status: 'loading' });
        return this.diag.checkCredentials(this.username(), this.password(), url).pipe(
          map(creds => ({ creds, sheets }))
        );
      })
    ).subscribe({
      next: result => {
        if (result) {
          this.updateCheck(1, { label: 'Identifiants', status: result.creds.ok ? 'ok' : 'error', message: result.creds.message });
          this.updateCheck(2, { label: 'Google Sheets', status: result.sheets.ok ? 'ok' : 'error', message: result.sheets.message });
        }
        this.diagRunning.set(false);
      },
      error: () => { this.diagRunning.set(false); }
    });
  }
}
