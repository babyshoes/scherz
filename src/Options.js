import React from 'react';
import './App.css';
import { util } from 'scherz'

// possible scales?
// const scaleOptions = ['major', 'minor', 'lydian', 'dorian']

const scaleOptions = util.scales//.slice(0, 10)
// const restOfScaleOptions = scales.slice(10)
// debugger

const Options = ({selectedScales, tonic, onScaleSelect, onScaleRemove, onTonicChange})  => {

  const validateScaleSelection = (e) => {
    const scale = e.target.id
    if(e.target.checked) {
      onScaleSelect(scale)
    } else {
      onScaleRemove(scale)
    }
    
    // selectedScales = [...selectedScales, scale]
    // debugger
    // onScaleSelect(selectedScales)
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
          onTonicChange(tonic.toUpperCase())
        }
    }
  }

  const makeChecklist = () => {
    return scaleOptions.map((scale, index) => {
      // const checked = selectedScales.includes(scale)
      return <div key={index}>
        <input className="checkbox" key={`scale-${index}`} id={scale} type="checkbox" onChange={validateScaleSelection}/> 
        <label key={`scale-label-${index}`} htmlFor={scale}>{scale}</label>
      </div>
    })

  }



  return (
    <div id="options-div" >
      <h2>Tonic</h2>
      <div>
        <input className="options" type="text" name="tonic" onChange={validateTonicSelection} value={tonic}/>
      </div>
      <br/>
      {/* <div> */}
        {/* <span>{tonic}</span> */}
        {/* </div> */}
      <h2>Scales</h2>
      
      <div className="scale-list">
      {makeChecklist()}
      </div>
      {/* <h2>Test</h2> */}
      
      {/* <p onClick={showRest}>See more</p> */}
      {/* <select className="options" onChange={validateScaleSelection} value="default">
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
      </select> */}
      {/* <div>
        { selectedScales.map( (scale, index) => 
          <div key={index}>
            <span onClick={() => onScaleRemove(scale)}>x</span>
            <span> {scale}</span>
          </div>
        )}
      </div>   */}
      <div>
        
      </div>
    </div>
  );
}
  
  export default Options;