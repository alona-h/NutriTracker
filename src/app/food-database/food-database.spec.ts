import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FoodDatabaseComponent } from './food-database';

describe('FoodDatabaseComponent', () => {
  let component: FoodDatabaseComponent;
  let fixture: ComponentFixture<FoodDatabaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FoodDatabaseComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FoodDatabaseComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
