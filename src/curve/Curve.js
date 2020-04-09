import React, { useState, useRef, useMemo } from 'react';
import _ from 'lodash';
import '../App.css';
import {
  width, height, marginX, marginY,
  plotWidth, plotHeight,
  curveStart, curveEnd, curveWidth, curveMarginX,
  headerSpacing, headerFontSize,
  getY, getValue,
} from './layout.js';
import bezierPath from './cubic-bezier.js';

const keys = ['dissonance', 'color', 'gravity'];

const colors = {
  color: '#f6cd61',
  dissonance: '#fe8a71',
  gravity: '#3da4ab',
};

const blurbs = {
	color: 'allows chords to venture further out in the circle of fifths',
	dissonance: 'results in more "unnatural" sounding chords',
	gravity: 'prioritizes half step resolutions and tighter voice leading'
};

const textProps = {
  fontSize: width / 40,
  dominantBaseline: 'middle',
  textAnchor: 'middle',
  cursor: 'pointer',
};

export default function({ play, forces, onNodeMove, onNodeRelease, onAddForce, onRemoveForce }) {

  const [activeNode, setActiveNode] = useState(null);
  const [activeKey, setActiveKey] = useState(null);
  const [hoveredKey, setHoveredKey] = useState(null);
  const [hoveredArea, setHoveredArea] = useState(null);

  const activeArea = useMemo(() => activeNode && activeNode.index, [activeNode]);
  
  const ref = useRef(null);

  const xBetweenNodes = (curveWidth / (forces.length-1));
  const getX = index => xBetweenNodes * index + curveStart;

  function getMousePosition(e) {
    const svg = ref.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }

  function onSVGPointerMove(e) {
    if (activeNode) {
      const { y } = getMousePosition(e);
      const value = getValue(y);
      if (value >= 0 && value <= 1) {
        const { index, key } = activeNode;
        onNodeMove(index, key, value);
      }
    }
  };

  function onSVGPointerUp() {
    activeNode && onNodeRelease(activeNode.index);
    setActiveNode(null);
  }

  function onSVGPointerLeave() {
    onSVGPointerUp();
    setActiveKey(null);
  }

  function getOpacity(key) {
    if (!activeKey && !hoveredKey && !activeNode) return 0.5;
    if (activeNode && key === activeNode.key) return 0.8;
    if (key === activeKey) return 0.8;
    if (key === hoveredKey) return 0.5;
    return 0.25;
  }

  function renderNode(index, key, value) {

    const disabled = index === 0 && ['color', 'gravity'].includes(key)
    
    function onPointerEnter() {
      setHoveredArea(index);
      !disabled && setHoveredKey(key);
    }

    function onPointerLeave() {
      setHoveredArea(null);
      setHoveredKey(null)
    }

    return (
      <circle
        className={`node ${disabled && 'disabled'} transition-opacity`}
        key={`node${index}${key}`}
        cy={getY(value)} r={6}
        opacity={getOpacity(key)}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onPointerDown={() => !disabled && setActiveNode({ index, key })}
        onPointerUp={() => !disabled && setActiveKey(key)}
      />
    )
  }

  function renderNodes(force, index) {
    let orderedKeys = keys;
    if (index === 0) {
      orderedKeys = ['color', 'gravity', 'dissonance'];
    } else if (activeKey) {
      orderedKeys = [ ..._.without(keys, activeKey), activeKey ];
    }

    return (
      <g key={`force${index}`} transform={`translate(${getX(index)}, 0)`}>
        { orderedKeys.map(key => renderNode(index, key, force[key])) }
      </g>
    )
  }

  function renderPath(key) {
    const points = _
      .map(forces, key)
      .map((value, index) => [getX(index), getY(value)])

    const start = [curveStart, getY(0)]
    const end = [curveEnd, getY(0)]
    return (
      <path
        key={`path${key}`}
        className="transition-opacity"
        clipPath="url(#curve)"
        d={bezierPath([ start, ...points, end ])}
        fill={colors[key]}
        opacity={getOpacity(key)}
      />
    )
  }

  function renderArea(index) {
    const maxValue = _.max(_.values(forces[index]));
    const maxY = getY(maxValue);

    return (
      <rect
        key={`area${index}`}
        opacity="0"
        width={xBetweenNodes / 2}
        height={getY(0) - maxY}
        x={getX(index) - (xBetweenNodes / 4)}
        y={maxY}
        onPointerEnter={() => setHoveredArea(index)}
        onPointerLeave={() => setHoveredArea(null)}
      />
    )
  }

  function renderHeading(key, index) {
    let value;
    if (activeNode && activeNode.key === key) {
      value = forces[activeNode.index][key];
    } else if (activeArea) {
      value = forces[activeArea][key];
    } else if (hoveredArea === 0 && ['color', 'gravity'].includes(key)) {
      value = '--'
    } else if (_.isNumber(hoveredArea)) {
      value = forces[hoveredArea][key];
    }

    return (
      <g
        key={`heading${key}`}
        className="transition-opacity"
        opacity={getOpacity(key)}
        transform={`translate(${marginX}, ${marginY + index*headerSpacing})`}
      >
        <text
          cursor="pointer" fontSize={headerFontSize}
          onPointerEnter={() => setHoveredKey(key)}
          onPointerLeave={() => setHoveredKey(null)}
          onClick={() => setActiveKey(key)}
        >
          <tspan>{key}</tspan>
          {value !== undefined &&
            <tspan className="fade-in-value">: {value}</tspan>
          }          
        </text>
        <text x={plotWidth} fontSize={headerFontSize} textAnchor="end">
          {blurbs[key]}
        </text>
      </g>
    )
  }

  return (
    <svg
      className={`curve transition-opacity`}
      ref={ref}
      viewBox={`0 0 ${width} ${height}`}
      opacity={play ? 0.5 : 1}
      onPointerMove={onSVGPointerMove}
      onPointerUp={onSVGPointerUp}
      onPointerLeave={onSVGPointerLeave}
    >
      <defs>
        <clipPath id="curve">
          <rect
            x={curveStart} y={marginY}
            width={curveWidth} height={plotHeight}
          />
        </clipPath>
      </defs>
      <rect
        className="layer"
        onClick={() => setActiveKey(null)}
      />
      { keys.map(renderHeading) }
      { keys.map(renderPath) }
      { _.range(forces.length).map(renderArea) }
      { forces.map(renderNodes) }
      <g transform={`translate(${curveEnd + (curveMarginX/2)}, ${getY(0)})`}>
        {forces.length > 1 &&
          <text { ...textProps } y={-width / 40} onClick={onRemoveForce}> - </text>
        }
        <text { ...textProps } onClick={onAddForce}> + </text>
      </g>
      { play && <rect className="transition-opacity cover"/>}
    </svg>
  )
}
