// import React, { useState, useLayoutEffect, useRef } from 'react';
// import { drawCurve } from './viz/curve'
// obsolete. see Left

// import './App.css';

// // no global for now
// export default function Tension ({numTimesteps, tensions}) {
//     const [active, setActive] = useState("color")
//     const ref = useRef(null)

//     useLayoutEffect(() => {
//         drawCurve(ref, numTimesteps, tensions)
//     })

//     const onActiveChange = (dim) => {
//         setActive(dim)
//     }

//     return (
//         <div ref={ref} id="curve-viz"/>
//     )

// } 