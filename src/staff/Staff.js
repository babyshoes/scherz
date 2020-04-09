import React from 'react';
import _ from 'lodash';
import '../App.css';
import ChordGroup from './ChordGroup.js';
import {
  width, height, marginX, marginY,
  headerHeight, lineSpacing,
  chordsStart, chordsEnd,
} from './layout.js';


export default function({ play, beat, colors, chordGroups, forceCount, onArrowClick, onAreaClick }) {

  function renderLine(index) {
    const y = marginY + headerHeight + (lineSpacing * (index+2));
    return index !== 5 && (
      <line
        key={`line${index}`} stroke="white"
        x1={marginX} x2={width - marginX}
        y1={y} y2={y}
      />
    )
  }
    
  function renderChordGroup(chordGroup, groupIndex) {
    const chordSpacing = (chordsEnd - chordsStart) / (forceCount-1);
    const x = (groupIndex * chordSpacing) + chordsStart;

    return (
      <g key={`chordGroup${groupIndex}`} transform={`translate(${x}, 0)`}>
        <ChordGroup
          chordGroup={chordGroup}
          onArrowClick={onArrowClick(groupIndex)}
        />
        <rect
          className="chord transition-opacity"
          x={chordSpacing / -4}
          y={marginY + headerHeight + lineSpacing}
          width={chordSpacing / 2}
          height={lineSpacing*12}
          opacity={groupIndex === beat ? 0.25 : 0}
          fill={colors[groupIndex % colors.length]}
          cursor="pointer"
          onClick={onAreaClick(groupIndex)}
        />
      </g>
    )
  }

  return (
    <svg
      className={`staff transition-opacity`}
      viewBox={`0 0 ${width} ${height}`}
    >
      { _.range(11).map(renderLine) }
      { chordGroups.map(renderChordGroup) }
      { play && <rect className="transition-opacity cover"/> }
    </svg>
  )
}