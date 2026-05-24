import { Routes } from '@angular/router';
import { NutritionLogComponent } from './nutrition-log/nutrition-log';
import { FoodDatabaseComponent } from './food-database/food-database';
import { DashboardComponent } from './dashboard/dashboard';
import { ProfileComponent } from './profile/profile';
import { InsightsComponent } from './insights/insights';

export const routes: Routes = [
  { path: '', redirectTo: 'summary', pathMatch: 'full' },

  { path: 'summary',   component: DashboardComponent },
  { path: 'log',       component: NutritionLogComponent },
  { path: 'foods',     component: FoodDatabaseComponent },
  { path: 'insights',  component: InsightsComponent },
  { path: 'profile',   component: ProfileComponent },

  // Legacy redirects
  { path: 'dashboard',   redirectTo: 'summary',  pathMatch: 'full' },
  { path: 'food-intake', redirectTo: 'log',       pathMatch: 'full' },
  { path: 'food-facts',  redirectTo: 'foods',     pathMatch: 'full' },
];
