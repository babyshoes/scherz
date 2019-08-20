import * as d3 from 'd3';
import _ from 'lodash';
import { baseLayout, makeSVG } from './util'

export const drawCurve = (ref, xScale, tensions, onCurveChange) => {
    let data = tensions

    const groups = ["color", "dissonance", "gravity"]

    // lay out lay out
    const layout = { 
        ...baseLayout,
        marginTop: 10,
        marginBottom: 10,
        maxH: 500
    }

    layout.height = layout.maxH - layout.marginTop - layout.marginBottom

    const yScale = d3.scaleLinear()
        .domain([3, 0])
        .range([0, layout.height])
        
    const color = d3.scaleOrdinal()
        .domain(groups)
        .range(['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628','#f781bf'])

    const svg = makeSVG(ref, layout)

    const legend = svg.append("text")
        .attr("x", 30)
        .attr("y", 75)
        .attr("font-family", "sans-serif")
        .attr("font-size", "20px")

    const addPoint = () => {
        data = [...data, {color:0, dissonance:0, gravity:0}]
        stacked = d3.stack().keys(groups)(data)
        onCurveChange(data)
    }

    svg.append("g")
        .attr("class", "pt")
        .append("text")
        .text(d => "\uf067")
        .attr("x", 10)
        .attr("y", yScale(0))
        .attr("font-size", 15)
        .attr("font-family", "FontAwesome")
        .on("click", addPoint)  
    // draw axis
    // const axis = d3.axisLeft()
    //              .scale(yScale)

    // svg.append("g")
    //    .call(axis)   

    function activate(d) {
        let current = d3.select(this).classed("active")
        d3.selectAll("path.curve.active").classed("active", false)
        d3.select(this).classed("active", !current)

        updatePointers(stacked)
    }

    function displayDimensionInfo (d) {
        legend.selectAll("tspan").remove()
        let string = `${d.key}`
        legend.append("tspan")
            .text(string) 
            .attr("font-weight", "bold")

        const dimension = stacked.find(l => l.key === d.key)
        const event = d3.event

        let node = null
        if (event.type === "drag" || event.type === "start") {
            node = dimension[event.subject.xPos]
        } else if (this.nodeName === "circle") {
            node = dimension[this.__data__.xPos]
        } else if (this.nodeName === "path") {
            const mouseX = xScale.invert(d3.mouse(this)[0])
                if (Math.abs(mouseX - Math.round(mouseX)) < 0.1) {
                    node = dimension[Math.round(mouseX)]
                }
        }

        const description = node !== null ? `: ${node.data[d.key].toFixed(1)}` : ""

        legend.append("tspan")
            .text(description)

    } 

    const clearDimensionInfo = (d) => {
        legend.selectAll("tspan").remove()
    }

    const updateAreaPlot = (stacked) =>
        svg
            .selectAll("path.curve")
            .data(stacked)
            .join(
                enter => enter
                            .append("path")
                            .attr("class", "curve") 
                            .classed("active", 
                                d => d.key === "color")
                            .attr("fill", (d) => color(d.key))
                            .attr("stroke", (d) => color(d.key))
                            .on("click", activate)
                , update => update.transition()   
                , exit => exit.remove()           
            )
            .attr("d", d3.area()
                .curve(d3.curveMonotoneX)
                .x((d, i) => xScale(i))
                .y0((d) => yScale(d[0]))
                .y1((d) => yScale(d[1]))
            )
            .on("mousemove", displayDimensionInfo)
            .on("mouseout", clearDimensionInfo)
    

    const dragStart = (d) =>{
        d3.select(this).classed('active', true);
        // d3.select(this).raise().classed('active', true);
        displayDimensionInfo(d)
    }

    const getPointFrom = (stacked, key, pos) => {
        return stacked.filter(layer => layer.key === key)[0][pos]
    }
    const getDimensionBounds = (point, key, currentHeight) => {
        const dataVal = point.data[key]
        const diffsPossible = [1.0 - dataVal, 0.0 - dataVal]

        return diffsPossible.map(diff => diff + currentHeight)
    }
    
    const dragging = (d) => {
        const point = getPointFrom(stacked, d.key, d.xPos)
        const [dimensionMax, dimensionMin] = getDimensionBounds(point, d.key, d.yPos)
        
        const newY = yScale.invert(d3.event.y)
        if (newY <= dimensionMax && newY >= dimensionMin) {
            d.yPos = newY
            d3.select(this).attr("transform", d => 
                `translate(${xScale(d.xPos)}, ${yScale(d.yPos)})`
            )
    
            const diff = d.yPos - point[1]
            data[d.xPos][d.key] += diff
    
            stacked = d3.stack().keys(groups)(data)
            updateAreaPlot(stacked)
            updatePointers(stacked)
        }
        displayDimensionInfo(d)
    }
    
    const dragEnd = (d) => {
        d3.select(this).classed('active', false);
        onCurveChange(data)
        clearDimensionInfo()
    }
        
    const drag = d3.drag()
        .on('start', dragStart)
        .on('drag', dragging)
        .on('end', dragEnd)
    
    const getActiveDimension = () => {
        const activeCurve = d3.selectAll("path.curve.active")
        return activeCurve.data().length > 0 ? activeCurve.datum().key : null
    }

    const getPointerData = (stacked) => {
        const activeDimension = getActiveDimension()
        return _.flatMap(stacked, (layer) => 
            layer.map((point, i) => {
                if (layer.key === activeDimension) {
                    return {xPos:i, yPos: point[1], key: layer.key}
                }
            } 
        )).filter( val => val != null)
    }

    const updatePointers = (data) => {
        const pointerData = getPointerData(data)
        svg.selectAll('g.pointer')
            .data(pointerData, (d) => d.key)
            .join(
                enter => enter
                    .append("g")
                    .attr("class", "pointer")
                    .attr("transform", d => 
                        `translate(${xScale(d.xPos)}, ${yScale(d.yPos)})`
                    )
                    .call(drag)
                    .append('circle')
                    .classed("active", true)
                    .style('fill', (d) => color(d.key) )
                , update => update
                    .attr("transform", d => 
                        `translate(${xScale(d.xPos)}, ${yScale(d.yPos)})`
                    )
                , exit => exit.remove()
            )
            .on("mousemove", displayDimensionInfo)
            .on("mouseout", clearDimensionInfo)
    }
    
    let stacked = d3.stack().keys(groups)(data)
    updateAreaPlot(stacked)
    updatePointers(stacked)
}