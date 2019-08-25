import React, { useLayoutEffect, useRef } from 'react';
// import { drawSpiral } from './viz/spiral'
import { makeSpiral } from './viz/spiral'
import './App.css';

export default function Spiral ({chord, spiralRange}) {

    const ref = useRef(null)
    const spiral = makeSpiral()

    useLayoutEffect(() => {
        // instead of componentDidMount/Update
        if (ref.current.clientWidth > 0 && ref.current.className === "first-load") {
            // debugger
            spiral.build(ref)
            spiral.updateChordPlane(chord)
            ref.current.className = ""
        } else {
            spiral.updateChordPlane(chord)
        }
    }, [chord])

    // useLayoutEffect(() => {
    //     console.log("first draw")
    //     spiral = drawSpiral(chord, ref)
    // }, [])

    // useLayoutEffect(() => {
    //     console.log("next")
    //     // debugger
    //     spiral.updateChordPlane(chord)
    // }, [chord])

    return (
        <div ref={ref} className="first-load" id="spiral-viz"/>
    )
  
  } 