import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunitesComponent } from './communites.component';

describe('CommunitesComponent', () => {
  let component: CommunitesComponent;
  let fixture: ComponentFixture<CommunitesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommunitesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommunitesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
