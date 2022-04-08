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
import { saveAs } from 'file-saver';

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
    this.downloadPNG();
  }

  downloadPNG() {
    d3.select('#saveButton').on('click', () => {
      var svgString = this.getSVGString(d3.select('svg#wf').node());
      this.svgString2Image(
        svgString,
        2 * this.width,
        2 * this.height,
        'png',
        (dataBlob) => {
          saveAs(dataBlob, 'D3 vis exported to PNG.png'); // FileSaver.js function
        }
      );
    });
  }

  svgString2Image(
    svgString: string,
    width: number,
    height: number,
    format: string,
    callback: (dataBlob: any) => void
  ) {
    var format = format ? format : 'png';
    var imgsrc =
      'data:image/svg+xml;base64,' +
      btoa(unescape(encodeURIComponent(svgString))); // Convert SVG string to data URL

    var image = new Image();
    image.onload = () => {
      var canvas = document.createElement('canvas');
      var context = canvas.getContext('2d');
      canvas.width = width;
      canvas.height = height;
      context?.clearRect(0, 0, width, height);
      context?.drawImage(image, 0, 0, width, height);
      canvas.toBlob((blob) => {
        // var filesize = 300 + 'KB'; // Math.round(blob?.length / 1024) + ' KB';
        if (callback) callback(blob);
      });
    };
    image.src = imgsrc;
  }

  getSVGString(svgNode: any) {
    // throw new Error('Method not implemented.');
    svgNode.setAttribute('xlink', 'http://www.w3.org/1999/xlink');
    var cssStyleText = this.getCSSStyles(svgNode);
    this.appendCSS(cssStyleText, svgNode);
    var serializer = new XMLSerializer();
    var svgString = serializer.serializeToString(svgNode);
    svgString = svgString.replace(/(\w+)?:?xlink=/g, 'xmlns:xlink='); // Fix root xlink without namespace
    svgString = svgString.replace(/NS\d+:href/g, 'xlink:href'); // Safari NS namespace fix
    return svgString;
  }
  appendCSS(cssText: string, element: any) {
    // throw new Error('Method not implemented.');
    var styleElement = document.createElement('style');
    styleElement.setAttribute('type', 'text/css');
    styleElement.innerHTML = cssText;
    var refNode = element.hasChildNodes() ? element.children[0] : null;
    element.insertBefore(styleElement, refNode);
  }
  getCSSStyles(parentElement: any) {
    // throw new Error('Method not implemented.');
    var selectorTextArr = [];
    // Add Parent element Id and Classes to the list
    selectorTextArr.push('#' + parentElement.id);
    for (var c = 0; c < parentElement.classList.length; c++)
      if (!this.contains('.' + parentElement.classList[c], selectorTextArr))
        selectorTextArr.push('.' + parentElement.classList[c]);
    // Add Children element Ids and Classes to the list
    var nodes = parentElement.getElementsByTagName('*');
    for (var i = 0; i < nodes.length; i++) {
      var id = nodes[i].id;
      if (!this.contains('#' + id, selectorTextArr))
        selectorTextArr.push('#' + id);
      var classes = nodes[i].classList;
      for (var c = 0; c < classes.length; c++)
        if (!this.contains('.' + classes[c], selectorTextArr))
          selectorTextArr.push('.' + classes[c]);
    }
    // Extract CSS Rules
    var extractedCSSText = '';
    for (var i = 0; i < document.styleSheets.length; i++) {
      var s = document.styleSheets[i];
      try {
        if (!s.cssRules) continue;
      } catch (e: any) {
        if (e.name !== 'SecurityError') throw e; // for Firefox
        continue;
      }
      var cssRules = s.cssRules;
      for (var r = 0; r < cssRules.length; r++) {
        const rule = cssRules[r];
        if (!(rule instanceof CSSStyleRule)) {
          continue;
        }
        if (this.contains(rule.selectorText, selectorTextArr))
          extractedCSSText += cssRules[r].cssText;
      }
    }
    return extractedCSSText;
  }
  contains(str: any, arr: any) {
    return arr.indexOf(str) === -1 ? false : true;
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
