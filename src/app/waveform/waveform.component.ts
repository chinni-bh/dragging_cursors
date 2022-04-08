import { Component, OnInit } from '@angular/core';
import * as d3Selection from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Shape from 'd3-shape';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';
import { WaveformData } from '../shared/machine-data';
import { SpectrumData } from '../shared/spectrum-data';
import * as d3 from 'd3';
import { BehaviorSubject } from 'rxjs';
import { ThisReceiver } from '@angular/compiler';

@Component({
  selector: 'app-waveform',
  templateUrl: './waveform.component.html',
  styleUrls: ['./waveform.component.scss'],
})
export class WaveformComponent implements OnInit {
  private margin = { top: 20, right: 20, bottom: 30, left: 30 };
  private width: number;
  private height: number;
  private x: any;
  private y: any;
  private svg: any;
  X: any;
  Y: any;
  cursor_readout: any;
  basic_cursor_A: any;
  cursor_A_postion: number = 130;
  cursor_B_postion: number = 150;
  basic_cursor_B: any;
  current_cursor: any;
  c_id: number = 0;
  cursor_point = new BehaviorSubject<Number | number>(0);
  index: any;
  isHarmonic: boolean = false;
  private line: d3Shape.Line<[number, number]> | undefined;
  circleSymbol = (size: number) =>
    d3
      .symbol()
      .type(d3.symbolCircle)
      .size(Math.PI * Math.pow(size / 2, 2))(null);

  deltaForSideband = 5;
  bisect: any;
  showCard = true;

  constructor() {
    this.width = 900 - this.margin.left - this.margin.right;
    this.height = 500 - this.margin.top - this.margin.bottom;
    this.cursor_readout = d3.select('readout');
  }

  ngOnInit() {
    this.X = SpectrumData.map((data) => data.x_value);
    this.Y = SpectrumData.map((data) => data.y_value);
    this.initSvg();
    this.initAxis();

    this.drawAxis();
    this.drawLine();
    this.renderCursor();
    this.addLegendDiv();
    this.renderLegends();

    // render([
    //   {
    //     name: 'series XFASDFA',
    //     color: 'red',
    //     symbol: circleSymbol,
    //     opacity: 0.5,
    //   },
    //   {
    //     name: 'series 2',
    //     color: 'blue',
    //     symbol: circleSymbol,
    //     opacity: 0.3,
    //   },
    // ]);
  }
  renderLegends() {
    var responsiveDivHeight = 20 * 30;
    var div = d3
      .select('#legendDiv')
      .append('div')
      .classed('legend-entry', true);
    // .attr('height', '100%')
    // .attr('width', '100%')
    // .attr('viewbox', '0 0 500 ' + responsiveDivHeight + '')
    // .attr('preserveAspectRatio', 'xMinYMin');

    div
      .append('svg')
      .classed('legend-entry-svg', true)
      .attr('viewBox', '0 0 100 100')
      .append('path')
      .attr('transform', 'translate(50 50)');

    div.append('span').classed('legend-entry-name', true);
    div
      .select('.legend-entry-svg path')
      .attr('d', this.circleSymbol(10))
      .attr('fill', 'red')
      .attr('opacity', '0.5');

    div.select('.legend-entry-name').text('Frequence');
    // entries = [
    //   {
    //     name: 'series 1',
    //     color: 'red',
    //     symbol: this.circleSymbol,
    //     opacity: 0.5,
    //   },
    // ];
    // var entriesUpdate: any = d3
    //   .select('#container')
    //   .selectAll('.legend-entry')
    //   .data(entries);
    // entriesUpdate.exit().remove();

    // var entriesEnter = entriesUpdate
    //   .enter()
    //   .append('div')
    //   .classed('legend-entry', true);

    // // create DOM for marker
    // entriesEnter
    //   .append('svg')
    //   .classed('legend-entry-svg', true)
    //   .attr('viewBox', '0 0 100 100')
    //   .append('path')
    //   .attr('transform', 'translate(50 50)');

    // // create DOM for name
    // entriesEnter.append('span').classed('legend-entry-name', true);

    // var entries: any = entriesEnter.merge(entriesUpdate);
    // entries.foreach((entry: any) => {
    //   var entryDiv = d3.select('#container');

    //   entryDiv
    //     .select('.legend-entry-svg path')
    //     .attr('d', entry.symbol(100))
    //     .attr('fill', entry.color)
    //     .attr('opacity', entry.opacity);

    //   entryDiv.select('.legend-entry-name').text(entry.name);
    // });
  }

