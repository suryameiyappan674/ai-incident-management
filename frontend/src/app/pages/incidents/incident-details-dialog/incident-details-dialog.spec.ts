import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncidentDetailsDialog } from './incident-details-dialog';

describe('IncidentDetailsDialog', () => {
  let component: IncidentDetailsDialog;
  let fixture: ComponentFixture<IncidentDetailsDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncidentDetailsDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(IncidentDetailsDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
