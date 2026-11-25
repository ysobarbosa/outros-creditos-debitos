import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BatchTable } from './batch-table';

describe('BatchTable', () => {
  let component: BatchTable;
  let fixture: ComponentFixture<BatchTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BatchTable],
    }).compileComponents();

    fixture = TestBed.createComponent(BatchTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
