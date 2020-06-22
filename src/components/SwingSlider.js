import React from 'react';

const SwingSlider = (props) => {

    function handleChange(evt) {
        props.updateSwing(evt.target.value)
    }

    return (
      <div>
        <input className="swing-slider" type="range" min="0.0" max="1.0" step="0.1" value={props.swing} onChange={handleChange}></input>
      </div>
    )
}

export default SwingSlider;
