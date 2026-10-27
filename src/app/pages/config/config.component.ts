import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ConfigService, DefaultTab } from '../../core/config.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-config',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './config.component.html',
  styleUrl: './config.component.scss'
})
export class ConfigComponent {
  private config = inject(ConfigService);

  readonly defaultUrl = environment.apiUrl;

  inputUrl = this.config.getBaseUrl();
  isCustom = this.config.isCustomUrl();
  saved = false;

  inputUsername = this.config.getCredentials()?.username ?? '';
  inputPassword = this.config.getCredentials()?.password ?? '';
  credSaved = false;
  inputDefaultTab: DefaultTab = this.config.getDefaultTab();

  save(): void {
    this.config.setApiUrl(this.inputUrl);
    this.isCustom = this.config.isCustomUrl();
    if (this.inputUsername) {
      this.config.setCredentials(this.inputUsername, this.inputPassword);
    } else {
      this.config.clearCredentials();
    }
    this.config.setDefaultTab(this.inputDefaultTab);
    this.saved = true;
    setTimeout(() => this.saved = false, 2000);
  }

  reset(): void {
    this.config.reset();
    this.inputUrl = this.config.getBaseUrl();
    this.isCustom = false;
    this.saved = false;
  }
}
