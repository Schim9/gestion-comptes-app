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

  checkHealth(baseUrl?: string): Observable<DiagResult> {
    return this.http.get(`${this.apiUrl(baseUrl)}/health`).pipe(
      map(() => ({ ok: true })),
      catchError(err => of({ ok: false, message: `Serveur inaccessible (${err.status || err.message})` }))
    );
  }

  checkCredentials(username: string, password: string, baseUrl?: string): Observable<DiagResult> {
    return this.http.post<{ token: string }>(`${this.apiUrl(baseUrl)}/auth/login`, { username, password }).pipe(
      map(() => ({ ok: true })),
      catchError(() => of({ ok: false, message: 'Identifiants incorrects' }))
    );
  }

  checkSheets(baseUrl?: string): Observable<DiagResult> {
    return this.http.get<{ status: string; message?: string }>(`${this.apiUrl(baseUrl)}/diagnostic/sheets`).pipe(
      map(r => r.status === 'OK'
        ? { ok: true }
        : { ok: false, message: r.message ?? 'Erreur Google Sheets' }),
      catchError(err => of({ ok: false, message: `Erreur Google Sheets (${err.status})` }))
    );
  }
}
