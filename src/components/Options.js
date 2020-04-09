import React, { useState } from 'react';
import { validatePitch, scales } from 'scherz.util';
import '../App.css';
import _ from 'lodash';

const Options = ({ selectedScales, tonic, onScaleSelect, onScaleRemove, onTonicChange }) => {

  const [tonicError, setTonicError] = useState(null);

  const handleTonicChange = input => {
    const formatted = input.toUpperCase();
    if (!validatePitch(formatted)) {
      setTonicError('invalid tonic :(');
    } else {
      setTonicError(null);
      onTonicChange(formatted);
    }
  }

  return (
    <div>
      <h2> Tonic </h2>
      <div>
        <input
          className="options" type="text" name="tonic"
          onChange={_.debounce(handleTonicChange, 500)} value={tonic}
        />
        <div className="error">
          <p className="error-text">{tonicError}</p>
        </div>  
      </div>

      <h2>Scales</h2>
      <div className="scale-list"></div>
    </div>
  );
}
  
export default Options;