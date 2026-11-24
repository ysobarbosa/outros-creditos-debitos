import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageHeader } from './page-header';

describe('PageHeader', () => {
  let fixture: ComponentFixture<PageHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageHeader],
    }).compileComponents();

    fixture = TestBed.createComponent(PageHeader);
    fixture.componentRef.setInput('title', 'Outros Créditos/Débitos');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the title', () => {
    const h1: HTMLElement = fixture.nativeElement.querySelector('h1');
    expect(h1.textContent).toContain('Outros Créditos/Débitos');
  });

  it('should mark the last breadcrumb as current page', () => {
    fixture.componentRef.setInput('breadcrumbs', [
      { label: 'Início', href: '/' },
      { label: 'Outros Créditos/Débitos' },
    ]);
    fixture.detectChanges();

    const current = fixture.nativeElement.querySelector('[aria-current="page"]');
    expect(current.textContent).toContain('Outros Créditos/Débitos');
  });
});