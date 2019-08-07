import * as d3 from 'd3';
import _ from 'lodash';

// TO DO
// - have curve and staff share x-axis?
// - add new points
// - tool tip on hover

export const drawCurve = (ref, numTimestep, tensions) => {

    let data = [{color:0, dissonance:0, gravity:0},...tensions]

    const groups = ["color", "dissonance", "gravity"]

    const margin = { top: 50, right: 30, bottom: 50, left: 50 },
        MAXW = 800,
        MAXH = 500,
        xstart = margin.right + 10,
        width = MAXW - margin.left - margin.right,
        height = MAXH - margin.top - margin.bottom;

    const color = d3.scaleOrdinal()
        .domain(groups)
        .range(['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628','#f781bf'])
    
    const svg = d3.select(ref.current)
                .append("svg")
                .attr("viewBox", `0 0 ${MAXW} ${MAXH}`)
                .attr("width", "100%")
                .attr("height", "100%")
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const xScale = d3.scaleLinear()
                .domain([0, numTimestep])
                .range([xstart, width])

    const yScale = d3.scaleLinear()
                .domain([3, 0])
                .range([0, height])
    // draw axis
    const axis = d3.axisLeft()
                 .scale(yScale)

    svg.append("g")
       .call(axis)

    function activate(d) {
        let current = d3.select(this).classed("active")
        d3.selectAll("path.curve.active").classed("active", false)
        d3.select(this).classed("active", !current)

        updatePointers(stacked)
    }

    // const dimTip = d3.tip()
    //     .attr('class', 'd3-tip')
    //     .offset([-10, 0])
    //     .html(function(d) {
    //         return "<span>" + d.key + "</span>"
    //     })

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
                , update => update.transition()   
                , exit => exit.remove()           
            )
            .attr("d", d3.area()
                .curve(d3.curveMonotoneX)
                .x((d, i) => xScale(i))
                .y0((d) => yScale(d[0]))
                .y1((d) => yScale(d[1]))
            )
            .attr("fill", (d) => color(d.key))
            .attr("stroke", (d) => color(d.key))
            .on("click", activate)
            // .on('mousover', dimTip.show)
            // .on('mouseout', dimTip.hide)

    const dragStart = (d) =>{
        d3.select(this).classed('active', true);
        // d3.select(this).raise().classed('active', true);
    
    }

    const getPointFrom = (stacked, dim, pos) => {
        return stacked.filter(layer => layer.key === dim)[0][pos]
    }
    const getDimBounds = (point, dim, currentHeight) => {
        const dataVal = point.data[dim]
        const diffsPossible = [1.0 - dataVal, 0.0 - dataVal]

        return diffsPossible.map(diff => diff + currentHeight)
    }
    
    const dragging = (d) => {
        const point = getPointFrom(stacked, d.dim, d.xPos)
        const [dimMax, dimMin] = getDimBounds(point, d.dim, d.yPos)
        
        const newY = yScale.invert(d3.event.y)
        if (newY <= dimMax && newY >= dimMin) {
            d.yPos = newY
            d3.select(this).attr("transform", d => 
                `translate(${xScale(d.xPos)}, ${yScale(d.yPos)})`
            )
    
            const diff = d.yPos - point[1]
            data[d.xPos][d.dim] += diff
    
            stacked = d3.stack().keys(groups)(data)
            updateAreaPlot(stacked)
            updatePointers(stacked)
        }
    }
    
    const dragEnd = (d) =>
        d3.select(this).classed('active', false);

    const drag = d3.drag()
        .on('start', dragStart)
        .on('drag', dragging)
        .on('end', dragEnd)
    
    const getActiveDim = () => {
        const activeCurve = d3.selectAll("path.curve.active")
        return activeCurve.data().length > 0 ? activeCurve.datum().key : null
    }

    const getPointerData = (stacked) => {
        const activeDim = getActiveDim()
        return _.flatMap(stacked, (layer) => 
            layer.map((point, i) => {
                if (layer.key === activeDim) {
                    return {xPos:i, yPos: point[1], dim: layer.key}
                }
                
            } 
        )).filter( val => val != null)
    }

    const updatePointers = (data) => {
        const pointerData = getPointerData(data)
        svg.selectAll('g.pointer')
            .data(pointerData, (d) => d.dim)
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
                    .style('fill', (d) => color(d.dim) )
                , update => update
                    .attr("transform", d => 
                        `translate(${xScale(d.xPos)}, ${yScale(d.yPos)})`
                    )
                , exit => exit.remove()
            )
    }
    
    let stacked = d3.stack().keys(groups)(data)
    updateAreaPlot(stacked)
    updatePointers(stacked)
}