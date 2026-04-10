import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserCode } from './user-code';

describe('UserCode', () => {
  let component: UserCode;
  let fixture: ComponentFixture<UserCode>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserCode],
    }).compileComponents();

    fixture = TestBed.createComponent(UserCode);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
