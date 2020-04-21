import React from 'react';
import _ from 'lodash';
import Circle from './Circle.js';
import { marginY, height, footerHeight, fontSize } from './layout.js';


const lowestNote = 40;

function countAccidentals(pitch) {
  const counts = _.countBy(pitch);
  return (counts['#'] || 0) - (counts['b'] || 0);
}

const stringOrder = "EFGABCD"
  .split("")
  .reduce((acc, char, i) => (
    { ...acc, [char]: i }
  ), {})

function getSpace([note, pitch]) {
  const base = stringOrder[pitch[0]];
  const adjustedNote = note - countAccidentals(pitch);
  const octave = Math.floor((adjustedNote - lowestNote) / 12) * 7;
  return base + octave;
}

function Chord({ notes, pitches, name, transition }) {

  const spaces = _.zip(notes, pitches).map(getSpace);

  function addOffset(offsets, space, index) {
    const adjacent = space - spaces[index-1] === 1;
    const offset = (index === 0 || !adjacent)
      ? false
      : !_.last(offsets);
    return [ ...offsets, offset ];
  }

  const offsets = spaces.reduce(addOffset, []);

  const renderCircle = ([pitch, space, offset], index) => 
    <Circle key={index} pitch={pitch} space={space} offset={offset} />

  return (
    <g className={`fade-in ${transition}`}>
      { _.zip(pitches, spaces, offsets).map(renderCircle) }
      <text
        dominantBaseline="hanging"
        y={height - (marginY + footerHeight)}
        textAnchor="middle"
      >
        <tspan fontSize={fontSize}> {name || '  '} </tspan>
      </text>
    </g>
  )
}

export default React.memo(
  Chord,
  (prevProps, nextProps) => _.isEqual(prevProps.notes, nextProps.notes),
);