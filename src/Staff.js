import React, { Component, useState, useEffect, useLayoutEffect, useRef } from 'react';
import { drawStaff } from './viz/staff'
import './App.css';

export default function Staff ({timestep, numTimesteps, chords}) {
    const [height, setHeight] = useState(0)
    const ref = useRef(null)

    useLayoutEffect(() => {
        setHeight(ref.current.clientHeight)
        drawStaff(ref, timestep, numTimesteps, chords, height)
    })

    // useEffect(() => {
    //     drawStaff(ref, timestep, numTimesteps, chords, height)
    // })

    return (
        <div ref={ref} id="staff-viz"/>
    )

} 
 
// export default class Staff extends Component {   

//     componentDidMount() {
//         drawStaff(this.props)
//     };

//     componentDidUpdate() {
//         drawStaff(this.props)
//     };

//     render(){ 
//         return (
//             <div id="staff-viz"/>
//         );
//     }
//   }
