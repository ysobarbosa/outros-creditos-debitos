import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BatchSearch } from './batch-search';

describe('BatchSearch', () => {
  let component: BatchSearch;
  let fixture: ComponentFixture<BatchSearch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BatchSearch],
    }).compileComponents();

    fixture = TestBed.createComponent(BatchSearch);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
