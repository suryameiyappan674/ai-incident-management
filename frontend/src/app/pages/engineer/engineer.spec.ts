import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Engineer } from './engineer';

describe('Engineer', () => {
  let component: Engineer;
  let fixture: ComponentFixture<Engineer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Engineer],
    }).compileComponents();

    fixture = TestBed.createComponent(Engineer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
