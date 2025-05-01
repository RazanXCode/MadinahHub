import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageEventsComponent } from './manage-events.component';

describe('ManageEventsComponent', () => {
  let component: ManageEventsComponent;
  let fixture: ComponentFixture<ManageEventsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageEventsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
