import React, { useLayoutEffect, useRef } from 'react';
// import { drawSpiral } from './viz/spiral'
import { makeSpiral } from './viz/spiral'
import './App.css';

export default function Spiral ({chord, spiralRange, play}) {

    const ref = useRef(null)
    const spiral = makeSpiral()

    useLayoutEffect(() => {
        if (ref.current.clientWidth > 0 && ref.current.className === "first-load") {
            spiral.build(ref)
            spiral.updateChordPlane(chord)
            ref.current.className = ""
        } else {
            spiral.updateChordPlane(chord)
        }
    }, [chord])

    useLayoutEffect(() => {
        const spiralDiv = ref.current
        if(play) {
            
            // ref.current.classList.remove("shift-off", "invisible")
          Array.from(spiralDiv.children)
            .forEach(el => el.classList.remove("shift-off", "invisible"))
        } else {
          Array.from(spiralDiv.children)
            .forEach(el => el.classList.add("shift-off", "invisible"))
        }     
    }, [play])

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