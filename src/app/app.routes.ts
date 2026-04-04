import { Routes } from '@angular/router';
import { FoodIntakeComponent } from './food-intake/food-intake';
import { FoodFactsComponent } from './food-facts/food-facts';

export const routes: Routes = [
    { path: '', redirectTo: 'food-intake', pathMatch: 'full' },
    { path: 'food-intake', component: FoodIntakeComponent },
    { path: 'food-facts', component: FoodFactsComponent }
];
