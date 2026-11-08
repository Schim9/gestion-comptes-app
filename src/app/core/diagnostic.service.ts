import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ConfigService } from './config.service';

export interface DiagResult {
  ok: boolean;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class DiagnosticService {
  private http = inject(HttpClient);
  private config = inject(ConfigService);

  private apiUrl(baseUrl?: string): string {
    return baseUrl ? `${baseUrl.trim().replace(/\/$/, '').replace(/\/api$/, '')}/api` : this.config.getApiUrl();
  }

  checkStatus(baseUrl?: string): Observable<{ health: DiagResult; sheets: DiagResult }> {
    return this.http.get<{ status: string; anomalies: string[] }>(`${this.apiUrl(baseUrl)}/status`).pipe(
      map(r => ({
        health: r.status === 'up' ? { ok: true } : { ok: false, message: 'Serveur dégradé' },
        sheets: (r.anomalies?.length ?? 0) === 0 ? { ok: true } : { ok: false, message: r.anomalies[0] }
      })),
      catchError(err => of({
        health: { ok: false, message: `Serveur inaccessible (${err.status || err.message})` },
        sheets: { ok: false, message: 'Non vérifié (serveur inaccessible)' }
      }))
    );
  }

  checkCredentials(username: string, password: string, baseUrl?: string): Observable<DiagResult> {
    return this.http.post<{ token: string }>(`${this.apiUrl(baseUrl)}/auth/login`, { username, password }).pipe(
      map(() => ({ ok: true })),
      catchError(() => of({ ok: false, message: 'Identifiants incorrects' }))
    );
  }
}
