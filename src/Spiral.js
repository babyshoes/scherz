import React, { useLayoutEffect, useRef } from 'react';
import { drawSpiral } from './viz/spiral'
import './App.css';

export default function Spiral ({chord}) {

    const ref = useRef(null)

    useLayoutEffect(() => {
        drawSpiral(chord, ref)
    })

    return (
        <div ref={ref} id="spiral-viz"/>
    )
  
  } 