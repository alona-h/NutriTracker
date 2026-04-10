import { Component, Input, Output, EventEmitter, inject, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgClass } from '@angular/common';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgClass],
  templateUrl: './sidebar.html',
})
export class SidebarComponent {
  @Input() isDark = false;
  @Output() themeToggle = new EventEmitter<void>();
  @Output() closeSidebar = new EventEmitter<void>();

  private auth = inject(AuthService);

  currentUser = computed(() => this.auth.currentUser());

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

  navItems = [
    { label: 'Food Intake', route: '/food-intake', icon: 'intake' },
    { label: 'Food Facts',  route: '/food-facts',  icon: 'facts'  },
  ];
}