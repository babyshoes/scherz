import React, { useMemo, useCallback } from 'react';
import _ from 'lodash';
import Circle from './Circle';
import { marginBottom, height, footerHeight, fontSize } from './layout';


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

const renderCircle = ([pitch, space, offset], index) => 
  <Circle key={index} pitch={pitch} space={space} offset={offset} />

function Chord({ notes, pitches, name, yTransition }) {

  const spaces = useMemo(
    () => _.zip(notes, pitches).map(getSpace),
    [notes, pitches]
  );

  const addOffset = useCallback(
    function add(offsets, space, index) {
      const adjacent = space - spaces[index-1] === 1;
      const offset = (index === 0 || !adjacent)
        ? false
        : !_.last(offsets);
      return [ ...offsets, offset ];
    },
    [spaces],
  )

  const offsets = useMemo(
    () => spaces.reduce(addOffset, []),
    [spaces, addOffset]
  );

  const circles = useMemo(
    () => _.zip(pitches, spaces, offsets).map(renderCircle),
    [pitches, spaces, offsets],
  )

  return (
    <g className={`fade-in ${yTransition}`}>
      { circles }
      <text
        dominantBaseline="hanging"
        y={height - (marginBottom + footerHeight)}
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