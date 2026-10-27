import { Component, Input, inject } from '@angular/core';
import { concatMap, of } from 'rxjs';
import { DiagnosticService } from '../../core/diagnostic.service';

type DiagStatus = 'idle' | 'loading' | 'ok' | 'error';
interface DiagCheck { label: string; status: DiagStatus; message?: string; }

@Component({
  selector: 'app-diagnostic-widget',
  standalone: true,
  imports: [],
  templateUrl: './diagnostic-widget.component.html',
  styleUrl: './diagnostic-widget.component.scss'
})
export class DiagnosticWidgetComponent {
  @Input() url = '';
  @Input() username = '';
  @Input() password = '';

  private diag = inject(DiagnosticService);

  diagRunning = false;
  checks: DiagCheck[] = [
    { label: 'Serveur',       status: 'idle' },
    { label: 'Identifiants',  status: 'idle' },
    { label: 'Google Sheets', status: 'idle' }
  ];

  run(): void {
    this.diagRunning = true;
    this.checks = [
      { label: 'Serveur',       status: 'loading' },
      { label: 'Identifiants',  status: 'idle' },
      { label: 'Google Sheets', status: 'idle' }
    ];

    const url = this.url || undefined;
    this.diag.checkHealth(url).pipe(
      concatMap(r1 => {
        this.checks[0] = { label: 'Serveur', status: r1.ok ? 'ok' : 'error', message: r1.message };
        if (!r1.ok) return of(null);
        this.checks[1] = { label: 'Identifiants', status: 'loading' };
        return this.diag.checkCredentials(this.username, this.password, url);
      }),
      concatMap(r2 => {
        if (r2 === null) return of(null);
        this.checks[1] = { label: 'Identifiants', status: r2.ok ? 'ok' : 'error', message: r2.message };
        if (!r2.ok) return of(null);
        this.checks[2] = { label: 'Google Sheets', status: 'loading' };
        return this.diag.checkSheets(url);
      })
    ).subscribe({
      next: r3 => {
        if (r3 !== null) this.checks[2] = { label: 'Google Sheets', status: r3.ok ? 'ok' : 'error', message: r3.message };
        this.diagRunning = false;
      },
      error: () => { this.diagRunning = false; }
    });
  }
}
