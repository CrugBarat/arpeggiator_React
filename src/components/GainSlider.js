import React from 'react';

const GainSlider = (props) => {

    function handleChange(evt) {
        props.updateGain(evt.target.value)
    }

    return (
      <div>
        <input className="gain-slider" type="range" min="0.1" max="1.0" step="0.1" value={props.gain} onChange={handleChange}></input>
      </div>
    )
}

export default GainSlider;
