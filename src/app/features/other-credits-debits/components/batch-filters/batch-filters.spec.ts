import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BatchFilters } from './batch-filters';

describe('BatchFilters', () => {
  let component: BatchFilters;
  let fixture: ComponentFixture<BatchFilters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BatchFilters],
    }).compileComponents();

    fixture = TestBed.createComponent(BatchFilters);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
