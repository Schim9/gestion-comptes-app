import { Component, OnInit, ViewChild, inject, signal, Injector, afterNextRender } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ConfigService } from '../../core/config.service';
import { DiagnosticWidgetComponent } from '../../shared/diagnostic-widget/diagnostic-widget.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, DiagnosticWidgetComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  private auth   = inject(AuthService);
  private router = inject(Router);
  private config = inject(ConfigService);

  @ViewChild(DiagnosticWidgetComponent) diagWidget?: DiagnosticWidgetComponent;

  private injector = inject(Injector);

  inputUrl      = this.config.getBaseUrl();
  inputUsername = this.config.getCredentials()?.username ?? '';
  inputPassword = this.config.getCredentials()?.password ?? '';

  loading = signal(false);
  error   = '';

  diagVisible = false;

  ngOnInit(): void {
    const creds = this.config.getCredentials();
    if (creds && !this.auth.isAuthenticated()) {
      this.loading.set(true);
      this.auth.login(creds.username, creds.password).subscribe({
        next: () => this.router.navigate(['/comptes']),
        error: () => { this.loading.set(false); }
      });
    }
  }

  save(): void {
    if (!this.inputUsername || !this.inputPassword) return;
    this.config.saveServerConfig(this.inputUrl, this.inputUsername, this.inputPassword);
    this.loading.set(true);
    this.error = '';
    this.auth.login(this.inputUsername, this.inputPassword).subscribe({
      next: () => this.router.navigate(['/comptes']),
      error: () => {
        this.error = 'Connexion échouée — vérifiez l\'URL et les identifiants';
        this.loading.set(false);
      }
    });
  }

  runDiag(): void {
    this.diagVisible = true;
    afterNextRender(() => this.diagWidget?.run(), { injector: this.injector });
  }
}
