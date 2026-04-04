import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgClass],
  templateUrl: './sidebar.html',
})
export class SidebarComponent {
  @Input() isDark = false;
  @Output() themeToggle = new EventEmitter<void>();

  navItems = [
    {
      label: 'Food Intake',
      route: '/food-intake',
      description: 'Track daily intake',
      icon: 'intake',
    },
    {
      label: 'Food Facts',
      route: '/food-facts',
      description: 'Nutrition database',
      icon: 'facts',
    },
  ];
}