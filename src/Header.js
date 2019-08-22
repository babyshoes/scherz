import React, { useEffect, useRef } from 'react';
import './App.css';
import { CubeUVRefractionMapping } from 'three';

export default function Header({play, onPlayStatusChange}) {

    const ref = useRef(null)

    const makePlayable = () => {
        ref.current.className = ref.current.className === "play" ? "" : "play"
    }

    const playVsPause = () => {
        return play === true ? "||" : ">"
    }

    const playChange = (e) => {
        e.target.classList.remove('rainbow-surf')
        onPlayStatusChange()
    }

    const about = () => {
        return (
            <div flex={1} alignSelf="flex-end">
                <p>👋 Welcome to scherz.</p>
                <p>Click 👇 to see/hear your generated chords.</p>
                <p>Pull the tension curves 👉 to get some new chords.</p>
                <p>Play on. 🤘</p>
            </div>
        )
    }
    
    return (
        <div >
            <div>s</div>
            <div>c</div>
            <div>h</div>
            <div>e</div>
            <div>r</div>
            <div ref={ref} className="" onMouseOver={makePlayable} onClick={playChange}>
                <div className="play hype rainbow-surf">
                    { playVsPause() }
                    <span className="tooltiptext" display="flex" flexDirection="row" alignItems="center">
                        { about() }
                    </span>
                </div>
            </div>
        </div>
        
    )
}