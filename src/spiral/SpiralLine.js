import React from 'react';
import { useUpdate } from 'react-three-fiber';


function SpiralLine({ points, updateMaterial }) {

  const geometryRef = useUpdate(geometry => geometry.setFromPoints(points));
  const materialRef = useUpdate(updateMaterial);

  return (
    <line>
      <bufferGeometry attach="geometry" ref={geometryRef} />
      <lineBasicMaterial attach="material" ref={materialRef} transparent />
    </line>
  )
}

export default SpiralLine;