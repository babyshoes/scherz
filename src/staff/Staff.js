import React from 'react';
import _ from 'lodash';
import ChordGroup from './ChordGroup.js';
import {
  width, height, marginX, marginY,
  headerHeight, lineSpacing,
  chordsStart, chordsEnd,
} from './layout.js';


export default function Staff({
  isPlaying, beat, colors, chordGroups, forceCount,
  onUpArrowClick, onDownArrowClick, onAreaClick
}) {

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
    const color = colors[groupIndex % colors.length];
    const x = (groupIndex * chordSpacing) + chordsStart;

    return (
      <g key={`chordGroup${groupIndex}`} transform={`translate(${x}, 0)`}>
        <ChordGroup
          beat={groupIndex}
          chordGroup={chordGroup}
          onUpArrowClick={() => onUpArrowClick(groupIndex)}
          onDownArrowClick={() => onDownArrowClick(groupIndex)}
        />
        <rect
          className={`chord ${groupIndex === beat && 'on-beat'}`}
          x={chordSpacing / -4}
          y={marginY + headerHeight + lineSpacing}
          width={chordSpacing / 2}
          height={lineSpacing*12}
          fill={color}
          cursor="pointer"
          onClick={() => onAreaClick(groupIndex)}
        />
      </g>
    )
  }

  return (
    <svg
      className={`staff transition-opacity ${isPlaying && 'transparent'}`}
      viewBox={`0 0 ${width} ${height}`}
    >
      { _.range(11).map(renderLine) }
      { chordGroups.map(renderChordGroup) }
    </svg>
  )
}