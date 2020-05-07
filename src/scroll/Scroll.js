import React from 'react';
import { width, height, arrowWidth, arrowHeight } from './layout';
import arrowSVG from '../util/arrow-svg';


const displayCount = 5;
const arrow = arrowSVG(arrowWidth, arrowHeight);

function Scroll({ isPlaying, forceCount, offset, onLeftArrowClick, onRightArrowClick }) {

  return (
    <svg
      className={`scroll transition-opacity ${isPlaying && 'transparent'}`}
      viewBox={`0 0 ${width} ${height}`}
    >
      <g transform={`translate(0, ${height / 2.5})`}>
        <g
          className={`arrow ${offset === 0 && 'hidden'}`}
          transform={`translate(0, 0) rotate(-90)`}
          onClick={onLeftArrowClick}
        >
          { arrow }
        </g>
        <g
          className={`arrow ${forceCount <= displayCount+offset && 'hidden'}`}
          transform={`translate(${width}, 0) rotate(90)`}
          onClick={onRightArrowClick}
        >
          { arrow }
        </g>
      </g>
    </svg>
  )
}

export default React.memo(Scroll);