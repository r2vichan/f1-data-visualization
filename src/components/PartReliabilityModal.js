import React, {useEffect} from 'react';
import * as d3 from "d3";

import './PartReliabilityModal.css';
import jsonData from "../data/derivedDataset/partReliabilityVsTime.json";

var DATA = null
const TOTAL_DATA_CONSTRUCTOR_KEY = "Total"
const SELECTED_CONSTRUCTOR_CLASS = "selectedConstructor"

var X_SCALE = null
var Y_SCALE = null
const AXIS_VERTICAL_SHIFT = -50

const COLORS = [
    {
        "stroke" : "#154b73",
        "fill" : "#1f77b4"
    },
    {
        "stroke" : "#c4560b", 
        "fill" : "#ff7f0e"
    },
    {
        "stroke" : "#1d701d",
        "fill" : "#2ca02c"
    },
    {
        "stroke" : "#6c4a8a",
        "fill" : "#9467bd"
    },
    {
        "stroke" : "#a95491",
        "fill" : "#e377c2"
    },
    {
        "stroke" : "#a1191b",
        "fill" : "#d62728"
    }
]

var AVAILABLE_COLOR_INDICES_QUEUE = null
var CONSTRUCTOR_TO_COLOR_INDEX_MAP = null

var PARENT_UNMOUNT_CALLBACK = null

function onDropdownChange() {
    const dropdown = document.getElementById("constructorDropdown")
    const selectedOption = dropdown.options[dropdown.selectedIndex]
    const selectedConstructorCountSpan = document.getElementById("selectedConstructorCount")

    if(selectedOption.classList.contains(SELECTED_CONSTRUCTOR_CLASS)) {
        selectedOption.classList.remove(SELECTED_CONSTRUCTOR_CLASS)
        selectedConstructorCountSpan.textContent = (parseInt(selectedConstructorCountSpan.textContent) - 1).toString()

        AVAILABLE_COLOR_INDICES_QUEUE.push(CONSTRUCTOR_TO_COLOR_INDEX_MAP[selectedOption.text])
        selectedOption.style.backgroundColor = ""
        delete CONSTRUCTOR_TO_COLOR_INDEX_MAP[selectedOption.text]

        removeAreaChart(selectedOption.value)

        for(const option of dropdown.options) {
            option.disabled = false
        }
        return
    }

    selectedOption.classList.add(SELECTED_CONSTRUCTOR_CLASS)
    selectedConstructorCountSpan.textContent = (parseInt(selectedConstructorCountSpan.textContent) + 1).toString()
    
    const colorIndex = AVAILABLE_COLOR_INDICES_QUEUE.shift()
    selectedOption.style.backgroundColor = COLORS[colorIndex]["fill"]
    CONSTRUCTOR_TO_COLOR_INDEX_MAP[selectedOption.text] = colorIndex
    
    drawAreaChart(selectedOption.text, selectedOption.value, colorIndex)

    if(AVAILABLE_COLOR_INDICES_QUEUE.length === 0) {
        for(const option of dropdown.options) {
            if(option.classList.contains(SELECTED_CONSTRUCTOR_CLASS))
                continue
            option.disabled = true
        }
    }
}

function drawAreaChart(constructorKey, constructorId, colorIndex) {
    const initialArea = d3.area()
        .x(d => X_SCALE(d.year))
        .y0(Y_SCALE(0) + AXIS_VERTICAL_SHIFT)
        .y1(d => Y_SCALE(0) + AXIS_VERTICAL_SHIFT)

    const area = d3.area()
        .x(d => X_SCALE(d.year))
        .y0(Y_SCALE(0) + AXIS_VERTICAL_SHIFT)
        .y1(d => Y_SCALE(d.failures) + AXIS_VERTICAL_SHIFT)
    
    const line = d3.line()
        .x(d => X_SCALE(d.year))
        .y(d => Y_SCALE(d.failures) + AXIS_VERTICAL_SHIFT)

    const drawnArea = d3.select("#partReliabilityModalSvg").append("path")
        .data([DATA[constructorKey]])
        .attr("d", initialArea)
        .attr("id", constructorId+"Area")
        .attr("fill", COLORS[colorIndex]["fill"])
        .attr("opacity", 0.9)
        .transition()
        .duration(400)
        .attr("d", area)
        .attr("fill", COLORS[colorIndex]["fill"])
    
    const path = d3.select("#partReliabilityModalSvg").append("path")
        .data([DATA[constructorKey]])
        .attr("d", line)
        .attr("id", constructorId+"Line")
        .attr("fill", "none")
        .attr("stroke", COLORS[colorIndex]["stroke"])
        .attr("stroke-width", 1.5)
        .attr("opacity", 0)

    path
        .transition()
        .duration(400)
        .attr("opacity", 1)
        .delay(400)
}

