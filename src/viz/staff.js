import * as d3 from 'd3';
import _ from 'lodash';
import { makeSVG, baseLayout } from './util'

// TO DO:
// - make accidentals placement more dynamic

export const drawStaff = (ref, timestep, xScale, chords) => {
    // lay down layout
    const layout = { 
        ...baseLayout,
        marginTop: -30,
        marginBottom: 50,
        maxH: 300
    }

    layout.height = layout.maxH - layout.marginTop - layout.marginBottom

    const svg = makeSVG(ref, layout)

    const yScale = d3.scaleLinear()
                    .domain([16, -8])
                    .range([0, layout.height])
    // draw axis
    // const axis = d3.axisLeft()
    //              .scale(yScale)

    // svg.append("g")
    //    .call(axis)

    // format data                
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
    
    const stringOrder = "cdefgab"
                        .split("")
                        .reduce((acc, char, i) => { 
                            acc[char] = i; return acc 
                        }, {})

    const translate = (note, pitch) => {
        const base = stringOrder[pitch[0].toLowerCase()]
        // const octave = Math.floor((note - 60)/12) * 7 * !onCusp
        // const onCusp = note === 72 && pitch.includes("B")
        // const adjustedNote = pitch[0].toLowerCase() != "c" && note >= 72 ? note - (7 - base) : note
        const numAccidentals = countAllAccidentals(pitch)
        const adjustedNote = note - numAccidentals
        // console.log(onCusp)
        const octave = Math.floor((adjustedNote - 60)/12) * 7
        // console.log
        
        return base + octave 
    }

    let data = chords.map( chord => {
        if (chord.notes.length === chord.pitches.length) {
            return chord.notes.map( (note, i) => {
                let pitch = chord.pitches[i]
                return { 
                    note: translate(note, pitch), 
                    accidental: countAllAccidentals(pitch),
                    type: chord.type
                }
            })    
        } else {
            console.log("notes and pitches unequal length")
        }
    })
              
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
    ) // [{note: 12, offset: true, x: 0}, ...]

    // draw ledger lines
    svg.selectAll("line")
       .data([2,4,6,8,10]) 
       .enter()
       .append("line")
       .attr("x1", 0)
       .attr("x2", layout.width)
       .attr("y1", d => yScale(d))
       .attr("y2", d => yScale(d))   

    const convertAccidental = numAcc => {
        const sharp = "♯"
        const flat = "♭"

        return numAcc > 0 ? sharp.repeat(numAcc) : flat.repeat(Math.abs(numAcc))
    }

    const extensionLine = y => {
        return (y % 2 === 0) & ((y > 10) | (y < 2)) ? 1 : 0
    }

    const notesGroupedByChord = d3.nest()
        .key(d => d.type)
        .rollup(grp => grp[0].xPos)
        .entries(data)

    // draw chords
    // https://stackoverflow.com/questions/20644415/d3-appending-text-to-a-svg-rectangle
    const notesAndAccidentals = svg.selectAll("g.note")
        .data(data)
        .enter().append("g")
        .attr("transform", d => `translate(${xScale(d.xPos)}, ${yScale(d.note)})`)
    
    const amtOffset = xScale(.1) - xScale(0)

    // draw notes
    notesAndAccidentals.append("circle")
        .attr("cx", d => d.offset * amtOffset )
        .attr("r", 8)
        .attr("fill", "none")
    
    // draw accidentals
    notesAndAccidentals.append("text")
        .attr("class", "annotate")
        .attr("x", d => d.offset ? amtOffset * -2 : amtOffset * -1.3)
        // .attr("x", d => d.offset ? xScale(-0.17) : xScale(-0.12))
        // .attr("x", d => xScale((-0.15 * d.offset) - 0.15))
        .attr("dy", ".35em")
        .text(d => convertAccidental(d.accidental) )
    
    // draw extension ledger lines
    notesAndAccidentals.append("line")
        .attr("x1", d => amtOffset * -0.8)
        .attr("x2", d => amtOffset * 0.8)
        // .attr("x1", d => -12 + xScale((.1 * d.offset)))
        // .attr("x2", d => 12 + xScale((.1 * d.offset)))
        .attr("stroke-width", d => extensionLine(d.note))

    svg.selectAll("g.note")
        .data(notesGroupedByChord)
        .enter().append("text")
        .attr("class", "annotate")
        .attr("transform", d => `translate(${xScale(d.value)}, ${yScale(-2.8)})`)
        .text(d => d.key )

}