import React from 'react';
// import Tension from './TensionCurve.js';
// import Timeline from './Timeline.js';
import Staff from './Staff.js';
import './App.css';

const App = () => {
  
  const jsonData = "{\"chords\":[{\"notes\":[60,64,67,72],\"pitches\":[\"C\",\"E\",\"G\",\"C\"],\"type\":\"CM\"},{\"notes\":[64,69,69,72],\"pitches\":[\"E\",\"A\",\"A\",\"C\"],\"type\":\"Am\"},{\"notes\":[64,66,69,71],\"pitches\":[\"E\",\"F#\",\"A\",\"B\"],\"type\":\"B7sus4\"},{\"notes\":[62,66,68,71],\"pitches\":[\"D\",\"F#\",\"G#\",\"B\"],\"type\":\"G#m7-5\"},{\"notes\":[61,66,66,69],\"pitches\":[\"C#\",\"F#\",\"F#\",\"A\"],\"type\":\"F#m\"}],\"tensions\":{\"color\":[0,0.4,0,0],\"dissonance\":[0,0.5,0.8,0],\"gravity\":[0,0,0,0]}}"
  const { chords, tensions }  = JSON.parse(jsonData)

  // const data = [{"notes":[60,64,67,71],"pitches":["C","E","G","B"]},
  // {"notes":[62,65,67,71],"pitches":["G","B","D","F"]},
  // {"notes":[62,66,69,72],"pitches":["D","F#","A","C"]},
  // {"notes":[64,65,69,72],"pitches":["F","A","C","E"]},
  // {"notes":[62,64,67,71],"pitches":["E","G","B","D"]},
  // {"notes":[60,64,67,71],"pitches":["C","E","G","B"]},
  // {"notes":[61,63,67,70],"pitches":["Eb","G","Bb","Db"]},{"notes":[60,63,65,68],"pitches":["F","Ab","C","Eb"]},{"notes":[60,62,65,69],"pitches":["D","F","A","C"]},{"notes":[58,62,65,69],"pitches":["Bb","D","F","A"]},{"notes":[59,61,65,68],"pitches":["Db","F","Ab","Cb"]},{"notes":[58,61,63,66],"pitches":["Eb","Gb","Bb","Db"]},{"notes":[58,60,63,67],"pitches":["C","Eb","G","Bb"]},{"notes":[56,60,63,67],"pitches":["Ab","C","Eb","G"]},{"notes":[57,59,63,66],"pitches":["Cb","Eb","Gb","Bbb"]},{"notes":[56,59,61,64],"pitches":["Db","Fb","Ab","Cb"]}]

  return (
    <div className="App">
      <Staff timestep={1} numTimesteps={chords.length} chords={chords} ></Staff>
      HELLO
    </div>
  );
}

export default App;