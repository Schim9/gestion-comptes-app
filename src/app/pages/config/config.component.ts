import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ConfigService, DefaultTab } from '../../core/config.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-config',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './config.component.html',
  styleUrl: './config.component.scss'
})
export class ConfigComponent {
  private config = inject(ConfigService);

  readonly defaultUrl = environment.apiUrl;

  inputUrl = this.config.getBaseUrl();
  isCustom = this.config.isCustomUrl();
  saved = signal(false);

  inputUsername = this.config.getCredentials()?.username ?? '';
  inputPassword = this.config.getCredentials()?.password ?? '';
  credSaved = false;
  inputDefaultTab: DefaultTab = this.config.getDefaultTab();

  save(): void {
    this.config.saveServerConfig(this.inputUrl, this.inputUsername, this.inputPassword);
    this.isCustom = this.config.isCustomUrl();
    this.config.setDefaultTab(this.inputDefaultTab);
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 2000);
  }

  reset(): void {
    this.config.reset();
    this.inputUrl = this.config.getBaseUrl();
    this.isCustom = false;
    this.saved.set(false);
  }
}
