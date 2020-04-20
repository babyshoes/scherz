import React from 'react';
import * as THREE from 'three'
import { useUpdate } from 'react-three-fiber';
import _ from 'lodash'

export default function({ vertices, color, updateMaterial }) {

  const faces = _
    .combinations(_.range(0, vertices.length), 3)
    .map(c => new THREE.Face3(...c));

  const onGeometryUpdate = geometry => {
    geometry.verticesNeedUpdate = true;
    geometry.elementsNeedUpdate = true;
  };

  const materialRef = useUpdate(updateMaterial, [vertices]);

  return (
    <mesh>
      <geometry
        attach="geometry" onUpdate={onGeometryUpdate}
        vertices={vertices} faces={faces} 
      />
      <meshBasicMaterial
        attach="material" ref={materialRef}
        depthTest={false} side={THREE.DoubleSide}
        color={color} opacity={0.5} transparent
      />
    </mesh>
  )
}