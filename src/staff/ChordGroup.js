import React, { useMemo } from 'react';
import _ from 'lodash';
import Chord from './Chord.js';
import { marginY, headerHeight, arrowHeight, arrowWidth } from './layout.js';
import usePrevious from '../util/usePrevious';


const ChordGroup = ({ chordGroup, onUpArrowClick, onDownArrowClick }) => {

  const arrow = useMemo(() => {
    const arrowPath =  `
      M -${arrowWidth / 2} ${arrowHeight}
      L 0,0
      L ${arrowWidth / 2} ${arrowHeight}
      z
    `
    return (
      <g>
        <rect
          transform={`translate(-${arrowWidth}, -${arrowHeight})`}
          opacity={0}
          width={arrowWidth*2}
          height={arrowHeight*2}
        />
        <path d={arrowPath} fill="white" />
      </g>
    )
  }, [])

  const { chords, chordIndex } = chordGroup;
  const selectedChord = chords[chordIndex];

  const previousChordIndex = usePrevious(chordIndex);

  let transition;
  if (!_.isNumber(previousChordIndex) || chordIndex - previousChordIndex === 0) {
    transition = null;
  } else if (chordIndex - previousChordIndex > 0) {
    transition = 'up';
  } else {
    transition = 'down';
  }

  const arrowsAreDisabled = chords.length === 1;
  return (
    <g>
      <g transform={`translate(0, ${marginY})`}>
        <g transform={`translate(-${arrowWidth}, 0)`}>
          <g
            className={`arrow ${arrowsAreDisabled && 'disabled'}`}
            onClick={onUpArrowClick}
          >
            { arrow }
          </g>
          <g
            className={`arrow ${arrowsAreDisabled && 'disabled'}`}
            transform={`translate(0, ${headerHeight}) rotate(180)`}
            onClick={onDownArrowClick}
          >
            { arrow }
          </g>
        </g>
        <text dominantBaseline="hanging" fontSize={12}>
          { chordIndex+1 }/{ chords.length }
        </text>
      </g>
      <Chord key={selectedChord.notes.join('-')} { ...selectedChord } transition={transition} />
    </g>
  )
}

export default React.memo(
  ChordGroup,
  ({ chordGroup: prevChordGroup }, { chordGroup: nextChordGroup }) =>
    _.isEqual(prevChordGroup.chords[0].notes, nextChordGroup.chords[0].notes)
      && prevChordGroup.chords.length === nextChordGroup.chords.length
      && prevChordGroup.chordIndex === nextChordGroup.chordIndex
)