function removeAreaChart(constructorId) {
    const initialArea = d3.area()
        .x(d => X_SCALE(d.year))
        .y0(Y_SCALE(0) + AXIS_VERTICAL_SHIFT)
        .y1(d => Y_SCALE(0) + AXIS_VERTICAL_SHIFT)

    d3.select("#"+constructorId+"Area")
        .transition()
        .duration(1000)
        .attr("d", initialArea)
        .remove()
    
    d3.select("#"+constructorId+"Line")
        .transition()
        .duration(1000)
        .attr("opacity", 0)
        .remove()
        .delay(1000)
}

function onMouseMove(event) {
    const [xCoord, yCoord] = d3.pointer(event)
    const xAxisDate = Math.round(X_SCALE.invert(xCoord))
    clearHoverElements()

    if((xAxisDate < 1950) || (xAxisDate > 2024)) {
        return
    }

    d3.select("#partReliabilityModalSvg")
        .append("line")
        .attr("id", "hoverLine")
        .attr("x1", X_SCALE(xAxisDate))
        .attr("y1", Y_SCALE.range()[0] + AXIS_VERTICAL_SHIFT)
        .attr("x2", X_SCALE(xAxisDate))
        .attr("y2", Y_SCALE.range()[1] + AXIS_VERTICAL_SHIFT)
        .attr("stroke", "white")
        .attr("fill", "white")
    
    for (const [constructorKey, colorIndex] of Object.entries(CONSTRUCTOR_TO_COLOR_INDEX_MAP)) {
        d3.select("#partReliabilityModalSvg")
            .append("circle")
            .classed("hoverPoint", true)
            .attr("r", 5)
            .attr("fill", COLORS[colorIndex]["stroke"])
            .attr("cx", X_SCALE(xAxisDate))
            .attr("cy", Y_SCALE(DATA[constructorKey][xAxisDate - 1950]["failures"]) + AXIS_VERTICAL_SHIFT)
    }   

    const generateHtmlForToolip = () => {
        var html = '<br><span style="white-space: pre;background-color:'+ COLORS[CONSTRUCTOR_TO_COLOR_INDEX_MAP[TOTAL_DATA_CONSTRUCTOR_KEY]]["stroke"] +'">   </span>  ' + TOTAL_DATA_CONSTRUCTOR_KEY + " - " + DATA[TOTAL_DATA_CONSTRUCTOR_KEY][xAxisDate - 1950]["failures"]
        for (const [constructorKey, colorIndex] of Object.entries(CONSTRUCTOR_TO_COLOR_INDEX_MAP)) {
            if(constructorKey === TOTAL_DATA_CONSTRUCTOR_KEY)
                continue
            html += '<br><span style="white-space: pre;background-color:'+ COLORS[colorIndex]["stroke"] +'">   </span>  ' + constructorKey + " - " + DATA[constructorKey][xAxisDate - 1950]["failures"]
        }   
        return html
    }

    const tooltipDiv = d3.select("#partReliabilityModalHoverToolTipDiv")
    tooltipDiv
        .style("left", ((xAxisDate < 1987) ? (xCoord - AXIS_VERTICAL_SHIFT) : (xCoord - tooltipDiv.node().offsetWidth + AXIS_VERTICAL_SHIFT)) + "px")
        .style("top", (yCoord) + "px")
        .html("<p>" + xAxisDate + generateHtmlForToolip() + "</p")
}

