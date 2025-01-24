import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
// import resultsCSV from '../data/originalDataset/results.csv';
// import statusCSV from '../data/originalDataset/status.csv';
// import racesCSV from '../data/originalDataset/races.csv';
import circuitsCSV from '../data/derivedDataset/finalCircuitData.csv'
import './Idiom1.css';

function Idiom1() {

  const effectRan = useRef(false);
  const ref = useRef();
  const [statVal, setStatVal] = useState('most');
  useEffect(() => {

    console.log(effectRan.current);

    // const statVal = d3.select('#statSelect').property('value');

    // Fetch the CSV files using their URLs
    Promise.all([
      fetch(circuitsCSV).then((response) => response.text()),
    ])
      .then(([circuitsText]) => {
        // Function to parse CSV strings into arrays of objects
        const parseCSV = (csvString) => {
          const [headerLine, ...lines] = csvString.split('\n');
          const headers = headerLine.split(',');

          return lines
            .filter((line) => line.trim() !== '') // Remove empty lines
            .map((line) => {
              const values = line.split(',');
              return headers.reduce(
                (acc, header, index) => ({
                  ...acc,
                  [header.trim()]: values[index]?.trim(),
                }),
                {}
              );
            });
        };


        var circuits = parseCSV(circuitsText);
        if(statVal==='most'){
          circuits = circuits.slice(0,20)
        }else if (statVal==='least') {
          circuits = circuits.slice(-20)
        }else if(statVal==='all'){
        console.log("CIRCA", circuits);
        }
        console.log(circuits);

        // const subcategoriesData = Object.entries(circuits)
        // .filter(([key, val]) => ['accident', 'collision', 'spun_off', 'fatal_accident'].includes(key) && val > 0)
        // .map(([key, val]) => ({ category: key, value: val }));        

        // console.log("SUBIES",subcategoriesData)
        // const filteredColumns = circuits.map(row => ({
        //   accident: row.accident,
        //   collision: row.collision,
        //   spun_off: row.spun_off,
        //   fatal_accident: row.fatal_accident
        // }));

        // console.log("COLCOL",filteredColumns);

        const svg = d3.select('#barSvg');
        const width = svg.style('width').replace('px','');
        const height = svg.style('height').replace('px','')
        const margin = {top:50, bottom:160, right:0, left:100};

        const minBarWidth = 40; // Set a desired minimum bar width
const maxChartWidth = 1200; // Set a maximum chart width

const dynamicWidth = Math.min(circuits.length * minBarWidth, maxChartWidth);
const innerWidth = dynamicWidth - margin.left - margin.right;
svg.attr('width', dynamicWidth); // Update SVG width dynamically

        const innerHeight = height - margin.top - margin.bottom;

        const maxTotal = d3.max(d3.max([circuits.map(d=>{return +d.total})]));

        const color = d3.scaleOrdinal(d3.schemeCategory10);
        const xscale = d3
        .scaleBand()
        .domain(circuits.map((d) => d.circuit_name))
        .range([0, innerWidth])
        .padding(0.2);
      

const yscale = d3
  .scaleLinear()
  .domain([0, d3.max(circuits, (d) => +d.total)])
  .range([innerHeight, 0]); // Invert for SVG coordinate system
        
  svg.selectAll('*')
  .transition()
  .duration(500) // Set the duration of the fade-out
  .style('opacity', 0) // Fade out all elements
  .remove(); // Remove elements after the transition completes


        

        const donutWidth = 120;
        const donutHeight = 120;
        const donutRadiusOut = Math.min(donutWidth, donutHeight) / 2;
        const donutRadiusIn = donutRadiusOut * 0.75;
        
        const g = svg.append('g')
          .attr('transform', `translate(${margin.left}, ${margin.top})`);

          var barchart = g
          .selectAll('rect')
          .data(circuits)
          .enter()
          .append('rect')
          .attr('x', (d) => xscale(d.circuit_name)) // Horizontal position
          .attr('y', (d) => innerHeight) // Vertical position based on total
          .attr('width', xscale.bandwidth()) // Bar width
          .attr('height', (d) => 0) // Bar height
          .style('fill', '#DAA520') // Fill color
          .style('stroke', '#ccc') // Bar border color
          .style('stroke-width', 0.2)
          .style('opacity', 0)
          .transition()
          .duration(1000)
          .style('opacity', 0.9)
          .attr('height', (d) => innerHeight - yscale(+d.total))
          .attr('y', (d) => yscale(+d.total)) ;
        

          const xaxis = d3.axisBottom(xscale);
          g.append('g')
            .call(xaxis)
            .attr('transform', `translate(-1000, ${innerHeight})`)
            .transition()
            .duration(1000)
            .attr('transform', `translate(0, ${innerHeight})`)
            .selectAll('text') // Select the labels
            .attr('transform', 'rotate(-45)') // Rotate labels
            .style('text-anchor', 'end') // Align to the end for readability
            .style('font-size', '8px');

            const yaxis = d3.axisLeft(yscale);
g.append('g').call(yaxis)
.attr('transform', `translate(0, 1000)`)
.transition()
.duration(1000)
.attr('transform', `translate(0, 0)`);

// Add y-axis label
g.append('text')
  .attr('class', 'axis-label')
  .attr('x', -1000)
  .attr('y', height / 2)
  .attr('transform', `rotate(-90, -${margin.left / 2}, ${height / 2})`)
  .text('Total Accidents')
  .attr('fill', '#e63946')
  .style('font-size', '14px')
  .style('font-weight', 'bold')
  .transition()
.duration(1000)
.attr('x', -margin.left / 2);


// tooltip part 
      
      g
      .selectAll("rect")
      .on('mouseover', function (event, d) {

        d3.select('#tooltip-c').remove();

        const tooltip= d3.select("body").append("div")
        .attr('id','tooltip-c')
        .attr("class", "bar-tooltip")
        .style("z-index", 2)
        .style("opacity", 0);


        tooltip.transition()
         .duration(200)
         .style("opacity", 0.95)
         tooltip.html(`
          <strong style='font-size:18px'>${d.circuit_name}</strong><br/><br/>
          Location: ${d.location}<br/>
          Country: ${d.country}<br/><br/>
          <strong style='font-size:15px'><u>Total Number of Accidents: ${d.total}</u></strong><br/><br/>
          Accidents: ${d.accident}<br/>
          Collisions: ${d.collision}<br/>
          Spun Off: ${d.spun_off}<br/>
          Fatal Accidents: ${d.fatal_accident}
        `)
         .style("left", (event.pageX) + "px")
         .style("top", (event.pageY - 28) + "px");
         
         
         const pieData = [
           { category: 'Accidents', value: +d.accident },
           { category: 'Collisions', value: +d.collision },
           { category: 'Spun Off', value: +d.spun_off },
           { category: 'Fatal Accidents', value: +d.fatal_accident }
          ];
          
          // console.log("DD",pieData);
        // d3.select('#tooltip-donut').remove();

        const donutSvg = d3.select('#tooltip-c')
        .append('svg')
        .attr('id', 'tooltip-donut')
        .attr('width', donutWidth)
        .attr('height', donutHeight)
        .style('position', 'relative') 
        .style('top', '20px')  
        .style('left', '90px') 
        .append('g')
        .attr('transform', `translate(${donutWidth / 2}, ${donutHeight / 2})`); 
  
        const pie = d3.pie().value((d) => d.value).sort(null);
        const arc = d3.arc().innerRadius(donutRadiusIn).outerRadius(donutRadiusOut);        

          donutSvg
          .selectAll('path')
          .data(pie(pieData))
          .join('path')
          .attr('d', arc)
          .attr('fill', (d,i) => color(i))
          .attr('stroke', 'white')
          .attr('stroke-width', 1)
          .style('opacity', 0.8)
          .transition()
          .duration(500)
          .attrTween('d', function (d) {
            const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
            return function (t) {
              return arc(interpolate(t));
            };
          });

       })
       .on("mousemove", function(event, d){
            d3.select('#tooltip-c').style("left", (event.pageX + 15) + "px") 
            .style("top", (event.pageY - 28) + "px");
       })
     .on("mouseout", function(event, d) {
       d3.select('#tooltip-c').transition()
         .duration(500)
         .style("opacity", 0);
      })
      })


      if (!effectRan.current) {
        effectRan.current = true;
      }
    }, [statVal])

  return (
    <div className="idiom-containerM" style={{padding:30}}>
      {/* <h2>Idiom 1: Deaths + Accidents Vs Circuit</h2> */}
      <div style={{ height: 30 }}></div>
      <p>This section visualizes the number of deaths and accidents per circuit in F1 history.</p>
      <select id='statSelect' onChange={(e) => setStatVal(e.target.value)} // Update state on change
        value={statVal}>
        <option value='most'>20 Most dangerous tracks</option>
        <option value='least'>20 Least dangerous tracks</option>
        <option value='all'> All tracks</option>
        </select>
      <div>
        <svg id='barSvg'></svg>
      </div>
    </div>
  );
}

export default Idiom1;
