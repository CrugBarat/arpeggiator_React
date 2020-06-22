import React, {Component, Fragment} from 'react';
import ChordArray from '../config/ChordArray';
import SynthSelect from '../components/SynthSelect';
import DurationSelect from '../components/DurationSelect';
import BPMSlider from '../components/BPMSlider';
import SwingSlider from '../components/SwingSlider';
import GainSlider from '../components/GainSlider';
import Tone from 'tone';
import './Arpeggiator.css';

class Arpeggiator extends Component {
  constructor() {
    super();

    this.state = {
      synth: new Tone.Synth(),
      chords: ChordArray,
      chordIndex: 0,
      formattedChords: [],
      playing: false,
      step: 0,
      duration: '16n',
      synthChoices: ['AMSynth', 'DuoSynth', 'FMSynth', 'MembraneSynth', 'MonoSynth', 'PluckSynth', 'PolySynth', 'Default'],
      durationChoices: ['4n', '8n', '16n', '32n'],
      eventID: 0,
      bpm: 90,
      swing: 0.0,
      gain: 1.0,
      recDest: Tone.context.createMediaStreamDestination(),
      recorder: null,
      recording: false,
      order: 'UP'
    }

    this.startSynth = this.startSynth.bind(this);
    this.stopSynth = this.stopSynth.bind(this);
    this.handleChord = this.handleChord.bind(this);
    this.repeat = this.repeat.bind(this);
    this.formatChords = this.formatChords.bind(this);
    this.mapChords = this.mapChords.bind(this);
    this.onSynthSelect = this.onSynthSelect.bind(this);
    this.onDurationSelect = this.onDurationSelect.bind(this);
    this.updateBPM = this.updateBPM.bind(this);
    this.updateSwing = this.updateSwing.bind(this);
    this.updateGain = this.updateGain.bind(this);
    this.recordStart = this.recordStart.bind(this);
    this.recordStop = this.recordStop.bind(this);
    this.stopMedia = this.stopMedia.bind(this);
    this.getOrder = this.getOrder.bind(this);
  }

  componentDidMount() {
    this.mapChords();
  }

