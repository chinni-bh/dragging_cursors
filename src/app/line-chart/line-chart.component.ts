import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import * as d3Selection from 'd3-selection';

import * as d3Scale from 'd3-scale';

import * as d3Shape from 'd3-shape';

import * as d3Array from 'd3-array';

import * as d3Axis from 'd3-axis';

import {SpectrumData} from "../shared/spectrum-data"

// import { MachineData } from "../shared/machine-data"

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss']
})
export class LineChartComponent implements OnInit {

 private margin = { top: 20, right: 20, bottom: 30, left: 50 };
 private width: number;
 private height: number;
 private x: any;
 private y: any;
 private svg: any;
 private line: d3Shape.Line<[number, number]> | undefined;
 cursor_readout:any;
 basic_cursor: any;

 constructor() {
  this.width = 900 - this.margin.left - this.margin.right;
  this.height = 500 - this.margin.top - this.margin.bottom;
  this.cursor_readout = d3.select('readout')
 }

 ngOnInit() {
  this.initSvg();
  this.initAxis();
  this.drawAxis();
  this.drawLine();
  this.renderCursor();
 }

 private initSvg() {

  this.svg = d3Selection
   .select('svg') 
   .on("click", (event:any)=>this.mouseClick(event))   
   .append('g')
   .attr(
    'transform',
    'translate(' + this.margin.left + ',' + this.margin.top + ')'
   )  
   
  
   }

 private initAxis() {
  
  this.x = d3.scaleLinear().range([0, this.width]);
  this.y = d3.scaleLinear().range([this.height, 0]);
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
   .call(d3Axis.axisLeft(this.y))
   .append('text')
   .attr('class', 'axis-title')
   .attr('transform', 'rotate(-90)')
   .attr('y', 6)
   .attr('dy', '.71em')
   .style('text-anchor', 'end')
   .text('Price ($)');
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
    .attr("d", this.line)
    .style("fill", "none")
    .style("stroke", "#CC0000")
    // .style("stroke-width", "1");


//   this.svg.append('g')
//     .selectAll("dot")
//     .datum(SpectrumData)
//     .enter()
//     .append("circle")
//     .attr("cx", function (d:any) { return SpectrumData[d].x_value; } )
//     .attr("cy", function (d:any) { return SpectrumData[d].y_value; } )
//     .attr("r", 0.2)
//      .attr("transform", "translate(" + 100 + "," + 100 + ")")
//     .style("fill", "#000000");
 }


 public mouseClick = (event:any) => {
   
  const X=SpectrumData.map((data)=>data.x_value)
    // this.cursor_readout.style("opacity", 1);
  //  console.log(d3.pointer(event))
    const i = d3.bisectCenter(X, this.x.invert(d3.pointer(event)[0]-49));
    // console.log("click ",this.x(5))

    // console.log("invert",this.x.invert(83))
    // console.log("click",i,d3.pointer(event)[0],this.x.invert(d3.pointer(event)[0]-49))

    
    
    const text = d3.select('.readout');   
    text.text(`X : ${SpectrumData[i].x_value} Y: ${SpectrumData[i].y_value} `);

    this.basic_cursor.attr("x",this.x(SpectrumData[i].x_value)-5)
    .attr("y", this.y(SpectrumData[i].y_value)-5)

//             //harmonic cursors
//       this.svg.append('g')
//     .selectAll(".harmonicCursor")
//     .data([1,2,3])
//     .enter()    
//     .append("image")   
//     .attr("xlink:href",'../../assets/starburst.svg')
//     .style("width","10px")
//     .style("height","10px")
    
//     .attr('x', this.harmonicX(i))
//  .attr('y',function(yVal:number){ return 0; })
            
          
    
  };
//  private harmonicX(i:number){
//   SpectrumData[i].x_value)*1);
//  }
 


  private renderCursor(){
   
    this.basic_cursor= this.svg.append('g')
    .selectAll(".cursor")
    .data([1])
    .enter()    
    .append("image")   
    .attr("xlink:href",'../../assets/starburst.svg')
    .style("width","10px")
    .style("height","10px")
    .attr('x',this.x(SpectrumData[80].x_value)-5)
    .attr('y',this.y(SpectrumData[80].y_value)-5)
   
  }

}
