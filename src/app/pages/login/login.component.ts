import { Component, OnInit, ViewChild, inject } from '@angular/core';
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

  inputUrl      = this.config.getBaseUrl();
  inputUsername = this.config.getCredentials()?.username ?? '';
  inputPassword = this.config.getCredentials()?.password ?? '';

  loading = false;
  error   = '';

  diagVisible = false;

  ngOnInit(): void {
    const creds = this.config.getCredentials();
    if (creds && !this.auth.isAuthenticated()) {
      this.loading = true;
      this.auth.login(creds.username, creds.password).subscribe({
        next: () => this.router.navigate(['/comptes']),
        error: () => { this.loading = false; }
      });
    }
  }

  save(): void {
    if (!this.inputUsername || !this.inputPassword) return;
    this.config.setApiUrl(this.inputUrl);
    this.config.setCredentials(this.inputUsername, this.inputPassword);
    this.loading = true;
    this.error = '';
    this.auth.login(this.inputUsername, this.inputPassword).subscribe({
      next: () => this.router.navigate(['/comptes']),
      error: () => {
        this.error = 'Connexion échouée — vérifiez l\'URL et les identifiants';
        this.loading = false;
      }
    });
  }

  runDiag(): void {
    this.diagVisible = true;
    setTimeout(() => this.diagWidget?.run());
  }
}
