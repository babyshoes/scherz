import React from 'react';


export default function Header({ isPlaying, onPressPlay, onPressPause }) {

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
      <div className="love">
        made with &#10084; at the&nbsp;
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.recurse.com"
        >
          recurse center
        </a>
      </div>
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
        <div onClick={isPlaying ? onPressPause : onPressPlay}>
          <div className={`play ${!isPlaying && 'rainbow-surf'}`}>
            { isPlaying ? '||' : '>' }
          </div>
        </div>
      </div>
      { about() }
    </div>
  )
}