import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FoodIntake } from './food-intake';

describe('FoodIntake', () => {
  let component: FoodIntake;
  let fixture: ComponentFixture<FoodIntake>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FoodIntake],
    }).compileComponents();

    fixture = TestBed.createComponent(FoodIntake);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
