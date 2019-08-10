import React, { useLayoutEffect, useRef } from 'react';
import { drawStaff } from './viz/staff'
import { drawCurve } from './viz/curve'
import './App.css';
import { getxScale } from './viz/util';

export default ({timestep, numTimesteps, chords, tensions, onCurveChange}) => {
    const staffRef = useRef(null)
    const curveRef = useRef(null)

    useLayoutEffect(() => {
        const xScale = getxScale(numTimesteps)
        drawStaff(staffRef, timestep, xScale, chords)
        drawCurve(curveRef, xScale, tensions, onCurveChange)
    })

    return (
        <div>
            <div ref={curveRef} id="curve-viz"/>
            <div ref={staffRef} id="staff-viz"/>
        </div>
    )
} 