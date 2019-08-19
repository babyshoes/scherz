import React, { useLayoutEffect, useRef } from 'react';
import { drawSpiral } from './viz/spiral'
import './App.css';

// TO DO: draw spiral separately from chord plane?
export default function Spiral ({chord}) {

    const ref = useRef(null)
    // let spiral = null 

    useLayoutEffect(() => {
        // instead of componentDidMount/Update
        if (ref.current.className === "first-load") {
            const spiral = drawSpiral(chord, ref)
            ref.current.className = ""
        } else {
            console.log("hello")
            // spiral.updateChordPlane(chord)
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