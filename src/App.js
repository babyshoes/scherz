import React, { useState } from 'react';
import Left from './Left.js'
import './App.css';

const App = () => {
  const jsonData = "{\"chords\":[{\"notes\":[60,64,67,72],\"pitches\":[\"C\",\"E\",\"G\",\"C\"],\"type\":\"CM\"},{\"notes\":[64,69,69,72],\"pitches\":[\"E\",\"A\",\"A\",\"C\"],\"type\":\"Am\"},{\"notes\":[64,66,69,71],\"pitches\":[\"E\",\"F#\",\"A\",\"B\"],\"type\":\"B7sus4\"},{\"notes\":[62,66,68,71],\"pitches\":[\"D\",\"F#\",\"G#\",\"B\"],\"type\":\"G#m7-5\"},{\"notes\":[61,66,66,69],\"pitches\":[\"C#\",\"F#\",\"F#\",\"A\"],\"type\":\"F#m\"}],\"tensions\":[{\"color\":0,\"dissonance\":0,\"gravity\":0},{\"color\":0.4,\"dissonance\":0.5,\"gravity\":0},{\"color\":0,\"dissonance\":0.8,\"gravity\":0},{\"color\":0,\"dissonance\":0,\"gravity\":0}]}"
  const { chords, tensions: ogTensions }  = JSON.parse(jsonData)
  const [tensions, setTensions] = useState([ {color:0, dissonance:0, gravity:0}, ...ogTensions])

  const onCurveChange = (t) => {
    setTensions(t)
  }

  const numTimesteps = chords.length

  return (
    <div className="App">
      <Left 
        timestep={1}
        numTimesteps={numTimesteps}
        chords={chords}
        tensions={tensions}
        onCurveChange={onCurveChange}
      />
    </div>
  );
}

export default App;