import * as d3 from 'd3';

const baseLayout = { 
  marginRight: 10, 
  marginLeft: 70, 
  maxW: 1000,
}

baseLayout.xstart = baseLayout.marginLeft + 10
baseLayout.width = baseLayout.maxW - baseLayout.marginLeft - baseLayout.marginRight

const getxScale = (numTimesteps) =>
  d3.scaleLinear()
    .domain([0, numTimesteps])
    .range([baseLayout.xstart, baseLayout.width])

const makeSVG = (ref, layout) => {
  d3.select(ref.current).selectAll("*").remove()
  return d3.select(ref.current)
    .append("svg")
    .attr("viewBox", `0 0 ${layout.maxW} ${layout.maxH}`)
    .attr("width", "100%")
    .attr("height", "100%")
    .append("g")
    .attr("transform", "translate(" + layout.marginLeft + "," + layout.marginTop + ")")
};

export { baseLayout, makeSVG, getxScale }