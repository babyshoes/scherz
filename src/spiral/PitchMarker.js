import React, { createRef, useEffect } from 'react'
import { Dom, useUpdate } from 'react-three-fiber'

export default function PitchMarker({ position, pitch, updateMaterial }) {
  const ref = createRef()
  useEffect(() => {
    ref.current && updateMaterial(ref.current.style)
  }, [ref, updateMaterial, pitch]);

  const materialRef = useUpdate(updateMaterial, [position]);

  return (
    <mesh position={position} name={pitch}>
      <Dom ref={ref}> <span className="pitch"> { pitch } </span> </Dom>
      <sphereBufferGeometry attach="geometry" args={[0.1, 1, 1]} />
      <meshBasicMaterial ref={materialRef} attach="material" transparent />
    </mesh>
  )
}