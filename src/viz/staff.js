import * as d3 from 'd3';
import _ from 'lodash';

// TO DO:
// 1. fig out how to properly translate pitch

export const drawStaff = ({timestep, numTimestep, chords}) => {
    // [{"notes":[60,64,67,71],"pitches":["C#","Eb","G","B"]}]
    const countAccidental = (str, pattern) => {
        const re = new RegExp(pattern, 'g')
        return ((str || '').match(re) || []).length
      }

    const countAllAccidentals = (pitch) => {
        const sharpCt = countAccidental(pitch, "#")
        const flatCt = countAccidental(pitch, "b")
        return sharpCt - flatCt
    }

    const translate = (note) => {
        return Math.floor((note - 60) * 7/12)
    }

    let data = chords.map( chord => 
        chord.notes.map( (note, i) => 
            ({ note: translate(note), accidental: countAllAccidentals(chord.pitches[i]) })
        ))

    // format data                
    numTimestep = data.length;

    const getOffset = (note, {note: prevNote, offset: prevOffset}) => {
        const diff = note - prevNote
        return (diff <= 1) ? !prevOffset : false
    }

    data = _.flatMap(data, (notes, xPos) => 
        notes.reduce(
            (acc, {note, accidental}) => {
                const offset = (_.isEmpty(acc)) ? false : getOffset(note, acc[acc.length - 1])
                return [ ...acc, {note, accidental, offset, xPos} ]
            },
            []
        )
    ) // [{note: 12, offset: true, x: 0}, ...]

    // boilerplate
    const margin = { top: 50, right: 50, bottom: 50, left: 50 },
        width = 800 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;

    const svg = d3.select("#staff-viz")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const xScale = d3.scaleLinear()
                    .domain([0, numTimestep])
                    .range([0, width])
    const yScale = d3.scaleLinear()
                  .domain([16, -8])
                  .range([0, height])
    
    // draw axis
    const axis = d3.axisLeft()
                 .scale(yScale)

    svg.append("g")
       .call(axis)

    // draw ledger lines
    svg.selectAll("lines")
       .data([2,4,6,8,10]) 
       .enter()
       .append("line")
       .attr("x1", 0)
       .attr("x2", width)
       .attr("y1", d => yScale(d))
       .attr("y2", d => yScale(d)) 
       .attr("stroke", "black")  

    const convertAccidental = numAcc => {
        const sharp = "♯"
        const flat = "♭"

        return numAcc > 0 ? sharp.repeat(numAcc) : flat.repeat(Math.abs(numAcc))
    }

    const extensionLine = y => {
        return (y % 2 === 0) & ((y > 10) | (y < 2)) ? 1 : 0
    }

    // draw chords
    // https://stackoverflow.com/questions/20644415/d3-appending-text-to-a-svg-rectangle
    const notesAndAccidentals = svg.selectAll("g.note")
        .data(data)
        .enter().append("g")
        .attr("transform", d => `translate(${xScale(d.xPos)}, ${yScale(d.note)})`)
       
    notesAndAccidentals.append("circle")
        .attr("cx", d => xScale(.1 * d.offset))
        .attr("r", 7)
        .attr("stroke", "black")
        .attr("fill", "none")
    
    notesAndAccidentals.append("text")
        .attr("x", d => xScale((-0.1 * d.offset) - 0.4))
        .attr("dy", ".35em")
        .text(d => convertAccidental(d.accidental) )
    
    notesAndAccidentals.append("line")
        .attr("x1", d => -12 + xScale((.1 * d.offset)))
        .attr("x2", d => 12 + xScale((.1 * d.offset)))
        .attr("stroke", "black")
        .attr("stroke-width", d => extensionLine(d.note))

}