import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { LineChartComponent } from './line-chart/line-chart.component';
import { WaveformComponent } from './waveform/waveform.component';
import { Waveform2Component } from './waveform2/waveform2.component';

@NgModule({
  declarations: [
    AppComponent,
    LineChartComponent,
    WaveformComponent,
    Waveform2Component,
  ],
  imports: [BrowserModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
