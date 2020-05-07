import React, { useState, useRef, useMemo, useCallback } from 'react';
import _ from 'lodash';
import {
  width, height, marginTop, controlsHeight,
  displayCount, nodeRadius, xBetweenNodes,
  getX, getY, getValue,
  curveHeight, curveStart, curveEnd, curveWidth,
} from './layout.js';
import bezierPath from './cubic-bezier.js';
import usePrevious from '../util/use-previous.js';
import Controls from './Controls';


const keys = ['dissonance', 'color', 'gravity'];

export default function Curve({
  isPlaying, forces, offset,
  onNodeMove, onNodeRelease, onAddForce, onRemoveForce,
}) {

  const [activeNode, setActiveNode] = useState(null);
  const [activeKey, setActiveKey] = useState(null);
  const [hoveredKey, setHoveredKey] = useState(null);
  const [hoveredArea, setHoveredArea] = useState(null);

  const displayedForces = useMemo(() =>
    forces.slice(offset, displayCount+offset), [forces, offset]
  );
  const activeArea = useMemo(() => activeNode && activeNode.index, [activeNode]);
  
  const toggleActiveKey = useCallback(
    (key) =>
      activeKey === key
        ? setActiveKey(null)
        : setActiveKey(key),
    [activeKey],
  )

  const ref = useRef(null);

  const previousOffset = usePrevious(offset);

  const transition = useMemo(
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
        onNodeMove(index+offset, key, value);
      }
    }
  };

  function onSVGPointerUp() {
    activeNode && onNodeRelease(activeNode.index + offset);
    setActiveNode(null);
  }

  function onSVGPointerLeave() {
    onSVGPointerUp();
    setActiveKey(null);
  }

  const getOpacity = useCallback(
    function(key) {
      if (!activeKey && !hoveredKey && !activeNode) return 0.5;
      if (activeNode && key === activeNode.key) return 0.8;
      if (key === activeKey) return 0.8;
      if (key === hoveredKey) return 0.5;
      return 0.25;
    },
    [activeKey, activeNode, hoveredKey],
  );

  function getMaxY(...forces) {
    const values = _.flatMap(forces, _.values);
    return getY(_.max(values));
  }

  const renderHeading = useCallback(
    function render(key) {
      const blurbs = {
        color: 'allows chords to venture further out in the circle of fifths',
        dissonance: 'results in more "unnatural" sounding chords',
        gravity: 'prioritizes half step resolutions and tighter voice leading'
      };
  
      let value;
      if (activeNode && activeNode.key === key) {
        value = displayedForces[activeNode.index][key];
      } else if (activeArea) {
        value = displayedForces[activeArea][key];
      } else if (hoveredArea === 0 && ['color', 'gravity'].includes(key)) {
        value = '--'
      } else if (_.isNumber(hoveredArea)) {
        value = displayedForces[hoveredArea][key];
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
          <div> {blurbs[key]} </div>
        </div>
      )
    },
    [displayedForces, activeArea, activeNode, getOpacity, hoveredArea, toggleActiveKey],
  )

  const headings = useMemo(() => keys.map(renderHeading), [renderHeading]);

  const renderPath = useCallback(
    function render(key) {
      const colors = {
        color: '#f6cd61',
        dissonance: '#fe8a71',
        gravity: '#3da4ab',
      };
  
      const points = _
        .map(displayedForces, key)
        .map((value, index) => [getX(index), getY(value)])
  
      const prevX = getX(0) - xBetweenNodes;
      const prevValue = offset !== 0 && forces[offset-1][key];
      const prevY = prevValue ? getY(prevValue) : getY(0);
      const prev = [prevX, prevY];
  
      const nextX = curveStart + curveWidth + xBetweenNodes;
      const nextValue = offset + displayCount < forces.length && forces[offset+displayCount][key];
      const nextY = nextValue ? getY(nextValue) : getY(0);
      const next = [nextX, nextY];
  
      const start = [prevX, getY(0)];
      const end = [nextX, getY(0)];
  
      return (
        <path
          key={`path${key}`}
          className="transition-opacity"
          clipPath="url(#bounding-box)"
          d={bezierPath([ start, prev, ...points, next, end ])}
          fill={colors[key]}
          opacity={getOpacity(key)}
          onClick={() => toggleActiveKey(key)}
        />
      )
    },
    [displayedForces, forces, offset, getOpacity, toggleActiveKey],
  );

  const paths = useMemo(
    () =>
      <>
        <defs>
          <clipPath id="bounding-box">
            <rect
              x={0} y={0}
              width={width} height={marginTop + controlsHeight + curveHeight}
            />
          </clipPath>
        </defs>
        <g
          key={`paths${offset}`}
          className={transition && `swipe ${transition}`}
        >
          { keys.map(renderPath) }
        </g>
      </>,
    [offset, transition, renderPath],
  );

  const renderEdgeOverlays = useCallback(
    function render(buffer = 0) {
      const addedRightOverlayWidth = Math.max(displayCount - forces.length, 0) * xBetweenNodes;
      const canScrollLeft = offset !== 0;
      const canScrollRight = offset + displayCount < forces.length;
  
      const leftStartIndex = canScrollLeft ? offset-1 : offset;
      const leftY = getMaxY(...forces.slice(leftStartIndex, offset+2));
  
      const rightStartIndex = canScrollLeft ? offset + displayCount-2 : offset + displayCount-1;
      const rightY = forces.length < displayCount
        ? getMaxY(_.last(forces))
        : getMaxY(...forces.slice(rightStartIndex, offset + displayCount+1));
  
      return (
        <>
          <rect
            className={canScrollLeft ? 'left-gradient' : 'cover'}
            x={0}
            y={leftY - nodeRadius}
            width={curveStart - buffer}
            height={getY(0) - leftY + nodeRadius*2}
          />
          <rect
            className={canScrollRight ? 'right-gradient' : 'cover'}
            x={curveEnd - addedRightOverlayWidth + buffer}
            y={rightY - nodeRadius}
            width={curveStart + addedRightOverlayWidth - buffer}
            height={getY(0) - rightY + nodeRadius*2}
          />
        </>
      );
    },
    [forces, offset],
  );

  const pathEdgeOverlays = useMemo(() => renderEdgeOverlays(), [renderEdgeOverlays]);

  const renderHoverArea = useCallback(
    function render(index) {
      const force = displayedForces[index];
      const maxY = getMaxY(force);
  
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
          key={`area${index}`}
          opacity="0"
          width={xBetweenNodes / 2}
          height={getY(0) - maxY}
          x={getX(index) - (xBetweenNodes / 4)}
          y={maxY}
          onPointerEnter={() => setHoveredArea(index)}
          onPointerLeave={() => setHoveredArea(null)}
          onClick={toggleUnderlyingKey}
        />
      )
    },
    [displayedForces, toggleActiveKey],
  )

  const hoverAreas = useMemo(
    () => _.range(displayCount).map(renderHoverArea),
    [renderHoverArea],
  );

  const renderNode = useCallback(
    function renderNode(index, key, value) {
      const isDisabled = index === 0 && offset === 0 && ['color', 'gravity'].includes(key);
      
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
          cy={getY(value)} r={nodeRadius}
          opacity={getOpacity(key)}
          onPointerEnter={onPointerEnter}
          onPointerLeave={reset}
          onPointerDown={() => !isDisabled && setActiveNode({ index, key })}
          onPointerUp={() => !isDisabled && setActiveKey(key)}
        />
      )
    },
    [getOpacity, offset],
  );

  const renderNodes = useCallback(
    function render(force, index) {
      let orderedKeys = keys;
      if (index === 0 && offset === 0) {
        orderedKeys = ['color', 'gravity', 'dissonance'];
      } else if (activeKey) {
        orderedKeys = [ ..._.without(keys, activeKey), activeKey ];
      }
  
      return (
        <g key={`force${index}`} transform={`translate(${getX(index)}, 0)`}>
          { orderedKeys.map(key => renderNode(index, key, force[key])) }
        </g>
      )
    },
    [activeKey, offset, renderNode],
  );

  const nodes = useMemo(
    () => 
      <g
        key={`nodes${offset}`}
        className={transition && `swipe ${transition}`}
      >
        { displayedForces.map(renderNodes) }
      </g>,
    [displayedForces, offset, transition, renderNodes],
  );

  const nodeEdgeOverlays = useMemo(() => renderEdgeOverlays(nodeRadius), [renderEdgeOverlays]);

  return (
    <>
      <div className="forces">
        { headings }
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
          <linearGradient id="left-gradient">
            <stop offset="0%" style={{ stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopOpacity: 0.15 }} />
          </linearGradient>
        </defs>
        <defs>
          <linearGradient id="right-gradient">
            <stop offset="0%" style={{ stopOpacity: 0.15 }}/>
            <stop offset="100%" style={{ stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        <rect
          className="layer"
          onClick={() => setActiveKey(null)}
        />
        <Controls
          forceCount={forces.length}
          onAddForce={onAddForce}
          onRemoveForce={onRemoveForce}
        />
        { paths }
        { pathEdgeOverlays }
        { hoverAreas }
        { nodes }
        { nodeEdgeOverlays }
      </svg>
    </>
  )
}