  addLegendDiv(): void {
    if (this.showCard) {
      const localIndex = this.index;
      const w = this.width - 4;
      const h = this.height;
      const lineHeight = 60;

      try {
        const cont = d3.select('#cont_line_' + localIndex);
        const div = cont.select('.plotly .svg-container');
        const yBase = h - lineHeight - 20;
        div
          .append('div')
          .attr('class', 'legend-area la-' + localIndex)
          .style('top', `${yBase}px`)
          .append('svg')
          .style('width', `${w}px`)
          .style('height', `${lineHeight - 5}px`)
          .attr('class', 'legend-svg legend-' + localIndex);
      } catch (e) {}
    }
  }

  private initSvg() {
    this.svg = d3Selection
      .select('svg')
      // .on('click', (event: any) => this.mouseClick(event))
      .append('g')
      .attr(
        'transform',
        'translate(' + this.margin.left + ',' + this.margin.top + ')'
      );
  }

  private initAxis() {
    this.x = d3Scale.scaleLinear().range([0, this.width]);
    this.y = d3Scale.scaleLinear().range([this.height, 0]);
    this.x.domain(d3Array.extent(SpectrumData, (d) => d.x_value));
    this.y.domain(d3Array.extent(SpectrumData, (d) => d.y_value));
  }

  private drawAxis() {
    this.svg
      .append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(d3Axis.axisBottom(this.x));

    this.svg
      .append('g')
      .attr('class', 'axis axis--y')
      .call(d3Axis.axisLeft(this.y));
  }

  private drawLine() {
    this.line = d3Shape
      .line()
      .x((d: any) => this.x(d.x_value))
      .y((d: any) => this.y(d.y_value));

    this.svg
      .append('path')
      .datum(SpectrumData)
      .attr('class', 'line')
      .attr('d', this.line)
      .style('fill', 'red')
      .style('stroke', 'blue')
      .style('stroke-width', '1');
  }

  private renderCursor() {
    // this.basic_cursor_A = this.svg
    // .append('g')
    // .selectAll('.cursor')
    // .data([1])
    // .enter()
    // .append('image')
    // .attr('xlink:href', '../../assets/star-e.svg')
    // .attr('id', 'cursor-a')
    // .style('width', '12px')
    // .style('height', '30px')
    // .attr('x', this.x(SpectrumData[this.cursor_A_postion].x_value) - 5)
    // .attr('y', this.y(SpectrumData[this.cursor_A_postion].y_value) - 5)
    // .on('click', (event: any) => this.mouseClick(event));

    this.basic_cursor_B = this.svg
      .append('g')
      .selectAll('.cursor')
      .data([1])
      .enter()
      .append('image')
      .attr('xlink:href', '../../assets/star.svg')
      .attr('id', 'cursor-b')
      .style('width', '13px')
      .style('height', '30px')
      .attr('x', this.x(SpectrumData[this.cursor_B_postion].x_value) - 6)
      .attr('y', this.y(SpectrumData[this.cursor_B_postion].y_value) - 15)
      .on('click', (event: any) => this.mouseClick(event));

    // This allows to find the closest X index of the mouse:
    // this.bisect = d3.bisector((d: any) => {
    //   return d.x;
    // }).left;
  }

