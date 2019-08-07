import React, { useLayoutEffect, useRef } from 'react';
import { drawCurve } from './viz/curve'
import './App.css';

// no global for now
export default function Tension ({numTimesteps, tensions}) {
    const ref = useRef(null)

    useLayoutEffect(() => {
        drawCurve(ref, numTimesteps, tensions)
    })

    return (
        <div ref={ref} id="curve-viz"/>
    )

} 