import React, { useLayoutEffect, useRef } from 'react';
import { drawSpiral } from './viz/spiral'
import './App.css';

// TO DO: draw spiral separately from chord plane?
export default function Spiral ({chord}) {

    const ref = useRef(null)

    useLayoutEffect(() => {
        drawSpiral(chord, ref)
    }, [chord])

    return (
        <div ref={ref} id="spiral-viz"/>
    )
  
  } 