  renderSideBands(x_coordinate: number, deltaForSideband: number) {
    let sideBandIdIndex = 0;
    let nextXValSideBand = x_coordinate; //x_coordinate + this.deltaForSideband;
    let indexOfNextSideBand = 0; //d3.bisectCenter(this.X, nextXValSideBand);

    while (nextXValSideBand + deltaForSideband < this.X[this.X.length - 1]) {
      nextXValSideBand += deltaForSideband;
      indexOfNextSideBand = d3.bisectCenter(this.X, nextXValSideBand);
      this.svg
        .append('g')
        .selectAll('.cursor')
        .data([1])
        .enter()
        .append('image')
        .attr('xlink:href', '../../assets/circle.svg')
        .attr('id', 'r-side-band-' + sideBandIdIndex++)
        .style('width', '10px')
        .style('height', '10px')
        .attr('x', this.x(SpectrumData[indexOfNextSideBand].x_value) - 5)
        .attr('y', this.y(SpectrumData[indexOfNextSideBand].y_value) - 5);
    }

    let prevXValSideBand = x_coordinate;
    indexOfNextSideBand = 0;
    while (prevXValSideBand - deltaForSideband > this.X[0]) {
      prevXValSideBand -= deltaForSideband;
      indexOfNextSideBand = d3.bisectCenter(this.X, prevXValSideBand);
      this.svg
        .append('g')
        .selectAll('.cursor')
        .data([1])
        .enter()
        .append('image')
        .attr('xlink:href', '../../assets/circle.svg')
        .attr('id', 'l-side-band-' + sideBandIdIndex++)
        .style('width', '10px')
        .style('height', '10px')
        .attr('x', this.x(SpectrumData[indexOfNextSideBand].x_value) - 5)
        .attr('y', this.y(SpectrumData[indexOfNextSideBand].y_value) - 5);
      console.log(
        'l-side-band-' + (sideBandIdIndex - 1),
        ' \n prev x-vlaue',
        prevXValSideBand,
        '\n WaveformIndex-Next sideband: ',
        indexOfNextSideBand
      );
    }
    let startX = 0,
      delta = deltaForSideband;
    let drag = d3
      .drag()
      .on('start', (d: any) => {
        startX = d.x;
      })
      .on('end', (d: any) => {
        // let updatedCoordinates =
        //   SpectrumData[d3.bisectCenter(this.X, this.x.invert(d.x))];
        // let currentCoordinates =
        //   SpectrumData[d3.bisectCenter(this.X, this.x.invert(startX))];
        // let diffInXvalues = //startX - d.x;
        //   +updatedCoordinates.x_value - +currentCoordinates.x_value;
        // console.log('UC', updatedCoordinates, 'CC', currentCoordinates);
        // console.log('startX - d.x:  ', startX - d.x);
        // console.log('diffInXvalues: ', diffInXvalues);
        // deltaForSideband += diffInXvalues;
      })
      .on('drag', (d: any) => {
        let updatedCoordinates =
          SpectrumData[d3.bisectCenter(this.X, this.x.invert(d.x))];
        let currentCoordinates =
          SpectrumData[d3.bisectCenter(this.X, this.x.invert(startX))];

        let diffInXvalues = //startX - d.x;
          +updatedCoordinates.x_value - +currentCoordinates.x_value;
        // console.log('UC', updatedCoordinates, 'CC', currentCoordinates);
        // console.log('startX - d.x:  ', startX - d.x);
        // console.log('diffInXvalues: ', diffInXvalues);
        this.deltaForSideband = delta + diffInXvalues;

        this.svg.selectAll("image[id*='side-band-']").remove();
        this.renderSideBands(x_coordinate, this.deltaForSideband);
      });
    this.svg.selectAll("image[id*='side-band-']").call(drag);
  }

  public mouseClick = (event: any) => {
    let id_extension = '';
    if (event.target.id === 'cursor-a') {
      id_extension = 'a';
    }
    let x_coordinate =
      +SpectrumData[
        id_extension === 'a' ? this.cursor_A_postion : this.cursor_B_postion
      ].x_value;
    console.log('Base Band', x_coordinate);
    this.renderSideBands(x_coordinate, this.deltaForSideband);
  };
}
