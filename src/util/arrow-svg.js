import React from 'react';

export default function arrowSVG(width, height) {
  const arrowPath =  `
    M -${width / 2} ${height}
    L 0,0
    L ${width / 2} ${height}
    z
  `
  return (
    <>
      <rect
        transform={`translate(-${width}, -${height})`}
        opacity={0}
        width={width*2}
        height={height*2}
      />
      <path d={arrowPath} fill="white" />
    </>
  )
}