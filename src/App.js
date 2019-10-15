import React, { Component } from 'react';
import Header from './Header.js'
import Left from './Left.js'
import Options from './Options.js'
import Spiral from './Spiral.js'
import './App.css';
import Tone from 'tone';
import { generate, brightness } from 'scherz'
import chordWorker from "./chord.worker.js"
import typesWorker from "./types.worker.js"
import spiralWorker from "./spiral.worker.js" 
import _ from 'lodash'

// TBR: random init
const jsonData = "{\"chords\":[{\"notes\":[60,64,67,72],\"pitches\":[\"C\",\"E\",\"G\",\"C\"],\"type\":\"CM\"},{\"notes\":[64,69,69,72],\"pitches\":[\"E\",\"A\",\"A\",\"C\"],\"type\":\"Am\"},{\"notes\":[64,66,69,71],\"pitches\":[\"E\",\"F#\",\"A\",\"B\"],\"type\":\"B7sus4\"},{\"notes\":[62,66,68,71],\"pitches\":[\"D\",\"F#\",\"G#\",\"B\"],\"type\":\"G#m7-5\"},{\"notes\":[61,66,66,69],\"pitches\":[\"C#\",\"F#\",\"F#\",\"A\"],\"type\":\"F#m\"}],\"tensions\":[{\"color\":0,\"dissonance\":0,\"gravity\":0},{\"color\":0.4,\"dissonance\":0.5,\"gravity\":0},{\"color\":0,\"dissonance\":0.8,\"gravity\":0},{\"color\":0,\"dissonance\":0,\"gravity\":0}]}"
const { chords: ogChords, tensions: ogTensions }  = JSON.parse(jsonData)
const colorChoices = ['#3da4ab', '#f6cd61', '#fe8a71']

class App extends Component {

  constructor(props) {
    super(props)
    const timestep = 0
    // TBR: bundle play, timestep into dict
    const play = false
    const tensions = [ {color:0, dissonance:0, gravity:0}, ...ogTensions]
    const scales = ['major']
    const tonic = 'C'
    const tonicError = null
    const types = generate.possibleTypes(scales)
    const tonicType = types[0]
    // TBR: init as null and have worker take care of it
    const chords = this.getInitialChords(scales, tonic, tonicType, tensions)
    // TBR: does spiralRange need to be in state?
    const spiralRange = this.getSpiralRange(chords)

    this.state = {
      chords, tensions, scales, types, tonic, tonicError, tonicType, timestep, play, spiralRange
    }
  }

  getSpiralRange(chordList) {
    const chordsByBrightness = _.orderBy(chordList, [function(chord) {return brightness.scaleBrightness(chord.tonic, chord.scale)}])
    const darkest = _.first(chordsByBrightness),
          brightest = _.last(chordsByBrightness)

    const darkestFifths = brightness.circleOfFifths(darkest.tonic, darkest.scale),
          brightestFifths = brightness.circleOfFifths(brightest.tonic, brightest.scale)
    
    let circleOfFifths = brightness.fifthsBetween(_.first(darkestFifths), _.last(brightestFifths))
    while (circleOfFifths.length < 36) {
      if (circleOfFifths.length % 2) {
        circleOfFifths = [...circleOfFifths, brightness.fifthsAbove(1, _.last(circleOfFifths))]
        // circleOfFifths.push(brightness.fifthsAbove(1, _.last(circleOfFifths)))
      } else {
        circleOfFifths = [brightness.fifthsAbove(-1, _.first(circleOfFifths)), ...circleOfFifths]
      }
    }
    return circleOfFifths
  }

  getInitialChords(scales, root, type, tensions) {
    const first = generate.initialChord(scales, root, type)
    const chords = tensions.slice(1).reduce((acc, tension) => {
      const prevTimestep = acc.length - 1
      return [...acc, generate.nextChord(scales, acc[prevTimestep], tension)]
    }, [first])

    return chords
  }

  setUpChordWorker(){
    this.chordWorker = new chordWorker()
    this.chordWorker.onmessage = (evt) => {
      const [newChord, timestep] = evt.data
      const {tensions} = this.state

      this.setNewChord(newChord, timestep)
      if (timestep < tensions.length - 1) { 
        this.generateAndSet(timestep+1)
      }
    }     
  }

  // TBR: benchmark types calculations. ncessary in worker??
  setUpTypesWorker(){
    this.typesWorker = new typesWorker()
    this.typesWorker.onmessage = (evt) => {
      const possibleTypes = evt.data
      if(!possibleTypes.includes(this.state.tonicType)) {
        this.setState(() => ({
          // ?? possibleTypes list not always in same order
          tonicType: possibleTypes[0], 
          types: possibleTypes
          }), () => {this.generateAndSet(0)}
        )
      } else {
        this.setState(() => ({types: possibleTypes}))
      }
    }  
  }

  setUpSpiralWorker(){
    this.spiralWorker = new spiralWorker()
    this.spiralWorker.onmessage = (evt) => {
      const range = evt.data
      console.log(range)
      this.setState(({spiralRange: prevRange}) => {
        if (_.first(prevRange) !== _.first(range) && _.last(prevRange) !== _.last(range)) {
          return {spiralRange: range}
        }
      })
    }
  }

