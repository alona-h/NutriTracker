import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar';
import { LoginComponent } from './login/login';
import { RegisterComponent } from './register/register';
import { AuthService } from './services/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, SidebarComponent, LoginComponent, RegisterComponent],
  templateUrl: './app.html',
})
export class App implements OnInit {
  private auth = inject(AuthService);

  isNight = false;
  sidebarOpen = false;
  authView = signal<'login' | 'register'>('login');

  isAuthenticated = computed(() => this.auth.isAuthenticated());

  ngOnInit(): void {
    this.auth.init();
    const saved = localStorage.getItem('theme');
    this.isNight = saved === 'night';
    this.applyTheme();
  }

  toggleTheme(): void {
    this.isNight = !this.isNight;
    localStorage.setItem('theme', this.isNight ? 'night' : 'light');
    this.applyTheme();
  }

  private applyTheme(): void {
    document.documentElement.classList.toggle('night', this.isNight);
  }
}
