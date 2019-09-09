import React, { useLayoutEffect, useRef } from 'react';
// import { drawSpiral } from './viz/spiral'
import { makeSpiral } from './viz/spiral'
import './App.css';

const spiral = makeSpiral()

export default function Spiral ({chord, spiralRange, play, color}) {

    const ref = useRef(null)
    // let spiral = null
    // const spiral = makeSpiral(spiralRange)

    useLayoutEffect(() => {
        // spiral = makeSpiral(ref, spiralRange)
        if (ref.current.clientWidth > 0 && ref.current.className === "first-load") {
            console.log("first build")
            spiral.build(ref, spiralRange)
            ref.current.className = ""
        // } else if (spiral.spiralRange !== spiralRange) {
        //     debugger
        //     // tear down spiral
        //     spiral.build(ref.spiralRange)
        } else {
            if (!ref.current) {debugger}
            if (ref.current === null) {debugger}
            spiral.updateChordPlane(chord, color)
        }

    }, [spiralRange, chord])

    // useLayoutEffect(() => {
    //     spiral.updateChordPlane(chord)
    //     // if (spiral && ref.current.clientWidth > 0 && ref.current.className === "first-load") {
    //     //     spiral.build()
    //     //     // spiral.updateChordPlane(chord)
    //     //     ref.current.className = ""
    //     // } else {
    //     //     debugger
    //     //     spiral.updateChordPlane(chord)
    //     // }
    // }, [chord])

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