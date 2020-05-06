import React, { useMemo } from 'react';
import _ from 'lodash';
import Chord from './Chord';
import { marginTop, headerHeight, arrowWidth, arrowHeight, fontSize } from './layout';
import arrowSVG from '../util/arrow-svg';
import usePrevious from '../util/use-previous';


const arrow = arrowSVG(arrowWidth, arrowHeight);

const ChordGroup = ({ beat, chordGroup, offset, onUpArrowClick, onDownArrowClick }) => {

  const { chords, chordIndex } = chordGroup;
  const selectedChord = chords[chordIndex];

  const previousChordIndex = usePrevious(chordIndex);

  const yTransition = useMemo(
    () => {
      if (!_.isNumber(previousChordIndex) || chordIndex === previousChordIndex) {
        return null;
      } else if (chordIndex > previousChordIndex) {
        return 'up';
      } else {
        return 'down';
      }
    },
    [chordIndex, previousChordIndex],
  );

  const previousOffset = usePrevious(offset);

  const xTransition = useMemo(
    () => {
      if (!_.isNumber(previousOffset) || previousOffset === offset) {
        return null;
      } else if (offset < previousOffset) {
        return 'right';
      } else {
        return 'left';
      }
    },
    [previousOffset, offset]
  );


  const arrowsAreDisabled = chords.length === 1;

  return (
    <>
      <g
        key={`chord-group-${beat}`}
        className={`swipe ${xTransition}`}
      >
        <g transform={`translate(0, ${marginTop})`}>
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
          <text
            className={!xTransition ? 'fade-in down' : ''}
            key={`chord-count-${beat}-${chords.length}`}
            dominantBaseline="hanging"
            fontSize={fontSize}
          >
            { chordIndex+1 }/{ chords.length }
          </text>
        </g>
        <Chord
          key={selectedChord.notes.join('-')}
          { ...selectedChord }
          yTransition={yTransition}
        />
      </g>
    </>
  )
}

export default React.memo(
  ChordGroup,
  ({ chordGroup: prevChordGroup }, { chordGroup: nextChordGroup }) =>
    _.isEqual(prevChordGroup.chords[0].notes, nextChordGroup.chords[0].notes)
      && prevChordGroup.chords.length === nextChordGroup.chords.length
      && prevChordGroup.chordIndex === nextChordGroup.chordIndex
)