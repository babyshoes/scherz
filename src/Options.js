import React from 'react';
import './App.css';

// possible scales?
const scaleOptions = ['major', 'minor', 'lydian', 'dorian']


const Options = ({selectedScales, tonic, onScaleSelect, onScaleRemove, onTonicChange})  => {

  const validateScaleSelection = (e) => {
    const scale = e.target.value
    onScaleSelect(scale)
  }

  const validateTonicSelection = (e) => {
    const tonic = e.target.value
    
    if (tonic.length > 0) {
      const baseNote = tonic[0].toLowerCase()
      const accidentals = new Set(tonic.slice(1))

      if ("cdefgab".includes(baseNote) 
        && (accidentals.size === 0
          || (accidentals.size === 1 && (accidentals.has("b") || accidentals.has("#"))))
        ) {
          onTonicChange(tonic)
        }
    }
  }

  return (
    <div>
      <input type="text" name="tonic" onChange={validateTonicSelection}/>
      <div>
        <span>{tonic}</span>
        </div>
      <select onChange={validateScaleSelection} value="default">
        <option value="default" disabled>
          select a scale
        </option>
        { scaleOptions
          .filter(scale => 
            !selectedScales.includes(scale))
          .map((scale, index) =>
          <option 
            value={scale} 
            key={index}
          > 
            {scale} 
          </option>
        )}
      </select>
      <div>
        { selectedScales.map(scale => 
          <div>
            <span onClick={() => onScaleRemove(scale)}>x</span>
            <span>{scale}</span>
          </div>
        )}
      </div>  
      <div>
        
      </div>
    </div>
  );
}
  
  export default Options;