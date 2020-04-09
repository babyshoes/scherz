import * as d3 from 'd3';
import _ from 'lodash';
import { makeSVG, baseLayout } from './util'

export default (ref, xScale, play, beat, chords, color) => {
  // lay out lay out
  const layout = { 
    ...baseLayout,
    marginTop: 0,
    marginBottom: 50,
    maxH: 300
  }

  layout.height = layout.maxH - layout.marginTop - layout.marginBottom

  const svg = makeSVG(ref, layout)

  const yScale = d3.scaleLinear()
    .domain([16, -8])
    .range([0, layout.height])

  const countAccidental = (str, pattern) => {
    const re = new RegExp(pattern, 'g')
    return ((str || '').match(re) || []).length
  }

  const countAllAccidentals = (pitch) =>
    countAccidental(pitch, "#") - countAccidental(pitch, "b")
  
  const stringOrder = "efgabcd"
    .split("")
    .reduce((acc, char, i) => (
      { ...acc, [char]: i }
    ), {})

  const translate = (note, pitch) => {
    const base = stringOrder[pitch[0].toLowerCase()]
    const numAccidentals = countAllAccidentals(pitch)
    const adjustedNote = note - numAccidentals
    const octave = Math.floor((adjustedNote - 40)/12) * 7      
    return base + octave 
  }

  let data = chords.map(chord =>
    chord.notes.map((note, i) => {
      let pitch = chord.pitches[i]
      return { 
        note: translate(note, pitch), 
        accidental: countAllAccidentals(pitch),
        type: chord.name
      }
    })    
  )
            
  const getOffset = (note, {note: prevNote, offset: prevOffset}) => {
    const diff = note - prevNote
    return (diff <= 1) ? !prevOffset : false
  }

  data = _.flatMap(data, (notes, xPos) => 
    notes.reduce(
      (acc, {note, accidental, type}) => {
        const offset = (_.isEmpty(acc)) ? false : getOffset(note, acc[acc.length - 1])
        return [ ...acc, {note, accidental, offset, xPos, type} ]
      },
      []
    )
  )

  // draw ledger lines
  svg.selectAll("line")
    .data([2,4,6,8,10]) 
    .enter()
    .append("line")
    .attr("x1", 0)
    .attr("x2", layout.width)
    .attr("y1", d => yScale(d))
    .attr("y2", d => yScale(d))   

  const convertAccidental = numAcc =>
    numAcc > 0
      ? "♯".repeat(numAcc)
      : "♭".repeat(Math.abs(numAcc))

  const extensionLine = y =>
    (y % 2 === 0) & ((y > 10) | (y < 2)) ? 1 : 0

  const notesGroupedByChord = d3.nest()
    .key(d => d.type)
    .rollup(grp => grp[0].xPos)
    .entries(data)

  // draw chords
  // https://stackoverflow.com/questions/20644415/d3-appending-text-to-a-svg-rectangle
  const notesAndAccidentals = svg.selectAll("g.note")
    .data(data)
    .enter()
    .append("g")
    .attr("transform", d => `translate(${xScale(d.xPos)}, ${yScale(d.note)})`)
  
  const amtOffset = xScale(.1) - xScale(0)

  const adjustOffset = (numAccidentals, factor) =>
    -amtOffset * (factor + (Math.abs(numAccidentals)/3.0))

  // draw notes
  notesAndAccidentals.append("circle")
    .attr("cx", d => d.offset * amtOffset)
    .attr("r", 8)
    .style("stroke", d => play && d.xPos === beat ? color : "white")
  
  // draw accidentals
  notesAndAccidentals.append("text")
    .attr("class", "annotate")
    .attr("x", d => d.offset ? adjustOffset(d.accidental, 2) : adjustOffset(d.accidental, 1.3))
    .attr("dy", ".35em")
    .text(d => convertAccidental(d.accidental) )
  
  // draw extension ledger lines
  notesAndAccidentals.append("line")
    .attr("x1", _ => amtOffset * -0.8)
    .attr("x2", _ => amtOffset * 0.8)
    .attr("stroke-width", d => extensionLine(d.note))

  svg.selectAll("g.note")
    .data(notesGroupedByChord)
    .enter()
    .append("text")
    .attr("class", "annotate")
    .attr("transform", d => `translate(${xScale(d.value)}, ${yScale(-2.8)})`)
    .text(d => d.key)
}