  componentDidMount(){
    this.setUpChordWorker()
    this.setUpTypesWorker()
    this.setUpSpiralWorker()

    this.synth = new Tone.PolySynth(4, Tone.Synth).toMaster()
  }


  componentDidUpdate(prevProps, prevState) {
    if ((prevState.tonic !== this.state.tonic || prevState.tonicType !== this.state.tonicType)) {
      this.generateAndSet(0)
    }

    if (this.state.play) {
        const {chords, timestep} = this.state
        this.playChord(chords[timestep])

        setTimeout(() => {
            if (timestep < this.state.tensions.length-1) {
              this.setState(() => ({timestep: timestep+1}))
            } else {
              this.setState(() => ({timestep: 0}))
            }
          }, 1000)
    } 
  }

  playChord = (chord) => {
    const chordNotes = chord.notes.map(note => Tone.Midi(note))
    this.synth.triggerAttackRelease(chordNotes, '8n')
  } 

  changeElementAtIndex = (array, newElement, index) => {
    return [...array.slice(0, index), newElement, ...array.slice(index+1)]
  }

  setNewChord = (newChord, timestep) => {
    const prevChords = this.state.chords
    const newChords = this.changeElementAtIndex(prevChords, newChord, timestep)
    this.spiralWorker.postMessage(newChords)
    this.setState(() => ({chords: newChords}))  
  }
  
  generateAndSet = (timestepIndex) => {
    const {chords, scales, tensions, tonic, tonicError, tonicType, types} = this.state
    const prevChord = chords[timestepIndex - 1],
          tension = tensions[timestepIndex]

    if(!tonicError) {
      this.chordWorker.postMessage({prevChord, tension, timestepIndex, tonic, tonicType, types, scales})   
    }
  }

  onCurveChange = (newTension, timestep) => {
      const {tensions, chords, scales, tonic, tonicType} = this.state
      const newTensions = this.changeElementAtIndex(tensions, newTension, timestep)
      this.setState(() => ({tensions: newTensions}))  
      this.generateAndSet(timestep)
  }
  
  onScaleSelect = (scale) => {
    if (!this.state.scales.includes(scale)) {
        this.setState(({scales: prevScales}) => {
          return {scales: [...prevScales, scale]}
        }, () => {
          this.typesWorker.postMessage(this.state.scales)
        })  
    }
  }

  onScaleRemove = (scale) => {
    if (this.state.scales.length > 1 && this.state.scales.includes(scale)) {
        this.setState(({scales: prevScales}) => {
          return {scales: prevScales.filter(s => s !== scale)}
        }, () => {
          this.typesWorker.postMessage(this.state.scales)
        })
    }
  }

  onTonicChange = (newTonic) => { 
      const format = tonic => tonic ? tonic[0].toUpperCase() + tonic.slice(1) : ""
      let error = null

      if (newTonic.length == 0) {
        error = "input a tonic"
      } else {
        const baseNote = newTonic[0].toLowerCase()
        const accidental = new Set(newTonic.slice(1))
        const invalidAccidental = [...accidental].filter(char => !new Set(["b", "#"]).has(char))

        let errors = []
        if (!"cdefgab".includes(baseNote)) { errors.push("tonic") }
        if (accidental.size > 1 || invalidAccidental.length > 0) { errors.push("accidental") }
        if (errors.length > 0) { error = "not valid " + errors.join(" or ") }
      }

      this.setState(() => {
        return {
          tonic: format(newTonic),
          tonicError: error
        }
      })
  }

  onTypeChange = (newType) => {
    this.setState( ({types: possibleTypes}) => {
      if (possibleTypes.includes(newType)) {
        return {tonicType: newType}
      }}
    )
  }
 
  onPlayStatusChange = () => {
      this.setState( ({play: prevPlay}) => {
        return {
            play: !prevPlay,
            timestep: 0
        }
      })
  }

  render() {
    const {chords, scales, types, tensions, tonic, tonicError, play, timestep, spiralRange} = this.state
    const color = colorChoices[timestep % colorChoices.length]
    return (
        <div className="App">
            <div className="header panel">
                <Header 
                  play={play} 
                  onPlayStatusChange={this.onPlayStatusChange}
                />
            </div>
            <div className="left panel">
                <Left 
                  play={play}
                  timestep={timestep}
                  color={color}
                  chords={chords}
                  tensions={tensions}
                  onCurveChange={this.onCurveChange}
                />
            </div>
            <div className="right panel">
                <Spiral 
                  chord={chords[timestep]} 
                  spiralRange={spiralRange} 
                  play={play} 
                  color={color}
                />
            </div>
            <div className="right options-right panel">
                <Options
                  selectedScales={scales}
                  tonic={tonic}
                  tonicError={tonicError}
                  possibleTypes={types}
                  onScaleSelect={this.onScaleSelect}
                  onScaleRemove={this.onScaleRemove}
                  onTonicChange={this.onTonicChange}
                  onTypeChange={this.onTypeChange}
                  play={play}
                />  
            </div>
        </div>
    )
  }
}

export default App;