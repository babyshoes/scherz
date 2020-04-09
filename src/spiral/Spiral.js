import React, { useMemo } from 'react'
import { useFrame, useUpdate } from 'react-three-fiber'
import * as THREE from 'three'
import { pitchToBrightness, brightnessToPitch, fifthsBetween, fifthsAbove } from 'scherz.util'
import 'lodash.combinations'
import _ from 'lodash'
import TWEEN from '@tweenjs/tween.js'
import SpiralLine from './SpiralLine';
import PitchMarker from './PitchMarker';
import ChordShape from './ChordShape';
import usePrevious from '../util/usePrevious.js';

const spiralLength = 20;
const pitchesPerRev = 4
const numRevs = spiralLength / pitchesPerRev

const topY = 6
const bottomY = -6
const totalHeight = topY - bottomY
const diameter = 2

function getPoints() {
  const stepsPerRev = 64;
  const radiansPerStep = (Math.PI * 2) / stepsPerRev
  const stepCount = stepsPerRev * numRevs
  const deltaY = totalHeight / stepCount

  const getPoint = (numstep) => new THREE.Vector3(
    diameter * Math.cos(radiansPerStep * numstep), // x
    bottomY + (deltaY * numstep), // y
    diameter * Math.sin(radiansPerStep * numstep) // z
  )

  const points = _.range(0, stepCount).map(getPoint)
  return new THREE.CatmullRomCurve3(points).getPoints(1600)
}

const calculateCenter = (pitches) =>
  brightnessToPitch(
    Math.floor(
      _.mean(
        pitches.map(pitchToBrightness)
      )))

const calculateSpiral = (center) => [
  ..._.dropRight(fifthsBetween(fifthsAbove(-10, center), center), 1),
  ...fifthsBetween(center, fifthsAbove(10, center)),
]

const tweenOpacity = (initialOpacity, targetOpacity, duration, delay) => (material) => {
  material.opacity = initialOpacity;
  new TWEEN.Tween(material)
    .to({ opacity: targetOpacity }, duration)
    .easing(TWEEN.Easing.Quadratic.Out)
    .delay(delay)
    .start();
}

const updatePrevSpiral = (prevCenter, center) => group => {
  const brightnessDiff = pitchToBrightness(center) - pitchToBrightness(prevCenter);

  group.rotation.y = 0;
  const radiansPerPitch = (Math.PI * 2) / pitchesPerRev;
  new TWEEN.Tween(group.rotation)
    .to({ y: group.rotation.y + (brightnessDiff * radiansPerPitch) }, 250)
    .easing(TWEEN.Easing.Quadratic.Out)
    .start();
  
  group.position.y = 0;
  const heightPerPitch = totalHeight / spiralLength;
  new TWEEN.Tween(group.position)
    .to({ y: group.position.y - (brightnessDiff * heightPerPitch) }, 250)
    .easing(TWEEN.Easing.Quadratic.Out)
    .start();
}

export default function Spiral({ pitches, color }) {

  useFrame(() => TWEEN.update());

  const center = calculateCenter(pitches);
  const spiral = calculateSpiral(center);

  const points = useMemo(getPoints);

  const n = Math.floor(points.length / (spiral.length-1));
  const markerPositions = points.filter((_, index) => index % n === 0);

  const chordVertices = pitches
    .map(pitch => spiral.indexOf(pitch))
    .map(index => markerPositions[index]);

  const prevCenter = usePrevious(center);
  const prevSpiralRef = useUpdate(updatePrevSpiral(prevCenter, center), [pitches]);

  const prevPitches = usePrevious(pitches);
  const prevChordVertices = usePrevious(chordVertices);

  const prevSpiral = usePrevious(spiral);
  const markerObjects = _
    .zip(markerPositions, spiral)
    .map(([position, pitch]) => ({ position, pitch, key: pitch }));

  const markers = markerObjects
    .filter(o => !(prevSpiral && prevSpiral.includes(o.pitch)))
    .map(o => {
      const targetOpacity = pitches.includes(o.pitch) ? 1 : 0.25;
      return <PitchMarker { ...o } updateMaterial={tweenOpacity(0, targetOpacity, 250, 250)} />
    });

  const prevColor = usePrevious(color);
  const prevMarkerObjects = usePrevious(markerObjects);
  const prevMarkers = prevMarkerObjects && prevMarkerObjects.map(o => {
    let initialOpacity;
    if (pitches.includes(o.pitch)) {
      initialOpacity = 1;
    } else if (prevPitches.includes(o.pitch)) {
      initialOpacity = 0.5;
    } else {
      initialOpacity = 0.15;
    }
    const targetOpacity = spiral.includes(o.pitch) ? initialOpacity : 0;
    return <PitchMarker { ...o } updateMaterial={tweenOpacity(initialOpacity, targetOpacity, 975, 0)} />
  });

  return (
    <group>
      <group>
        <SpiralLine points={points} updateMaterial={tweenOpacity(0, 1, 250, 250)}/>
        { markers }
        <ChordShape
          vertices={chordVertices}
          updateMaterial={tweenOpacity(0, 0.75, 250, 250)}
          color={color}
        />
      </group>
      { prevCenter &&
        <group ref={prevSpiralRef}>
          <SpiralLine points={points} updateMaterial={tweenOpacity(1, 0, 975, 0)} />
          { prevMarkers }
          <ChordShape
            vertices={prevChordVertices}
            updateMaterial={tweenOpacity(0.75, 0, 975, 0)}
            color={prevColor}
          />
        </group>
      }
    </group>
  )
}