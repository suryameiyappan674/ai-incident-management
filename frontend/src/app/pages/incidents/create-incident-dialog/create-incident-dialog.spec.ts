import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateIncidentDialog } from './create-incident-dialog';

describe('CreateIncidentDialog', () => {
  let component: CreateIncidentDialog;
  let fixture: ComponentFixture<CreateIncidentDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateIncidentDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateIncidentDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
