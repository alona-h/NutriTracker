import { Routes } from '@angular/router';
import { FoodIntakeComponent } from './food-intake/food-intake';
import { FoodFactsComponent } from './food-facts/food-facts';
import { DashboardComponent } from './dashboard/dashboard';

export const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'food-intake', component: FoodIntakeComponent },
    { path: 'food-facts', component: FoodFactsComponent }
];
