import React from 'react';
import _ from 'lodash';
import { set } from 'lodash/fp';
import { scaleIntervals } from 'scherz.util';
import scherzClient from './util/scherz-client';
import Header from './Header';
import Curve from './curve/Curve';
import Staff from './staff/Staff';
import Scroll from './scroll/Scroll';
import ScaleSelect from './ScaleSelect';
import SpiralCanvas from './spiral/SpiralCanvas';
import PlayMode from './util/play-mode';


const initialForces = [
  {"color":0,"dissonance":0.1,"gravity":0},
  {"color":0,"dissonance":0.25,"gravity":0},
  {"color":0.4,"dissonance":0.5,"gravity":0.25},
  {"color":0.2,"dissonance":0.8,"gravity":0},
  {"color":0,"dissonance":0.5,"gravity":0.25}
];
const emptyForce = { color: 0, dissonance: 0, gravity: 0 };
const colors = ['#3da4ab', '#f6cd61', '#fe8a71'];

const displayCount = 5;

class App extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      scales: ['diatonic'],
      tonic: 'C',
      chordGroups: [],
      forces: initialForces,
      beat: 0,
      offset: 0,
      isPlaying: false,
      playMode: PlayMode.LOOP,
    };
  }

  createToken(beat) {
    this.token = { beat, id: '_' + Math.random().toString(36).substr(2, 9) };
    return this.token;
  }

  generateChords(generateFrom) {
    const { scales, tonic, forces } = this.state;
    if (generateFrom === 0) {
      return scherzClient.initialChords(scales, tonic, forces[0].dissonance)
    }
    const prevChord = this.selectedChords[generateFrom-1];
    const force = forces[generateFrom];
    return scherzClient.generateChords(scales, prevChord, force);
  };

  async generate(generateFrom, { token, setBeat=false }) {
    const _token = token || this.createToken(generateFrom);
    if (_token.beat <= this.token.beat && _token.id !== this.token.id) {
      return;
    }
    const generatedChords = await this.generateChords(generateFrom);
    let newChordIndex = _.findIndex(
      generatedChords, 
      chord => _.isEqual(chord.notes, _.get(this.selectedChords[generateFrom], 'notes'))
    );
    if (newChordIndex === -1) {
      newChordIndex = null;
    }
    const newChordGroup = { chords: generatedChords, chordIndex: newChordIndex || 0 };
    const isNotLastChord = generateFrom < this.state.forces.length-1;
    const progressionIsIncomplete = this.selectedChords.length !== this.state.forces.length;

    this.setState(
      ({ chordGroups }) => ({
        chordGroups: set(generateFrom, newChordGroup, chordGroups),
        ...(setBeat && {beat: generateFrom}),
      }),
      () => {
        setBeat && this.playSelectedChord();
        (progressionIsIncomplete || !newChordIndex) && isNotLastChord
          && this.generate(generateFrom+1, { token: _token });
      }
    )
  };

  async catchUp() {
    const { forces, chordGroups } = this.state;
    if (forces.length > chordGroups.length) {
      this.generate(chordGroups.length, {});
    }
  }

  initialize = () => this.generate(0, {});

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
    const { beat, offset } = this.state;
    const newoffset = (offset !== 0 && offset === beat)
      ? offset-1
      : offset;
    (beat !== 0) && this.setState(
      { beat: beat-1, offset: newoffset },
      this.playSelectedChord,
    )
  }

  onPressRight = () => {
    const { beat, offset, forces, chordGroups } = this.state;
    if (beat < forces.length-1 && chordGroups[beat+1]) {
      const newoffset = (beat === offset + (displayCount-1)) ? offset+1 : offset;
      this.setState(
        { beat: beat+1, offset: newoffset },
        this.playSelectedChord,
      )
    }
  }

  midiToHz = (midi) => Math.pow(2, (midi-69)/12) * 440;

  playNote(note, duration, delay=0) {
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

  setForce = (beat, key, value) =>
    this.setState({
      forces: set([beat, key], value, this.state.forces)
    });

  addForce = () =>
    this.setState(
      ({ forces }) => (
        {
          forces: [ ...forces, emptyForce ],
          offset: Math.max(forces.length - (displayCount-1), 0),
        }
      ),
      () => {
        const { forces, chordGroups } = this.state;
        if (forces.length === chordGroups.length+1) {
          this.generate(forces.length-1, { setBeat: true })
        }
      }
    )

  removeForce = () =>
    this.setState(({ forces, chordGroups }) => ({
      forces: _.dropRight(forces, 1),
      chordGroups: _.dropRight(chordGroups, 1),
      offset: Math.max(forces.length - (displayCount+1), 0),
      beat: forces.length-2,
    }))

  playScale = (scale) =>
    scaleIntervals[scale]
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
        { scales: [ ...scales, scale ] },
        this.initialize,
      );
    }
  }

  removeScale = (scale) =>
    (this.state.scales.length > 1) &&
      this.setState(
        { scales: this.state.scales.filter(s => s !== scale) },
        this.initialize,
      );

  onTonicChange = (tonic) => this.setState({ tonic }, this.initialize);

  onCycle = _.debounce(function() {
    const { beat, forces } = this.state;
    this.playSelectedChord();
    (beat < forces.length - 1) && this.generate(beat+1, {});
  }, 250);

  cycleChord = (beat, chordIndex) =>
    this.setState(
      ({ chordGroups }) => ({
        beat, chordGroups: set([beat, 'chordIndex'], chordIndex, chordGroups)
      }),
      this.onCycle,
    );

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

  setBeat = (beat) => this.setState({ beat }, this.playSelectedChord);

  scrollRight = () => this.setState(
    ({ beat, offset }) => ({ beat: beat+1, offset: offset+1 }),
    this.playSelectedChord,
  );

  scrollLeft = () => this.setState(
    ({ beat, offset }) => ({ beat: beat-1, offset: offset-1 }),
    this.playSelectedChord,
  )

  playSelectedChord = () =>
    this.selectedChord.notes.forEach(note => this.playNote(note, 0.75));

  playOn(forceCount) {
    this.playSelectedChord();
    setTimeout(() => {
      this.setState(
        ({ beat, forces, offset, playMode }) => {
          const newBeat = playMode === PlayMode.LOOP
            ? (beat+1) % forces.length
            : beat+1;

          let newOffset;
          if (newBeat === 0) {
            newOffset = 0;
          } else if (beat === offset + (displayCount-1)) {
            newOffset = offset+1;
          } else {
            newOffset = offset;
          }

          const newForces = playMode === PlayMode.INFINITE
            ? [ ...forces, forces[(beat % (forceCount-1)) + 1] ]
            : forces;

          return { beat: newBeat, offset: newOffset, forces: newForces };
        },
        () => {
          this.state.playMode === PlayMode.INFINITE && this.catchUp();
          this.state.isPlaying && this.playOn(forceCount);
        },
      )
    }, 1000);
  }

  play = () => this.setState(
    { isPlaying: true },
    () => this.playOn(this.state.forces.length),
  );
  pause = () => this.setState({ isPlaying: false });

  render() {
    const { scales, isPlaying, playMode, beat, offset, forces, chordGroups } = this.state;
    return (
      <div className="App">
        <Header
          isPlaying={isPlaying}
          playMode={playMode}
          setPlayMode={(mode) => this.setState({ playMode: mode })}
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
          offset={offset}
          onNodeMove={this.setForce}
          onNodeRelease={(beat) => this.generate(beat, { setBeat: true })}
          onAddForce={this.addForce}
          onRemoveForce={this.removeForce}
        />
        <Scroll
          isPlaying={isPlaying}
          forceCount={forces.length}
          offset={offset}
          onLeftArrowClick={this.scrollLeft}
          onRightArrowClick={this.scrollRight}
        />
        <Staff
          isPlaying={isPlaying}
          beat={beat}
          offset={offset}
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