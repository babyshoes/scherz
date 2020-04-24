import React, { useState, useRef, useMemo } from 'react';
import _ from 'lodash';
import {
  width, height, marginY,
  plotHeight, getY, getValue,
  curveStart, curveEnd, curveWidth, curveMarginX,
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
};

export default function({ isPlaying, forces, onNodeMove, onNodeRelease, onAddForce, onRemoveForce }) {

  const [activeNode, setActiveNode] = useState(null);
  const [activeKey, setActiveKey] = useState(null);
  const [hoveredKey, setHoveredKey] = useState(null);
  const [hoveredArea, setHoveredArea] = useState(null);

  const activeArea = useMemo(() => activeNode && activeNode.index, [activeNode]);
  
  const toggleActiveKey = (key) =>
    activeKey === key
      ? setActiveKey(null)
      : setActiveKey(key);

  const ref = useRef(null);

  const xBetweenNodes = curveWidth / (forces.length-1);
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

    const isDisabled = index === 0 && ['color', 'gravity'].includes(key)
    
    function onPointerEnter() {
      setHoveredArea(index);
      !isDisabled && setHoveredKey(key);
    }

    function reset() {
      setHoveredArea(null);
      setHoveredKey(null)
    }

    return (
      <circle
        className={`node ${isDisabled && 'disabled-cursor'} transition-opacity`}
        key={`node${index}${key}`}
        cy={getY(value)} r={6}
        opacity={getOpacity(key)}
        onPointerEnter={onPointerEnter}
        onPointerLeave={reset}
        onPointerDown={() => !isDisabled && setActiveNode({ index, key })}
        onPointerUp={() => !isDisabled && setActiveKey(key)}
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
        clipPath="url(#bounding-box)"
        d={bezierPath([ start, ...points, end ])}
        fill={colors[key]}
        opacity={getOpacity(key)}
        onClick={() => toggleActiveKey(key)}
      />
    )
  }

  function renderHoverArea(beat) {
    const force = forces[beat];
    const maxValue = _.max(_.values(force));
    const maxY = getY(maxValue);

    function toggleUnderlyingKey(e) {
      const { y } = getMousePosition(e);
      const value = getValue(y);
      for (let i=keys.length-1; i>=0; i--) {
        const key = keys[i];
        const formerKey = keys[i+1];
        const maxVal = force[key];
        const minVal = i === keys.length-1 ? 0 : force[formerKey];
        if (value > minVal && value < maxVal) {
          toggleActiveKey(key);
          return;
        }
      }
    }

    return (
      <rect
        key={`area${beat}`}
        opacity="0"
        width={xBetweenNodes / 2}
        height={getY(0) - maxY}
        x={getX(beat) - (xBetweenNodes / 4)}
        y={maxY}
        onPointerEnter={() => setHoveredArea(beat)}
        onPointerLeave={() => setHoveredArea(null)}
        onClick={toggleUnderlyingKey}
      />
    )
  }

  function renderHeading(key) {
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
      <div
        key={`heading${key}`}
        className="heading transition-opacity"
        style={{opacity: getOpacity(key)}}
      >
        <div
          style={{cursor: 'pointer'}}
          onPointerEnter={() => setHoveredKey(key)}
          onPointerLeave={() => setHoveredKey(null)}
          onClick={() => toggleActiveKey(key)}
        >
          <span>{key}</span>
          {value !== undefined &&
            <span className="fade-in">: {value}</span>
          }          
        </div>
        <div>
          {blurbs[key]}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="forces">
        { keys.map(renderHeading) }
      </div>
      <svg
        className={`curve transition-opacity ${isPlaying && 'transparent'}`}
        ref={ref}
        viewBox={`0 0 ${width} ${height}`}
        onPointerMove={onSVGPointerMove}
        onPointerUp={onSVGPointerUp}
        onPointerLeave={onSVGPointerLeave}
      >
        <defs>
          <clipPath id="bounding-box">
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
        { keys.map(renderPath) }
        { _.range(forces.length).map(renderHoverArea) }
        { forces.map(renderNodes) }
        <g transform={`translate(${curveEnd + (curveMarginX/2)}, ${getY(0)})`}>
          <text { ...textProps }
            className={`remove-force ${forces.length <= 1 && 'disabled'}`}
            y={-width / 40}
            onClick={onRemoveForce}
          >
            -
          </text>
          <text { ...textProps }
            className={`add-force ${forces.length >= 10 && 'disabled'}`}
            onClick={onAddForce}
          >
            +
          </text>
        </g>
      </svg>
    </>
  )
}
