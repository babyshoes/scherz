import React, { useLayoutEffect, useRef } from 'react';
// import { drawSpiral } from './viz/spiral'
import { makeSpiral } from './viz/spiral'
import './App.css';

const spiral = makeSpiral()

export default function Spiral ({chord, spiralRange, play, color}) {

    const ref = useRef(null)

    useLayoutEffect(() => {
        if (ref.current.clientWidth > 0 && ref.current.className === "first-load") {
            console.log("first build")
            spiral.build(ref, spiralRange)
            ref.current.className = ""
        } else {
            spiral.rebuild(spiralRange)
        } 

    }, [spiralRange])

    useLayoutEffect(() => {
        const spiralDiv = ref.current
        
        if(play) {
          spiral.updateChordPlane(chord, color)
          Array.from(spiralDiv.children)
            .forEach(el => el.classList.remove("shift-off", "invisible"))
        } else {
          Array.from(spiralDiv.children)
            .forEach(el => el.classList.add("shift-off", "invisible"))
        }     
    }, [play, chord])

    return (
        <div ref={ref} className="first-load" id="spiral-viz"/>
    )
  
  } 