function clearHoverElements() {
    d3.select("#hoverLine").remove()
    d3.selectAll(".hoverPoint").remove()
}

function closeModal() {
    PARENT_UNMOUNT_CALLBACK()
}

function PartReliabilityModal(props) {
    useEffect(() => {
        // Reset values on re-render
        PARENT_UNMOUNT_CALLBACK = props.triggerUnmount
        AVAILABLE_COLOR_INDICES_QUEUE = new Array(0, 1, 2, 3, 4)
        CONSTRUCTOR_TO_COLOR_INDEX_MAP = {"Total" : 5}

        DATA = jsonData[props.partName]
        d3.selectAll("#partReliabilityModalSvg > *").remove()

        const svgWidth = document.getElementById("partReliabilityModalSvg").getBoundingClientRect().width
        const svgHeight = document.getElementById("partReliabilityModalSvg").getBoundingClientRect().height

        // Axes
        X_SCALE = d3.scaleLinear()
            .domain([1950, 2024])
            .range([50, svgWidth - 50])
        d3.select("#partReliabilityModalSvg").append("g")
            .attr("transform", `translate(0, ${svgHeight + AXIS_VERTICAL_SHIFT})`)
            .call(d3.axisBottom(X_SCALE).tickFormat(d3.format("d")))

        Y_SCALE = d3.scaleLinear()
            .domain([0, Math.max(...Object.values(DATA[TOTAL_DATA_CONSTRUCTOR_KEY].map(o => o.failures)))])
            .range([svgHeight, 50])
        d3.select("#partReliabilityModalSvg").append("g")
            .attr("transform", `translate(50, ${AXIS_VERTICAL_SHIFT})`)
            .call(d3.axisLeft(Y_SCALE))
        
        // Axes Names
        d3.select("#partReliabilityModalSvg").append("text")
            .attr("x", 0.5 * svgWidth)
            .attr("y", 0.99 * svgHeight)         
            .attr("font-size", "1em")
            .style("fill", "red")
            .text("year")
        d3.select("#partReliabilityModalSvg").append("text")
            .attr("x", -0.1 * svgHeight)
            .attr("y", 0.03 * svgHeight)         
            .attr("font-size", "1em")
            .style("fill", "red")
            .text("failures")
            .attr("transform", "rotate(-90, 100, 100)")
        
        // Populate dropdown
        const dropdown = document.getElementById("constructorDropdown")
        dropdown.options.length = 0
        for(const k in DATA) {
            if(k === TOTAL_DATA_CONSTRUCTOR_KEY)
                continue
            dropdown.add(new Option(k, k.replace(/\s+/g, "")))
        }

        drawAreaChart(TOTAL_DATA_CONSTRUCTOR_KEY, TOTAL_DATA_CONSTRUCTOR_KEY, CONSTRUCTOR_TO_COLOR_INDEX_MAP[TOTAL_DATA_CONSTRUCTOR_KEY])
        d3.select("#partReliabilityModalSvg")
            .on("mousemove", e => {
                d3.select("#partReliabilityModalHoverToolTipDiv").style("opacity", 1)
                onMouseMove(e)
            })
            .on("mouseout", _ => {
                d3.select("#partReliabilityModalHoverToolTipDiv").style("opacity", 0)
                clearHoverElements()
            })
    });

    return (
        <div className="container" id="partReliabilityModalContainer">
            <div id="partReliabilityModalHoverToolTipDiv"></div>

            <div className="row">
                <div className="col-3" style={{padding : "5px"}}><b>Constructors (<span id="selectedConstructorCount">0</span>/5 Selected): </b></div>
                <div className="col-3" style={{padding : "5px"}}>
                    <select id= "constructorDropdown" onChange={onDropdownChange}>
                    </select>
                </div>
                <div className="col-6" style={{textAlign : "right", fontSize : "25px", cursor : "pointer"}} onClick={closeModal}>
                    <b>X</b>
                </div>
            </div>
            <div className="row" style={{height: "90%"}}>
                <svg id="partReliabilityModalSvg"></svg>
            </div>
        </div>
    );
}

export default PartReliabilityModal;