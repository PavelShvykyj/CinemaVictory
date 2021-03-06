import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LogginComponent } from './loggin.component';

describe('LoggginComponent', () => {
  let component: LogginComponent;
  let fixture: ComponentFixture<LogginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LogginComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LogginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
