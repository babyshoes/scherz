import React from 'react';
import _ from 'lodash';
import { set } from 'lodash/fp';
import { scaleIntervals } from 'scherz.util';
import scherzClient from './util/scherz-client.js';
import Header from './Header.js';
import Curve from './curve/Curve.js';
import Staff from './staff/Staff.js';
import ScaleSelect from './ScaleSelect.js';
import SpiralCanvas from './spiral/SpiralCanvas.js';


const initialForces = [{"color":0,"dissonance":0.1,"gravity":0}, {"color":0,"dissonance":0.2,"gravity":0}, {"color":0.4,"dissonance":0.4,"gravity":0.25}, {"color":0.2,"dissonance":0.8,"gravity":0}, {"color":0,"dissonance":0.5,"gravity":0.25}];
const emptyForce = { color: 0, dissonance: 0, gravity: 0 };
const colors = ['#3da4ab', '#f6cd61', '#fe8a71'];

class App extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      scales: ['diatonic'],
      tonic: 'C',
      chordGroups: [],
      forces: initialForces,
      beat: 0,
      isPlaying: false,
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

  generate = async (generateFrom, setBeat=false) => {
    const { forces, chordGroups } = this.state;
    const generatedChords = await this.generateChords(generateFrom);
    const newChordGroup = { chords: generatedChords, chordIndex: 0 };
    const selectedChordHasChanged = !_.isEqual(generatedChords[0], this.selectedChords[generateFrom]);
    const isNotLastChord = generateFrom < forces.length - 1;
    const newChordGroups = set(generateFrom, newChordGroup, chordGroups)
    this.setState(
      { chordGroups: newChordGroups, ...(setBeat && {beat: generateFrom}) },
      () => {
        setBeat && this.playSelectedChord();
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
    document.addEventListener("keyup", e => {
      if (e.code === 'Space') {
        this.onPressSpace();
      } else if (e.keyCode === 37) {
        this.onPressLeft();
      } else if (e.keyCode === 39) {
        this.onPressRight();
      } else if (e.keyCode === 38) {
        this.onPressUp();
      } else if (e.keyCode === 40) {
        this.onPressDown();
      }
    });
  }

  onPressSpace = () => this.state.isPlaying ? this.pause() : this.play();
  onPressUp = () => this.cycleChordUp(this.state.beat);
  onPressDown = () => this.cycleChordDown(this.state.beat);

  onPressLeft = () => {
    const { beat, forces } = this.state;
    this.setState(
      { beat: (beat-1 + forces.length) % forces.length },
      this.playSelectedChord,
    )
  }

  onPressRight = () => {
    const { beat, forces } = this.state;
    this.setState(
      { beat: (beat+1) % forces.length },
      this.playSelectedChord,
    )  
  }

  midiToHz = (midi) => Math.pow(2, (midi-69)/12) * 440;

  playNote = (note, duration, delay=0) => {
    const hz = this.midiToHz(note);

    const gainNode = this.audioCtx.createGain();
    gainNode.gain.value = 0.15;

    const oscillator = this.audioCtx.createOscillator();
    oscillator.frequency.setValueAtTime(hz, this.audioCtx.currentTime)

    oscillator.connect(gainNode);
    gainNode.connect(this.audioCtx.destination);

    oscillator.start(this.audioCtx.currentTime + delay);
    oscillator.stop(this.audioCtx.currentTime + delay + duration);
  }

  setForce = (beat, key, value) => this.setState(
    { forces: set([beat, key], value, this.state.forces) }
  );

  addForce = () => {
    const { forces } = this.state;
    this.setState(
      { forces: [ ...forces, emptyForce ] },
      () => this.generate(forces.length, true),
    )
  }

  removeForce = () => {
    const { forces, chordGroups, beat } = this.state;
    this.setState({
      forces: _.dropRight(forces, 1),
      chordGroups: _.dropRight(chordGroups, 1),
      ...(beat === forces.length-1 && { beat: forces.length-2 })
    })
  }

  playScale = (scale) => scaleIntervals[scale]
    .reduce(
      (notes, interval) => [ ...notes, _.last(notes) + interval],
      [60]
    )
    .forEach((note, i) => this.playNote(note, 0.18, i*0.18));

  selectScale = (scale) => {
    const { scales } = this.state;
    if (scales.length < 2) {
      this.playScale(scale);
      this.setState(
        { scales: [ ...this.state.scales, scale ] },
        this.initialize,
      );
    }
  }

  removeScale = (scale) => {
    const { scales } = this.state;
    if (scales.length > 1) {
      this.setState(
        { scales: scales.filter(s => s !== scale) },
        this.initialize,
      );
    }
  }

  onTonicChange = (tonic) => this.setState({ tonic }, this.initialize);

  cycleChord = (beat, chordIndex) => {
    const { chordGroups, forces } = this.state;
    const newChordGroups = set([beat, 'chordIndex'], chordIndex, chordGroups)
    this.setState(
      { chordGroups: newChordGroups, beat },
      () => {
        this.playSelectedChord();
        (beat < forces.length - 1) && this.generate(beat+1);
      }
    )
  };

  cycleChordUp = (beat) => {
    const { chordGroups } = this.state;
    const { chords, chordIndex } = chordGroups[beat];
    this.cycleChord(beat, (chordIndex+1) % chords.length);
  }

  cycleChordDown = (beat) => {
    const { chordGroups } = this.state;
    const { chords, chordIndex } = chordGroups[beat];
    this.cycleChord(beat, (chordIndex-1 + chords.length) % chords.length);
  }

  setBeat = (beat) => () => this.setState({ beat }, this.playSelectedChord);

  playSelectedChord = () => this.selectedChord.notes
    .forEach(note => this.playNote(note, 0.75));

  playOn = () => {
    const { beat, forces, isPlaying } = this.state;
    this.playSelectedChord();
    setTimeout(() => {
      this.setState(
        { beat: (beat+1) % forces.length },
        () => isPlaying && this.playOn(),
      )
    }, 1000);
  }

  play = () => this.setState({ isPlaying: true }, this.playOn);
  pause = () => this.setState({ isPlaying: false });

  render() {
    const { scales, isPlaying, beat, forces, chordGroups } = this.state;
    return (
      <div className="App">
        <Header
          isPlaying={isPlaying}
          onPressPlay={this.play}
          onPressPause={this.pause}
        />
        <ScaleSelect
          selectedScales={scales}
          selectScale={this.selectScale}
          removeScale={this.removeScale}
        />
        <Curve
          isPlaying={isPlaying}
          forces={forces}
          onNodeMove={this.setForce}
          onNodeRelease={(beat) => this.generate(beat, true)}
          onAddForce={this.addForce}
          onRemoveForce={this.removeForce}
        />
        <Staff
          isPlaying={isPlaying}
          beat={beat}
          colors={colors}
          chordGroups={chordGroups}
          forceCount={forces.length}
          onDownArrowClick={this.cycleChordDown}
          onUpArrowClick={this.cycleChordUp}
          onAreaClick={this.setBeat}
        />
          { this.selectedChord &&
            <SpiralCanvas
              isPlaying={isPlaying}
              chord={this.selectedChord}
              color={colors[beat % colors.length]}
            />
          }
      </div>
    )
  }

}

export default App;