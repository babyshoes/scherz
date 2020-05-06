import React, { useMemo, useCallback } from 'react';
import _ from 'lodash';
import ChordGroup from './ChordGroup';
import {
  width, height, marginX, marginTop,
  headerHeight, lineSpacing,
  chordsStart, chordsEnd,
} from './layout';


const displayCount = 5;

function renderLine(index) {
  const y = marginTop + headerHeight + (lineSpacing * (index+2));
  return index !== 5 && (
    <line
      key={`line${index}`} stroke="white"
      x1={marginX} x2={width - marginX}
      y1={y} y2={y}
    />
  )
}

export default function Staff({
  isPlaying, beat, offset, chordGroups, colors,
  onUpArrowClick, onDownArrowClick, onAreaClick
}) {

  const displayedChordGroups = useMemo(() => 
    chordGroups.slice(offset, displayCount+offset), [offset, chordGroups]
  );
    
  const renderChordGroup = useCallback(
    function render(chordGroup, groupIndex) {
      const chordSpacing = (chordsEnd - chordsStart) / (displayCount-1);
      const thisBeat = groupIndex + offset;
      const color = colors[thisBeat % colors.length];
      const x = (groupIndex * chordSpacing) + chordsStart;
  
      return (
        <g key={`chordGroup${groupIndex}`} transform={`translate(${x}, 0)`}>
          <ChordGroup
            beat={beat}
            chordGroup={chordGroup}
            offset={offset}
            onUpArrowClick={() => onUpArrowClick(thisBeat)}
            onDownArrowClick={() => onDownArrowClick(thisBeat)}
          />
          <rect
            className={`chord ${thisBeat === beat && 'on-beat'}`}
            x={chordSpacing / -4}
            y={marginTop + headerHeight + lineSpacing}
            width={chordSpacing / 2}
            height={lineSpacing*12}
            fill={color}
            onClick={() => onAreaClick(thisBeat)}
          />
        </g>
      )
    },
    [beat, colors, offset, onAreaClick, onDownArrowClick, onUpArrowClick],
  );

  const _chordGroups = useMemo(
    () => displayedChordGroups.map(renderChordGroup),
    [displayedChordGroups, renderChordGroup],
  )

  return (
    <svg
      className={`staff transition-opacity ${isPlaying && 'transparent'}`}
      viewBox={`0 0 ${width} ${height}`}
    >
      { _.range(11).map(renderLine) }
      { _chordGroups }
    </svg>
  )
}