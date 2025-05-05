import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunityDetailsComponent } from './community-details.component';

describe('CommunityDetailsComponent', () => {
  let component: CommunityDetailsComponent;
  let fixture: ComponentFixture<CommunityDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommunityDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommunityDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
