import React, { useState, useRef, useEffect } from 'react';
import Header from './Header.js'
import Left from './Left.js'
import Options from './Options.js'
import Spiral from './Spiral.js'
import './App.css';
import Tone from 'tone';
// import { main } from 'shadow-cljs/scherz.generate'
import { generate } from 'shadow-cljs/scherz.exports'
// import { keyword } from 'shadow-cljs/cljs.core'

const App = () => {
  const generateChords = (tensions, scales, tonic) => {
    return generate(tensions.slice(1), scales.map(s=>s), tonic)
  }

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
  // const [chords, setChords] = useState(generate(tensions.slice(1), scales.map(s=>keyword(s)), keyword(tonic)))
  const generated = generateChords(tensions, scales, tonic)
  const [chords, setChords] = useState(generated.progression)
  const [spiralRange, setSpiralRange] = useState(generated.spiral)
  const [numTimesteps, setNumTimesteps] = useState(chords.length)

  const synth = new Tone.PolySynth(4, Tone.Synth).toMaster()

  useEffect(() => {
    if (play === true) {
      // synth.releaseAll() 
      playChord(synth, chords[timestep])
      console.log(chords[timestep])

      setTimeout(() => {
        if (timestep < numTimesteps-1) {
          setTimestep(timestep+1)
        } else {
          setTimestep(0)
        }
      }, 1000)
    }
  }, [play, timestep]) 

  const hideOptions = (outer, inner) => {
    outer.classList.add("invisible")
    inner.classList.add("shift-off")

  }

  const showOptions = (outer, inner) => {
    outer.classList.remove("invisible")
    inner.classList.remove("shift-off")
  }

  const showSpiral = (allEls) => {
    // debugger
    Array.from(allEls.children).forEach(el => el.classList.remove("shift-off", "invisible"))
    // canvas.classList.remove("shift-off")
  }

  const hideSpiral = (allEls) => {
    Array.from(allEls.children).forEach(el => el.classList.add("shift-off", "invisible"))
    // canvas.classList.add("shift-off")
  }

  useEffect(() => {
    const outer = optionsRef.current
    const inner = Array.from(outer.children).find(n=> n.id === "options-div")
    const spiralCanvas = Array.from(spiralRef.current.children).find(n=> n.id === "spiral-viz")
    // const spiralCanvas = Array.from(spiralRef.current.children)//.find(n=> n.id === "spiral-viz").children[0]

    if (play === true) {
      hideOptions(outer, inner)
      showSpiral(spiralCanvas)
      
    } else {
      showOptions(outer, inner)
      hideSpiral(spiralCanvas)
    }
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

  const generateAndSet = (tensions, scales, tonic) => {
    const generated = generateChords(tensions, scales, tonic)
    setChords(generated.progression)
    setSpiralRange(generated.spiral)
  }

  const onCurveChange = (t) => {
    setTensions(t)
    setNumTimesteps(t.length)

    generateAndSet(t, scales, tonic)

    // const newChords = generate(t.slice(1), scales.map(s=>keyword(s)), keyword(tonic))
    // setChords(newChords)
  }

  const onScaleSelect = (scale) => {
    if (!scales.includes(scale)) {
      setScales([...scales, scale])
    }

    generateAndSet(tensions, scales, tonic)
    // const newChords = generate(tensions.slice(1), scales.map(s=>keyword(s)), keyword(tonic))
    // setChords(newChords)
  }

  const onScaleRemove = (scale) => {
    if (scales.length > 1 && scales.includes(scale)) {
      setScales(scales.filter(s => s !== scale))
    }

    generateAndSet(tensions, scales, tonic)
  }

  const onTonicChange = (tonic) => { 
    setTonic(tonic)
    generateAndSet(tensions, scales, tonic)
  }
 
  const onPlayStatusChange = () => {
    setPlay(!play)
    setTimestep(0)
  }

  return (
    <div className="App">
      
      <div className="header panel">
        
        <Header play={play} onPlayStatusChange={onPlayStatusChange}/>
      </div>
      <div className="left panel">
        <Left 
          // className="panel"
          play={play}
          numTimesteps={numTimesteps}
          chords={chords}
          tensions={tensions}
          onCurveChange={onCurveChange}
        />
      </div>
      <div ref={spiralRef} className="right panel">
        <Spiral chord={chords[timestep]} spiralRange={spiralRange}/>
      </div>
      <div ref={optionsRef} className="right options-right panel">
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