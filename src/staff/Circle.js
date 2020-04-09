import React from 'react';
import {
  height, marginY, footerHeight, noteSpacing,
  circleRadius, ledgerLineWidth, offsetWidth, fontSize,
} from './layout.js';


export default function({ pitch, space, offset }) {
  // todo: don't hardcode these values
  const x = offset ? offsetWidth : 0;
  const y = height - (marginY + footerHeight + ((space+2) * noteSpacing));
  const accidentals = pitch.slice(1)
    .replace('#', '♯', 'g')
    .replace('b', '♭', 'g')

  return (
    <g>
      <circle
        r={circleRadius} cx={x} cy={y}
      />
      {[0, 12, 24].includes(space) &&
        <line
          x1={x - (ledgerLineWidth/2)} x2={x + (ledgerLineWidth/2)}
          y1={y} y2={y}
          stroke="white"
        />
      }
      <text
        fontSize={fontSize}
        x={offset ? x-50: x-20} y={y}
        textAnchor="end" dominantBaseline="middle"
      >
        { accidentals }
      </text>
    </g>
  )
}