import React, { Component } from 'react';
import Header from './Header.js'
import Left from './Left.js'
import Options from './Options.js'
import Spiral from './Spiral.js'
import './App.css';
import Tone from 'tone';
import { generate } from 'scherz'
import chordWorker from "./chord.worker.js"


const jsonData = "{\"chords\":[{\"notes\":[60,64,67,72],\"pitches\":[\"C\",\"E\",\"G\",\"C\"],\"type\":\"CM\"},{\"notes\":[64,69,69,72],\"pitches\":[\"E\",\"A\",\"A\",\"C\"],\"type\":\"Am\"},{\"notes\":[64,66,69,71],\"pitches\":[\"E\",\"F#\",\"A\",\"B\"],\"type\":\"B7sus4\"},{\"notes\":[62,66,68,71],\"pitches\":[\"D\",\"F#\",\"G#\",\"B\"],\"type\":\"G#m7-5\"},{\"notes\":[61,66,66,69],\"pitches\":[\"C#\",\"F#\",\"F#\",\"A\"],\"type\":\"F#m\"}],\"tensions\":[{\"color\":0,\"dissonance\":0,\"gravity\":0},{\"color\":0.4,\"dissonance\":0.5,\"gravity\":0},{\"color\":0,\"dissonance\":0.8,\"gravity\":0},{\"color\":0,\"dissonance\":0,\"gravity\":0}]}"
const { chords: ogChords, tensions: ogTensions }  = JSON.parse(jsonData)

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

class App extends Component {

  constructor(props) {
    super(props)
    const tensions = [ {color:0, dissonance:0, gravity:0}, ...ogTensions]
    const scales = ['major']
    const timestep = 0
    const tonic = 'C'
    const play = false
    const chords = this.getInitialChords(scales, tonic, generate.possibleTypes(scales)[0], tensions)
    // const spiralRange
    this.state = {
      chords, tensions, scales, tonic, timestep, play
    }
}

  getInitialChords(scales, root, type, tensions) {
    const first = generate.initialChord(scales, root, type)
    const chords = tensions.slice(1).reduce((acc, tension) => {
      const prevTimestep = acc.length - 1
      return [...acc, generate.nextChord(scales, acc[prevTimestep], tension)]
    }, [first])

    return chords
  }

  componentDidMount(){
    // this.chordWorker = new WebWorker(worker)
    this.chordWorker = new chordWorker()
    this.synth = new Tone.PolySynth(4, Tone.Synth).toMaster()
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.state.play) {
        const {chords, timestep} = this.state
        this.playChord(chords[timestep])

        setTimeout(() => {
            if (timestep < this.state.tensions.length-1) {
              this.setState({timestep: timestep+1})
            } else {
              this.setState({timestep: 0})
            }
          }, 1000)
    }
  }

  playChord = (chord) => {
    const chordNotes = chord.pitches.map((note, i) => {
      const octave = Math.floor((chord.notes[i] - 60)/12.0) + 4
      return note + octave.toString()
    })
    this.synth.triggerAttackRelease(chordNotes, '8n')
  } 

  changeElementAtIndex = (array, newElement, index) => {
    return [...array.slice(0, index), newElement, ...array.slice(index+1)]
  }

  setNewChord = (newChord, timestep) => {
    console.log(timestep)
    const prevChords = this.state.chords
    const newChords = this.changeElementAtIndex(prevChords, newChord, timestep)
    this.setState({chords: newChords})  
  }
  
  generateAndSet = (prevChord, tension, scales, timestepIndex) => {
      this.chordWorker.postMessage({prevChord, tension, scales, timestepIndex})
      this.chordWorker.onmessage = (evt) => {
          this.setNewChord(...evt.data)
      }  
      
  }

  generateProgressionFrom = (timestep0) => {
    const {tensions, chords, scales} = this.state
    asyncForEach(tensions, async (tension, timestep) => {
      if (timestep >= timestep0) {
        this.generateAndSet(chords[timestep-1], tensions[timestep], scales, timestep)
      }
    })
  }

  onCurveChange = (newTension, timestep) => {
      const {tensions, chords, scales} = this.state
      const newTensions = this.changeElementAtIndex(tensions, newTension, timestep)
      this.setState({tensions: newTensions})
  
    // how to get and terminate prev worker?
      // this.generateAndSet(chords[timestep - 1], newTension, scales, timestep)
    this.generateProgressionFrom(timestep)
  }
  

  onScaleSelect = (scale) => {
    if (!this.state.scales.includes(scale)) {
        this.setState({scales: [...this.state.scales, scale]})
    }

    // this.generateAndSet(this.tensions, this.scales, this.tonic)
  }

  onScaleRemove = (scale) => {
    if (this.state.scales.length > 1 && this.state.scales.includes(scale)) {
        this.setState({scales: this.state.scales.filter(s => s !== scale)})
    }

    // this.generateAndSet(this.tensions, this.scales, this.tonic)
  }

  onTonicChange = (tonic) => { 
      this.setState({tonic})
    // this.generateAndSet(this.tensions, this.scales, this.tonic)
  }
 
  onPlayStatusChange = () => {
      this.setState({
          play: !this.state.play, 
          timestep: 0
        })
  }

  render() {
    const {chords, scales, tensions, tonic, play} = this.state
    console.log("render")
    return (
        <div className="App">
            <div className="header panel">
                <Header play={play} onPlayStatusChange={this.onPlayStatusChange}/>
            </div>
            <div className="left panel">
                <Left 
                play={play}
                numTimesteps={chords.length}
                chords={chords}
                tensions={tensions}
                onCurveChange={this.onCurveChange}
                />
            </div>
            {/* <div ref={spiralRef} className="right panel">
                <Spiral chord={chords[timestep]} spiralRange={spiralRange}/>
            </div> */}
            <div className="right options-right panel">
                <Options
                    selectedScales={scales}
                    tonic={tonic}
                    onScaleSelect={this.onScaleSelect}
                    onScaleRemove={this.onScaleRemove}
                    onTonicChange={this.onTonicChange}
                />  
            </div>
        </div>
    )
  }
}

export default App;