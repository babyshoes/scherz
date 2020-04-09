import React, { useRef } from 'react'
import { Canvas, extend, useThree, useFrame } from 'react-three-fiber'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Spiral from './Spiral'

extend({ OrbitControls })

function Controls(props) {
  const { camera, gl: { domElement } } = useThree()
  const controls = useRef()
  useFrame(() => controls.current && controls.current.update())
  return <orbitControls ref={controls} args={[camera, domElement]} {...props} />
}

const SpiralCanvas = ({ chord, color }) => (
  <Canvas className="spiral" camera={{ position: [0, 0, 32], fov: 25 }}>
    <Spiral pitches={chord.pitches} color={color} />
    <Controls enableDamping enableZoom={false} enablePan={false} />
  </Canvas>
)

export default SpiralCanvas;