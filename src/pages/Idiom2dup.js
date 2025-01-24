import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import resultsCSV from '../data/originalDataset/results.csv';
import statusCSV from '../data/originalDataset/status.csv';
import racesCSV from '../data/originalDataset/races.csv';
import { interpolatePath } from 'd3-interpolate-path';


function Idiom2() {
  const effectRan = useRef(false);
  const ref = useRef();


  const yearRanges = [
    { label: "All", range: [1950, 2023] },
    { label: "1950-1960", range: [1950, 1960] },
    { label: "1960-1970", range: [1960, 1970] },
    { label: "1970-1980", range: [1970, 1980] },
    { label: "1980-1990", range: [1980, 1990] },
    { label: "1990-2000", range: [1990, 2000] },
    { label: "2000-2010", range: [2000, 2010] },
    { label: "2010-2020", range: [2010, 2020] },
    { label: "2020-Present", range: [2020, 2023] },
    { label: "Last 10 years", range: [2013, 2023] },
    { label: "Last 20 years", range: [2003, 2023] },
    { label: "Last 30 years", range: [1993, 2023] },
    { label: "Last 40 years", range: [1983, 2023] },
    { label: "Last 50 years", range: [1973, 2023] },
    { label: "Last 60 years", range: [1963, 2023] },
  ];
  

  const [selectedRange, setSelectedRange] = useState(yearRanges[0].range);




  const handleYearRangeChange = (rangeLabel) => {
    const selected = yearRanges.find((range) => range.label === rangeLabel);
    if (selected) {
      setSelectedRange(selected.range);
    }
  };


  const keys = ['Accident', 'Collision', 'Spun', 'Mechanical', 'Human', 'Deaths', 'Fires','Other'];
     const width = 1300+200;
     const height = 600;
     const margin = { top: 40, right: 30, bottom: 50, left: 70 };
  
  



  const drawSteam = (results, status, races,selectedRange,isfirst) => {

    console.log(selectedRange);
    console.log(isfirst);


    

     // Mapping statusId to status
     const statusMap = new Map(status.map((d) => [d.statusId, d.status.slice(1,d.status.length-1)]));
     const racesYearMap = new Map(races.map((d) => [d.raceId, d.year]));

     // Define incidents
     const accidents = [
       "Accident"
         
     ];

     const collision = [
       "Collision",
      "Collision damage",
         
     ];

     const spun = [
       "Spun off",
       "Tyre puncture"
     ];

     const mechanical = [
       "Engine",
        "Gearbox", "Transmission",
       "Hydraulics", "Tyre", "Puncture", "Technical" , "Clutch", "Electrical", "Radiator",
       "Brakes", "Mechanical", "Throttle", "Steering", "Oil leak"
     ]


     const powertrain = [
       "Engine", "Gearbox", "Transmission", "Clutch", "Hydraulics", "Throttle", 
       "Steering", "Driveshaft", "Halfshaft", "Crankshaft", "Fuel pressure", 
       "Fuel pump", "Fuel leak", "Fuel pipe", "Oil pressure", "Oil leak", 
       "Oil pump", "Oil pipe", "Ignition", "Battery", "Engine misfire", "Turbo", 
       "CV joint", "Spark plugs", "Drivetrain", "Cooling system", "Radiator", 
       "Water pump", "Water pipe"
     ];
     
     const structural = [
       "Tyre", "Puncture", "Brakes", "Suspension", "Differential", 
       "Overheating", "Wheel", "Wheel rim", "Wheel nut", "Wheel bearing", 
       "Brake duct", "Front wing", "Rear wing", "Undertray", "Track rod", 
       "Water leak", "Mechanical"
     ];
     
     

     const human = [
       "Injured", "Injury", "Eye injury",
     ]

     const death = ["Fatal accident"];

     const fires = [
       "Heat shield fire",
     "Engine fire",
       "Fire",
       "Overheating"
     ];

     const other = [
       "Safety", "Safety concerns",
       "Damage"
     ]

     const incidentStatuses = [...accidents, ...collision, ...spun, ...mechanical, ...powertrain, ...structural, ...human, ...death, ...fires, ...other];

     // console.log("Incident Statuses:",incidentStatuses);

     // for (const [key, value] of statusMap) {
     //   if(incidentStatuses.includes(value))
     //   console.log(key, value);
     // }

     // console.log(results);
     // console.log(statusMap);
     // console.log(races);

     // Process the results to filter only relevant incidents
     const processedData = results
     .filter((d) => incidentStatuses.includes(statusMap.get(d.statusId?.trim())))
       .map((d) => ({
         resultId: d.resultId,
         statusId: d.statusId,
         driverId: d.driverId,
         status: statusMap.get(d.statusId),
         // year: +d.year,
         year: + racesYearMap.get(d.raceId)
       }));

    //  console.log('Processed Data:', processedData);


     const filteredData = processedData.filter(
      (d) => d.year >= selectedRange[0] && d.year <= selectedRange[1]
    );
    

     // Prepare data for steam graph
     const data = Array.from({ length: selectedRange[1] - selectedRange[0] + 1 }, (_, i) => {
       const year = selectedRange[0] + i;
       return {
         year,
         Accident: filteredData.filter(
           (d) => accidents.includes(d.status) && d.year === year
         ).length,
         Collision: filteredData.filter(
           (d) => collision.includes(d.status) && d.year === year
         ).length,
         Spun: filteredData.filter(
           (d) => spun.includes(d.status) && d.year === year
         ).length,
         Mechanical: filteredData.filter(
           (d) => mechanical.includes(d.status) && d.year === year
         ).length,
         Human: filteredData.filter(
           (d) => human.includes(d.status) && d.year === year
         ).length,
         Deaths: filteredData.filter(
           (d) => death.includes(d.status) && d.year === year
         ).length,
         Fires: filteredData.filter(
           (d) => fires.includes(d.status) && d.year === year
         ).length,
         Other: filteredData.filter(
           (d) => other.includes(d.status) && d.year === year
         ).length,
       };
     });

    //  console.log(data);

     
     
     const svg = d3
       .select(ref.current)
       .attr('width', width)
       .attr('height', height);

       const gridlineGroup = svg.append('g').attr('class', 'gridlines');


     const xScale = d3
       .scaleLinear()
       .domain(d3.extent(data, (d) => d.year))
       .range([margin.left, width - margin.right-200-200]);

     const maxSum = d3.max(data, (d) =>
  keys.reduce((sum, key) => sum + d[key], 0)
);

const yScale = d3
  .scaleLinear()
  .domain([-maxSum / 2, maxSum / 2]) // Center the graph around 0
  .range([height - margin.bottom, margin.top]);


     const colorScale = d3
       .scaleOrdinal()
       .domain(keys)
       .range(['#008080', '#FF7F50', '#6A5ACD', '#556B2F', '#DAA520', '#DC143C', '#4682B4', '#F4A460']); // Yellow-Blue theme

       const stack = d3
       .stack()
       .keys(keys)
       .offset(d3.stackOffsetSilhouette);
     

     const stackedData = stack(data);

     // Add legend group to the SVG
const legend = svg
.append('g')
.attr('class', 'legend')
.attr('transform', `translate(0, 0)`)
.style('opacity', 0); // Start invisible for animation

// Add legend items
keys.forEach((key, i) => {


let x ={}
let z = "";

if(key==="Accident")
{ 
 x=accidents;
 z="Incidents occured due to accidents in general."
}
else if(key==="Collision")
{
 x=collision;
 z="Incidents occured due to all kinds of collisions. The subcategories of collisions include:"
}
else if(key==="Spun")
{
 x=spun;
 z="Incidents occured due to all kinds of spun-off accidents. The subcategories of spun-off accidents include:";
 
}
else if(key==="Mechanical")
{
 x=mechanical;
 z="Powertrain includes components related to the vehicle’s propulsion and power transmission systems, along with cooling and lubrication."
}
else if(key==="Human")
{
 x=human;
 z="Incidents occured due to all kinds of human injuries. The subcategories of human injuries include:"
}
else if(key==="Deaths")
{
 x=death;
     z="Incidents occured due to deaths."
 
}
else if(key==="Fires")
{
 x=fires;
 z="Incidents occured due to all kinds of fire accidents. The subcategories of fire accidents include:";
}
else if(key==="Other")
{
 x=other;
 z="Other catgories of incidents that occured which are as follows:"
}


let y="";

x.forEach((i)=>{
 y+=i+"<br/>";
});

// Add color rectangle
legend
.append('rect')
.attr('x', 0)
.attr('y', i * 25)
.attr('width', 20)
.attr('height', 20)
.attr('fill', colorScale(key))
.on('mouseover', function (event, d) {
 d3.select(this).attr('opacity', 0.5);


  // Remove any existing tooltip
  d3.select('#tooltip-box').remove();

  // Create tooltip
  const tooltip = d3
    .select('body')
    .append('div')
    .attr('id', 'tooltip-box')
    .style('position', 'absolute')
    .style('background', '#fff')
    .style('border', '1px solid #ccc')
    .style('border-radius', '4px')
    .style('padding', '10px')
    .style('box-shadow', '0px 4px 6px rgba(0, 0, 0, 0.1)')
    .style('color', '#333')
    .style('font-size', '12px')
    .style('opacity', 0.9)
    .style('pointer-events', 'none')
    .html(`
      <strong>${key}:</strong> <br/>
              ${z}<br/><br/>
              ${y}<br/>
    `);


    tooltip.style('left', `${event.pageX+10}px`).style('top', `${event.pageY+10}px`);

})
.on('mouseout', function (event, d) {

 d3.select(this).attr('opacity', 1);
 d3.select('#tooltip-box').remove(); // Remove the tooltip

});

// Add category text
legend
.append('text')
.attr('x', 30)
.attr('y', i * 25 + 12.5)
.text(key)
.attr('font-size', '12px')
// .attr('fill', '#333')
.attr('fill', '#ccc')
.style('alignment-baseline', 'middle')
.on('mouseover', function (event, d) {
 d3.select(this).attr('opacity', 0.5);


  // Remove any existing tooltip
  d3.select('#tooltip-box').remove();

  // Create tooltip
  const tooltip = d3
    .select('body')
    .append('div')
    .attr('id', 'tooltip-box')
    .style('position', 'absolute')
    .style('background', '#fff')
    .style('border', '1px solid #ccc')
    .style('border-radius', '4px')
    .style('padding', '10px')
    .style('box-shadow', '0px 4px 6px rgba(0, 0, 0, 0.1)')
    .style('color', '#333')
    .style('font-size', '12px')
    .style('opacity', 0.9)
    .style('pointer-events', 'none')
    .html(`
      <strong>${key}:</strong> <br/>
      ${z}<br/><br/>
              ${y}<br/>
    `);


    tooltip.style('left', `${event.pageX+10}px`).style('top', `${event.pageY+10}px`);

})
.on('mouseout', function (event, d) {

 d3.select(this).attr('opacity', 1);
 d3.select('#tooltip-box').remove(); // Remove the tooltip

});

});

if (isfirst===false)
// Add animation for the legend to fade in
legend
.transition()
.duration(1000)
.attr('transform', `translate(${width -100-200 - margin.right}, ${margin.top-30})`)
.style('opacity', 1);



// Add control panel group to the SVG below the legend
const controlPanelGroup = svg.append('foreignObject')
  .attr('width', 300)
  .attr('height', 50)
  .attr('x', width - 100 - 250 - margin.right) // Align with the legend
  .attr('y', margin.top + keys.length * 25 + 10) // Position below the legend
  .append('xhtml:div') // Add an HTML <div> for the dropdown
  .style('display', 'flex')
  .style('align-items', 'center')
  .style('justify-content', 'space-between')
  .style('gap', '10px')
  .style('background', '#f8f9fa')
  .style('border', '1px solid #ccc')
  .style('padding', '5px')
  .style('border-radius', '5px');

// Add label to the control panel
controlPanelGroup
  .append('xhtml:span')
  .style('color', '#333')
  .style('font-size', '12px')
  .text('Select Year Range:');

// Add dropdown to the control panel
const dropdown = controlPanelGroup
  .append('xhtml:select')
  .style('padding', '5px')
  .style('border-radius', '4px')
  .style('border', '1px solid #ccc')
  .on('change', function () {
    const rangeLabel = this.value;
    handleYearRangeChange(rangeLabel); // Call the year range change handler
  });

// Populate the dropdown options
dropdown
  .selectAll('option')
  .data(yearRanges)
  .join('option')
  .attr('value', (d) => d.label)
  .text((d) => d.label);

// Set the dropdown's value dynamically based on `selectedRange`
// Set the dropdown's value dynamically based on `selectedRange`
dropdown.property(
  'value',
  yearRanges.find((range) => range.range[0] === selectedRange[0] && range.range[1] === selectedRange[1])?.label || 'All'
);


     const area = d3
     .area()
     .x((d) => xScale(d.data.year))
     .y0((d) => yScale(d[0]))
     .y1((d) => yScale(d[1]))
     .curve(d3.curveBasis);

     svg.selectAll('.layer')
     .data(stackedData)
     .join('path')
     .attr('class', 'layer')
     .attr('fill', (d) => colorScale(d.key))
     .attr('stroke', 'white')
     .attr('stroke-width', 0.5)
     .transition() // Add a transition
     .duration(1000) // Duration of the transition in milliseconds
     .attrTween('d', function (d) {
       const previous = d3.select(this).attr('d') || ''; // Get the current path or default to an empty string
       const current = area(d); // Generate the new path
       return interpolatePath(previous, current); // Interpolate between paths
     });
   
   

svg.selectAll('.layer')
.on('mousemove', function (event, d) {
 d3.select(this).attr('opacity', 1);
 d3.select('#tooltip-box').remove(); // Remove the tooltip
 gridlineGroup.selectAll('line').remove(); // Clear gridlines



// Extract hovered category data
const hoveredData = d.map((point) => ({
year: point.data.year,
value: point.data[d.key], // Value for the hovered category
data: point.data, // Complete data for subcategories
}));

const [x, y] = d3.pointer(event);

// Find the exact or left-most point
const closestPoint = hoveredData.find((p) => xScale(p.year) === Math.floor(x)) || // Find the exact match
hoveredData.reduce((leftMost, p) => (xScale(p.year) < x ? p : leftMost), hoveredData[0]); // Default to left-most point


 if (closestPoint) {
   d3.select(this).attr('opacity', 0.7);

   const { year, value, data } = closestPoint;

   // Generate subcategories and their counts
   const subcategories = Object.entries(data)
     .filter(([key, val]) => keys.includes(key) && val > 0)
     .map(([key, val]) => `<strong style="color:${colorScale(key)}">${key}:</strong> ${val}`)
     .join('<br/>');



   // Generate subcategories and their counts
const subcategoriesData = Object.entries(data)
.filter(([key, val]) => keys.includes(key) && val > 0)
.map(([key, val]) => ({ category: key, value: val }));

let sumF = 0;



subcategoriesData.forEach((i)=>{

sumF+=i.value;
});

// console.log(sumF);

   // Remove any existing tooltip
   d3.select('#tooltip-box').remove();

   // Create tooltip
   const tooltip = d3
     .select('body')
     .append('div')
     .attr('id', 'tooltip-box')
     .style('position', 'absolute')
     .style('background', '#fff')
     .style('border', '1px solid #ccc')
     .style('border-radius', '4px')
     .style('padding', '10px')
     .style('box-shadow', '0px 4px 6px rgba(0, 0, 0, 0.1)')
     .style('color', '#333')
     .style('font-size', '12px')
     .style('opacity', 0.9)
     .style('pointer-events', 'none')
     .html(`
       <strong>Year:</strong> ${year}<br/>
       <strong>Total Incidents:</strong> ${sumF}<br/><br/>
       <strong>Subcategories:</strong><br/>
       ${subcategories}<br/><br/>
     `);

   // Position tooltip and ensure it stays within SVG boundaries
   const svgRect = ref.current.getBoundingClientRect(); // Get SVG boundaries
   let tooltipX = event.pageX + 15; // Add offset
   let tooltipY = event.pageY + 15;

   // Check for overflow and adjust
   const tooltipRect = tooltip.node().getBoundingClientRect();
   if (tooltipX + tooltipRect.width > svgRect.right) {
     tooltipX = event.pageX - tooltipRect.width - 15; // Align to the left of cursor
   }
   if (tooltipY + tooltipRect.height > svgRect.bottom) {
     tooltipY = event.pageY - tooltipRect.height - 15; // Align above the cursor
   }

   tooltip.style('left', `${tooltipX}px`).style('top', `${tooltipY}px`);



// Set dimensions for the pie chart
const pieWidth = 120;
const pieHeight = 120;
const pieRadius = Math.min(pieWidth, pieHeight) / 2;

// Create a pie layout
const pie = d3.pie().value((d) => d.value);
const arc = d3.arc().innerRadius(0).outerRadius(pieRadius);

// Remove existing pie chart if present
// d3.select('#tooltip-pie').remove();

// Create an SVG container for the pie chart within the tooltip
const pieSvg = d3
.select('#tooltip-box')
.append('svg')
.attr('id', 'tooltip-pie')
.attr('width', pieWidth)
.attr('height', pieHeight)
.style('margin-top', '10px') // Add spacing between text and pie chart
.append('g')
.attr('transform', `translate(${pieWidth / 2}, ${pieHeight / 2})`);

// Bind data to the pie chart and create arcs
pieSvg
.selectAll('path')
.data(pie(subcategoriesData))
.join('path')
.attr('d', arc)
.attr('fill', (d) => colorScale(d.data.category))
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

// Add labels to the pie chart (optional)
// pieSvg
// .selectAll('text')
// .data(pie(subcategoriesData))
// .join('text')
// .text((d) => `${d.data.category}`)
// .attr('transform', (d) => `translate(${arc.centroid(d)})`)
// .attr('text-anchor', 'middle')
// .attr('font-size', '10px')
// .attr('fill', '#333');


 }

 else {
   // Add vertical gridlines for years
   gridlineGroup
     .selectAll('line')
     .data(data)
     .join('line')
     .attr('x1', (d) => xScale(d.year))
     .attr('x2', (d) => xScale(d.year))
     .attr('y1', margin.top)
     .attr('y2', height - margin.bottom)
     // .attr('stroke', '#e63946')
     .attr('stroke', '#D3D3D3')
     .attr('stroke-width', 1)
     .attr('stroke-dasharray', '4 2');
 }


})
.on('mouseout', function () {
 d3.select(this).attr('opacity', 1);
 d3.select('#tooltip-box').remove(); // Remove the tooltip
 gridlineGroup.selectAll('line').remove();
 d3.select('#tooltip-pie').remove(); 
});



// Remove existing axes
svg.selectAll('.x-axis').remove();
svg.selectAll('.y-axis').remove();

     

     // X-axis
     const xAxis = svg
     .append('g')
     .attr('class', 'x-axis') // Add class for easier removal
     .style('color', '#e63946'); // Set the axis color
   
   xAxis
     .attr('transform', `translate(1000,${height - margin.bottom})`)
     .transition()
     .duration(1000)
     .attr('transform', `translate(0,${height - margin.bottom})`)
     .call(d3.axisBottom(xScale).ticks(20).tickFormat(d3.format('d')));
     
     // .call(d3.axisBottom(xScale).ticks(data.length).tickFormat(d3.format('d')));
   

     xAxis
       .append('text')
       .attr('x', (width-200-100) / 2)
       .attr('y', margin.bottom - 10)
       // .attr('fill', 'black')
       .attr('fill', '#e63946')
       .attr('text-anchor', 'middle')
       .text('Timeline in years')
       .style('font-size', '14px')
       .style("font-weight","bold");

     // Y-axis
     const yAxis = svg
     .append('g')
     .attr('class', 'y-axis') // Add class for easier removal
     .style('color', '#e63946'); // Set the axis color
   
     yAxis
   .attr('transform', `translate(${margin.left},1000)`)
     .transition()
     .duration(1000)
     .attr('transform', `translate(${margin.left},0)`)
     .call(d3.axisLeft(yScale).ticks(10));


     yAxis
       .append('text')
       .attr('x', -margin.left / 2)
       .attr('y', height / 2)
       // .attr('fill', 'black')
       .attr('fill', '#e63946')
       .attr('text-anchor', 'middle')
       .attr('transform', `rotate(-90, -${margin.left / 2}, ${height / 2})`)
       .text('Number of Incidents')
       .style('font-size', '14px')
       .style("font-weight","bold");

  }

  useEffect(() => {
  
  
    // Fetch the CSV files using their URLs
    Promise.all([
      fetch(resultsCSV).then((response) => response.text()),
      fetch(statusCSV).then((response) => response.text()),
      fetch(racesCSV).then((response) => response.text()),
    ])
      .then(([resultsText, statusText, racesText]) => {
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
  
        // Parse the CSV data
        const results = parseCSV(resultsText);
        const status = parseCSV(statusText);
        const races = parseCSV(racesText);
  
        // Draw the chart with the initial selected range
        drawSteam(results, status, races,selectedRange,effectRan.current);


        if (!effectRan.current) {
          effectRan.current = true;
        }
      })
      .catch((error) => {
        console.error('Error loading or processing CSV files:', error);
      });
  }, [selectedRange]);
  

  return (
    <div className="idiom-containerM" style={{ padding: 30 }}>
      <h2>Idiom 2: Incidents over Time</h2>
      <p>
        This visualization represents the number of incidents (Accidents,
        Deaths, Fires) over time.
      </p>
      <svg ref={ref}></svg>
      {/* <div className="control-panel" style={{ marginTop: "20px", textAlign: "center" }}>
  <label htmlFor="yearRange" style={{ color: "#ccc", marginRight: "10px" }}>
    Select Year Range:
  </label>
  <select
  id="yearRange"
  style={{ padding: "5px", borderRadius: "4px" }}
  onChange={(e) => handleYearRangeChange(e.target.value)}
>
  {yearRanges.map((range, index) => (
    <option key={index} value={range.label}>
      {range.label}
    </option>
  ))}
</select>

</div> */}

    </div>
  );
}

export default Idiom2;
