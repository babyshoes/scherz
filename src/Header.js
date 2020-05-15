import React, { useState } from 'react';


const about = (
  <div className="tooltiptext transition-opacity">
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
)

export default function Header({ isPlaying, onPressPlay, onPressPause }) {

  const [showPlayModes, setShowPlayModes] = useState(false);
  
  return (
    <div className="header">
      <div className="scherz">
        <div>s</div>
        <div>c</div>
        <div>h</div>
        <div>e</div>
        <div>r</div>
        <div>z</div>
        <div
          onPointerEnter={() => setShowPlayModes(true)}
          onPointerLeave={() => setShowPlayModes(false)}
          onClick={isPlaying ? onPressPause : onPressPlay}
        >
          <div className={`play ${!isPlaying && 'rainbow-surf'}`}>
            { isPlaying ? '||' : '>' }
          </div>
        </div>
      </div>
      <div
        onPointerEnter={() => setShowPlayModes(true)}
        onPointerLeave={() => setShowPlayModes(false)}
        className={`play-modes transition-opacity ${!showPlayModes && 'hidden'}`}
      >
        {/* <span
          className={`loop ${playMode === PlayMode.LOOP && 'selected'}`}
          onClick={() => playMode !== PlayMode.LOOP && setPlayMode(PlayMode.LOOP)}
        >
          &#10227;
        </span>
        <span
          className={`infinite ${playMode === PlayMode.INFINITE && 'selected'}`}
          onClick={() => playMode !== PlayMode.INFINITE && setPlayMode(PlayMode.INFINITE)}
        >
          &#8734;
        </span> */}
      </div>
      { about }
    </div>
  )
}