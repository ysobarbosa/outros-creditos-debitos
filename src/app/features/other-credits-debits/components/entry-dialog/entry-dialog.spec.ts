import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EntryDialog } from './entry-dialog';

describe('EntryDialog', () => {
  let component: EntryDialog;
  let fixture: ComponentFixture<EntryDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntryDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(EntryDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
