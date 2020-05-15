import React from 'react';
import { width, curveMarginX, marginTop, fontSize } from './layout';

const textProps = {
  fontSize,
  dominantBaseline: 'hanging'
};

const Controls = ({ forceCount, onAddForce, onRemoveForce }) =>
  <g transform={`translate(${width - (curveMarginX/2)}, ${marginTop})`}>
    <text { ...textProps }
      className={`add-force ${forceCount >= 12 && 'disabled'}`}
      onClick={onAddForce}
    >
      add
    </text>
    <text { ...textProps }
      className={`remove-force ${forceCount <= 2 && 'disabled'}`}
      y={width / 60}
      onClick={onRemoveForce}
    >
      drop
    </text>
  </g>

export default React.memo(Controls);