import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export type DefaultTab = 'consultation' | 'saisie' | 'pointage';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private readonly URL_KEY              = 'api_url';
  private readonly CRED_KEY             = 'saved_credentials';
  private readonly DEFAULT_TAB_KEY      = 'default_tab';
  private readonly ACCOUNT_FILTER_KEY   = 'account_filter';

  /** URL de base sans /api (ex: http://localhost:8080) */
  getBaseUrl(): string {
    return localStorage.getItem(this.URL_KEY) ?? environment.apiUrl;
  }

  /** URL complète avec /api pour les appels HTTP */
  getApiUrl(): string {
    return `${this.getBaseUrl()}/api`;
  }

  setApiUrl(url: string): void {
    // On stocke toujours sans /api final
    const trimmed = url.trim().replace(/\/$/, '').replace(/\/api$/, '');
    if (trimmed) {
      localStorage.setItem(this.URL_KEY, trimmed);
    }
  }

  reset(): void {
    localStorage.removeItem(this.URL_KEY);
  }

  isCustomUrl(): boolean {
    return !!localStorage.getItem(this.URL_KEY);
  }

  getAccountFilter(): { ccm: boolean; bourso: boolean } {
    const raw = localStorage.getItem(this.ACCOUNT_FILTER_KEY);
    try { return raw ? JSON.parse(raw) : { ccm: true, bourso: true }; }
    catch { return { ccm: true, bourso: true }; }
  }

  setAccountFilter(ccm: boolean, bourso: boolean): void {
    localStorage.setItem(this.ACCOUNT_FILTER_KEY, JSON.stringify({ ccm, bourso }));
  }

  getCredentials(): { username: string; password: string } | null {
    const raw = localStorage.getItem(this.CRED_KEY);
    try { return raw ? JSON.parse(raw) : null; }
    catch { return null; }
  }

  saveServerConfig(url: string, username: string, password: string): void {
    this.setApiUrl(url);
    if (username) {
      this.setCredentials(username, password);
    } else {
      this.clearCredentials();
    }
  }

  setCredentials(username: string, password: string): void {
    localStorage.setItem(this.CRED_KEY, JSON.stringify({ username, password }));
  }

  clearCredentials(): void {
    localStorage.removeItem(this.CRED_KEY);
  }

  getDefaultTab(): DefaultTab {
    const raw = localStorage.getItem(this.DEFAULT_TAB_KEY);
    if (raw === 'saisie' || raw === 'pointage') return raw;
    return 'consultation';
  }

  setDefaultTab(tab: DefaultTab): void {
    localStorage.setItem(this.DEFAULT_TAB_KEY, tab);
  }
}
