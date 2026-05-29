import { Component, Input, Output, EventEmitter, inject, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class SidebarComponent {
  @Input() isNight = false;
  @Output() themeToggle  = new EventEmitter<void>();
  @Output() closeSidebar = new EventEmitter<void>();

  private auth = inject(AuthService);

  userInitial = computed(() => {
    const user = this.auth.currentUser();
    if (!user) return '?';
    return (user.name ?? user.code).charAt(0).toUpperCase();
  });

  userLabel = computed(() => {
    const user = this.auth.currentUser();
    if (!user) return '';
    return user.name ?? user.code;
  });

  logout(): void {
    this.auth.logout();
    this.closeSidebar.emit();
  }
}
