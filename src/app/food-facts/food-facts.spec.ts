import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FoodFacts } from './food-facts';

describe('FoodFacts', () => {
  let component: FoodFacts;
  let fixture: ComponentFixture<FoodFacts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FoodFacts],
    }).compileComponents();

    fixture = TestBed.createComponent(FoodFacts);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
