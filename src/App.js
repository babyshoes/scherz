import React from 'react';
import _ from 'lodash';
import { set } from 'lodash/fp';
import scherzClient from './util/scherz-client.js';
import Header from './Header.js';
import Curve from './curve/Curve.js';
import Staff from './staff/Staff.js';
import Options from './components/Options.js';
import SpiralCanvas from './spiral/SpiralCanvas.js';
import './App.css';


const initialForces = [{"color":0,"dissonance":0.1,"gravity":0}, {"color":0,"dissonance":0.2,"gravity":0}, {"color":0.4,"dissonance":0.4,"gravity":0.25}, {"color":0.2,"dissonance":0.8,"gravity":0}, {"color":0,"dissonance":0.5,"gravity":0.25}];
const emptyForce = { color: 0, dissonance: 0, gravity: 0 };
const colors = ['#3da4ab', '#f6cd61', '#fe8a71'];

class App extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      scales: ['major'],
      tonic: 'C',
      chordGroups: [],
      forces: initialForces,
      beat: 0,
      play: false,
    };
  }

  generateChords = (generateFrom) => {
    const { scales, tonic, forces } = this.state;
    if (generateFrom === 0) {
      return scherzClient.initialChords(scales, tonic, forces[0].dissonance)
    }
    const prevChord = this.selectedChords[generateFrom-1];
    const force = forces[generateFrom];
    return scherzClient.generateChords(scales, prevChord, force);
  };

  generate = async (generateFrom) => {
    const { forces, chordGroups, beat } = this.state;
    const generatedChords = await this.generateChords(generateFrom);
    const newChordGroup = { chords: generatedChords, chordIndex: 0 };
    const selectedChordHasChanged = !_.isEqual(generatedChords[0], this.selectedChords[generateFrom]);
    const isNotLastChord = generateFrom < forces.length - 1;
    this.setState(
      { chordGroups: set(generateFrom, newChordGroup, chordGroups) },
      () => {
        generateFrom === beat && this.playSelectedChord();
        selectedChordHasChanged && isNotLastChord && this.generate(generateFrom+1);
      }
    )
  };

  initialize = () => this.generate(0);

  get selectedChords() {
    return this.state.chordGroups.map(
      ({ chords, chordIndex }) => chords[chordIndex]
    );
  }

  get selectedChord() {
    return this.selectedChords[this.state.beat];
  }

  componentDidMount() {
    this.initialize();
    this.audioCtx = new AudioContext();
  }

  onNodeMove = (index, key, value) => this.setState(
    { forces: set([index, key], value, this.state.forces) }
  );

  onNodeRelease = (index) => this.setState(
    { beat: index },
    () => this.generate(index)
  );

  onAddForce = () => {
    const { forces } = this.state;
    this.setState(
      { forces: [ ...forces, emptyForce ], beat: forces.length },
      () => this.generate(forces.length),
    )
  }

  onRemoveForce = () => this.setState({
    forces: _.dropRight(this.state.forces, 1),
    chordGroups: _.dropRight(this.state.chordGroups, 1),
  })

  onScaleSelect = (scale) => this.setState(
    { scales: [ ...this.state.scales, scale ] },
    this.initialize,
  );
  onScaleRemove = (scale) => this.setState(
    ({ scales }) => ({ scales: scales.filter(s => s!== scale) }),
    this.initialize,
  );

  onTonicChange = (tonic) => this.setState({ tonic }, this.initialize);

  onArrowClick = groupIndex => chordIndex => () => {
    const { chordGroups, forces } = this.state;
    const newChordGroups = set([groupIndex, 'chordIndex'], chordIndex, chordGroups)
    this.setState(
      { chordGroups: newChordGroups, beat: groupIndex },
      () => {
        this.playSelectedChord();
        (groupIndex < forces.length - 1) && this.generate(groupIndex+1);
      }
    )
  };

  onAreaClick = (index) => () => this.setState(
    { beat: index },
    this.playSelectedChord,
  )

  midiToHz = (midi) => Math.pow(2, (midi-69)/12) * 440;

  playSelectedChord = () =>
    this.selectedChord.notes.forEach(note => {
      const hz = this.midiToHz(note);

      const gainNode = this.audioCtx.createGain();
      gainNode.gain.value = 0.15;

      const oscillator = this.audioCtx.createOscillator();
      oscillator.frequency.setValueAtTime(hz, this.audioCtx.currentTime)

      oscillator.connect(gainNode);
      gainNode.connect(this.audioCtx.destination);

      oscillator.start();
      oscillator.stop(this.audioCtx.currentTime + 0.75);
    });

  playOn = () => {
    const { beat, forces, play } = this.state;
    this.playSelectedChord();
    setTimeout(() => {
      this.setState(
        { beat: beat < forces.length-1 ? beat+1 : 0 },
        () => play && this.playOn(),
      )
    }, 1000);
  }

  onPressPlay = () => this.setState({ play: true }, this.playOn);
  onPressPause = () => this.setState({ play: false });

  render() {
    const { forces, chordGroups, play, beat } = this.state;
    return (
      <div className="App">
        <Header
          play={play}
          onPressPlay={this.onPressPlay}
          onPressPause={this.onPressPause}
        />
        <Curve
          play={play}
          forces={forces}
          onNodeMove={this.onNodeMove}
          onNodeRelease={this.onNodeRelease}
          onAddForce={this.onAddForce}
          onRemoveForce={this.onRemoveForce}
        />
        <Staff
          play={play}
          beat={beat}
          colors={colors}
          chordGroups={chordGroups}
          forceCount={forces.length}
          onArrowClick={this.onArrowClick}
          onAreaClick={this.onAreaClick}
        />
          { this.selectedChord &&
            <SpiralCanvas
              play={play}
              chord={this.selectedChord}
              color={colors[beat % colors.length]}
            />
          }
      </div>
    )
  }

}

export default App;