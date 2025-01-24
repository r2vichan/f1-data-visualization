import * as d3 from 'd3';
import React, { useState, useEffect, useRef } from 'react';
import jsonData from "../data/derivedDataset/lapTimesVsSeason.json";
import './Idiom4Resources/Idiom4.css';

function Idiom4() {
  const eras = [
    {
      id: 'v10',
      startDate: new Date('1996-01-01'),
      endDate: new Date('2005-12-31'),
      name: 'V10 Era',
      color: 'lightgray',
      description: 'The V10 Era marked a time of high-revving engines, incredible speed, and intense competition. Teams like Ferrari, McLaren, and Renault dominated, with legendary drivers such as Michael Schumacher and Mika Häkkinen fighting for titles. The era ended with significant regulation changes that moved towards a more fuel-efficient engine formula.'
    },
    {
      id: 'v8',
      startDate: new Date('2006-01-01'),
      endDate: new Date('2008-12-31'),
      name: 'V8 Era',
      color: 'lightblue',
      description: 'The V8 Era began with a shift to 2.4L V8 engines, reducing engine power and improving fuel efficiency. This period saw increased focus on aerodynamics, with teams like Ferrari, McLaren, and Renault continuing to excel. Notable moments included Fernando Alonso’s two consecutive championships in 2005 and 2006, and the fierce rivalry between Kimi Räikkönen and Lewis Hamilton.'
    },
    {
      id: 'v8hybrid',
      startDate: new Date('2009-01-01'),
      endDate: new Date('2013-12-31'),
      name: 'V8 Hybrid Era',
      color: 'lightgreen',
      description: 'The V8 Hybrid Era saw the introduction of hybrid technology and KERS (Kinetic Energy Recovery System), blending traditional V8 engines with energy recovery for improved performance. It also saw the rise of Sebastian Vettel and Red Bull Racing, with Vettel winning four consecutive championships. The era also marked the transition towards a more environmentally conscious Formula 1.'
    },
    {
      id: 'v6hybrid',
      startDate: new Date('2014-01-01'),
      endDate: new Date(Date.now()),
      name: 'V6 Hybrid Era',
      color: 'lightcyan',
      description: 'The V6 Hybrid Era introduced 1.6L turbocharged V6 engines with hybrid energy recovery systems, drastically changing the power units in Formula 1. The era has been marked by Mercedes’ dominance, with Lewis Hamilton and Nico Rosberg leading the charge. Significant rule changes aimed at increasing fuel efficiency and cutting costs also took place, making this a highly technological and strategic period in F1 history.'
    },
  ];
  const [data, setData] = useState({});
  const [teams, setTeams] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const chartRef = useRef();

  useEffect(() => {
    // Preprocess data to filter teams and tracks with >= 5 years of data
    const processedData = preprocessData(jsonData.data);
    setData(processedData.filteredData);
    setTeams(processedData.filteredTeams);
    setSelectedTeams(processedData.filteredTeams);
    setTracks(processedData.filteredTracks);
    setSelectedTrack(processedData.filteredTracks[20]);
  }, []);

  useEffect(() => {
    drawChart();
  }, [selectedTeams, selectedTrack]);

  const preprocessData = (rawData) => {
    const teamYears = {};
    const trackYears = {};

    // Collect unique years for each team and track
    Object.entries(rawData).forEach(([team, teamData]) => {
      teamData.forEach((entry) => {
        const year = new Date(entry.raceDate).getFullYear();
        teamYears[team] = teamYears[team] || new Set();
        teamYears[team].add(year);

        trackYears[entry.race] = trackYears[entry.race] || new Set();
        trackYears[entry.race].add(year);
      });
    });

    // Filter teams and tracks with >= 5 unique years of data
    const filteredTeams = Object.keys(teamYears).filter(
      (team) => teamYears[team].size >= 5
    ).sort((a, b) => teamYears[b].size - teamYears[a].size);

    const filteredTracks = Object.keys(trackYears).filter(
      (track) => trackYears[track].size >= 5
    );

    // Filter the raw data to include only valid teams and tracks
    const filteredData = Object.fromEntries(
      Object.entries(rawData).filter(([team]) => filteredTeams.includes(team))
    );

    return {
      filteredData,
      filteredTeams,
      filteredTracks,
    };
  };

  let zoomedIn = false, tooltipTimeout;

  const drawChart = () => {
    const svg = d3.select(chartRef.current);

    const margin = { top: 20, right: 20, bottom: 60, left: 80 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const filteredData = Object.entries(data)
      .filter(([team]) => selectedTeams.includes(team))
      .map(([team, teamData]) => ({
        team,
        values:
          teamData.filter((entry) => entry.race === selectedTrack)
            .map((entry) => ({ ...entry, team })),
      }));

    const allDates = filteredData.flatMap((d) =>
      d.values.map((v) => new Date(v.raceDate))
    );

    if (allDates.length === 0) {
      svg
        .selectAll(".no-data-message")
        .data([null])
        .join(
          (enter) =>
            enter
              .append("text")
              .attr("class", "no-data-message")
              .attr("x", margin.left + width / 2)
              .attr("y", margin.top + height / 2)
              .attr("text-anchor", "middle")
              .style("opacity", 0)
              .transition()
              .duration(500)
              .style("opacity", 1)
              .text("No data available for the selected filters."),
          (update) =>
            update.transition().duration(500).text("No data available for the selected filters."),
          (exit) => exit.transition().duration(500).style("opacity", 0).remove()
        );
      return;
    } else {
      svg.selectAll(".no-data-message").remove();
    }
    const paddingStartDate = new Date(d3.extent(allDates)[0].getFullYear() - 1, 0, 1);

    const xScale = d3
      .scaleTime()
      .domain([paddingStartDate, d3.extent(allDates)[1]])
      .range([margin.left, width + margin.left]);

    const yScale = d3
      .scaleLinear()
      .domain([
        d3.min(filteredData, (d) => d3.min(d.values, (v) => v.lapTime)),
        d3.max(filteredData, (d) => d3.max(d.values, (v) => v.lapTime)),
      ])
      .range([height + margin.top, margin.top]);

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(teams);


    const line = d3
      .line()
      .x((d) => xScale(new Date(d.raceDate)))
      .y((d) => yScale(d.lapTime));

    svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    // Update Axes
    svg
      .selectAll(".x-axis")
      .data([null])
      .join("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height + margin.top})`)
      .transition()
      .duration(1000)
      .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y")));

    svg
      .selectAll(".y-axis")
      .data([null])
      .join("g")
      .attr("class", "y-axis")
      .attr("transform", `translate(${margin.left},0)`)
      .transition()
      .duration(1000)
      .call(d3.axisLeft(yScale).tickPadding(10));

    // Add x-axis label
    svg
      .selectAll(".x-axis-label")
      .data([null])
      .join("text")
      .attr("class", "x-axis-label")
      .style('fill', '#e63946')
      .attr("x", margin.left + width / 2)
      .attr("y", height + margin.top + 40)
      .attr("text-anchor", "middle")
      .text("Race Date");

    // Add y-axis label
    svg
      .selectAll(".y-axis-label")
      .data([null])
      .join("text")
      .attr("class", "y-axis-label")
      .style('fill', '#e63946')
      .attr("x", -height / 2 - margin.top)
      .attr("y", margin.left - 50)
      .attr("transform", `rotate(-90)`)
      .attr("text-anchor", "middle")
      .text("Lap Time (in seconds)");

    // Update Lines
    svg
      .selectAll(".line-path")
      .data(filteredData, (d) => d.team)
      .join(
        (enter) =>
          enter
            .append("path")
            .attr("class", "line-path")
            .attr("fill", "none")
            .attr("stroke-width", 2)
            .attr("stroke", (d) => colorScale(d.team))
            .attr("d", (d) => line(d.values))
            .style("opacity", 0)
            .transition()
            .duration(750)
            .style("opacity", 1),
        (update) =>
          update
            .transition()
            .duration(750)
            .attr("d", (d) => line(d.values)),
        (exit) =>
          exit.transition().duration(750).style("opacity", 0).remove()
      );

    // Add Data Points
    const points = svg
      .selectAll(".data-point")
      .data(filteredData.flatMap((d) => d.values), (d) => d.raceDate);

    points
      .join(
        (enter) =>
          enter
            .append("circle")
            .attr("class", "data-point")
            .attr("cx", (d) => xScale(new Date(d.raceDate)))
            .attr("cy", (d) => yScale(d.lapTime))
            .attr("r", 4)
            .attr("fill", (d) => colorScale(d.team))
            .on("mouseover", (event, d) => {
              const tooltip = d3.select(".tooltip");
              tooltip
                .style("opacity", 1)
                .style("left", `${event.pageX + 10}px`)
                .style("top", `${event.pageY - 20}px`)
                .html(
                  `<strong>Driver:</strong> ${d.driver}<br/>
                  <strong>Team:</strong> ${d.team}<br/>
                  <strong>Position:</strong> ${d.positionOrder}<br/>
                  <strong>Race:</strong> ${d.race}<br/>
                  <strong>Year:</strong> ${new Date(d.raceDate).getFullYear()}<br/>
                  <strong>Average Lap Time:</strong> ${d.lapTime} s`
                );

              svg.selectAll(".era-region")
                .filter((era) => {
                  const eraStart = xScale(new Date(era.startDate));
                  const eraEnd = xScale(new Date(era.endDate));
                  const pointX = xScale(new Date(d.raceDate));
                  // Check if the point is inside the era range
                  return pointX >= eraStart && pointX <= eraEnd;
                })
                .attr("opacity", 0.5);
            })
            .on("mouseout", () => {
              d3.select(".tooltip").style("opacity", 0);
            }),
        (update) =>
          update
            .transition()
            .duration(750)
            .attr("cx", (d) => xScale(new Date(d.raceDate)))
            .attr("cy", (d) => yScale(d.lapTime)),
        (exit) => exit.transition().duration(750).style("opacity", 0).remove()
      );

    // Add Tooltip Div
    if (d3.select(".tooltip").empty()) {
      d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background-color", "black")
        .style("color", "#e63946")
        .style("border", "1px solid #ccc")
        .style("padding", "8px")
        .style("border-radius", "4px")
        .style("pointer-events", "none")
        .style("opacity", 0);
    }
    // Filter eras to exclude those whose end date is less than the selected data start date
    const filteredEras = eras.filter(d => d.endDate >= d3.extent(allDates)[0]);

    if (d3.select(".era-tooltip").empty()) {
      d3.select("body")
        .append("div")
        .attr("class", "era-tooltip")
        .style("position", "absolute")
        .style("z-index", 2)
        .style("background-color", "black")
        .style("border", "1px solid #ccc")
        .style("padding", "18px")
        .style("border-radius", "4px")
        .style("pointer-events", "none")
        .style("opacity", 0)
        .style("max-width", "300px")
        .style("word-wrap", "break-word")
        .style("white-space", "normal");
    }

    // Add annotations for each filtered era
    svg
      .selectAll(".era-annotation")
      .data(filteredEras)
      .join("text")
      .attr("class", "era-annotation")
      .attr("x", (d) => Math.max(xScale(d.startDate), xScale.range()[0]) + 5)
      .attr("y", margin.top + 10)
      .text((d) => d.name)
      .style("font-size", "14px")
      .style("font-family", "Arial")
      .style("fill", "white")
      .style("text-anchor", "start")
      .on("mouseover", (event, d) => {
        const tooltip = d3.select(".era-tooltip");

        tooltip
          .style("opacity", 0.9)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 20}px`)
          .html(
            `<strong>${d.name}</strong> <br/>
            ${d.description}`
          );
      })
      .on("mouseout", () => {
        d3.select(".era-tooltip").style("opacity", 0);
      });

    const zoomInOnEra = (era) => {
      if (zoomedIn) {
        // Zoom out, reset scale
        xScale.domain([paddingStartDate, d3.extent(allDates)[1]]);
        zoomedIn = false;
        d3.select(".era-tooltip").style("opacity", 0);

        svg.selectAll(".era-region")
          .transition()
          .duration(500)
          .attr("opacity", 0)
          .attr("x", (d) => Math.max(xScale(d.startDate), xScale.range()[0]))
          .attr("width", (d) =>
            Math.max(0, Math.min(xScale(d.endDate), xScale.range()[1]) - Math.max(xScale(d.startDate), xScale.range()[0]))
          );

      } else {
        // Zoom in on selected era
        xScale.domain([new Date(era.startDate), new Date(era.endDate)]);
        zoomedIn = true;
        d3.select(".era-tooltip")
          .style("opacity", 0.9)
          .style("left", `${era.x + 10}px`)
          .style("top", `${era.y - 20}px`)
          .html("Click to Zoom Out");

        // Transition the era-region rectangles
        svg
          .selectAll(".era-region")
          .transition()
          .duration(500)
          .attr("x", (d) => Math.max(xScale(d.startDate), xScale.range()[0]))
          .attr("width", (d) =>
            Math.min(xScale(d.endDate), xScale.range()[1]) - Math.max(xScale(d.startDate), xScale.range()[0])
          );

      }
      // Update the chart after zoom
      svg
        .selectAll(".x-axis")
        .transition()
        .duration(500)
        .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y")));

      svg
        .selectAll(".line-path")
        .transition()
        .duration(500)
        .attr("d", (d) => line(d.values));

      svg
        .selectAll(".data-point")
        .transition()
        .duration(500)
        .attr("cx", (d) => xScale(new Date(d.raceDate)))
        .attr("cy", (d) => yScale(d.lapTime))
        .style("opacity", (d) =>
          new Date(d.raceDate) >= xScale.domain()[0] && new Date(d.raceDate) <= xScale.domain()[1] ? 1 : 0
        );

      svg
        .selectAll(".era-line")
        .transition()
        .duration(500)
        .attr("x1", (d) => Math.max(xScale(d.startDate), xScale.range()[0]))
        .attr("x2", (d) => Math.max(xScale(d.startDate), xScale.range()[0]))
        .attr("y1", margin.top)
        .attr("y2", height + margin.top);

      // Transition annotations' positions
      svg
        .selectAll(".era-annotation")
        .transition()
        .duration(500)
        .attr("x", (d) => xScale(d.startDate));
    };

    // Add era region
    const eraRegions = svg
      .selectAll(".era-region")
      .data(filteredEras)
      .join("rect")
      .attr("class", "era-region")
      .attr("x", (d) => Math.max(xScale(d.startDate), xScale.range()[0]))
      .attr("width", (d) =>
        Math.min(xScale(d.endDate), xScale.range()[1]) - Math.max(xScale(d.startDate), xScale.range()[0])
      )
      .attr("y", 0)
      .attr("height", height + margin.bottom - margin.top - 20)
      .attr("fill", (d) => d.color)
      .attr("opacity", 0)
      .on("mouseover", function (event, d) {
        d3.select(this)
          .transition("fillColor")
          .duration(200)
          .attr("opacity", 0.5);
      })
      .on("mouseout", function (d) {
        d3.select(this)
          .transition("hoverOut")
          .duration(200)
          .attr("opacity", 0);

      })
      .on("mouseenter", function (event, d) {
        clearTimeout(tooltipTimeout);

        tooltipTimeout = setTimeout(() => {
          d3.select(".era-tooltip")
            .style("opacity", 0.9)
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 20}px`)
            .html(zoomedIn ? "Click to Zoom Out" : "Click to Zoom");
        }, 500);
      })
      .on("mouseleave", function () {
        clearTimeout(tooltipTimeout);

        d3.select(".era-tooltip").style("opacity", 0);
      })
      .on("click", (event, d) => {
        zoomInOnEra(d);
      });

    eraRegions.lower();

    // Add vertical lines for era start
    svg
      .selectAll(".era-line")
      .data(filteredEras)
      .join("line")
      .attr("class", "era-line")
      .transition()
      .duration(500)
      .attr("x1", (d) => Math.max(xScale(d.startDate), xScale.range()[0]))
      .attr("x2", (d) => Math.max(xScale(d.startDate), xScale.range()[0]))
      .attr("y1", margin.top)
      .attr("y2", height + margin.top)
      .attr("stroke", "white")
      .attr("stroke-dasharray", "4,4")
      .attr("stroke-width", 1);
  };

  const handleTeamChange = (team) => {
    setSelectedTeams((prev) =>
      prev.includes(team)
        ? prev.filter((t) => t !== team)
        : [...prev, team]
    );
  };

  const handleTrackChange = (track) => {
    setSelectedTrack(track);
  };

  return (
    <div className="idiom-container4" style={{ paddingTop: 60 }}>
      <div id="graph-container">
        <svg ref={chartRef}></svg>
      </div>

      <div id="control-panel">
        <div className="teams-section">
          <div className="section-title">Teams</div>
          <div className="teams-list">
            {teams.map((team, index) => {
              const color = d3.schemeCategory10[index % d3.schemeCategory10.length];

              return (
                <label
                  key={team}
                  style={{
                    color: color,
                    display: "block",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedTeams.includes(team)}
                    onChange={() => handleTeamChange(team)}
                  />
                  {team}
                </label>
              );
            })}
          </div>

        </div>

        <div className="tracks-section">
          <div className="section-title">Race</div>
          <div className="tracks-list">
            {tracks.map((track) => (
              <label key={track} style={{ display: "block" }}>
                <input
                  type="radio"
                  name="track"
                  value={track}
                  checked={selectedTrack === track}
                  onChange={() => handleTrackChange(track)}
                />
                {'  ' + track}
              </label>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

export default Idiom4;
