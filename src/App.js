import React, { useState, useRef, useEffect } from 'react';
import Header from './Header.js'
import Left from './Left.js'
import Options from './Options.js'
import Spiral from './Spiral.js'
import './App.css';
import Tone from 'tone';
import { main } from 'shadow-cljs/scherz.generate'
// import { generate } from 'shadow-cljs/scherz.exports'
import { keyword } from 'shadow-cljs/cljs.core'

const App = () => {
  const spiralRef = useRef(null)
  const optionsRef = useRef(null)
  const jsonData = "{\"chords\":[{\"notes\":[60,64,67,72],\"pitches\":[\"C\",\"E\",\"G\",\"C\"],\"type\":\"CM\"},{\"notes\":[64,69,69,72],\"pitches\":[\"E\",\"A\",\"A\",\"C\"],\"type\":\"Am\"},{\"notes\":[64,66,69,71],\"pitches\":[\"E\",\"F#\",\"A\",\"B\"],\"type\":\"B7sus4\"},{\"notes\":[62,66,68,71],\"pitches\":[\"D\",\"F#\",\"G#\",\"B\"],\"type\":\"G#m7-5\"},{\"notes\":[61,66,66,69],\"pitches\":[\"C#\",\"F#\",\"F#\",\"A\"],\"type\":\"F#m\"}],\"tensions\":[{\"color\":0,\"dissonance\":0,\"gravity\":0},{\"color\":0.4,\"dissonance\":0.5,\"gravity\":0},{\"color\":0,\"dissonance\":0.8,\"gravity\":0},{\"color\":0,\"dissonance\":0,\"gravity\":0}]}"
  const { chords: ogChords, tensions: ogTensions }  = JSON.parse(jsonData)
  const [tensions, setTensions] = useState([ {color:0, dissonance:0, gravity:0}, ...ogTensions])
  // const [chords, setChords] = useState(ogChords)
  const [timestep, setTimestep] = useState(0)
  // const timeRef = useRef(timestep)
  // timeRef.current = timestep
  const [scales, setScales] = useState(['major'])
  const [tonic, setTonic] = useState("C")
  const [play, setPlay] = useState(false)
  const [chords, setChords] = useState(main(tensions.slice(1), scales.map(s=>keyword(s)), keyword(tonic)))
  const [numTimesteps, setNumTimesteps] = useState(chords.length)

  const synth = new Tone.PolySynth(4, Tone.Synth).toMaster()

  useEffect(() => {
    if (play === true) {
      // synth.releaseAll() 
      playChord(synth, chords[timestep])

      setTimeout(() => {
        if (timestep < numTimesteps-1) {
          setTimestep(timestep+1)
        } else {
          setTimestep(0)
        }
      }, 1000)
    }
  }, [play, timestep]) 

  const swapActivePanel= (visible, hidden) => {
    visible.current.classList.add('hidden')
    hidden.current.classList.remove('hidden')
  }

  // const activateEditing = () => {

  // }

  useEffect(() => {
    // debugger
    if (play === true) {
      swapActivePanel(optionsRef, spiralRef)
    } else {
      swapActivePanel(spiralRef, optionsRef)
      
    }
    // if (optionsRef.current && spiralRef.current) {
    //   swapOptionsSpiral(optionsRef, spiralRef)
    // }
  }, [play])



  const playChord = (synth, chord) => {
    // synth.triggerRelease()
    // synth.releaseAll()
    // get pitch in correct format
    const chordNotes = chord.pitches.map((note, i) => {
      const octave = Math.floor((chord.notes[i] - 60)/12.0) + 4
      return note + octave.toString()
    })
    synth.triggerAttackRelease(chordNotes, '8n')
    // synth.triggerAttack(chordNotes)
    // synth.releaseAll()
  } 

  const onCurveChange = (t) => {
    setTensions(t)
    setNumTimesteps(t.length)

    const newChords = main(t.slice(1), scales.map(s=>keyword(s)), keyword(tonic))
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

  const swapOptionsSpiral = (ref) => {
    debugger
    const children = Array.from(ref.current.children)
    const hidden = children.find(n=> n.classList.value.includes("hidden"))
    const visible = children.find(n=> !n.classList.value.includes("hidden"))

    hidden.classList.remove("hidden")
    visible.classList.add("hidden")
  }
 
  const onPlayStatusChange = () => {
    setPlay(!play)
    setTimestep(0)
    // swapOptionsSpiral()
  }

  return (
    <div className="App">
      <div className="header panel">
        <Header play={play} onPlayStatusChange={onPlayStatusChange}/>
      </div>
      <div className="left panel">
        <Left 
          className="panel"
          play={play}
          numTimesteps={numTimesteps}
          chords={chords}
          tensions={tensions}
          onCurveChange={onCurveChange}
        />
      </div>
      <div ref={spiralRef} className="panel hidden">
        <Spiral chord={chords[timestep]}/>
      </div>
      <div ref={optionsRef} className="right panel">
        <Options
            selectedScales={scales}
            tonic={tonic}
            onScaleSelect={onScaleSelect}
            onScaleRemove={onScaleRemove}
            onTonicChange={onTonicChange}
          />  
      </div>
      

      {/* <div className="right panel" ref={rightRef}>
        
        <Options
          selectedScales={scales}
          tonic={tonic}
          onScaleSelect={onScaleSelect}
          onScaleRemove={onScaleRemove}
          onTonicChange={onTonicChange}
        />
       <Spiral chord={chords[timestep]}/>
      </div> */}
    </div>
  );
}

export default App;