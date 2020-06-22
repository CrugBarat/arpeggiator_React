import React from 'react';

const BPMSlider = (props) => {

    function handleChange(evt) {
        props.updateBPM(evt.target.value)
    }

    return (
      <div>
        <input className="bpm-slider" type="range" min="1" max="180" step="1" onChange={handleChange}>
        </input>
      </div>
    )
}

export default BPMSlider;
