import React, { useEffect, useRef } from 'react';
import './App.css';
import { CubeUVRefractionMapping } from 'three';

export default function Header({play, onStatusChange}) {

    const ref = useRef(null)

    const makePlayable = () => {
        ref.current.className = ref.current.className === "play" ? "" : "play"
    }
    
    
    return (
        <div >
            <div>s</div>
            <div>c</div>
            <div>h</div>
            <div>e</div>
            <div>r</div>
            <div ref={ref} className="" onMouseOver={makePlayable} onClick={onStatusChange}>></div>
        </div>
        
    )
}