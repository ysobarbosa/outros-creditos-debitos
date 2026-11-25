import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BatchActions } from './batch-actions';

describe('BatchActions', () => {
  let component: BatchActions;
  let fixture: ComponentFixture<BatchActions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BatchActions],
    }).compileComponents();

    fixture = TestBed.createComponent(BatchActions);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
