import * as d3 from 'd3';
import _ from 'lodash';
import { baseLayout, makeSVG } from './util'


const dimBlurbs = {
	color: 'allows chords to venture further out in the circle of fifths',
	dissonance: 'results in more "unnatural" sounding chords',
	gravity: 'prioritizes half step resolutions and tighter voice leading'
} 

export default (ref, xScale, play, forces, onCurveChange, active, setActive) => {
  let data = forces
  console.log(forces);

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
    .range(['#3da4ab', '#f6cd61', '#fe8a71'])

  const svg = makeSVG(ref, layout)

	const legend = svg.append("text")
		.attr("class", "annotate")
		.attr("x", 30)
		.attr("y", 75)
		.attr("font-family", "sans-serif")
		.attr("font-size", "20px")
    
	const legendDesc = svg.append("text")
		.attr("class", "annotate")
		.attr("x", layout.width - 30)
		.attr("y", 75)
		.attr("font-family", "sans-serif")
		.attr("font-size", "20px")

	const addPoint = () => {
		if (!play) {
			data = [ ...data, { color: 0, dissonance: 0, gravity: 0 } ]
			stacked = d3.stack().keys(groups)(data)

			const beat = data.length - 1
			onCurveChange(data[beat], beat)
		}      
	}

	svg.append("g")
    .attr("class", "add-node")
    .append("text")
    .text(_ => play ? "\uf111" : "\uf067")
    .attr("fill", _ => play ? "rgb(255, 255, 255, 0.3)" : "white" )
    .attr("x", 10)
    .attr("y", yScale(0))
    .attr("font-size", 30)
    .attr("font-family", "FontAwesome")
    .on("click", addPoint)    

	function activate(d) {
		if (!play) {
			let current = d3.select(this).classed("active")
			d3.selectAll("path.curve.active").classed("active", false)
			d3.select(this).classed("active", !current)

			setActive(d.key)
			updatePointers(stacked)
		}    		
	}

	function displayDimensionInfo(d) {
		clearDimensionInfo()
		let string = `${d.key}`
		legend.append("tspan")
			.attr("class", "label")
			.text(string) 

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

		const dimVal = node !== null ? `: ${node.data[d.key].toFixed(1)}` : ""

		legend.append("tspan")
				.attr("class", "label")
				.text(dimVal)

		const dimDesc = dimBlurbs[d.key]
		legendDesc.append("tspan")
      .attr("class", "desc")
      .style("text-anchor", "end")
      .text(dimDesc)
	} 

	const clearDimensionInfo = () => {
		legend.selectAll("tspan").remove()
		legendDesc.selectAll("tspan").remove()
	}

	const updateAreaPlot = (stacked) =>
		svg
			.selectAll("path.curve")
			.data(stacked)
			.join(
				enter => enter
					.append("path")
					.attr("class", "curve") 
					.classed("active", d => !play && d.key === active)
					.attr("fill", d => !play ? color(d.key) : 'black')
					.attr("stroke", d => color(d.key))
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

	const dragStart = d => {
		d3.select(this).classed('active', true);
		displayDimensionInfo(d)
	}

	const getPointFrom = (stacked, key, pos) =>
		stacked.filter(layer => layer.key === key)[0][pos]

	const getDimensionBounds = (point, key, currentHeight) => {
		const dataVal = point.data[key]
		const diffsPossible = [1.0 - dataVal, 0.0 - dataVal]

		return diffsPossible.map(diff => diff + currentHeight)
	}
	
	const dragging = (d, i) => {
		// don't allow first node to be dragged
		if (!play && i !== 0) {
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
		}
		displayDimensionInfo(d)
	}
	
	const dragEnd = (d) => {
		d3.select(this).classed('active', false);
		clearDimensionInfo()

		const beat = d.xPos
		if (beat > 0) {
			onCurveChange(data[beat], beat)
		}
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
		return _
			.flatMap(stacked, (layer) => 
				layer.map((point, i) => {
					if (layer.key === activeDimension) {
						return { xPos: i, yPos: point[1], key: layer.key }
					}
				} 
			))
			.filter(val => val != null)
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
					.attr("r", 5.0)
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