  formatChords(chords) {
    let chord = chords.split(' ');
    let newChordArr = [];
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < chord.length; j++) {
        let noteValue = chord[j].split('');
        let note = noteValue[0];
        let octave = (noteValue[1] === '0') ? i + 3 : i + 4;
        note += octave;
        newChordArr.push(note);
      }
    }
    return newChordArr;
  }

  mapChords() {
    let formattedChords = this.state.chords.map( chord => this.formatChords(chord));
    this.setState({formattedChords: formattedChords});
  }

  handleChord(value) {
    this.setState({chordIndex: parseInt(value) - 1});
    this.getOrder(parseInt(value) - 1);
  }

  repeat() {
    let chord = this.state.formattedChords[this.state.chordIndex];
    let note = chord[this.state.step % chord.length];
    this.state.synth.triggerAttackRelease(note, this.state.duration);
    this.setState({step: this.state.step +1});
  }

  startSynth() {
    if(this.state.playing) return;
    this.stopSynth();
    this.setState({playing: true});
    this.state.synth.connect(this.state.recDest);
    this.state.synth.toMaster();
    const eventID = Tone.Transport.scheduleRepeat(this.repeat, this.state.duration);
    this.setState({eventID: eventID});
    Tone.Transport.start();
  }

  stopSynth() {
    Tone.Transport.stop();
    Tone.Transport.clear(this.state.eventID);
    this.setState({playing: false})
  }

  onSynthSelect(synth) {
    if(synth === 'AMSynth') {
        this.setState({synth: new Tone.AMSynth()});
        this.setState({playing: false});
    } else if (synth === 'DuoSynth') {
        this.setState({synth: new Tone.DuoSynth()});
        this.setState({playing: false});
    } else if (synth === 'FMSynth') {
        this.setState({synth: new Tone.FMSynth()});
        this.setState({playing: false});
    } else if (synth === 'MembraneSynth') {
        this.setState({synth: new Tone.MembraneSynth()});
        this.setState({playing: false});
    } else if (synth === 'MonoSynth') {
        this.setState({synth: new Tone.MonoSynth()});
        this.setState({playing: false});
    } else if (synth === 'PluckSynth') {
        this.setState({synth: new Tone.PluckSynth()});
        this.setState({playing: false});
    } else if (synth === 'PolySynth') {
        this.setState({synth: new Tone.PolySynth()});
        this.setState({playing: false});
    } else {
        this.setState({synth: new Tone.Synth()});
        this.setState({playing: false});
    }
  }

  onDurationSelect(duration) {
    if(duration === '4n') {
        this.setState({duration: '4n'});
        this.setState({playing: false});
    } else if (duration === '8n') {
        this.setState({duration: '8n'});
        this.setState({playing: false});
    } else if (duration === '16n') {
        this.setState({duration: '16n'});
        this.setState({playing: false});
    } else {
        this.setState({duration: '32n'});
        this.setState({playing: false});
    }
  }

  updateBPM(bpm) {
    this.setState({bpm: parseInt(bpm)});
    Tone.Transport.bpm.value = this.state.bpm;
  }

  updateSwing(swing) {
    this.setState({swing: parseFloat(swing)});
    Tone.Transport.swing = this.state.swing;
  }

  updateGain(gain) {
    this.state.synth.disconnect();
    this.setState({gain: parseFloat(gain)});
    const newGain = new Tone.Gain(this.state.gain);
    newGain.toMaster();
    this.state.synth.connect(newGain);
  }

  recordStart() {
    const recorder = new MediaRecorder(this.state.recDest.stream, {'type': 'audio/wav'});
    this.setState({recorder: recorder});
    this.setState({recording: true});
    recorder.start();
  }

  recordStop() {
    if(this.state.recorder != null) {
      this.setState({recording: false})
      this.state.recorder.stop();
      this.setState({recorder: null});
      const recChunks = [];
      this.state.recorder.ondataavailable = evt => recChunks.push(evt.data);
      this.state.recorder.onstop = evt => {
        let blob = new Blob(recChunks, {'type': 'audio/wav'});
        const audioURL = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.style.color = 'white';
        link.style.cssText = "font-size: 20px; color: white;"
        link.href = audioURL;
        link.download = 'my_recording';
        link.innerHTML = 'DOWNLOAD FILE';
        document.body.appendChild(link);
      };
    }
  }

  stopMedia() {
    if(this.state.recording) {
      this.recordStop();
    }
    this.stopSynth();
  }

  getOrder(value) {
    if(value <= 4) {
      this.setState({order: 'UP'})
    } else if (value > 4 && value <= 9) {
      this.setState({order: 'DN'})
    } else {
      this.setState({order: 'IN'})
    }
  }

  render() {
    return (
      <Fragment>
      <section className="controls-container">
          <div>
            <input id="c1" value="1" type="radio" name="chord" />
            <label onClick={() => this.handleChord(1)} className="c1" htmlFor="c1"></label>
            <input id="c2" value="2" type="radio" name="chord" />
            <label onClick={() => this.handleChord(2)} className="c2" htmlFor="c2"></label>
            <input id="c3" value="3" type="radio" name="chord" />
            <label onClick={() => this.handleChord(3)} className="c3" htmlFor="c3"></label>
            <input id="c4" value="4" type="radio" name="chord" />
            <label onClick={() => this.handleChord(4)} className="c4" htmlFor="c4"></label>
            <input id="c5" value="5" type="radio" name="chord" />
            <label onClick={() => this.handleChord(5)} className="c5" htmlFor="c5"></label>
          </div>
          <div>
            <input id="c6" value="6" type="radio" name="chord" />
            <label onClick={() => this.handleChord(6)} className="c6" htmlFor="c6"></label>
            <input id="c7" value="7" type="radio" name="chord" />
            <label onClick={() => this.handleChord(7)} className="c7" htmlFor="c7"></label>
            <input id="c8" value="8" type="radio" name="chord" />
            <label onClick={() => this.handleChord(8)} className="c8" htmlFor="c8"></label>
            <input id="c9" value="9" type="radio" name="chord" />
            <label onClick={() => this.handleChord(9)} className="c9" htmlFor="c9"></label>
            <input id="c10" value="10" type="radio" name="chord" />
            <label onClick={() => this.handleChord(10)} className="c10" htmlFor="c10"></label>
          </div>
          <div>
            <input id="c11" value="11" type="radio" name="chord" />
            <label onClick={() => this.handleChord(11)} className="c11" htmlFor="c11"></label>
            <input id="c12" value="12" type="radio" name="chord" />
            <label onClick={() => this.handleChord(12)} className="c12" htmlFor="c12"></label>
            <input id="c13" value="13" type="radio" name="chord" />
            <label onClick={() => this.handleChord(13)} className="c13" htmlFor="c13"></label>
            <input id="c14" value="14" type="radio" name="chord" />
            <label onClick={() => this.handleChord(14)} className="c14" htmlFor="c14"></label>
            <input id="c15" value="15" type="radio" name="chord" />
            <label onClick={() => this.handleChord(15)} className="c15" htmlFor="c15"></label>
          </div>
          <div className="values-border">
            <div className="values-container">
              <h3 className="values">{this.state.bpm} <p className="units">BPM</p></h3>
              <h3 className="values">{this.state.order} <p className="units">ORDER</p></h3>
              <h3 className="values">{this.state.swing} <p className="units">Swing</p></h3>
              <h3 className="values">{this.state.gain} <p className="units">Gain</p></h3>
            </div>
          </div>
          <div className="sliders-container">
              <div className="slider-value">
                <p>BPM</p>
              </div>
              <div className="slider-container">
                <BPMSlider className="bpm-slider" updateBPM={this.updateBPM} />
              </div>
              <div className="slider-value">
                <p>SWING</p>
              </div>
              <div className="slider-container">
                <SwingSlider className="swing-slider" updateSwing={this.updateSwing} swing={this.state.swing} />
              </div>
              <div className="slider-value">
                <p>GAIN</p>
              </div>
              <div className="slider-container">
                <GainSlider className="gain-slider" updateGain={this.updateGain} gain={this.state.gain} />
              </div>
            </div>
            <div className="media-border">
              <div className="media-controls-container">
                <div className="main-control">
                  <button name="play" onClick={this.startSynth}></button>
                </div>
                <div className="sub-controls">
                  <div>
                    <button name="record" onClick={this.recordStart}></button>
                  </div>
                  <div>
                    <button name="stop" onClick={this.stopMedia}></button>
                  </div>
                </div>
              </div>
            </div>
          <SynthSelect synthChoices={this.state.synthChoices} onSynthSelect={this.onSynthSelect} />
          <DurationSelect durationChoices={this.state.durationChoices} onDurationSelect={this.onDurationSelect}/>
      </section>
      </Fragment>
    )
  }
}

export default Arpeggiator;
