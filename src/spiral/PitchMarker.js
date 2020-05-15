import React, { createRef, useEffect } from 'react';
import { useUpdate } from 'react-three-fiber';
import { HTML } from 'drei';

export default function PitchMarker({ position, pitch, updateMaterial }) {
  const ref = createRef()
  useEffect(() => {
    ref.current && updateMaterial(ref.current.style)
  }, [ref, updateMaterial, pitch]);

  const materialRef = useUpdate(updateMaterial, [position]);

  return (
    <mesh position={position} name={pitch}>
      <HTML> <span ref={ref}> { pitch } </span> </HTML>
      <sphereBufferGeometry attach="geometry" args={[0.1, 1, 1]} />
      <meshBasicMaterial ref={materialRef} attach="material" transparent />
    </mesh>
  )
}