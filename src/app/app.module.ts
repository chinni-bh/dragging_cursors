import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { LineChartComponent } from './line-chart/line-chart.component';
import { WaveformComponent } from './waveform/waveform.component';
import { Waveform2Component } from './waveform2/waveform2.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
// import { MatButtonToggleModule } from '@angular/material/button-toggle';

@NgModule({
  declarations: [
    AppComponent,
    LineChartComponent,
    WaveformComponent,
    Waveform2Component,
  ],
  imports: [BrowserModule, MatSlideToggleModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
