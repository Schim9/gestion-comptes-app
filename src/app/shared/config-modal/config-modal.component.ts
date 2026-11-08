import { Component, Output, EventEmitter, ViewChild, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfigService, DefaultTab } from '../../core/config.service';
import { DiagnosticWidgetComponent } from '../diagnostic-widget/diagnostic-widget.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-config-modal',
  standalone: true,
  imports: [FormsModule, DiagnosticWidgetComponent],
  templateUrl: './config-modal.component.html',
  styleUrl: './config-modal.component.scss'
})
export class ConfigModalComponent {
  @Output() closed = new EventEmitter<void>();
  @ViewChild(DiagnosticWidgetComponent) diagWidget?: DiagnosticWidgetComponent;

  private config = inject(ConfigService);

  readonly defaultUrl = environment.apiUrl;

  inputUrl = this.config.getBaseUrl();
  isCustom = this.config.isCustomUrl();
  serverSaved = signal(false);

  defaultTab: DefaultTab = this.config.getDefaultTab();

  username = this.config.getCredentials()?.username ?? '';
  password = this.config.getCredentials()?.password ?? '';

  get canDiag(): boolean {
    return !!this.inputUrl && !!this.username && !!this.password;
  }

  close(): void { this.closed.emit(); }

  saveServer(): void {
    this.config.saveServerConfig(this.inputUrl, this.username, this.password);
    this.isCustom = this.config.isCustomUrl();
    this.serverSaved.set(true);
    setTimeout(() => this.serverSaved.set(false), 2000);
  }

  saveDefaultTab(): void { this.config.setDefaultTab(this.defaultTab); }

  resetUrl(): void {
    this.config.reset();
    this.inputUrl = this.config.getBaseUrl();
    this.isCustom = false;
    this.serverSaved.set(false);
  }

  runDiag(): void {
    this.diagWidget?.run();
  }
}
