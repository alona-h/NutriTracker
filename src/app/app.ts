import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  templateUrl: './app.html',
})
export class App implements OnInit {
  isDark = false;

  ngOnInit() {
    // Restore theme preference
    const saved = localStorage.getItem('theme');
    this.isDark = saved === 'dark';
    this.applyTheme();
  }

  toggleTheme() {
    this.isDark = !this.isDark;
    localStorage.setItem('theme', this.isDark ? 'dark' : 'light');
    this.applyTheme();
  }

  private applyTheme() {
    document.documentElement.classList.toggle('dark', this.isDark);
  }
}