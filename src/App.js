import React, { useState } from 'react';
import Header from './Header.js'
import Left from './Left.js'
import Options from './Options.js'
import Spiral from './Spiral.js'
import './App.css';
import Tone from 'tone';
import { main } from 'shadow-cljs/scherz.generate'
// main(tensions, scales)
import { keyword } from 'shadow-cljs/cljs.core'

const App = () => {
  const jsonData = "{\"chords\":[{\"notes\":[60,64,67,72],\"pitches\":[\"C\",\"E\",\"G\",\"C\"],\"type\":\"CM\"},{\"notes\":[64,69,69,72],\"pitches\":[\"E\",\"A\",\"A\",\"C\"],\"type\":\"Am\"},{\"notes\":[64,66,69,71],\"pitches\":[\"E\",\"F#\",\"A\",\"B\"],\"type\":\"B7sus4\"},{\"notes\":[62,66,68,71],\"pitches\":[\"D\",\"F#\",\"G#\",\"B\"],\"type\":\"G#m7-5\"},{\"notes\":[61,66,66,69],\"pitches\":[\"C#\",\"F#\",\"F#\",\"A\"],\"type\":\"F#m\"}],\"tensions\":[{\"color\":0,\"dissonance\":0,\"gravity\":0},{\"color\":0.4,\"dissonance\":0.5,\"gravity\":0},{\"color\":0,\"dissonance\":0.8,\"gravity\":0},{\"color\":0,\"dissonance\":0,\"gravity\":0}]}"
  const { chords: ogChords, tensions: ogTensions }  = JSON.parse(jsonData)
  const [tensions, setTensions] = useState([ {color:0, dissonance:0, gravity:0}, ...ogTensions])
  const [chords, setChords] = useState(ogChords)
  const [timestep, setTimestep] = useState(0)
  const [numTimesteps, setNumTimesteps] = useState(chords.length)
  const [scales, setScales] = useState(['major'])
  const [tonic, setTonic] = useState("C")
  const [play, setPlay] = useState(false)
  // console.log(chords)

  const synth = new Tone.PolySynth(4, Tone.Synth).toMaster()

  const playChord = (synth, chord) => {
    // get pitch in correct format
    debugger
    const chordNotes = chord.pitches.map((note, i) => {
      const octave = Math.floor((chord.notes[i] - 60)/12.0) + 4
      console.log(octave)
      return note + octave.toString()
    })
    synth.triggerAttackRelease(chordNotes, "4n");
  } 

  const onCurveChange = (t) => {
    console.log(t)
    setTensions(t)
    setNumTimesteps(t.length)

    

    const newChords = main(t.slice(1), scales.map(s=>keyword(s)), keyword(tonic))
    console.log(newChords)
    setChords(newChords)
  }

  const onScaleSelect = (scale) => {
    if (!scales.includes(scale)) {
      setScales([...scales, scale])
    }
    const newChords = main(tensions.slice(1), scales.map(s=>keyword(s)), keyword(tonic))
    setChords(newChords)
  }

  const onScaleRemove = (scale) => {
    if (scales.length > 1 && scales.includes(scale)) {
      setScales(scales.filter(s => s !== scale))
    }
    const newChords = main(tensions.slice(1), scales.map(s=>keyword(s)), keyword(tonic))
    setChords(newChords)
  }

  const onTonicChange = (tonic) => { 
    setTonic(tonic)
    const newChords = main(tensions.slice(1), scales.map(s=>keyword(s)), keyword(tonic))
    setChords(newChords)
  }

  const onPlayStatusChange = () => {
    setPlay(!play)
    if(play===true) {
      playChord(synth, chords[timestep])
    }
  }


  return (
    <div className="App">
      <div className="header panel">
        <Header play={play} onPlayStatusChange={onPlayStatusChange}/>
      </div>
      <div className="left panel">
        <Left 
          className="panel"
          timestep={1}
          numTimesteps={numTimesteps}
          chords={chords}
          tensions={tensions}
          onCurveChange={onCurveChange}
        />
      </div>
      <div className="right panel">
        
        {/* <Options
          selectedScales={scales}
          tonic={tonic}
          onScaleSelect={onScaleSelect}
          onScaleRemove={onScaleRemove}
          onTonicChange={onTonicChange}
        /> */}
        {/* <Spiral chord={chords[timestep]}/> */}
      </div>
    </div>
  );
}

export default App;