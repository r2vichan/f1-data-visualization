import * as d3 from 'd3';
import React, { useEffect, useRef } from 'react';
import pitstop_final_data from '../data/derivedDataset/pitstop_final_data.csv';
import './Idiom5Resources/Idiom5.css';

function Idiom5() {
  const effectRan = useRef(false);
  const chartRef = useRef();

  useEffect(() => {
    if (effectRan.current) return; // Prevent the effect from running again

    // console.log('Idiom5 rendered');
    // Clear existing SVG elements before rendering
    d3.select(chartRef.current).selectAll('*').remove();

    // Fetch and process data
    d3.csv(pitstop_final_data).then((data) => {
      // Step 2: Parse and prepare the data
      data.forEach((d) => {
        d.duration = +d.duration; // Convert duration to number
        d.year = +d.year; // Convert year to number
      });

      // Step 3: Filter out invalid data
      const validData = data.filter((d) => !isNaN(d.duration) && d.duration !== '');

      // Step 4: Group and sort teams
      const teamGroups = d3.group(validData, (d) => d.team);
      const topTeams = Array.from(teamGroups.entries()).sort((a, b) => b[1].length - a[1].length);
      const topTeamNames = topTeams.map((d) => d[0]);

      // Set up dimensions and margins
      const margin = { top: 60, right: 80, bottom: 60, left: 80 };
      const width = 900 - margin.left - margin.right;
      const height = 600 - margin.top - margin.bottom;

      // Create SVG container
      const svg = d3
        .select(chartRef.current)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

      // Create scales
      const x = d3.scaleBand().domain([]).range([0, width]).padding(1);
      const y = d3
        .scaleLinear()
        .domain([10, d3.max(validData, (d) => d.duration)])
        .nice()
        .range([height, 0]);

      // Create axes
      svg
        .append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(x))
        .selectAll('path')
        .style('stroke', 'red');

      svg
        .append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(y).tickPadding(10))
        .selectAll('path')
        .style('stroke', 'red');

      svg.selectAll('.y-axis text').style('fill', 'red');

      // Add axis labels
      svg
        .append('text')
        .attr('class', 'x-axis-label')
        .attr('x', width / 2)
        .attr('y', height + 35)
        .attr('text-anchor', 'middle')
        .text('Teams')
        .style('fill', 'red');

      svg
        .append('text')
        .attr('class', 'y-axis-label')
        .attr('x', -height / 2)
        .attr('y', -40)
        .attr('transform', 'rotate(-90)')
        .attr('text-anchor', 'middle')
        .text('Pitstop duration (seconds)')
        .style('fill', 'red');

      // Create color and opacity scales
      const teamColor = d3.scaleOrdinal(d3.schemeCategory10);
      const yearOpacity = d3
        .scaleLinear()
        .domain([2011, 2024])
        .range([0.3, 0.8]);


      // Ensure the tooltip exists
      let tooltipi5 = d3.select('body').select('.tooltipi5');
      if (tooltipi5.empty()) {
          tooltipi5 = d3.select('body')
              .append('div')
              .attr('class', 'tooltipi5')
              .style("z-index", 2)
              .style('opacity', 0)
              .style('position', 'absolute')
              .style('text-align', 'center')
              .style('background', 'rgba(0, 0, 0, 0.8)') // Black background
              .style('color', 'white') // White text
              .style('padding', '6px')
              .style('border-radius', '2px')
              .style('pointer-events', 'none'); // Disable pointer events
      } 
      

      // Define update chart function
      const updateChart = (selectedTeams) => {
        const updatedData = validData.filter((d) => selectedTeams.includes(d.team));

        x.domain(selectedTeams);

        // Update x-axis
        svg.select('.x-axis').transition().duration(500).call(d3.axisBottom(x));
        svg.selectAll('.x-axis text').style('fill', 'red');

        // Update gridlines
        const gridlines = svg.selectAll('.gridline-x').data(selectedTeams, (d) => d);
        gridlines.exit().remove();

        gridlines
          .enter()
          .append('line')
          .attr('class', 'gridline-x')
          .merge(gridlines)
          .transition()
          .duration(500)
          .attr('x1', (d) => x(d))
          .attr('x2', (d) => x(d))
          .attr('y1', 0)
          .attr('y2', height)
          .style('stroke', '#ddd')
          .style('stroke-width', 1.25)
          .style('stroke-dasharray', 'none')
          .style('stroke-opacity', 0.8);
        
        // Update dots
        const dots = svg.selectAll('.dot').data(updatedData, (d) => `${d.team}-${d.year}`);
        dots.exit().remove();
        
        // Add new dots or update existing ones
        const newDots = dots
          .enter()
          .append('circle')
          .attr('class', 'dot');

        newDots
            .merge(dots) // Combine new dots with existing ones
            .transition() // Apply transition to updated dots
            .duration(500)
            .attr('cx', (d) => x(d.team) + (Math.random() - 0.5) * 90)
            .attr('cy', (d) => y(d.duration))
            .attr('r', 4)
            .attr('fill', (d) => teamColor(d.team))
            .attr('fill-opacity', (d) => yearOpacity(d.year))
            .style('stroke', '#000');

        // Add event listeners separately to the selection
        newDots
            .merge(dots)
            .on('mouseover', function (event, d) {
                tooltipi5
                    .transition()
                    .duration(25)
                    .style('opacity', 0.8);
                tooltipi5
                    .html(
                        `<div>
                            <strong>Team:</strong> ${d.team}<br/>
                            <strong>Duration:</strong> ${d.duration}s<br/>
                            <strong>Year:</strong> ${d.year}
                        </div>`
                    )
                    .style('left', `${event.pageX + 10}px`)
                    .style('top', `${event.pageY - 28}px`);
            })
            .on('mousemove', function (event) {
                tooltipi5
                    .style('left', `${event.pageX + 10}px`)
                    .style('top', `${event.pageY - 28}px`);
            })
            .on('mouseout', function () {
                tooltipi5.transition().duration(10).style('opacity', 0);
            });
      };

      // Step 14: Add the Year Opacity Legend
      const legendWidth = 200;
      const legendHeight = 15;

      // Create a linear gradient for the legend to represent the year opacity scale
      const legend = svg.append('g')
          .attr('class', 'legend')
          .attr('transform', `translate(${width + 30}, ${height -10})`); // Position it side of the chart

      const gradient = legend.append('defs')
          .append('linearGradient')
          .attr('id', 'year-opacity-gradient')
          .attr('x1', '0%')
          .attr('x2', '100%')
          .attr('y1', '0%')
          .attr('y2', '0%');

      gradient.append('stop')
          .attr('offset', '0%')
          .attr('stop-color', 'red')
          .attr('stop-opacity', 0.3); // Low opacity for the earliest year

      gradient.append('stop')
          .attr('offset', '100%')
          .attr('stop-color', 'red')
          .attr('stop-opacity', 0.8); // High opacity for the latest year

      legend.append('rect')
          .attr('x', 0)
          .attr('y', 8) // Position the text just above the gradient
          .attr('width', legendWidth)
          .attr('height', legendHeight)
          .attr('transform', 'rotate(-90)')  // Rotate to make it vertical
          .style('fill', 'url(#year-opacity-gradient)');

      // Add text labels for 2011 and 2024
      legend.append('text')
          .attr('x', 0)
          .attr('y', 18) // Position the text just above the gradient
          .attr('text-anchor', 'start')
          .style('fill', 'red')
          .text('2011');

      legend.append('text')
          .attr('x', 35)
          .attr('y', -205) // Position the text just above the gradient
          .attr('text-anchor', 'end')
          .style('fill', 'red')
          .text('2024');

      // Create checkboxes
      const checkboxContainer = d3.select('#checkbox-container-idiom5');
      topTeamNames.forEach((team, index) => {
        const checkbox = checkboxContainer.append('div').attr('class', 'checkbox-item-i5');
        const isChecked = index < 6; // Select the first six teams by default
        checkbox
          .append('input')
          .attr('type', 'checkbox')
          .attr('id', team)
          .attr('value', team)
          .property('checked', isChecked) // Set the default checked state
          .on('change', function () {
            const selectedTeams = [];
            checkboxContainer.selectAll('input:checked').each(function () {
              selectedTeams.push(this.value);
            });
            if (selectedTeams.length <= 6) {
              updateChart(selectedTeams);
            } else {
              this.checked = false;
              alert('You can select a maximum of 6 teams.');
            }
          });

        checkbox.append('label').attr('for', team).text(team).style('color', 'red');
      });
      // Select the first six teams by default and update the chart
      const defaultSelectedTeams = topTeamNames.slice(0, 6);
      updateChart(defaultSelectedTeams);
    });
    effectRan.current = true; // Mark the effect as having run
  }, []);

  return (
    <div className="idiom-container5" style={{ padding: 30, color: "#e63946" }}>
      {/* <h2>Idiom 5: Pitstop Duration Vs Time</h2> */}
      <div style={{ height: 30 }}></div>
      <div id="checkbox-container-idiom5" style={{ position: 'absolute', top: '50px', right: '20px', maxHeight: '600px', overflowY: 'auto', color: "#e63946" }}>
        <h4> Teams</h4>
      </div>
      <div ref={chartRef}></div>
    </div>
  );
}

export default Idiom5;