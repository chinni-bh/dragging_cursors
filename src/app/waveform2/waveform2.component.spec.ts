import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Waveform2Component } from './waveform2.component';

describe('Waveform2Component', () => {
  let component: Waveform2Component;
  let fixture: ComponentFixture<Waveform2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Waveform2Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Waveform2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
