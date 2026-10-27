import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MonthData, OperationRequest, OperationResponse, UpdateOperationRequest } from './models';
import { ConfigService } from './config.service';

@Injectable({ providedIn: 'root' })
export class SheetsService {
  private http = inject(HttpClient);
  private config = inject(ConfigService);

  private get base() { return `${this.config.getApiUrl()}/months`; }

  getMonths(): Observable<string[]> {
    return this.http.get<string[]>(this.base);
  }

  getMonth(monthKey: string): Observable<MonthData> {
    return this.http.get<MonthData>(`${this.base}/${monthKey}`);
  }

  addOperation(monthKey: string, op: OperationRequest): Observable<OperationResponse> {
    return this.http.post<OperationResponse>(`${this.base}/${monthKey}/operations`, op);
  }

  updateOperation(monthKey: string, ligne: number, req: UpdateOperationRequest): Observable<void> {
    return this.http.patch<void>(`${this.base}/${monthKey}/operations/${ligne}`, req);
  }

  deleteOperation(monthKey: string, ligne: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${monthKey}/operations/${ligne}`);
  }

  depointeOperation(monthKey: string, ligne: number): Observable<void> {
    return this.http.post<void>(`${this.base}/${monthKey}/depointer-reel/${ligne}`, {});
  }

  pointerOperation(monthKey: string, ligne: number, date: string, libelle: string, montant: string, deduireDesCourses = false): Observable<void> {
    const body: Record<string, string> = { date, libelle, montant };
    if (deduireDesCourses) body['deduireDesCourses'] = 'true';
    return this.http.post<void>(`${this.base}/${monthKey}/pointer/${ligne}`, body);
  }
}
