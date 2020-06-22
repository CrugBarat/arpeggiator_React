import React from 'react';
import './Component.css';

const DurationSelect = (props) => {
  const options = props.durationChoices.map((duration, index) => {
      return <option key={index} value={duration.name}>{duration}</option>
  });

  function handleChange(ev) {
    props.onDurationSelect(ev.target.value);
  }

  return (
    <select className="duration-select" onChange={handleChange} defaultValue="default">
      <option value="default" disabled>Duration</option>
      {options}
    </select>
  )
}

export default DurationSelect;
