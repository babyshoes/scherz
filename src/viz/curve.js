import * as d3 from 'd3';
import _ from 'lodash';

// TO DO
// - curve lines
// - option to select dimension (dims others)
    // - ony draggable when selected
    // - max lines that appear when dragging a line

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

    const updateAreaPlot = (stacked) =>
        svg
            .selectAll("path.curve")
            .data(stacked)
            .join(
                enter => enter
                            .append("path")
                            .attr("class", "curve")     
                , update => update.transition()   
                , exit => exit.remove()           
            )
            .attr("d", 
                d3.area()
                    .x((d, i) => xScale(i))
                    .y0((d) => yScale(d[0]))
                    .y1((d) => yScale(d[1]))
                )
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("fill", (d) => color(d.key))
            .attr("fill-opacity", .5)
            .attr("stroke", (d) => color(d.key))
            .attr("stroke-width", 2)

    const dragStart = (d) =>
        d3.select(this).raise().classed('active', true);
    
    
    const dragging = (d) => {
        d.yPos = yScale.invert(d3.event.y)
        d3.select(this).attr("transform", d => 
            `translate(${xScale(d.xPos)}, ${yScale(d.yPos)})`
        )

        let diff = d.yPos - stacked.filter(dim => dim.key === d.dim)[0][d.xPos][1]
        data[d.xPos][d.dim] += diff

        stacked = d3.stack().keys(groups)(data)
        updateAreaPlot(stacked)
        updatePointers(pointerData(stacked))
    }
    
    const dragEnd = (d) =>
        d3.select(this).classed('active', false);

    const drag = d3.drag()
        .on('start', dragStart)
        .on('drag', dragging)
        .on('end', dragEnd)

    const pointerData = (stacked) =>
        _.flatMap(stacked, (layer) => 
            layer.map((point, i) => {
                return {xPos:i, yPos: point[1], dim: layer.key}
            } 
        ))


    let updatePointers = (pointerData) =>
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
                    .attr('r', 3.0)
                    .style('cursor', 'pointer')
                    .style('fill', (d) => color(d.dim) )
                , update => update
                    .attr("transform", d => 
                        `translate(${xScale(d.xPos)}, ${yScale(d.yPos)})`
                    )
                    .call(drag)
                , exit => exit.remove()
            )
  
    let stacked = d3.stack().keys(groups)(data)
    updateAreaPlot(stacked)
    updatePointers(pointerData(stacked))
}