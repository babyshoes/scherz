import React from 'react';
import './App.css';

export default function Header({ play, onPressPlay, onPressPause }) {

  const about = () => 
    <div className="tooltiptext">
      <span role="img" aria-label="wave"> 👋 </span>
      <div> Welcome to scherz!</div>
      <span role="img" aria-label="point-right"> 👉 </span>
      <div> Pull the force curves to get some new chords. </div>
      <span role="img" aria-label="point-down"> 👇 </span>
      <div> Click to see/hear your generated chords. </div>
      <span role="img" aria-label="rock-on"> 🤘 </span>
      <div> Play on. </div>
    </div>
  
  return (
    <div className="header">
      <div className="scherz">
        <div>s</div>
        <div>c</div>
        <div>h</div>
        <div>e</div>
        <div>r</div>
        <div>z</div>
        <div onClick={play ? onPressPause : onPressPlay}>
          <div className={`play ${!play && 'rainbow-surf'}`}>
            { play ? '||' : '>' }
          </div>
        </div>
      </div>
      { about() }
    </div>
  )
}