import React from 'react';
import './Component.css';

const SynthSelect = (props) => {
  const options = props.synthChoices.map((synth, index) => {
      return <option key={index} value={synth.name}>{synth}</option>
  });

  function handleChange(ev) {
    props.onSynthSelect(ev.target.value);
  }

  return (
    <select className="synth-select" onChange={handleChange} defaultValue="default">
      <option value="default" disabled>Synths</option>
      {options}
    </select>
  )
}

export default SynthSelect;
